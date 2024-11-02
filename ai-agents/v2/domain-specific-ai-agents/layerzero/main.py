from dotenv import load_dotenv
import os 
from langchain_openai.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS
import re
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Load environment variables
load_dotenv()
API_KEY = os.getenv('OPENAI_API_KEY')
Model = 'gpt-4-turbo'

# Initialize OpenAI model
model = ChatOpenAI(api_key=API_KEY, model=Model)

# Load and process the document
file_loader = PyPDFLoader('layerzeroprotocol.pdf')
documents = file_loader.load_and_split()

# Split documents into chunks for embedding
splitter = RecursiveCharacterTextSplitter(chunk_size=5000, chunk_overlap=100)
pages = splitter.split_documents(documents)

# Embed the document using OpenAI embeddings
vector_storage = FAISS.from_documents(pages, OpenAIEmbeddings())
retriever = vector_storage.as_retriever(search_kwargs={"k": 4})

# Define the question template
question_template = """
You are an AI assistant specializing in Solidity smart contracts. Your task is to provide accurate and complete code based on the context given. If a complete contract is requested, ensure you return the entire contract code.
REMEMBER: If you see a word cross-chain, then you have to write two contracts interacting on polygon and SKALE network.

context: {context}

question: {question}

Please provide the complete code for the contract requested.
REMEMBER: If you see a word cross-chain, then you have to write two contracts interacting on polygon and SKALE network.

"""

prompt = PromptTemplate.from_template(template=question_template)

# Define the FastAPI app
app = FastAPI()

# Define the input model
class QuestionInput(BaseModel):
    question: str

# Define the function to ask a question
def ask_question(question: str):
    relevant_docs = retriever.get_relevant_documents(question)
    
    if len(relevant_docs) == 0:
        return "No relevant information found in the document."
    
    context = "\n\n".join([doc.page_content for doc in relevant_docs])
    formatted_prompt = prompt.format(context=context, question=question)
    response = model.invoke(formatted_prompt)
    code_blocks = re.findall(r'```solidity\n(.*?)```', response.content, re.DOTALL)
    
    if code_blocks:
        return "\n\n".join(code_blocks)
    else:
        return response.content

# Define the API endpoint
@app.post("/generate_contract/")
async def generate_contract(input: QuestionInput):
    try:
        response = ask_question(input.question)
        return {"contract": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
