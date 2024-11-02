from fastapi import FastAPI
from app.routers import endpoints

app = FastAPI()

app.include_router(endpoints.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Agent Fine-tuning API"}