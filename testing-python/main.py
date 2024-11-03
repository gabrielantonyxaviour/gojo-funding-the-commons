from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
import bs4
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_community.document_loaders import TextLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.chains import create_history_aware_retriever
from langchain_core.prompts import MessagesPlaceholder

load_dotenv()

llm = ChatOpenAI(model="gpt-4o-mini")

loader = TextLoader("layerzero.txt")
docs = loader.load()

# Split the text into manageable chunks
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)

# Create an in-memory vector store from the document splits
vectorstore = InMemoryVectorStore.from_documents(
    documents=splits, embedding=OpenAIEmbeddings()
)

retriever = vectorstore.as_retriever()

contextualize_q_system_prompt = (
    "You are assisting with the iterative creation and modification of a smart contract. "
    "Given the chat history, which includes previous user instructions and changes to the contract, "
    "reformulate the latest user request as a standalone instruction. Ensure it is clear and self-contained, "
    "so it can be understood without additional context. Do NOT implement or provide solutions for the change; "
    "simply clarify the instruction as a complete request for modifying the smart contract."
)

contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)

history_aware_retriever = create_history_aware_retriever(
    llm, retriever, contextualize_q_prompt
)

system_prompt = (
    "You are an assistant for generating solidity smart contracts. "
    "Refer the LayerZero Protocol code and example smart contracts to generate code. "
    "Do not use any @imports in the generated code, flatten the code."
    "Do not pass constructor arguments instead hardcode them in the function."
    "the question. If you don't know the answer, say that you "
    "don't know. Use three sentences maximum and keep the "
    "answer concise."
    "\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}"),
    ]
)

question_answer_chain = create_stuff_documents_chain(llm, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

response = rag_chain.invoke({"input": "A crosschain airdrop"})
print(response["answer"])