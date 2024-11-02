from pydantic import BaseModel
from typing import Optional, List
class Message(BaseModel):
    text: str

class CodeGenerationRequest(BaseModel):
    prompt: str

class CodeGenerationResponse(BaseModel):
    agent: str
    generated_code: str

class FinetuningEstimateResponse(BaseModel):
    agent: str
    num_examples: int
    format_errors: dict
    missing_system: int
    missing_user: int
    num_messages_stats: dict
    total_tokens_stats: dict
    assistant_tokens_stats: dict
    num_truncated: int
    estimated_cost: dict

class FineTuningRequest(BaseModel):
    agent: str
    epochs: Optional[int] = None
    learning_rate_multiplier: Optional[float] = None
    batch_size: Optional[int] = None

class FineTuningResponse(BaseModel):
    job_id: str
    status: str
    fine_tuned_model: str | None

class ErrorInfo(BaseModel):
    code: str
    message: str
    param: Optional[str] = None

class Hyperparameters(BaseModel):
    n_epochs: int
    batch_size: int
    learning_rate_multiplier: float

class FineTuningJob(BaseModel):
    id: str
    created_at: int
    error: Optional[ErrorInfo] = None
    fine_tuned_model: Optional[str] = None
    finished_at: Optional[int] = None
    hyperparameters: Hyperparameters
    model: str
    object: str
    organization_id: str
    result_files: List[str]
    seed: int
    status: str
    trained_tokens: Optional[int] = None
    training_file: str
    validation_file: Optional[str] = None
    estimated_finish: Optional[int] = None
    integrations: List[str] = []
    user_provided_suffix: Optional[str] = None

class FineTuningEvent(BaseModel):
    id: str
    created_at: int
    level: str
    message: str

class ListJobsResponse(BaseModel):
    jobs: List[FineTuningJob]

class RetrieveJobResponse(BaseModel):
    job: FineTuningJob

class CancelJobResponse(BaseModel):
    job: FineTuningJob

class ListEventsResponse(BaseModel):
    events: List[FineTuningEvent]

class DeleteModelResponse(BaseModel):
    id: str
    deleted: bool