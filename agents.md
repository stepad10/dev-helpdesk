# Internal Helper - Agent Workflow & Architecture

## 1. Workflow with AI Tools

This prototype was developed using an AI-first engineering approach, utilizing an advanced agentic coding assistant capable of autonomous reasoning, file system manipulation, and code generation. 

The workflow consisted of the following phases:

### Phase 1: Requirements Gathering & Analysis
- **Input:** The initial assignment description (`description-en.md`) and data export (`knowledge_data.json`).
- **Action:** The agent analyzed the business request to extract core functional and non-functional requirements.
- **Output:** A formal Business Ticket Specification (`ticket_specification.md`) was generated to clarify the scope, defining acceptance criteria and identifying edge cases (e.g., prompt injection, handling deprecated info, expert availability).
- **Refinement:** The agent proactively identified missing information (authentication needs, DB read/write state, Confluence integration priority) and prompted the human product owner for decisions.

### Phase 2: Architecture & Technology Selection
- **Input:** Human decisions on constraints (MVP scope, read-only JSON, no auth).
- **Action:** The agent evaluated three potential tech stacks (Node/Next.js, Python/FastAPI, No-code/Flowise) against the team's existing skill profile found in the expert data (`@tech_lead` and `@karel_fe` having strong Node/React skills).
- **Output:** A Product Specification (`product-spec.md`) documenting the choice to proceed with **Option 1 (Next.js + Vercel AI SDK)** to ensure high team familiarity and rapid iteration.

### Phase 3: Technical Specification
- **Input:** The finalized product specification (`product-spec.md`).
- **Action:** The agent designed the full technical architecture — API shape, security model, system prompt rules, data pipeline, and frontend UI requirements.
- **Output:** A complete Technical Specification (`tech-spec.md`) including a Mermaid architecture diagram, a 3-layer security guardrail design, and a full system prompt template with 9 explicit rules (including edge cases like null-handle experts and multilingual content).

### Phase 4: Implementation
_To be completed. Document here: key prompts used to drive code generation, which parts the agent handled autonomously vs. required manual correction, and any architectural decisions made during the build._

### Phase 5: Testing & Verification
_To be completed. Document here: how correctness and security tests were run (manual prompts or automated), results observed, and any issues found and fixed._

## 2. Instructions Given to the Agent

The workflow was guided by the following high-level human prompts:

1. **Initial Request:** *"go through @[description-en.md] and write for it a ticket specification from a bussiness perspective. It should contain functional and maybe nonfuctional requirements, acceptance criteria. it should not contain any code. Ask for missing information. Keep it simple."*
2. **Clarification & Constraint Setting:** The user answered the clarifying questions: *"1. no authentication for now but mention this limitations 2. no 3. read only 4. decide if it add any reasonable value 5. let me know the options"*
3. **Architecture Decision:** *"lets go with option 1. Mark the reasoning behind it somewhere. save this spec to product-spec.md"*
4. **Technical Specification:** *"check @[product-spec.md] and @[tech-spec.md] — check if the approach is industry standard and if it is idiomatic. fix [the gaps]."*

From these high-level directives, the agent autonomously handled the formatting, structure, technical evaluation, file creation, and gap analysis. Add prompts for Phases 4 and 5 here as implementation progresses.

## 3. Architecture Approach

We are building a **Naive RAG (Retrieval-Augmented Generation) Chat Application**.

### Technology Stack
- **Framework:** React Router v7 (framework mode)
- **Build Tool:** Vite
- **Language:** TypeScript
- **UI:** React, Tailwind CSS
- **AI Integration:** Vercel AI SDK (`ai` package) with `@ai-sdk/google` (Gemini); provider-agnostic — swapping to OpenAI or Anthropic requires changing one import
- **Package Manager:** pnpm
- **Data Source:** Static filesystem read of `app/data/knowledge_data.json`

For the full technical detail — API design, security layers, system prompt rules, and UI spec — see [`tech-spec.md`](./tech-spec.md).
For the step-by-step agent build plan — see [`build-plan.md`](./build-plan.md).

### Why Naive RAG?
Given the extremely small size of the knowledge base (6 documents, 5 experts), implementing a full RAG pipeline with text chunking, embeddings, and a vector database (like Pinecone) is an anti-pattern for this MVP. 

Instead, the architecture relies on **Context Stuffing**:
- The entire relevant contents of `knowledge_data.json` are injected directly into the LLM's system prompt.
- Modern LLMs have large context windows (128k+ tokens) and excellent needle-in-a-haystack retrieval capabilities, making this the fastest, most reliable, and least complex approach for small datasets.
- The system instructions explicitly constrain the LLM to *only* use the provided JSON data to answer, fulfilling the requirement to avoid hallucinations.

### Fallback Mechanism
The logic for expert fallback is handled via prompt engineering. The LLM is instructed to:
1. Search the provided knowledge documents.
2. If the answer is missing, analyze the topic of the user's question.
3. Search the provided `experts` array for a matching skill.
4. Output a standardized fallback message citing the expert's handle and checking their `availability` status.

### Context Management
Conversational context is maintained natively by the Vercel AI SDK's `useChat` hook on the frontend, which sends the full message history to the backend API route on every new query.
