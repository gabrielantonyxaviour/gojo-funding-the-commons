# Frontend

### UI Components

1. ~~DONE -What can I help you ship? https://ui.aceternity.com/components/container-cover~~
2. ~~DONE - Floating Dock at the bottom - https://ui.aceternity.com/components/floating-dock~~
3. https://ui.aceternity.com/components/moving-border - For loading
4. https://ui.aceternity.com/components/multi-step-loader - For transactions?
5. For Chat reply - https://ui.aceternity.com/components/typewriter-effect

## SPONSORS / WORKS

1. Phala - 2/10
   - AI
   - MPC Wallets
   - Lit
   - Off chain Attest?
2. Lit Protocol - 6/10
   - Lit Actions Code
   - Lit Client Side
3. Walrus Data storage - 2/10
   - Code upload
   - Website hosting
   - Metadata?
4. TheGraph - 2/10
   - Indexer
   - Testing
   - Client side
5. LayerZero - 8/10
   - Crosschain contracts
   - Testing
6. Coinbase - 6/10
   - Client connect and send tx
   - MPC wallets in Phala
   - Connect Smart wallet
   - Webhooks?
   - Display Base names?
7. NounsDAO - 9/10
   - Artwork
8. XMTP - 7/10
   - Chat as AI chat bot
9. SKALE - 7/10
   - Just deploy
   - Different type of chains. Play around?
10. Polygon - 8/10
11. Sign Protocol - 7/10

## Contribute Page

1. Contribute
   - Choose an AI agent (cards)
     - Name
     - Image
     - Description
     - Contributors
   - AI Agent page
     - Choose any problem statement
   - Problem Statement Modal
     - Name
     - description
     - Token rewards
       - GOJO
       - Protocol
     - Clone template
     - Submit template
       - Connect Github

## AI Agents

1. ~~Openzeppelin~~
2. LayerZero
3. ~~SKALE~~
4. Sign Protocol
5. ~~FLOW~~

## Proper Demo Flow

UI (Nouns)
Contracts (LayerZero, Polygon, SKALE)
Indexer (TheGraph)

1. Let's say that I train my domain specific AI agents with some pieces of code. (PHALA + Lit + Walrus)
2. My core AI agent is trained to interact and handle these domain specific AI agents. (PHALA + COINBASE MPC + Sign Protocol)
3. The user enters the app, logs in and clicks on create new project gaslessly using SKALE. (COINBASE)
4. After creating the app, the user can create nodes with prompts aka. AI Agents (XMTP chat + PHALA + Lit)
5. Need to decrypt the encrypted code in the client side and parse it properly (Lit)
6. Run the code in the client side and with smart contract calls interaction (COINBASE)
7. OPTIONAL: Code contribution UI which makes the user import his code directly from Github (Walrus + Lit)

## Contracts

#### Functions

1. Create project - SKALE DONE
2. Register generation (called by AI Agent. Keeps track of consumed WrappedGojoIP for the project id.) - SKALE DONE
3. Register export (pay for the consumption with WrappedGojoIP, using Lit Action) - SKALE DONE
4. Consume WrappedGojoIP called by Gojo AI agent - SKALE DONE
5. Unwrap IP (converts WrappedGojoIP to IP and sends it to Story) - SKALE DONE
6. Register AI agent/ Whitlist AI agent - Story and Crosschain txs from Story to SKALE
7. Register knowledge. Mints IP to the user. - Story
8. Wrap IP (Converts IP to WrappedGojoIP and sends it to SKALE) - Story
9. Make attestation (hook verifies the logic) - Polygon

#### Contracts Pending

1. Attestation validation logic
2. Create IP logic
3. Fix SKALE crosschain fee token issue

### Added Features

1. Implement as IP currency as OFT and Each resource as ONFT?
2. Implement FLOW
3. Proper register knowledge UI
4. Copy button next to deployment in the node

## TODO

Before Hack starts

1. Graph indexing node for SKALE
2. Contracts Pending and Testing
3. Get started with Phala

First night

1. Complete Lit Actions
2. Try Phala

Sat Morning

1. Complete Phala
2. Integrate Walrus more

Sat Afternoon

1. Complete XMTP

Sat Night

1. Complete Everything hopefully
