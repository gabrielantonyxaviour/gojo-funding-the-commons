# app/models/schemas.py
from pydantic import BaseModel
from typing import List, Optional

class Agent(BaseModel):
    id: int
    name: str
    image: str

class AIQueryContract(BaseModel):
    nodeId: str
    chainId: int
    code: str
    label: str
    usedAIAgents: List[int]

class AIQuery(BaseModel):
    message: str
    contracts: List[AIQueryContract]
    selectedContract: Optional[str] = None
    selectedConnection: Optional[List[str]] = None

class AIResponse(BaseModel):
    message: str
    contracts: List[AIQueryContract]
    agentsUsedInGeneration: List[int]