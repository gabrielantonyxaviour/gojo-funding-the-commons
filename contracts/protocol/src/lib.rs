use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{UnorderedMap, Vector};
use near_sdk::json_types::{U128, U64};
use near_sdk::{env, log, near, AccountId, NearToken, PanicOnDefault, Promise, Gas, ext_contract};
use near_sdk::serde::{Serialize, Deserialize};
use near_sdk::NearSchema;

pub mod external;
use crate::external::*;

// Constants
const GOJO_PER_AGENT_USE: u128 = 50_000_000_000_000_000_000_000; // 0.05 GOJO per agent
const NO_DEPOSIT: NearToken = NearToken::from_near(0);
const FT_WASM_CODE: &[u8] = include_bytes!("./token.wasm");
const NEAR_PER_STORAGE: NearToken = NearToken::from_yoctonear(10u128.pow(19)); // 10e19yⓃ
const TGAS: Gas = Gas::from_tgas(1);

// View structs for JSON serialization
#[derive(Serialize, Deserialize, NearSchema)]
#[serde(crate = "near_sdk::serde")]
pub struct AIAgentJson {
    pub id: u64,
    pub name: String,
    pub metadata_walrus_hash: String,
    pub created_at: U64,
    pub resources: Vec<String>,
}

#[derive(Serialize, Deserialize, NearSchema)]
#[serde(crate = "near_sdk::serde")]
pub struct ProjectJson {
    pub id: u64,
    pub owner: AccountId,
    pub name: String,
    pub metadata_walrus_hash: String,
    pub created_at: U64,
    pub generations: Vec<GenerationJson>,
}

#[derive(Serialize, Deserialize, NearSchema)]
#[serde(crate = "near_sdk::serde")]
pub struct GenerationJson {
    pub id: u64,
    pub project_id: u64,
    pub agents_used: Vec<u64>,
    pub generation_walrus_hash: String,
    pub created_at: U64,
    pub gojo_burned: U128,
}

