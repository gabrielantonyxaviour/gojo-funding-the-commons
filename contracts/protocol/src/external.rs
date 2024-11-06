use near_sdk::{AccountId, NearToken, ext_contract};

#[ext_contract(ft_contract)]
pub trait FT {
    fn mint(&mut self, account_id: &AccountId, amount: NearToken);
    fn burn(&mut self, account_id: &AccountId, amount: NearToken);
}