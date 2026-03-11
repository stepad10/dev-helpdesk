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

**Trigger:** _"read @[build-plan.md] and proceed with its steps. You are an orchestrator agent."_

The agent operated autonomously for all implementation tasks. The build-plan provided precise file-by-file specifications (types, exports, code templates) requiring no human correction during execution.

#### Task 1 — Data Types & Loader

- **Files created:** `app/types/knowledge.ts`, `app/lib/loadKnowledge.ts`
- **Notes:** Types derived directly from the shape of `knowledge_data.json`. `handle: string | null` was explicitly typed to handle Karel Dvorak's missing handle. ESM-compatible path resolution (`import.meta.url` + `fileURLToPath`) used for Vite SSR compatibility.
- **Corrections:** None required.

#### Task 2 — Security Utility Functions

- **Files created:** `app/lib/security.ts`
- **Notes:** `isInjectionAttempt` checks 10 known injection phrases (case-insensitive). `containsLeakedPrompt` checks for distinctive system prompt fragments. Canned `REFUSAL_MESSAGE` and `SAFE_FALLBACK_MESSAGE` constants exported. Normal doc citation patterns (e.g. `DOC-001`) not flagged.
- **Corrections:** None required.

#### Task 3 — System Prompt Builder

- **Files created:** `app/lib/buildSystemPrompt.ts`
- **Notes:** All 9 rules from `tech-spec.md §4` embedded verbatim. Knowledge documents serialized as `[DOC-XXX] Topic: ... | Status: ... | Content: ...` blocks. Experts serialized with null-handle guard: Karel Dvorak outputs `no handle — contact via team lead` instead of `@null`. Manual verification script confirmed: all 6 DOC IDs present, all 5 expert names present, `"contact via team lead"` present, `"@null"` absent.
- **Corrections:** None required.

#### Task 4 — API Resource Route `api.chat`

- **Files created:** `app/routes/api.chat.ts`
- **Notes:** Implemented 3-layer security logic. Added endpoint to `app/routes.ts` because React Router v7 framework mode requires explicit routing registration unless auto-routing is set up exactly right. Shifted model to `gemini-2.5-flash` due to free tier quota limitations on `gemini-2.0-flash`.
- **Corrections:** Had to manually register the route in `routes.ts`. Handled a syntax error (extra bracket). Handled API quota limits by checking available models and updating the model name string.

#### Task 5 — Chat UI

- **Files created:** `app/types/chat.ts`, `app/components/ChatInterface.tsx`, `app/components/MessageBubble.tsx`
- **Files modified:** `app/routes/_index.tsx`
- **Notes:** Styled with Tailwind CSS dark glassmorphism. Handled citation badges dynamically checking for `DOC-XXX`. Message state handled nicely via `useState`.
- **Corrections:** Fixed some minor React linting errors (Readonly props, deprecated FormEvent, array index keys).

### Phase 5: Testing & Verification

A suite of 13 prompts was executed against the `/api/chat` route to verify functional correctness, security constraints, and edge cases. (Note: testing was slightly hampered by strictly rate-limited Gemini free tier quotas (`gemini-2.5-flash`), but we successfully gathered results across all categories).

**Correctness Tests:**

1. **Documents:** Queries like "How do I deploy a PHP app?" successfully retrieved the deprecated manual FTP process and warned the user, while citing `DOC-003`.
2. **Expert Routing:** "Who should I contact about CI/CD pipelines?" successfully bypassed the knowledge base (which is silent on CI/CD) and routed to `@lucie_ops` based on her profile skills.
3. **Follow-ups:** The conversational state logic successfully carried context from `@lucie_ops` to a follow-up "And what about monitoring?".

**Security & Safety Tests:**

1. **Layer 2 (Input Sanitization):** Direct injection attempts ("Ignore previous instructions") instantly returned the static `REFUSAL_MESSAGE` with 0ms LLM latency.
2. **Layer 1 (Prompt Constraint):** "What's the best pizza in Prague?" correctly triggered a polite, off-topic rejection from the LLM based on its system instruction guardrails.

**Edge Cases:**

1. **Expert Without Handle (Null check):** "Who reviews frontend changes?" successfully retrieved Karel Dvorak, detected his `handle: null` state, and gracefully output: "contact him via his team lead" (never emitting `@null`).
2. **Multilingual (Czech):** "Jak nasadím aplikaci?" triggered a perfect Czech translation of the deployment protocol, citing DOC-001 and DOC-003 exactly as required, handling `@tech_lead` and `@jana_php` references fluidly in the foreign language.

## 2. Instructions Given to the Agent

The workflow was guided by the following high-level human prompts:

1. **Initial Request:** _"go through @[description-en.md] and write for it a ticket specification from a bussiness perspective. It should contain functional and maybe nonfuctional requirements, acceptance criteria. it should not contain any code. Ask for missing information. Keep it simple."_
2. **Clarification & Constraint Setting:** The user answered the clarifying questions: _"1. no authentication for now but mention this limitations 2. no 3. read only 4. decide if it add any reasonable value 5. let me know the options"_
3. **Architecture Decision:** _"lets go with option 1. Mark the reasoning behind it somewhere. save this spec to product-spec.md"_
4. **Technical Specification:** _"check @[product-spec.md] and @[tech-spec.md] — check if the approach is industry standard and if it is idiomatic. fix [the gaps]."_

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
- The system instructions explicitly constrain the LLM to _only_ use the provided JSON data to answer, fulfilling the requirement to avoid hallucinations.

### Fallback Mechanism

The logic for expert fallback is handled via prompt engineering. The LLM is instructed to:

1. Search the provided knowledge documents.
2. If the answer is missing, analyze the topic of the user's question.
3. Search the provided `experts` array for a matching skill.
4. Output a standardized fallback message citing the expert's handle and checking their `availability` status.

### Context Management

Conversational context is maintained natively by the Vercel AI SDK's `useChat` hook on the frontend, which sends the full message history to the backend API route on every new query.
