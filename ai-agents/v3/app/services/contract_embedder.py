# app/services/contract_embedder.py
from langchain_text_splitters import RecursiveCharacterTextSplitter  # Updated import
import os
from langchain_community.embeddings import OpenAIEmbeddings
from langchain_community.chat_models import ChatOpenAI
from langchain_community.vectorstores import Chroma
from langchain.docstore.document import Document
from typing import Dict, List
from app.config import Config

class ContractEmbedder:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(openai_api_key=Config.OPENAI_API_KEY)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )

    def create_contract_chunks(self, contract_text: str, metadata: Dict) -> List[Document]:
        texts = self.text_splitter.split_text(contract_text)
        return [
            Document(page_content=text, metadata=metadata)
            for text in texts
        ]

    def create_vector_store(self, contracts: Dict[str, Dict]) -> Chroma:
        documents = []
        
        for protocol, data in contracts.items():
            source_chunks = self.create_contract_chunks(
                data["source"],
                {
                    "protocol": protocol,
                    "type": "source",
                    "deployed": data.get("deployed", {})
                }
            )
            documents.extend(source_chunks)
        
        return Chroma.from_documents(
            documents=documents,
            embedding=self.embeddings,
            persist_directory="./chroma_db"
        )