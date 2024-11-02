import os
from dotenv import load_dotenv
from enum import Enum

load_dotenv()

class Config:
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    if not OPENAI_API_KEY:
        raise ValueError("Please set the OPENAI_API_KEY environment variable")
    
    SIMILARITY_THRESHOLD = 0.6
    
class ChainId(Enum):
    ETHEREUM_SEPOLIA = 11155111
    POLYGON_AMOY = 80002
    BASE_SEPOLIA = 84532
