import json
import tiktoken
import numpy as np
from collections import defaultdict
import os
from typing import List, Dict

encoding = tiktoken.get_encoding("cl100k_base")

def load_dataset(file_path: str) -> List[Dict]:
    with open(file_path, 'r', encoding='utf-8') as f:
        return [json.loads(line) for line in f]

def validate_format(dataset: List[Dict]) -> Dict[str, int]:
    format_errors = defaultdict(int)
    for ex in dataset:
        if not isinstance(ex, dict):
            format_errors["data_type"] += 1
            continue
        
        messages = ex.get("messages", None)
        if not messages:
            format_errors["missing_messages_list"] += 1
            continue
        
        for message in messages:
            if "role" not in message or "content" not in message:
                format_errors["message_missing_key"] += 1
            
            if any(k not in ("role", "content", "name", "function_call") for k in message):
                format_errors["message_unrecognized_key"] += 1
            
            if message.get("role", None) not in ("system", "user", "assistant", "function"):
                format_errors["unrecognized_role"] += 1
            
            content = message.get("content", None)
            function_call = message.get("function_call", None)
            
            if (not content and not function_call) or not isinstance(content, str):
                format_errors["missing_content"] += 1
        
        if not any(message.get("role", None) == "assistant" for message in messages):
            format_errors["example_missing_assistant_message"] += 1
    
    return format_errors

def num_tokens_from_messages(messages: List[Dict], tokens_per_message: int = 3, tokens_per_name: int = 1) -> int:
    num_tokens = 0
    for message in messages:
        num_tokens += tokens_per_message
        for key, value in message.items():
            num_tokens += len(encoding.encode(value))
            if key == "name":
                num_tokens += tokens_per_name
    num_tokens += 3
    return num_tokens

def num_assistant_tokens_from_messages(messages: List[Dict]) -> int:
    return sum(len(encoding.encode(message["content"])) for message in messages if message["role"] == "assistant")

def print_distribution(values: List[float], name: str):
    print(f"\n#### Distribution of {name}:")
    print(f"min / max: {min(values)}, {max(values)}")
    print(f"mean / median: {np.mean(values):.2f}, {np.median(values):.2f}")
    print(f"p5 / p95: {np.quantile(values, 0.05):.2f}, {np.quantile(values, 0.95):.2f}")

def analyze_dataset(dataset: List[Dict]):
    n_missing_system = sum(1 for ex in dataset if not any(message["role"] == "system" for message in ex["messages"]))
    n_missing_user = sum(1 for ex in dataset if not any(message["role"] == "user" for message in ex["messages"]))
    n_messages = [len(ex["messages"]) for ex in dataset]
    convo_lens = [num_tokens_from_messages(ex["messages"]) for ex in dataset]
    assistant_message_lens = [num_assistant_tokens_from_messages(ex["messages"]) for ex in dataset]
    
    print("Num examples missing system message:", n_missing_system)
    print("Num examples missing user message:", n_missing_user)
    print_distribution(n_messages, "num_messages_per_example")
    print_distribution(convo_lens, "num_total_tokens_per_example")
    print_distribution(assistant_message_lens, "num_assistant_tokens_per_example")
    n_too_long = sum(1 for l in convo_lens if l > 16385)
    print(f"\n{n_too_long} examples may be over the 16,385 token limit, they will be truncated during fine-tuning")

