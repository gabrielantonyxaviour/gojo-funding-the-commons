# app/services/agent_manager.py
import os
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.chat_models import ChatOpenAI
from langchain_community.vectorstores import Chroma
from typing import List, Dict, Set
import numpy as np
from app.config import Config, ChainId
from app.utils.contract_loader import ContractLoader
from app.services.contract_embedder import ContractEmbedder
class AIAgentManager:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(openai_api_key=Config.OPENAI_API_KEY)
        
        # Initialize contract loader and embedder
        self.contract_loader = ContractLoader()
        self.contract_embedder = ContractEmbedder()
        
        # Load all contracts
        self.contracts = self.contract_loader.load_all_contracts()
        
        # Create vector store
        self.vector_store = self.contract_embedder.create_vector_store(self.contracts)
        
        # Agent definitions
        self.agents = {
            1: {
                "name": "Chainlink",
                "keywords": ["randomness", "price oracle", "VRF", "oracle data", "price feeds"],
                "protocol": "chainlink"
            },
            2: {
                "name": "Sign Protocol",
                "keywords": ["attestation", "validate attestations", "on-chain hooks", "proof", "attest"],
                "protocol": "sign"
            },
            3: {
                "name": "LayerZero",
                "keywords": ["cross-chain", "multi-chain", "LayerZero", "contract interaction", "interoperability"],
                "protocol": "layerzero"
            }
        }