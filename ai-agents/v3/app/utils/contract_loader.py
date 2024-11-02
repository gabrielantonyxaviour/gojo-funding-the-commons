from typing import Dict, List
import json
import os
from pathlib import Path

class ContractLoader:
    def __init__(self, contracts_dir: str = "data/contracts"):
        self.contracts_dir = Path(contracts_dir)
        self.deployed_contracts_dir = self.contracts_dir / "deployed"
        
    def load_contract_file(self, filename: str) -> str:
        file_path = self.contracts_dir / filename
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except FileNotFoundError:
            print(f"Warning: Contract file {filename} not found")
            return ""

    def load_deployed_contracts(self, protocol: str) -> Dict:
        file_path = self.deployed_contracts_dir / f"{protocol}_deployed.json"
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: Deployed contracts file for {protocol} not found")
            return {}

    def load_all_contracts(self) -> Dict[str, Dict]:
        contracts = {
            "layerzero": {
                "source": self.load_contract_file("layerzero.txt"),
                "deployed": self.load_deployed_contracts("layerzero")
            },
            "chainlink": {
                "source": self.load_contract_file("chainlink.txt"),
                "deployed": self.load_deployed_contracts("chainlink")
            },
            "sign": {
                "source": self.load_contract_file("sign.txt"),
                "deployed": self.load_deployed_contracts("sign")
            },
            "openzeppelin": {
                "source": self.load_contract_file("openzeppelin.txt"),
                "deployed": {}
            }
        }
        return contracts