def estimate_fine_tuning_cost(dataset: List[Dict]):
    MAX_TOKENS_PER_EXAMPLE = 16385
    TARGET_EPOCHS = 3
    MIN_TARGET_EXAMPLES = 100
    MAX_TARGET_EXAMPLES = 25000
    MIN_DEFAULT_EPOCHS = 1
    MAX_DEFAULT_EPOCHS = 25

    n_epochs = TARGET_EPOCHS
    n_train_examples = len(dataset)
    if n_train_examples * TARGET_EPOCHS < MIN_TARGET_EXAMPLES:
        n_epochs = min(MAX_DEFAULT_EPOCHS, MIN_TARGET_EXAMPLES // n_train_examples)
    elif n_train_examples * TARGET_EPOCHS > MAX_TARGET_EXAMPLES:
        n_epochs = max(MIN_DEFAULT_EPOCHS, MAX_TARGET_EXAMPLES // n_train_examples)

    convo_lens = [num_tokens_from_messages(ex["messages"]) for ex in dataset]
    n_billing_tokens_in_dataset = sum(min(MAX_TOKENS_PER_EXAMPLE, length) for length in convo_lens)
    print(f"Dataset has ~{n_billing_tokens_in_dataset} tokens that will be charged for during training")
    print(f"By default, you'll train for {n_epochs} epochs on this dataset")
    print(f"By default, you'll be charged for ~{n_epochs * n_billing_tokens_in_dataset} tokens")


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

class Message(BaseModel):
    text: str

class SpecializedAIAgent:
    def __init__(self, model_name: str, training_data: List[Dict[str, str]]):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForCausalLM.from_pretrained(model_name)
        self.fine_tune(training_data)

    def fine_tune(self, training_data: List[Dict[str, str]]):
        # Implement fine-tuning logic here
        # This is a placeholder and would need to be expanded based on your specific requirements
        pass

    async def generate_response(self, prompt: str) -> str:
        inputs = self.tokenizer(prompt, return_tensors="pt")
        outputs = self.model.generate(**inputs, max_length=1000)
        return self.tokenizer.decode(outputs[0], skip_special_tokens=True)

class LayerZeroAgent(SpecializedAIAgent):
    def __init__(self, training_data: List[Dict[str, str]]):
        super().__init__("ethereum/codegen-350M-mono", training_data)

class FhenixAgent(SpecializedAIAgent):
    def __init__(self, training_data: List[Dict[str, str]]):
        super().__init__("ethereum/codegen-350M-mono", training_data)

class SignProtocolAgent(SpecializedAIAgent):
    def __init__(self, training_data: List[Dict[str, str]]):
        super().__init__("ethereum/codegen-350M-mono", training_data)

with open('sample_layerzero_training_data.json', 'r') as f:
    layerzero_data = json.load(f)
layerzero_agent = LayerZeroAgent(layerzero_data)

with open('sample_fhenix_training_data.json', 'r') as f:
    fhenix_data = json.load(f)
fhenix_agent = FhenixAgent(fhenix_data)

with open('sample_signprotocol_training_data.json', 'r') as f:
    signprotocol_data = json.load(f)
signprotocol_agent = SignProtocolAgent(signprotocol_data)


# Expanded keyword lists for each protocol
keywords = {
    "LayerZero": [
        'cross-chain', 'crosschain', 'cross chain',
        'multi-chain', 'multichain', 'multi chain',
        'omnichain', 'omni-chain', 'omni chain',
        'interoperability', 'interoperable',
        'bridge', 'bridging',
        'chain-agnostic', 'chain agnostic',
        'inter-blockchain', 'inter blockchain',
        'cross-network', 'cross network',
        'chain-hopping', 'chain hopping',
        'blockchain-interlink', 'blockchain interlink',
        'multi-ledger', 'multi ledger',
        'chain-connecting', 'chain connecting',
        'cross-consensus', 'cross consensus',
        'inter-protocol', 'inter protocol',
        'chain-unifying', 'chain unifying',
        'network-spanning', 'network spanning',
        'cross-ecosystem', 'cross ecosystem',
        'blockchain-bridging', 'blockchain bridging',
        'inter-chain', 'interchain', 'inter chain',
        'chain interoperability',
        'cross-chain communication',
        'multi-blockchain',
        'blockchain interconnection'
    ],
    "Sign Protocol": [
        'attest', 'attestation',
        'verify', 'verification',
        'credential', 'credentials',
        'certify', 'certification',
        'validate', 'validation',
        'proof', 'proving',
        'endorse', 'endorsement',
        'authenticate', 'authentication',
        'confirm', 'confirmation',
        'vouch', 'vouching',
        'substantiate', 'substantiation',
        'corroborate', 'corroboration',
        'accredit', 'accreditation',
        'notarize', 'notarization',
        'assert', 'assertion',
        'testify', 'testimony',
        'affirm', 'affirmation',
        'witness', 'witnessing',
        'verify claims',
        'proof of'
    ],
    "Fhenix": [
        'private', 'privacy',
        'confidential', 'confidentiality',
        'encrypted', 'encryption',
        'fhe', 'fully homomorphic encryption',
        'homomorphic', 'homomorphism',
        'zero-knowledge', 'zero knowledge',
        'zkp', 'zero-knowledge proof',
        'secret', 'secrecy',
        'hidden', 'hide',
        'concealed', 'conceal',
        'obscured', 'obscure',
        'masked', 'mask',
        'anonymized', 'anonymize',
        'shielded', 'shield',
        'obfuscated', 'obfuscate',
        'stealth', 'stealthy',
        'veiled', 'veil',
        'cloaked', 'cloak',
        'encrypted computation',
        'privacy-preserving'
    ]
}


def classify_intent(user_input: str) -> list:
    user_input = user_input.lower()
    intents = []

    for protocol, protocol_keywords in keywords.items():
        if any(keyword in user_input for keyword in protocol_keywords):
            intents.append(protocol)

    logger.info(f"Input: {user_input}")
    logger.info(f"Classified intents: {intents}")

    return intents if intents else ["Invalid"]

@app.post("/generate-response/")
async def generate_response(message: Message):
    try:
        user_input = message.text
        intents = classify_intent(user_input)
        tasks = []

        if "Invalid" in intents:
            raise HTTPException(status_code=400, detail="No valid protocols identified for the given input")

        for intent in intents:
            if intent == "Fhenix":
                tasks.append(fhenix_aiagent_response(user_input))
            elif intent == "LayerZero":
                tasks.append(layerzero_aiagent_response(user_input))
            elif intent == "Sign Protocol":
                tasks.append(signprotocol_aiagent_response(user_input))

        # If no tasks are created
        if not tasks:
            raise HTTPException(status_code=400, detail="No valid intent found")

        # Run all tasks concurrently and gather the responses
        responses = await asyncio.gather(*tasks)
        return {"responses": aggregate_responses(responses)}
    except Exception as e:
        logger.error(f"Error in generate_response: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

async def layerzero_aiagent_response(user_input: str) -> str:
    return await layerzero_agent.generate_response(user_input)

async def fhenix_aiagent_response(user_input: str) -> str:
    return await fhenix_agent.generate_response(user_input)

async def signprotocol_aiagent_response(user_input: str) -> str:
    return await signprotocol_agent.generate_response(user_input)

def aggregate_responses(responses) -> str:
    return "\n".join(responses)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)