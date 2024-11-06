from dotenv import load_dotenv
from typing import Sequence, List, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.graph.message import add_messages
from typing_extensions import Annotated, TypedDict
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, MessagesState, StateGraph
from langchain_core.documents import Document
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain.chains import create_retrieval_chain, create_history_aware_retriever
from langchain.chains.combine_documents import create_stuff_documents_chain
from os import getenv
import random
import re 

load_dotenv()
 
origins = getenv("ALLOWED_ORIGINS", "http://localhost:3000,https://gojo-redacted.vercel.app/,https://gojo-protocol.vercel.app/").split(",")

class AIQueryContract(BaseModel):
    nodeId: str
    chainId: int
    code: str
    label: str
    thread_id: str

class AIQuery(BaseModel):
    message: str
    name: str
    contracts: List[AIQueryContract]
    selectedContract: Optional[str]
    selectedConnection: Optional[List[str]]
    thread_id: str

class AIResponse(BaseModel):
    message: str
    name: str
    contracts: List[AIQueryContract]
    thread_id: str

CHAIN_INFO = {
    'ethereum': {'id': 11155111, 'keywords': ['ethereum', 'eth', 'sepolia']},
    'base': {'id': 84532, 'keywords': ['base', 'base sepolia']},
    'polygon': {'id': 80002, 'keywords': ['polygon', 'amoy', 'polygon amoy']},
}

DEFAULT_CHAIN_ID = 11155111  # Ethereum Sepolia
DEFAULT_CROSS_CHAIN_PAIRS = [(11155111, 80002)]  # Default: Ethereum Sepolia - Polygon Amoy
CHAIN_NAME_MAP = {
    11155111: 'EthereumSepolia',
    84532: 'BaseSepolia',
    80002: 'PolygonAmoy'
}

# Document loading and processing setup
loader = DirectoryLoader("data/", glob="**/*.txt", loader_cls=TextLoader)
docs = loader.load()

text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)
vectorstore = InMemoryVectorStore.from_documents(
    documents=splits, embedding=OpenAIEmbeddings()
)

model = ChatOpenAI(model="gpt-4o-mini")

# Prompt setup
contextualize_q_system_prompt = """
You are an assistant for generating and modifying Solidity smart contracts. 
Use the following context and existing contracts to generate or modify contracts.
If you don't know how to implement something, say that you don't know.

Context about existing contracts:
{context}

Existing Contracts:
{contracts}

Selected Contract: {selected_contract}
Selected Connection: {selected_connection}

Generate your response as Solidity code when appropriate, and provide explanations when needed.
"""

contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)

# Retriever setup
retriever = vectorstore.as_retriever()
history_aware_retriever = create_history_aware_retriever(
    model, retriever, contextualize_q_prompt
)

question_answer_chain = create_stuff_documents_chain(model, contextualize_q_prompt)
rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)

# State definition
class State(TypedDict):
    chat_history: Annotated[Sequence[BaseMessage], add_messages]
    input_message: str
    context: str
    answer: str
    contracts: List[AIQueryContract]

def get_short_name_map() -> dict:
    """Get mapping of concepts to short names"""
    return {
        # DeFi related
        'liquidity': 'Flux',
        'pool': 'Pool',
        'yield': 'Yield',
        'farm': 'Farm',
        'stake': 'Stax',
        'lending': 'Lend',
        'borrow': 'Loan',
        'swap': 'Swap',
        
        # Governance
        'dao': 'Dao',
        'vote': 'Vote',
        'govern': 'Gov',
        
        # NFT
        'nft': 'NFT',
        'token': 'Token',
        'mint': 'Mint',
        'game': 'Play',
        
        # Bridge
        'bridge': 'Link',
        'cross': 'Cross',
        'transfer': 'Port',
        
        # Oracle
        'oracle': 'Eye',
        'price': 'Price',
        'feed': 'Feed',
        
        # Security
        'multisig': 'Safe',
        'vault': 'Vault',
        'guard': 'Guard',
        
        # Distribution
        'airdrop': 'Drop',
        'claim': 'Claim',
        'reward': 'Prize'
    }

def extract_main_concept(message: str, code: str) -> str:
    """Extract the main concept from message and code"""
    # Convert to lowercase and split into words
    text = (message + " " + code).lower()
    
    # Get short name mapping
    name_map = get_short_name_map()
    
    # Find the first matching concept
    for concept in name_map.keys():
        if concept in text:
            return name_map[concept]
    
    return "Dapp"

def generate_project_name(message: str, contracts: List[AIQueryContract]) -> str:
    """Generate a short project name (max 10 letters) based on context"""
    try:
        if not message or not contracts:
            return "Dapp"
            
        # Combine all contract code
        all_code = " ".join(contract.code for contract in contracts)
        
        # Get the main concept
        name = extract_main_concept(message, all_code)
        
        # Ensure name is no longer than 10 characters
        if len(name) > 10:
            name = name[:10]
            
        # Capitalize first letter if not already
        name = name[0].upper() + name[1:] if name else "Dapp"
        
        return name
        
    except Exception as e:
        print(f"Error generating project name: {str(e)}")
        return "Dapp"

