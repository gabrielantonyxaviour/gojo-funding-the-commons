from dotenv import load_dotenv
from typing import Sequence, List, Optional
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

load_dotenv()

class AIQueryContract(BaseModel):
    nodeId: str
    chainId: int
    code: str
    label: str

class AIQuery(BaseModel):
    message: str
    contracts: List[AIQueryContract]
    selectedContract: Optional[str]
    selectedConnection: Optional[List[str]]

class AIResponse(BaseModel):
    message: str
    contracts: List[AIQueryContract]

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


def call_model(state: State):
    """Call the RAG chain and update the state with the response."""
    response = rag_chain.invoke({
        "chat_history": state.get("chat_history", []),
        "input": state["input_message"],
        "contracts": format_contracts(state.get("contracts", [])),
        "selected_contract": state.get("selected_contract", "No contract selected"),
        "selected_connection": state.get("selected_connection", "No connection selected")
    })
    
    # Parse the response to extract any new contracts
    # This is a simplified example - you might need more sophisticated parsing
    new_contracts = []
    if "```solidity" in response["answer"]:
        code_blocks = response["answer"].split("```solidity")
        for i in range(1, len(code_blocks)):
            if "```" in code_blocks[i]:
                code = code_blocks[i].split("```")[0].strip()
                new_contracts.append(AIQueryContract(
                    nodeId=f"new_contract_{i}",
                    chainId=1,  # Default chain ID
                    code=code,
                    label=f"Generated Contract {i}"
                ))
    
    return {
        "chat_history": [
            *state.get("chat_history", []),
            HumanMessage(content=state["input_message"]),
            AIMessage(content=response["answer"])
        ],
        "input_message": state["input_message"],
        "context": response.get("context", ""),
        "answer": response["answer"],
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
    
    output = ai_app.invoke(initial_state, config={"configurable": {"thread_id": "121322342"}})
    
    return AIResponse(
        message=output["answer"],
        contracts=output["contracts"]
    )