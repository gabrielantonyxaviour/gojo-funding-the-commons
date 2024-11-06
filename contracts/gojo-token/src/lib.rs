use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap}; 
use near_sdk::json_types::U128;
use near_sdk::{env, near_bindgen, AccountId, BorshStorageKey, NearToken, PanicOnDefault, StorageUsage};

pub mod ft_core;
pub mod events;
pub mod metadata;
pub mod storage;
pub mod internal;

use crate::metadata::*;
use crate::events::*;

const GOJO_ICON: &str = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2l10 20H2L12 2z'/%3E%3C/svg%3E";
const FT_METADATA_SPEC: &str = "ft-1.0.0";
pub const ZERO_TOKEN: NearToken = NearToken::from_yoctonear(0);

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub accounts: LookupMap<AccountId, NearToken>,
    pub total_supply: NearToken,
    pub bytes_for_longest_account_id: StorageUsage,
    pub metadata: LazyOption<FungibleTokenMetadata>,
}

#[derive(BorshSerialize, BorshStorageKey)]
pub enum StorageKey {
    Accounts,
    Metadata
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn init() -> Self {
        // Create default metadata
        let metadata = FungibleTokenMetadata {
            spec: FT_METADATA_SPEC.to_string(),
            name: "Gojo Token".to_string(), 
            symbol: "GOJO".to_string(),
            icon: Some(GOJO_ICON.to_string()),
            reference: None,
            reference_hash: None,
            decimals: 24,
        };

        // Verify metadata is valid
        metadata.assert_valid();

        // Create contract instance
        let mut contract = Self {
            accounts: LookupMap::new(StorageKey::Accounts),
            total_supply: ZERO_TOKEN,
            bytes_for_longest_account_id: 0,
            metadata: LazyOption::new(
                StorageKey::Metadata,
                Some(&metadata),
            ),
        };

        // Calculate storage for longest account ID
        contract.measure_bytes_for_longest_account_id();

        contract
    }

    #[init]
    pub fn new(metadata: FungibleTokenMetadata) -> Self {
        // Verify metadata is valid
        metadata.assert_valid(); 

        // Create contract instance
        let mut contract = Self {
            accounts: LookupMap::new(StorageKey::Accounts),
            total_supply: ZERO_TOKEN,
            bytes_for_longest_account_id: 0,
            metadata: LazyOption::new(
                StorageKey::Metadata, 
                Some(&metadata),
            ),
        };

        // Calculate storage for longest account ID
        contract.measure_bytes_for_longest_account_id();

        contract
    }

    pub fn mint(&mut self, account_id: &AccountId, amount: NearToken) {
        // Check if caller is protocol contract
        let token_domain = env::current_account_id().to_string();
        let caller_domain = env::predecessor_account_id().to_string();
        let token_parts: Vec<&str> = token_domain.split('.').collect();
        let caller_parts: Vec<&str> = caller_domain.split('.').collect();

        assert!(
            caller_parts.len() == token_parts.len() - 1 && 
            caller_parts.iter().zip(token_parts[1..].iter()).all(|(a, b)| a == b),
            "Only protocol contract can mint"
        );

        // Register account if needed
        if !self.accounts.contains_key(account_id) {
            self.internal_register_account(account_id);
        }

        // Mint tokens
        self.internal_deposit(account_id, amount);
        self.total_supply = self.total_supply.saturating_add(amount);

        // Emit mint event
        FtMint {
            owner_id: account_id,
            amount: &amount,
            memo: Some("Minted GOJO tokens"),
        }.emit();
    }

    pub fn burn(&mut self, account_id: &AccountId, amount: NearToken) {
        // Check if caller is protocol contract
        let token_domain = env::current_account_id().to_string();
        let caller_domain = env::predecessor_account_id().to_string();
        let token_parts: Vec<&str> = token_domain.split('.').collect();
        let caller_parts: Vec<&str> = caller_domain.split('.').collect();

        assert!(
            caller_parts.len() == token_parts.len() - 1 && 
            caller_parts.iter().zip(token_parts[1..].iter()).all(|(a, b)| a == b),
            "Only protocol contract can burn"
        );

        // Burn tokens
        self.internal_withdraw(account_id, amount);
        self.total_supply = self.total_supply.saturating_sub(amount);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_init() {
        let contract = Contract::init();
        
        assert_eq!(contract.total_supply, ZERO_TOKEN);
        assert!(contract.metadata.get().is_some());
        
        let metadata = contract.metadata.get().unwrap();
        assert_eq!(metadata.spec, FT_METADATA_SPEC);
        assert_eq!(metadata.name, "Gojo Token");
        assert_eq!(metadata.symbol, "GOJO");
        assert_eq!(metadata.decimals, 24);
    }

    #[test]
    fn test_new() {
        let metadata = FungibleTokenMetadata {
            spec: FT_METADATA_SPEC.to_string(),
            name: "Test Token".to_string(),
            symbol: "TEST".to_string(),
            icon: None,
            reference: None,
            reference_hash: None,
            decimals: 18,
        };
        
        let contract = Contract::new(metadata.clone());
        
        assert_eq!(contract.total_supply, ZERO_TOKEN);
        let stored_metadata = contract.metadata.get().unwrap();
        assert_eq!(stored_metadata.spec, metadata.spec);
        assert_eq!(stored_metadata.name, metadata.name);
        assert_eq!(stored_metadata.symbol, metadata.symbol);
        assert_eq!(stored_metadata.decimals, metadata.decimals);
    }
}