def determine_chain_ids(message: str, code: str) -> list[int]:
    """Determine which chain IDs to use based on the message content"""
    message_lower = message.lower()
    
    # Check if all chains are requested
    if any(word in message_lower for word in ['all chains', 'all networks', 'three chains']):
        return [11155111, 84532, 80002]
    
    # Check for specific chains mentioned
    mentioned_chains = []
    for chain, info in CHAIN_INFO.items():
        if any(keyword in message_lower for keyword in info['keywords']):
            mentioned_chains.append(info['id'])
    
    # Handle cross-chain scenarios
    if any(term in message_lower for term in ['cross chain', 'cross-chain', 'crosschain']):
        if len(mentioned_chains) >= 2:
            return mentioned_chains[:2]  # Use first two mentioned chains
        return [11155111, 80002]  # Default cross-chain pair
    
    # Return mentioned chains or default
    return mentioned_chains if mentioned_chains else [DEFAULT_CHAIN_ID]

def format_contracts(contracts: List[AIQueryContract]) -> str:
    """Format contracts for prompt context"""
    if not contracts:
        return "No existing contracts"
    
    formatted = []
    for contract in contracts:
        formatted.append(f"""Contract ID: {contract.nodeId} \nChain ID: {contract.chainId}\nLabel: {contract.label}\nCode: {contract.code}\n\n\n""")
    return "\n".join(formatted)

def get_selected_contract(contracts: List[AIQueryContract], selected_id: Optional[str]) -> str:
    """Get details of selected contract"""
    if not selected_id:
        return "No contract selected"
    
    for contract in contracts:
        if contract.nodeId == selected_id:
            return f"Working with contract '{contract.label}' ({contract.nodeId})"
    return "Selected contract not found"

def generate_contract_label(code: str, context: str = "") -> str:
    """Generate a meaningful name for the contract based on its code and context"""
    # Common contract patterns to look for
    patterns = {
        "airdrop": ["airdrop", "drop", "distribute"],
        "token": ["ERC20", "ERC721", "token"],
        "bridge": ["bridge", "cross chain", "layerzero"],
        "vault": ["vault", "storage", "safe"],
        "governance": ["governance", "dao", "voting"],
        "staking": ["stake", "staking", "reward"],
    }
    
    code_lower = code.lower()
    context_lower = context.lower()
    
    # Check for patterns in both code and context
    for category, keywords in patterns.items():
        if any(keyword in code_lower or keyword in context_lower for keyword in keywords):
            if "cross" in code_lower or "cross" in context_lower:
                return f"CrossChain{category.title()}Contract"
            return f"{category.title()}Contract"
    
    return "SmartContract"


def format_connection(contracts: List[AIQueryContract], connection: Optional[List[str]]) -> str:
    """Format connection information"""
    if not connection:
        return "No connection selected"
    
    contract_map = {c.nodeId: c.label for c in contracts}
    connected_contracts = [contract_map.get(id, "Unknown") for id in connection]
    return f"Connection between: {' and '.join(connected_contracts)}"


def process_input(state: State) -> State:
    """Process the input message and update the state."""
    return {
        "chat_history": state.get("chat_history", []),
        "input_message": state["input_message"],
        "context": state.get("context", ""),
        "answer": state.get("answer", ""),
        "contracts": state.get("contracts", [])
    }


def call_model(state: State) -> State:
    response = rag_chain.invoke({
        "chat_history": state.get("chat_history", []),
        "input": state["input_message"],
        "context": state.get("context", ""),
        "contracts": format_contracts(state.get("contracts", [])),
        "selected_contract": state.get("selected_contract", "No contract selected"),
        "selected_connection": state.get("selected_connection", "No connection selected")
    })
    
    response_parts = response["answer"].split("```solidity")
    message = response_parts[0].strip()
    
    new_contracts = []
    if len(response_parts) > 1:
        code = response_parts[1].split("```")[0].strip()
        chain_ids = determine_chain_ids(state["input_message"], code)
        
        for i, chain_id in enumerate(chain_ids):
            label = generate_contract_label(code, message)
            if len(chain_ids) > 1:
                label = f"{label}{CHAIN_NAME_MAP[chain_id]}"
            new_contracts.append(AIQueryContract(
                nodeId=f"{len(state.get('contracts', [])) + i + 1}",
                chainId=chain_id,
                code=code,
                label=label
            ))
    
    return {
        "chat_history": state.get("chat_history", []) + [
            HumanMessage(content=state["input_message"]),
            AIMessage(content=message)
        ],
        "input_message": state["input_message"],
        "context": response.get("context", ""),
        "answer": message,
        "contracts": [*state.get("contracts", []), *new_contracts]
    }

# Graph setup
workflow = StateGraph(State)

# Add nodes and edges
workflow.add_node("process_input", process_input)
workflow.add_node("model", call_model)

# Define the flow
workflow.add_edge(START, "process_input")
workflow.add_edge("process_input", "model")
workflow.set_finish_point("model")

# Compile the workflow
memory = MemorySaver()
ai_app = workflow.compile(checkpointer=memory)

# FastAPI setup
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class Message(BaseModel):
    input: str

@app.post("/chat/")
async def chat(query: AIQuery) -> AIResponse:
    initial_state = {
        "input_message": query.message,
        "chat_history": [],
        "context": "",
        "answer": "",
        "contracts": query.contracts,
        "selected_contract": get_selected_contract(query.contracts, query.selectedContract),
        "selected_connection": format_connection(query.contracts, query.selectedConnection)
    }
    
    thread_id = query.thread_id if query.thread_id else random.randint(1, 100000000)
    output = ai_app.invoke(initial_state, config={"configurable": {"thread_id": str(thread_id)}})

    project_name = query.name if query.name.strip() else generate_project_name(query.message, output["contracts"])
    
    return AIResponse(
        message=output["answer"],
        contracts=output["contracts"],
        name=project_name,
        thread_id=thread_id
    )