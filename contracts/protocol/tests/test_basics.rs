use near_sdk::json_types::{U64, U128};
use near_sdk::AccountId;
use near_workspaces::{types::NearToken, Account, Contract};
use near_workspaces::types::Gas;
use serde_json::json;

const TEN_NEAR: NearToken = NearToken::from_near(10);
const FIVE_NEAR: NearToken = NearToken::from_near(5);

use near_sdk::serde::{Serialize, Deserialize};
use near_sdk::NearSchema;

#[derive(Debug, Serialize, Deserialize, NearSchema)]
#[serde(crate = "near_sdk::serde")]
struct AIAgentJson {
    id: u64,
    name: String,
    metadata_walrus_hash: String,
    created_at: U64,
    resources: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, NearSchema)]
#[serde(crate = "near_sdk::serde")]
struct ProjectJson {
    id: u64,
    owner: AccountId,
    name: String,
    metadata_walrus_hash: String,
    created_at: U64,
    generations: Vec<GenerationJson>,
}

#[derive(Debug, Serialize, Deserialize, NearSchema)]
#[serde(crate = "near_sdk::serde")]
struct GenerationJson {
    id: u64,
    project_id: u64,
    agents_used: Vec<u64>,
    generation_walrus_hash: String,
    created_at: U64,
    gojo_burned: U128,
}

#[tokio::test]
async fn test_protocol_contract() -> Result<(), Box<dyn std::error::Error>> {
    let worker = near_workspaces::sandbox().await?;
    
    // Create owner and user accounts
    let owner = worker
        .dev_create_account()
        .await?;
    
    let user = worker
        .dev_create_account()
        .await?;

    let contract_wasm = near_workspaces::compile_project("./").await?;
    let protocol = worker.dev_deploy(&contract_wasm).await?;

    // Initialize protocol with owner
    protocol
        .call("init")
        .args_json(json!({
            "owner": owner.id()
        }))
        .transact()
        .await?;

    // Deploy token contract
    let deploy_result = owner
        .call(protocol.id(), "deploy_token")
        .args_json(json!({}))
        .deposit(FIVE_NEAR)
        .gas(Gas::from_tgas(200))
        .transact()
        .await?;

    // Wait for deployment to complete
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

    // Test deposit NEAR
    let deposit_result = owner
        .call(protocol.id(), "deposit_near")
        .args_json(json!({}))
        .deposit(NearToken::from_near(1))
        .gas(Gas::from_tgas(200))
        .transact()
        .await?;

    // Wait for deposit to complete
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

    // Create AI agent
    let agent_id: u64 = owner
        .call(protocol.id(), "create_ai_agent")
        .args_json(json!({
            "name": "Test Agent",
            "metadata_walrus_hash": "hash123"
        }))
        .gas(Gas::from_tgas(200))
        .transact()
        .await?
        .json()?;

    // Add resource to agent
    owner
        .call(protocol.id(), "create_resource")
        .args_json(json!({
            "agent_id": agent_id,
            "resource_walrus_hash": "resource_hash123"
        }))
        .gas(Gas::from_tgas(200))
        .transact()
        .await?;

    // Create project
    let project_id: u64 = user
        .call(protocol.id(), "create_project")
        .args_json(json!({
            "name": "Test Project",
            "metadata_walrus_hash": "project_hash123"
        }))
        .gas(Gas::from_tgas(200))
        .transact()
        .await?
        .json()?;

    // Make a generation
    user
        .call(protocol.id(), "make_generation")
        .args_json(json!({
            "project_id": project_id,
            "agents_used": [agent_id],
            "generation_walrus_hash": "gen_hash123"
        }))
        .gas(Gas::from_tgas(200))
        .transact()
        .await?;

    // Test view functions
    let agent = protocol
        .view("get_agent")
        .args_json(json!({"agent_id": agent_id}))
        .await?
        .json::<Option<AIAgentJson>>()?;

    assert!(agent.is_some(), "Failed to get agent");
    let agent = agent.unwrap();
    assert_eq!(agent.name, "Test Agent");

    let project = protocol
        .view("get_project")
        .args_json(json!({"project_id": project_id}))
        .await?
        .json::<Option<ProjectJson>>()?;

    assert!(project.is_some(), "Failed to get project");
    let project = project.unwrap();
    assert_eq!(project.name, "Test Project");

    let resources = protocol
        .view("get_agent_resources")
        .args_json(json!({
            "agent_id": agent_id,
            "from_index": 0,
            "limit": 10
        }))
        .await?
        .json::<Vec<String>>()?;

    assert_eq!(resources.len(), 1, "Incorrect number of resources");
    assert_eq!(resources[0], "resource_hash123");

    Ok(())
}