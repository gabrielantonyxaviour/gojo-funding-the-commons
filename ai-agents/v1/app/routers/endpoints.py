import logging
from fastapi import APIRouter, HTTPException, Query, BackgroundTasks
from app.models import (Message, FinetuningEstimateResponse, CodeGenerationRequest, 
                        CodeGenerationResponse, FineTuningRequest, FineTuningResponse,
                        ListJobsResponse, RetrieveJobResponse, CancelJobResponse,
                        ListEventsResponse, DeleteModelResponse, FineTuningJob, FineTuningEvent)
from fastapi.responses import JSONResponse
from app.scripts.prepare_solidity_data import main as prepare_data
from app.services.fine_tuner import fine_tune_agent
from app.services.code_generator import generate_code
from openai import OpenAI
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
router = APIRouter()
client = OpenAI()

@router.post("/fine-tune-estimate/", response_model=FinetuningEstimateResponse)
async def fine_tune_estimate(message: Message):
    agent_name = message.text  # Assume the message contains the agent name
    data_path = f"data/{agent_name.lower()}_training_data.jsonl"
    
    try:
        dataset = load_dataset(data_path)
        format_errors = validate_format(dataset)
        analysis_results = analyze_dataset(dataset)
        cost_estimate = estimate_fine_tuning_cost(dataset)
        
        return FinetuningEstimateResponse(
            agent=agent_name,
            num_examples=len(dataset),
            format_errors=format_errors,
            missing_system=analysis_results['missing_system'],
            missing_user=analysis_results['missing_user'],
            num_messages_stats=analysis_results['num_messages_stats'],
            total_tokens_stats=analysis_results['total_tokens_stats'],
            assistant_tokens_stats=analysis_results['assistant_tokens_stats'],
            num_truncated=analysis_results['num_truncated'],
            estimated_cost=cost_estimate
        )
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Training data for {agent_name} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-code/", response_model=CodeGenerationResponse)
async def generate_code_endpoint(request: CodeGenerationRequest):
    try:
        agent, generated_code = generate_code(request.prompt)
        return CodeGenerationResponse(agent=agent, generated_code=generated_code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fine-tune/", response_model=FineTuningResponse)
async def fine_tune(request: FineTuningRequest):
    try:
        data_path = f"data/{request.agent.lower()}_training_data.jsonl"
        job_info = fine_tune_agent(
            request.agent,
            data_path,
            epochs=request.epochs,
            learning_rate_multiplier=request.learning_rate_multiplier,
            batch_size=request.batch_size
        )
        return FineTuningResponse(**job_info)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Training data for {request.agent} not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @router.get("/fine-tuning/jobs", response_model=ListJobsResponse)
# async def list_fine_tuning_jobs(limit: int = Query(10, le=100)):
#     try:
#         jobs = client.fine_tuning.jobs.list(limit=limit)
#         return ListJobsResponse(jobs=[FineTuningJob(**job) for job in jobs.data])
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.get("/fine-tuning/jobs/{job_id}")
async def retrieve_fine_tuning_job(job_id: str):
    try:
        job = client.fine_tuning.jobs.retrieve(job_id)
        
        # Log the entire job object
        logger.info(f"Retrieved job: {job}")
        
        # Convert the job object to a dictionary
        job_dict = job.model_dump()
        
        # Log the dictionary representation
        logger.info(f"Job as dictionary: {job_dict}")
        
        # Return the raw dictionary as a JSON response
        return JSONResponse(content=job_dict)
    except Exception as e:
        logger.error(f"Error retrieving job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/fine-tuning/jobs/{job_id}", response_model=RetrieveJobResponse)
async def retrieve_fine_tuning_job(job_id: str):
    try:
        job = client.fine_tuning.jobs.retrieve(job_id)
        return RetrieveJobResponse(job=FineTuningJob(**job.model_dump()))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fine-tuning/jobs/{job_id}/cancel", response_model=CancelJobResponse)
async def cancel_fine_tuning_job(job_id: str):
    try:
        job = client.fine_tuning.jobs.cancel(job_id)
        return CancelJobResponse(job=FineTuningJob(**job))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fine-tuning/jobs/{job_id}/events", response_model=ListEventsResponse)
async def list_fine_tuning_events(job_id: str, limit: int = Query(10, le=100)):
    try:
        events = client.fine_tuning.jobs.list_events(fine_tuning_job_id=job_id, limit=limit)
        return ListEventsResponse(events=[FineTuningEvent(**event) for event in events.data])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/models/{model_id}", response_model=DeleteModelResponse)
async def delete_fine_tuned_model(model_id: str):
    try:
        response = client.models.delete(model_id)
        return DeleteModelResponse(id=response.id, deleted=response.deleted)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.post("/fine-tune-solidity/{agent}", response_model=FineTuningResponse)
async def fine_tune_solidity(agent: str, background_tasks: BackgroundTasks):
    try:
        # Prepare the training data
        prepare_data()
        
        # Get the path to the prepared training data
        data_path = f"/app/data/{agent.lower().replace(' ', '_')}_training_data.jsonl"
        
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Training data file not found: {data_path}")
        
        # Initiate fine-tuning
        job_info = fine_tune_agent(agent, data_path)
        
        return FineTuningResponse(**job_info)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during fine-tuning: {str(e)}")
