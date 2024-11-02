from openai import OpenAI
import os
from typing import Dict

# Initialize the OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def upload_training_file(file_path: str) -> str:
    with open(file_path, "rb") as file:
        response = client.files.create(
            file=file,
            purpose="fine-tune"
        )
    return response.id

def start_fine_tuning_job(file_id: str, model: str, hyperparameters: Dict) -> Dict:
    response = client.fine_tuning.jobs.create(
        training_file=file_id,
        model=model,
        hyperparameters=hyperparameters
    )
    return {
        "job_id": response.id,
        "status": response.status,
        "fine_tuned_model": getattr(response, 'fine_tuned_model', None)
    }

def fine_tune_agent(agent: str, file_path: str, epochs: int = None, learning_rate_multiplier: float = None, batch_size: int = None) -> Dict:
    # Map agent names to base models
    # Note: You'll need to replace this with the actual model version you have access to
    model_map = {
        "layerzero": "gpt-4o-mini-2024-07-18",
        "fhenix": "gpt-4o-mini-2024-07-18",
        "sign_protocol": "gpt-4o-mini-2024-07-18"
    }

    base_model = model_map.get(agent.lower())
    if not base_model:
        raise ValueError(f"No base model found for agent: {agent}")

    # Upload the training file
    file_id = upload_training_file(file_path)

    # Start the fine-tuning job
    hyperparameters = {}
    if epochs is not None:
        hyperparameters["n_epochs"] = epochs
    if learning_rate_multiplier is not None:
        hyperparameters["learning_rate_multiplier"] = learning_rate_multiplier
    if batch_size is not None:
        hyperparameters["batch_size"] = batch_size
    
    job_info = start_fine_tuning_job(file_id, base_model, hyperparameters)
    return job_info