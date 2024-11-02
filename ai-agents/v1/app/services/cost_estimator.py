from typing import List, Dict
from app.services.token_counter import num_tokens_from_messages

def estimate_fine_tuning_cost(dataset: List[Dict]) -> Dict:
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
    
    return {
        "billing_tokens": n_billing_tokens_in_dataset,
        "epochs": n_epochs,
        "total_billed_tokens": n_epochs * n_billing_tokens_in_dataset
    }