from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import aiohttp
import asyncio
import openai
from typing import List, Dict, Optional
import json
import logging
from fastapi.middleware.cors import CORSMiddleware

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Smart Contract Generator API",
    description="Multi-agent system for generating smart contracts using LayerZero, Fhenix, and Sign Protocol",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response validation
class ContractRequest(BaseModel):
    prompt: str
    openai_api_key: str

class ContractResponse(BaseModel):
    name1: str
    name2: Optional[str]
    code1: str
    code2: Optional[str]
    description: str
    chain1: str
    chain2: str
    agents_used: List[str]
    status: str

class MultiAgentProcessor:
    def __init__(self, openai_api_key: str):
        openai.api_key = openai_api_key
        self.endpoints = {
            "LayerZero": "https://layerzeroprotocolagent.onrender.com/generate_contract",
            "Fhenix": "https://fhenixprotocolagent.onrender.com/generate_contract",
            "Sign Protocol": "https://signprotocolagent.onrender.com/generate_contract"
        }
        
        self.keywords = {
            "LayerZero": ["layerzero", "cross-chain", "cross chain", "bridge"],
            "Fhenix": ["fhenix", "privacy", "encrypted", "confidential", "vote"],
            "Sign Protocol": ["sign", "signature", "authentication", "attest"]
        }

    def identify_required_agents(self, prompt: str) -> List[str]:
        prompt = prompt.lower()
        required_agents = []
        
        for agent, keywords in self.keywords.items():
            if any(keyword in prompt for keyword in keywords):
                required_agents.append(agent)
        
        return required_agents

    async def get_agent_response(self, agent: str, prompt: str, session: aiohttp.ClientSession) -> str:
        """Get response from a specific agent."""
        logger.debug(f"Sending request to {agent} with prompt: {prompt}")
        
        payload = {
            "question": prompt
        }
        
        try:
            async with session.post(
                self.endpoints[agent],
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                logger.debug(f"Response status from {agent}: {response.status}")
                
                if response.status == 200:
                    text_response = await response.text()
                    logger.debug(f"Raw response from {agent}: {text_response}")
                    
                    try:
                        data = json.loads(text_response)
                        return text_response
                    except json.JSONDecodeError:
                        return text_response
                else:
                    error_text = await response.text()
                    logger.error(f"Error from {agent}: {error_text}")
                    raise HTTPException(status_code=response.status, detail=f"Error from {agent}: {error_text}")
                    
        except Exception as e:
            logger.error(f"Error communicating with {agent}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error communicating with {agent}: {str(e)}")

    async def combine_code_with_openai(self, combined_code: str) -> str:
        """Use OpenAI to combine the given responses into a final single code."""
        logger.debug("Combining code using OpenAI API.")
        
        chat_prompt = [
            {"role": "system", "content": """1.) You are an expert smart contract developer.
             2.) There are a few cases where you should make only one contract, and there are other few cases where you should make 2 contracts.
             3.) Two contracts should be made when Layerzero gives two contracts for anything involving crosschain airdrops
             4.) Your response should only be in this format:
             
             {
    "name1": "name of the contract",
    "name2": "name of the second contract, if a second one is generated",
    "code1": "the code of the first contract",
    "code2": "the code of the second contract if there is a need for a second contract for an application like crosschain airdrops",
    "description": "a VERY SHORT description of what the contracts do"
    "chain1": "this value could be "80003" in most cases, but if any word in this list is present  [
        'private', 'privacy',
        'confidential', 'confidentiality',
        'encrypted', 'encryption',
        'fhe', 'fully homomorphic encryption',
        'homomorphic', 'homomorphism',
        'zero-knowledge', 'zero knowledge',
        'zkp', 'zero-knowledge proof',
        'secret', 'secrecy',
        'hidden', 'hide',
        'concealed', 'conceal',
        'obscured', 'obscure',
        'masked', 'mask',
        'anonymized', 'anonymize',
        'shielded', 'shield',
        'obfuscated', 'obfuscate',
        'stealth', 'stealthy',
        'veiled', 'veil',
        'cloaked', 'cloak',
        'encrypted computation',
        'privacy-preserving'
    ] is used it should carry the value "8008135". If polygon is used in the first contarct then, "80002" should be the value, and "1444673419" if SKALE is used by the first contract."
    "chain2": "similarly if the second contract uses any of these chains mentioned, use their respective number here."
    5.) If you are implementing sign protocol, remember that sign could be implemented only in polygon network and not in SKALE, so let's say you want to attest a crosschain airdrop, you should include the sign protocol features only in the polygon contract and not in the SKALE contract.
}"""},
            {"role": "user", "content": f"Combine the following protocol contract parts into a single contract: {combined_code}"}
        ]
        
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4-turbo",
                messages=chat_prompt,
                max_tokens=1500,
                temperature=0.5,
            )
            combined_code_response = response['choices'][0]['message']['content']
            logger.debug(f"OpenAI response: {combined_code_response}")
            return combined_code_response
        except Exception as e:
            logger.error(f"Error combining contracts with OpenAI: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error combining contracts with OpenAI: {str(e)}")

    async def process_prompt(self, prompt: str) -> Dict[str, any]:
        """Process the prompt and return combined responses."""
        logger.debug(f"Processing prompt: {prompt}")
        required_agents = self.identify_required_agents(prompt)
        
        if not required_agents:
            raise HTTPException(
                status_code=400,
                detail="No specific protocols identified in the prompt. Please include specific mentions of LayerZero, Fhenix, or Sign Protocol."
            )
        
        logger.debug(f"Required agents: {required_agents}")
        
        connector = aiohttp.TCPConnector(ssl=False)
        
        async with aiohttp.ClientSession(connector=connector) as session:
            tasks = []
            for agent in required_agents:
                tasks.append(self.get_agent_response(agent, prompt, session))
            
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            logger.debug(f"Gathered responses: {responses}")
            
            valid_responses = {}
            combined_code = ""
            for agent, response in zip(required_agents, responses):
                if isinstance(response, Exception):
                    logger.error(f"Error from {agent}: {str(response)}")
                    continue
                
                if response and not response.startswith("Error"):
                    valid_responses[agent] = response
                    combined_code += f"\n\n/* {agent} contract part */\n{response}"
                    logger.debug(f"Valid response received from {agent}")
                else:
                    logger.error(f"Invalid response from {agent}: {response}")
            
            if not valid_responses:
                raise HTTPException(
                    status_code=500,
                    detail="Error: No valid responses received from any agents. Please try again later."
                )
            
            final_contract = await self.combine_code_with_openai(combined_code)
            
            try:
                parsed_contract = json.loads(final_contract)
                return {
                    "name1": parsed_contract.get("name1", ""),
                    "name2": parsed_contract.get("name2", ""),
                    "code1": parsed_contract.get("code1", ""),
                    "code2": parsed_contract.get("code2", ""),
                    "description": parsed_contract.get("description", ""),
                    "chain1": parsed_contract.get("chain1", ""),
                    "chain2": parsed_contract.get("chain2", ""),
                    "agents_used": list(valid_responses.keys()),
                    "status": "success"
                }
            except json.JSONDecodeError:
                logger.error("Failed to parse the contract JSON")
                raise HTTPException(status_code=500, detail="Failed to parse the contract JSON")

@app.post("/generate-contract", response_model=ContractResponse)
async def generate_contract(request: ContractRequest):
    """
    Generate a smart contract based on the provided prompt.
    
    - **prompt**: Description of the desired smart contract functionality
    - **openai_api_key**: Your OpenAI API key for contract combination
    """
    try:
        processor = MultiAgentProcessor(request.openai_api_key)
        result = await processor.process_prompt(request.prompt)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Check if the API is running"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)