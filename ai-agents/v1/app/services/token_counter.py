import tiktoken
from typing import List, Dict

encoding = tiktoken.get_encoding("cl100k_base")

def num_tokens_from_messages(messages: List[Dict], tokens_per_message: int = 3, tokens_per_name: int = 1) -> int:
    num_tokens = 0
    for message in messages:
        num_tokens += tokens_per_message
        for key, value in message.items():
            num_tokens += len(encoding.encode(str(value)))
            if key == "name":
                num_tokens += tokens_per_name
    num_tokens += 3
    return num_tokens

def num_assistant_tokens_from_messages(messages: List[Dict]) -> int:
    return sum(len(encoding.encode(message["content"])) for message in messages if message["role"] == "assistant")