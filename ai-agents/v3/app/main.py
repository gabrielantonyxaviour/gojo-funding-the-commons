# app/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models.schemas import AIQuery, AIResponse
from app.services.agent_manager import AIAgentManager

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the AI Agent Manager
agent_manager = AIAgentManager()

@app.post("/generate-code", response_model=AIResponse)
async def generate_code(query: AIQuery):
    try:
        chain_ids = {contract.chainId for contract in query.contracts}
        relevant_agents = agent_manager.identify_relevant_agents(query.message, chain_ids)
        modified_contracts = query.contracts.copy()
        
        if query.selectedContract:
            for contract in modified_contracts:
                if contract.nodeId == query.selectedContract:
                    contract.code = agent_manager.generate_contract_code(
                        query.message,
                        relevant_agents,
                        contract.chainId
                    )
                    contract.usedAIAgents = relevant_agents
        
        elif query.selectedConnection:
            contract_ids = query.selectedConnection[0].split("-")
            connected_contracts = [c for c in modified_contracts if c.nodeId in contract_ids]
            
            if len({c.chainId for c in connected_contracts}) > 1:
                relevant_agents = list(set(relevant_agents) | {3})
            
            for contract in modified_contracts:
                if contract.nodeId in contract_ids:
                    contract.code = agent_manager.generate_contract_code(
                        query.message,
                        relevant_agents,
                        contract.chainId
                    )
                    contract.usedAIAgents = relevant_agents
        
        else:
            for contract in modified_contracts:
                contract.code = agent_manager.generate_contract_code(
                    query.message,
                    relevant_agents,
                    contract.chainId
                )
                contract.usedAIAgents = relevant_agents

        agent_names = [agent_manager.agents[aid]["name"] for aid in relevant_agents]
        response_message = f"Generated code using {', '.join(agent_names)}"
        
        return AIResponse(
            message=response_message,
            contracts=modified_contracts,
            agentsUsedInGeneration=relevant_agents
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)