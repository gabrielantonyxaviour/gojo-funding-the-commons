# app/services/agent_manager.py

from typing import List, Dict, Set, Sequence
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.vectorstores import VectorStore
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from typing_extensions import TypedDict, Annotated
from app.config import Config, ChainId

class AIAgentManager:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0,
            openai_api_key=Config.OPENAI_API_KEY
        )
        
        # Initialize vector stores for each protocol
        self.vector_stores = self._initialize_vector_stores()
        
        # Create retrievers for each protocol
        self.retrievers = {
            protocol: vs.as_retriever() 
            for protocol, vs in self.vector_stores.items()
        }
        
        # Create RAG chains for each protocol
        self.rag_chains = self._initialize_rag_chains()
        
        # Initialize memory
        self.memory = MemorySaver()
        
        # Set up the state graph
        self.app = self._initialize_state_graph()

    def _initialize_vector_stores(self) -> Dict[str, VectorStore]:
        """Initialize vector stores for each protocol"""
        embeddings = OpenAIEmbeddings(openai_api_key=Config.OPENAI_API_KEY)
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
        )
        
        protocols = {
            "chainlink": "chainlink.txt",
            "sign": "sign.txt",
            "layerzero": "layerzero.txt",
            "openzeppelin": "openzeppelin.txt"
        }
        
        vector_stores = {}
        for protocol, filename in protocols.items():
            try:
                with open(f"data/contracts/{filename}", "r") as f:
                    content = f.read()
                
                splits = text_splitter.split_text(content)
                
                vector_stores[protocol] = Chroma.from_texts(
                    texts=splits,
                    embedding=embeddings,
                    collection_name=f"{protocol}_collection",
                    persist_directory=f"./chroma_db/{protocol}"
                )
            except Exception as e:
                print(f"Error loading {protocol} contracts: {e}")
                continue
        
        return vector_stores

    def _initialize_rag_chains(self):
        """Initialize RAG chains for each protocol"""
        
        # System prompts for each protocol
        prompts = {
            "chainlink": """You are an expert in Chainlink smart contracts.
            Use the following context to generate or modify smart contract code.
            Focus on VRF for randomness and Price Feeds for oracle data.
            {context}""",
            
            "sign": """You are an expert in Sign Protocol smart contracts.
            Use the following context to generate or modify smart contract code.
            Focus on attestations and validation hooks.
            {context}""",
            
            "layerzero": """You are an expert in LayerZero cross-chain contracts.
            Use the following context to generate or modify smart contract code.
            Focus on cross-chain messaging and interactions.
            {context}""",
            
            "openzeppelin": """You are an expert in OpenZeppelin contracts.
            Use the following context to provide secure, standard implementations.
            Focus on best practices and security.
            {context}"""
        }
        
        rag_chains = {}
        for protocol in self.retrievers:
            # Create prompt
            prompt = ChatPromptTemplate.from_messages([
                ("system", prompts[protocol]),
                MessagesPlaceholder(variable_name="chat_history"),
                ("human", "{input}")
            ])
            
            # Create contextualization prompt
            contextualize_q_prompt = ChatPromptTemplate.from_messages([
                ("system", "Given the chat history and question, create a standalone question."),
                MessagesPlaceholder(variable_name="chat_history"),
                ("human", "{input}")
            ])
            
            # Create retriever chain
            history_aware_retriever = create_history_aware_retriever(
                self.llm,
                self.retrievers[protocol],
                contextualize_q_prompt
            )
            
            # Create QA chain
            qa_chain = create_stuff_documents_chain(
                self.llm,
                prompt
            )
            
            # Create final RAG chain
            rag_chains[protocol] = create_retrieval_chain(
                history_aware_retriever,
                qa_chain
            )
            
        return rag_chains

    def _initialize_state_graph(self):
        """Initialize the state graph for managing conversation flow"""
        
        # Define state schema
        class State(TypedDict):
            input: str
            chat_history: Annotated[Sequence[BaseMessage], add_messages]
            context: str
            answer: str
        
        # Create chain that processes messages
        def process_message(state: State):
            query = state["input"]
            chat_history = state["chat_history"]
            
            # Determine which protocols are needed
            protocols_needed = self._determine_protocols(query)
            
            # Generate code using each needed protocol
            generated_code = ""
            for protocol in protocols_needed:
                response = self.rag_chains[protocol].invoke({
                    "input": query,
                    "chat_history": chat_history
                })
                generated_code += f"\n// Using {protocol}\n"
                generated_code += response["answer"]
            
            return {
                "chat_history": [
                    HumanMessage(content=query),
                    AIMessage(content=generated_code)
                ],
                "answer": generated_code,
                "context": "Combined context from multiple protocols"
            }
        
        # Create and compile graph
        workflow = StateGraph(State)
        workflow.add_node("process", process_message)
        workflow.add_edge(START, "process")
        
        return workflow.compile(checkpointer=self.memory)

    def _determine_protocols(self, query: str) -> List[str]:
        """Determine which protocols are needed based on the query"""
        keywords = {
            "chainlink": ["random", "vrf", "oracle", "price feed", "price data"],
            "sign": ["attest", "attestation", "validate", "proof"],
            "layerzero": ["cross-chain", "cross chain", "bridge", "messaging"],
        }
        
        needed_protocols = []
        query = query.lower()
        
        # Always include OpenZeppelin for base contracts
        needed_protocols.append("openzeppelin")
        
        # Check for protocol-specific keywords
        for protocol, protocol_keywords in keywords.items():
            if any(keyword in query for keyword in protocol_keywords):
                needed_protocols.append(protocol)
        
        return needed_protocols

    def generate_code(self, query: str, chain_ids: Set[int] = None) -> str:
        """Generate code based on the query"""
        config = {"configurable": {"thread_id": "default"}}
        
        result = self.app.invoke(
            {
                "input": query,
                "chat_history": []
            },
            config=config
        )
        
        return result["answer"]