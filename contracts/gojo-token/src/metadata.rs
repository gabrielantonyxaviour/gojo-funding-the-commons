use near_sdk::borsh::{ BorshDeserialize, BorshSerialize};
use near_sdk::json_types::Base64VecU8;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::near_bindgen;
use near_sdk::{NearSchema, require};

use crate::*;

#[derive(BorshDeserialize, BorshSerialize, Clone, Deserialize, Serialize, Debug, PartialEq, NearSchema)]
#[borsh(crate = "near_sdk::borsh")]
#[serde(crate = "near_sdk::serde")]
pub struct FungibleTokenMetadata {
    pub spec: String,
    pub name: String,
    pub symbol: String,
    pub icon: Option<String>,
    pub reference: Option<String>,
    pub reference_hash: Option<Base64VecU8>,
    pub decimals: u8,
}

impl FungibleTokenMetadata {
    pub fn assert_valid(&self) {
        require!(self.spec == FT_METADATA_SPEC, "Metadata spec is invalid");
        require!(!self.name.is_empty(), "Name cannot be empty");
        require!(!self.symbol.is_empty(), "Symbol cannot be empty");
        require!(self.decimals <= 24, "Decimals must be less than 24");
    }
}

pub trait FungibleTokenMetadataProvider {
    fn ft_metadata(&self) -> FungibleTokenMetadata;
}

#[near_bindgen]
impl FungibleTokenMetadataProvider for Contract {
    fn ft_metadata(&self) -> FungibleTokenMetadata {
        self.metadata.get().unwrap()
    }
}