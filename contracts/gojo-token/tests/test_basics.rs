use near_workspaces::types::NearToken;
use serde_json::json;

const ONE_YOCTO: NearToken = NearToken::from_yoctonear(1);
const REGISTRATION_COST: NearToken = NearToken::from_yoctonear(12500000000000000000000); // 0.0125 NEAR


#[tokio::test]
async fn test_gojo_token() -> anyhow::Result<()> {
    let worker = near_workspaces::sandbox().await?;
    
    // Deploy contract
    let wasm = near_workspaces::compile_project("./").await?;
    let contract = worker.dev_deploy(&wasm).await?;
    
    // Create test accounts
    let owner = worker.dev_create_account().await?;
    let alice = worker.dev_create_account().await?;
    let bob = worker.dev_create_account().await?;
    
    // Initialize contract
    let init_contract = contract
        .call("init")
        .transact()
        .await?;
    
    assert!(init_contract.is_success());
    
    // Test metadata
    let metadata: FungibleTokenMetadata = contract
        .view("ft_metadata")
        .await?
        .json()?;
    
    assert_eq!(metadata.spec, "ft-1.0.0");
    assert_eq!(metadata.name, "Gojo Token");
    assert_eq!(metadata.symbol, "GOJO");
    assert_eq!(metadata.decimals, 24);
    
    // Test storage management 
    test_storage_management(&contract, &alice, &bob).await?;
    
    // Test minting restrictions
    let mint_result = owner
        .call(contract.id(), "mint")
        .args_json(json!({
            "account_id": alice.id(),
            "amount": NearToken::from_near(100)
        }))
        .deposit(ONE_YOCTO) 
        .transact()
        .await;
    
    assert!(mint_result.is_err());

    // Rest of test implementations...
    Ok(())
}


async fn test_storage_management(
    contract: &near_workspaces::Contract,
    alice: &near_workspaces::Account,
    bob: &near_workspaces::Account,
) -> anyhow::Result<()> {
    // Test storage deposit
    let alice_deposit = alice
        .call(contract.id(), "storage_deposit")
        .args_json(json!({
            "account_id": alice.id()
        }))
        .deposit(REGISTRATION_COST)
        .transact()
        .await?;
    
    assert!(alice_deposit.is_success());
    
    // Try to register again - should refund
    let second_deposit = alice
        .call(contract.id(), "storage_deposit")
        .args_json(json!({
            "account_id": alice.id()
        }))
        .deposit(REGISTRATION_COST)
        .transact()
        .await?;
    
    assert!(second_deposit.is_success());
    
    // Test storage balance bounds
    let bounds: StorageBalanceBounds = contract
        .view("storage_balance_bounds")
        .await?
        .json()?;
    
    assert!(bounds.min > NearToken::from_yoctonear(0));
    assert_eq!(bounds.min, bounds.max.unwrap());
    
    // Test storage balance of
    let alice_balance = contract
        .view("storage_balance_of")
        .args_json(json!({
            "account_id": alice.id()
        }))
        .await?
        .json::<Option<StorageBalance>>()?;
    
    assert!(alice_balance.is_some());
    
    // Test unregistered account
    let bob_balance = contract
        .view("storage_balance_of")
        .args_json(json!({
            "account_id": bob.id()
        }))
        .await?
        .json::<Option<StorageBalance>>()?;
    
    assert!(bob_balance.is_none());
    
    Ok(())
}

async fn test_transfers(
    contract: &near_workspaces::Contract,
    alice: &near_workspaces::Account,
    bob: &near_workspaces::Account,
) -> anyhow::Result<()> {
    // Register bob
    let bob_deposit = bob
        .call(contract.id(), "storage_deposit")
        .args_json(json!({
            "account_id": bob.id()
        }))
        .deposit(REGISTRATION_COST)
        .transact()
        .await?;
    
    assert!(bob_deposit.is_success());
    
    // Test ft_transfer without enough balance
    let failed_transfer = alice
        .call(contract.id(), "ft_transfer")
        .args_json(json!({
            "receiver_id": bob.id(),
            "amount": NearToken::from_near(1),
            "memo": null
        }))
        .deposit(ONE_YOCTO)
        .transact()
        .await;
    
    assert!(failed_transfer.is_err());
    
    // Test ft_transfer_call
    let transfer_call = alice
        .call(contract.id(), "ft_transfer_call")
        .args_json(json!({
            "receiver_id": bob.id(),
            "amount": NearToken::from_near(1),
            "memo": null,
            "msg": ""
        }))
        .deposit(ONE_YOCTO)
        .transact()
        .await;
    
    assert!(transfer_call.is_err());
    
    Ok(())
}

#[derive(Debug, serde::Deserialize)]
pub struct StorageBalance {
    pub total: NearToken,
    pub available: NearToken,
}

#[derive(Debug, serde::Deserialize)]
pub struct StorageBalanceBounds {
    pub min: NearToken,
    pub max: Option<NearToken>,
}

#[derive(Debug, serde::Deserialize, PartialEq)]
pub struct FungibleTokenMetadata {
    pub spec: String,
    pub name: String,
    pub symbol: String, 
    pub decimals: u8,
}