// Storage structs
#[derive(BorshDeserialize, BorshSerialize)]
pub struct AIAgent {
    id: u64,
    name: String,
    metadata_walrus_hash: String,
    created_at: U64,
    resources: Vector<String>,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Project {
    id: u64,
    owner: AccountId,
    name: String,
    metadata_walrus_hash: String,
    created_at: U64,
    generations: Vector<Generation>,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Generation {
    id: u64,
    project_id: u64,
    agents_used: Vec<u64>,
    generation_walrus_hash: String,
    created_at: U64,
    gojo_burned: U128,
}

// Implement conversion to JSON views
impl AIAgent {
    pub fn to_json(&self) -> AIAgentJson {
        AIAgentJson {
            id: self.id,
            name: self.name.clone(),
            metadata_walrus_hash: self.metadata_walrus_hash.clone(),
            created_at: self.created_at,
            resources: self.resources.to_vec(),
        }
    }
}

impl Project {
    pub fn to_json(&self) -> ProjectJson {
        ProjectJson {
            id: self.id,
            owner: self.owner.clone(),
            name: self.name.clone(),
            metadata_walrus_hash: self.metadata_walrus_hash.clone(),
            created_at: self.created_at,
            generations: self.generations.iter().map(|g| g.to_json()).collect(),
        }
    }
}

impl Generation {
    pub fn to_json(&self) -> GenerationJson {
        GenerationJson {
            id: self.id,
            project_id: self.project_id,
            agents_used: self.agents_used.clone(),
            generation_walrus_hash: self.generation_walrus_hash.clone(),
            created_at: self.created_at,
            gojo_burned: self.gojo_burned,
        }
    }
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct Contract {
    owner: AccountId,
    token_account: AccountId,
    agents: UnorderedMap<u64, AIAgent>,
    projects: UnorderedMap<u64, Project>,
    next_agent_id: u64,
    next_project_id: u64,
    next_generation_id: u64,
    initialized: bool,
}

#[near]
impl Contract {
    #[init]
    pub fn init(owner: AccountId) -> Self {
        let current_account_id = env::current_account_id();
        let token_account: AccountId = format!("token.{}", current_account_id).parse().unwrap();
        
        Self {
            owner,
            token_account,
            agents: UnorderedMap::new(b"a"),
            projects: UnorderedMap::new(b"p"),
            next_agent_id: 0,
            next_project_id: 0,
            next_generation_id: 0,
            initialized: false,
        }
    }

    #[private]
    pub fn finish_initialization(&mut self) {
        assert!(!self.initialized, "Already initialized");
        self.initialized = true;
    }
    #[payable]
    pub fn deploy_token(&mut self) -> Promise {
        assert!(!self.initialized, "Already initialized");
        assert_eq!(
            env::predecessor_account_id(),
            self.owner,
            "Only owner can deploy token"
        );
    
        // Validate attached deposit
        let attached = env::attached_deposit();
        let contract_bytes = FT_WASM_CODE.len() as u128;
        let contract_storage_cost = NEAR_PER_STORAGE.saturating_mul(contract_bytes);
        let minimum_needed = contract_storage_cost.saturating_add(NearToken::from_millinear(100));
        
        assert!(
            attached >= minimum_needed,
            "Attach at least {minimum_needed} yⓃ"
        );
    
        // Create the promise chain
        Promise::new(self.token_account.clone())
            .create_account()
            .transfer(attached)
            .deploy_contract(FT_WASM_CODE.to_vec())
            .function_call(
                "init".to_string(),
                vec![],  // Empty args since init() doesn't take any
                NO_DEPOSIT,
                TGAS.saturating_mul(5),
            )
            .then(
                Self::ext(env::current_account_id())
                    .with_static_gas(TGAS)
                    .finish_initialization()
            )
    }
   
    #[payable]
    pub fn deposit_near(&mut self) -> Promise {
        let deposit_amount = env::attached_deposit();
        let account_id = env::predecessor_account_id();
        
        ft_contract::ext(self.token_account.clone())
            .with_static_gas(TGAS.saturating_mul(10)) // Increased gas
            .mint(
                &account_id,
                deposit_amount,
            )
    }
   
    pub fn get_owner(&self) -> AccountId {
        self.owner.clone()
    }

    fn assert_owner(&self) {
        assert_eq!(env::predecessor_account_id(), self.owner, "Owner only function");
    }

    pub fn create_ai_agent(&mut self, name: String, metadata_walrus_hash: String) -> u64 {
        self.assert_owner();
        
        let agent_id = self.next_agent_id;
        self.next_agent_id += 1;

        let agent = AIAgent {
            id: agent_id,
            name,
            metadata_walrus_hash,
            created_at: U64::from(env::block_timestamp()),
            resources: Vector::new(format!("r{}", agent_id).as_bytes()),
        };

        self.agents.insert(&agent_id, &agent);
        agent_id
    }

    pub fn create_resource(&mut self, agent_id: u64, resource_walrus_hash: String) {
        let mut agent = self.agents.get(&agent_id).expect("Agent not found");
        agent.resources.push(&resource_walrus_hash);
        self.agents.insert(&agent_id, &agent);
    }

    pub fn create_project(&mut self, name: String, metadata_walrus_hash: String) -> u64 {
        let project_id = self.next_project_id;
        self.next_project_id += 1;

        let project = Project {
            id: project_id,
            owner: env::predecessor_account_id(),
            name,
            metadata_walrus_hash,
            created_at: U64::from(env::block_timestamp()),
            generations: Vector::new(format!("g{}", project_id).as_bytes()),
        };

        self.projects.insert(&project_id, &project);
        project_id
    }

    pub fn make_generation(
        &mut self,
        project_id: u64,
        agents_used: Vec<u64>,
        generation_walrus_hash: String,
    ) -> Promise {
        let project = self.projects.get(&project_id).expect("Project not found");
        
        assert_eq!(
            project.owner,
            env::predecessor_account_id(),
            "Only project owner can make generations"
        );
    
        for agent_id in &agents_used {
            assert!(self.agents.get(agent_id).is_some(), "Invalid agent ID");
        }
    
        let gojo_to_burn = NearToken::from_yoctonear(GOJO_PER_AGENT_USE * agents_used.len() as u128);
        let account_id = env::predecessor_account_id();
    
        ft_contract::ext(self.token_account.clone())
            .with_attached_deposit(NearToken::from_yoctonear(1))
            .with_static_gas(TGAS)
            .burn(
                &account_id,  // Note the & here since burn takes &AccountId
                gojo_to_burn,
            )
            .then(
                Self::ext(env::current_account_id())
                    .with_static_gas(TGAS)
                    .make_generation_callback(
                        project_id,
                        agents_used,
                        generation_walrus_hash,
                        U128::from(gojo_to_burn.as_yoctonear()),
                        env::predecessor_account_id(),
                    )
            )
    }


    #[private]
    pub fn make_generation_callback(
        &mut self,
        project_id: u64,
        agents_used: Vec<u64>,
        generation_walrus_hash: String,
        gojo_burned: U128,
        _user: AccountId,
        #[callback_result] call_result: Result<(), near_sdk::PromiseError>,
    ) -> bool {
        if call_result.is_err() {
            log!("Failed to burn GOJO tokens");
            return false;
        }

        let mut project = self.projects.get(&project_id).unwrap();
        
        let generation_id = self.next_generation_id;
        self.next_generation_id += 1;

        let generation = Generation {
            id: generation_id,
            project_id,
            agents_used,
            generation_walrus_hash,
            created_at: U64::from(env::block_timestamp()),
            gojo_burned,
        };

        project.generations.push(&generation);
        self.projects.insert(&project_id, &project);
        
        true
    }

    // View functions
    pub fn get_agent(&self, agent_id: u64) -> Option<AIAgentJson> {
        self.agents.get(&agent_id).map(|agent| agent.to_json())
    }

    pub fn get_project(&self, project_id: u64) -> Option<ProjectJson> {
        self.projects.get(&project_id).map(|project| project.to_json())
    }

    pub fn get_agent_resources(&self, agent_id: u64, from_index: u64, limit: u64) -> Vec<String> {
        let agent = self.agents.get(&agent_id).expect("Agent not found");
        agent.resources
            .iter()
            .skip(from_index as usize)
            .take(limit as usize)
            .collect()
    }
}