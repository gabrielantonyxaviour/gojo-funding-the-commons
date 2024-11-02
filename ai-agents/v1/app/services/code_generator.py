from openai import OpenAI
import os

client = OpenAI()

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

def detect_agent(prompt: str) -> str:
    prompt_lower = prompt.lower()
    for agent, agent_keywords in keywords.items():
        if any(keyword.lower() in prompt_lower for keyword in agent_keywords):
            return agent
    raise ValueError("Unable to detect a specific agent from the prompt")

def generate_code(prompt: str) -> tuple:
    # You would replace these with your actual fine-tuned model names
    model_map = {
        "LayerZero": "ft:gpt-4o-mini-2024-07-18:personal::AKCp3fUR",
        "Fhenix": "ft:gpt-4o-mini-2024-07-18:personal::AKCp3fUR",
        "Sign Protocol": "ft:gpt-4o-mini-2024-07-18:personal::AKCp3fUR"
    }
    
    agent = detect_agent(prompt)
    model = model_map.get(agent)
    if not model:
        raise ValueError(f"No fine-tuned model found for agent: {agent}")

    messages = [
        {"role": "system", "content": f"You are an AI assistant specialized in {agent}. Generate code based on the user's prompt."},
        {"role": "user", "content": prompt}
    ]

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            },
        ],
        temperature=1,
        max_tokens=2048,
        top_p=1,
        frequency_penalty=0,
        presence_penalty=0,
        response_format={
            "type": "text"
        }
    )

    return agent, response.choices[0].message.content.strip()