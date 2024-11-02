import numpy as np
from typing import List, Dict
from app.services.token_counter import num_tokens_from_messages, num_assistant_tokens_from_messages
from app.services.utils import calculate_distribution

def analyze_dataset(dataset: List[Dict]) -> Dict:
    n_missing_system = sum(1 for ex in dataset if not any(message["role"] == "system" for message in ex["messages"]))
    n_missing_user = sum(1 for ex in dataset if not any(message["role"] == "user" for message in ex["messages"]))
    n_messages = [len(ex["messages"]) for ex in dataset]
    convo_lens = [num_tokens_from_messages(ex["messages"]) for ex in dataset]
    assistant_message_lens = [num_assistant_tokens_from_messages(ex["messages"]) for ex in dataset]
    
    return {
        "missing_system": n_missing_system,
        "missing_user": n_missing_user,
        "num_messages_stats": calculate_distribution(n_messages),
        "total_tokens_stats": calculate_distribution(convo_lens),
        "assistant_tokens_stats": calculate_distribution(assistant_message_lens),
        "num_truncated": sum(1 for l in convo_lens if l > 16385)
    }