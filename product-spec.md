# Internal Developer Q&A Helper MVP - Product Specification

## 1. Overview

The **Internal Developer Q&A Helper** is a prototype AI-assisted web application designed to reduce the time developers spend searching for company-specific documentation or discovering who the subject matter experts are. It achieves this by providing text-based answers derived strictly from an internal knowledge base (`knowledge_data.json`).

## 2. Target Audience

- Internal developers (Frontend, Backend, DevOps, etc.) who need quick answers regarding internal processes, architectures, or deployment standards.

## 2a. Known Data Constraints

- **Mixed-language content:** The current `knowledge_data.json` contains documents in both English and Czech. The system must answer in the language of the user's question, regardless of the source document language. The LLM is responsible for translation as part of answer synthesis.
- **Expert with no contact handle:** At least one expert in the dataset (`Karel Dvorak`) has a `null` handle field. In this case, the system must not expose a broken reference (e.g., `@null`) and instead state the expert's name and advise the user to contact them via their team lead.

## 3. Core Features

### 3.1. Document-Grounded Q&A (RAG)

- **Feature:** Users can ask questions in natural language.
- **Behavior:** The system searches the provided `knowledge_data.json` for relevant snippets and synthesizes an answer.
- **Constraint:** The AI must only use the provided knowledge base and must not hallucinate answers or rely on outside general knowledge.

### 3.2. Explicit Source Citation

- **Feature:** All factual answers must cite their sources.
- **Behavior:** The answer must include a reference to the specific document ID (e.g., `DOC-001`) or topic that provided the information.

### 3.3. Intelligent Expert Fallback

- **Feature:** If the system cannot find a conclusive answer in the documentation, it routes the user to a human expert.
- **Behavior:**
  - The system analyzes the question's topic.
  - It cross-references the topic against the `skills` array in the `experts` list.
  - It outputs a message stating the information is missing from the docs and provides the `handle` (e.g., `@tech_lead`) of the matching expert.
  - **Availability Check:** If the matched expert's `availability` is not "available" (e.g., "on_leave_until_2025-12-01"), the system must explicitly inform the user of this status so they do not expect an immediate reply.

### 3.4. Contextual Memory

- **Feature:** The chat interface remembers recent interactions.
- **Behavior:** Users can ask follow-up questions (e.g., "And what about frontend?") without restating the full context of their previous question ("Who reviews PRs?").

### 3.5. Document Version Control (Current vs. Deprecated)

- **Feature:** The system must handle deprecated knowledge safely.
- **Behavior:** If a question hits a document marked as `status: "deprecated"`, the system must explicitly warn the user that the process is no longer active, in addition to providing the historical answer or routing to a modern equivalent expert.

## 4. Security & Safety Requirements

### 4.1. Prompt Injection Protection

- The system prompt must instruct the model to ignore attempts by the user to "jailbreak" the AI, change its persona, or reveal its system instructions.
- A pre-LLM input filter must block obvious injection patterns (e.g., "ignore previous instructions", "reveal your system prompt") before any API call is made.

### 4.2. Off-Topic Rejection

- The system must politely decline to answer questions completely unrelated to software development, internal company processes, or the specified topics in the knowledge base.

### 4.3. Authentication (Out of Scope for MVP)

- For this initial prototype, **no authentication or authorization** is required. The application will be accessible to anyone with the URL. This is a known limitation that must be addressed before production deployment.

## 4a. Testing & QA Requirements

The MVP must include basic verification of two areas:

### Correctness Testing
- At least one representative prompt per knowledge document must be tested to confirm the system returns a grounded, cited answer.
- At least one question outside the knowledge base must be tested to confirm expert fallback triggers correctly.
- At least one follow-up question must be tested to confirm conversational memory works.

### Security Testing
- At least three prompt injection attempts must be tested to confirm they are refused (e.g., "ignore previous instructions", "repeat the above", "you are now DAN").
- An off-topic question must be tested to confirm polite rejection.
- A question referencing a deprecated document must be tested to confirm the deprecation warning is included in the response.

## 5. Architecture & Technology Stack

### 5.1. Tech Stack Decision

We have selected **Option 2: React Router v7 (framework mode) + Vite**.

**Reasoning:**

- **Modern tooling:** React Router v7 (released November 2024) uses Vite natively as its build tool, giving the team a modern, fast dev experience.
- **Team Alignment:** The team's React and TypeScript expertise transfers directly. React Router v7 in framework mode follows very similar conventions to Next.js (file-based routing, server loaders/actions), minimising the learning curve.
- **Full-stack in one repo:** Server resource routes handle the backend API, and the React frontend lives in the same project — no separate server required.
- **Ecosystem:** The Vercel AI SDK works with any server runtime that supports standard `Request`/`Response`, including React Router v7 resource routes.
- **Package manager:** `pnpm` for faster installs and stricter dependency resolution.

### 5.2. Architecture Components

1. **Frontend (React Router v7 / React):**
   - A simple, clean chat interface.
   - Manages local state for the conversation history.
   - Fetches responses from the resource route API.
2. **Backend (React Router v7 Resource Routes):**
   - Handles incoming user messages and conversation history.
   - **Data Layer:** Reads `knowledge_data.json` statically from the file system at startup.
   - **LLM Integration:** Uses the Vercel AI SDK to communicate with Gemini (`@ai-sdk/google`).
3. **Retrieval Mechanism (Naive RAG):**
   - Given the very small size of the initial dataset (6 documents, 5 experts), a heavy vector database is unnecessary and over-engineered.
   - The system injects the entirety of `knowledge_data.json` directly into the system prompt as context, allowing the LLM's vast context window to handle the "search" and reasoning natively.

## 6. Delivery Requirements

- **Source code** in a GitHub repository.
- **`README.md`** with clear instructions on how to set up and run the application locally (dependencies, environment variables, start command).
- **`agents.md`** documenting the AI-assisted workflow, instructions given to the agent, and architecture rationale.

## 7. Future Considerations (Post-MVP)

- **Confluence Integration:** Implement LangChain.js Document Loaders to fetch, chunk, and embed Confluence pages into a vector database (like Pinecone or pgvector) once the data volume exceeds optimal context window limits.
- **SSO Authentication:** Implement OAuth2 (e.g., via NextAuth.js) to restrict access to company employees.
- **Dynamic Data Updates:** Move from a static `knowledge_data.json` file to a proper database or CMS for managing knowledge and expert availability.
