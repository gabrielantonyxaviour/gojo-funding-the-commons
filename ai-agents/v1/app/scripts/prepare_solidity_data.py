import os
import json
from typing import List, Dict

def read_solidity_file(file_path: str) -> str:
    with open(file_path, 'r') as file:
        return file.read()

def create_training_examples(code: str, agent: str, num_examples: int = 1) -> List[Dict]:
    examples = []
    prompts = [
        "Explain this Solidity code and suggest improvements.",
        f"How does this contract implement {agent}-specific functionality?",
        "Identify potential security vulnerabilities in this code.",
        "How can this contract be optimized for gas efficiency?",
        "Explain the purpose of each function in this smart contract.",
        "How does this contract handle error cases and exceptions?",
        "What events does this contract emit and when?",
        "How does this contract interact with other contracts or protocols?",
        "Suggest additional features for this contract.",
        "How would you test this smart contract?"
    ]
    
    for i in range(num_examples):
        examples.append({
            "messages": [
                {"role": "system", "content": f"You are an AI assistant specialized in {agent} Solidity development. Provide accurate and helpful information about {agent} smart contracts."},
                {"role": "user", "content": prompts[i % len(prompts)]},
                {"role": "assistant", "content": f"Analyzing the {agent} Solidity code:\n\n```solidity\n{code}\n```\n\n[Detailed analysis and response to the prompt would be here]\n\nAlways thoroughly test and audit smart contracts before deployment, especially for {agent}-specific functionalities."}
            ]
        })
    return examples

def prepare_training_data(agent: str, solidity_files: List[str]) -> List[Dict]:
    training_data = []
    
    if not solidity_files:
        generic_code = f"// Generic {agent} contract\ncontract Generic{agent.replace(' ', '')} {{\n    // Contract code here\n}}"
        training_data = create_training_examples(generic_code, agent, 10)
    else:
        target_examples = max(10, len(solidity_files))
        examples_per_file = max(1, target_examples // len(solidity_files))
        
        for file_path in solidity_files:
            code = read_solidity_file(file_path)
            training_examples = create_training_examples(code, agent, examples_per_file)
            training_data.extend(training_examples)
        
        while len(training_data) < 10:
            training_data.append(training_data[0])
    
    return training_data

def save_jsonl(data: List[Dict], output_file: str):
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w') as f:
        for item in data:
            json.dump(item, f)
            f.write('\n')

def main():
    agents = ['LayerZero', 'Fhenix', 'Sign Protocol']
    base_path = '/app/data/solidity_files'
    
    for agent in agents:
        agent_path = os.path.join(base_path, agent.lower().replace(' ', '_'))
        os.makedirs(agent_path, exist_ok=True)
        solidity_files = [os.path.join(agent_path, f) for f in os.listdir(agent_path) if f.endswith('.sol')]
        
        training_data = prepare_training_data(agent, solidity_files)
        output_file = f'/app/data/{agent.lower().replace(" ", "_")}_training_data.jsonl'
        save_jsonl(training_data, output_file)
        print(f"Created training data for {agent}: {output_file} with {len(training_data)} examples")

if __name__ == "__main__":
    main()