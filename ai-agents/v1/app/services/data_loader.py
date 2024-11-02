import json
from typing import List, Dict

def load_dataset(file_path: str) -> List[Dict]:
    with open(file_path, 'r', encoding='utf-8') as f:
        return [json.loads(line) for line in f]
