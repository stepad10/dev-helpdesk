# Assignment - Internal Tool Prototype

## Context

Your task is to build a prototype of an internal application based on an assignment from a ticket in our backlog. This task is not a test of manual coding. The goal is to demonstrate how effectively you can use AI tools (Copilot, Claude, etc.) to create a complex, secure, and well-structured application in record time.

## Expected Output

1. **Functional prototype** (source codes in a GitHub repository + instructions on how to run it)
2. **File `agents.md`** — describe your workflow with AI tools, what instructions you gave the agent, and how you approached the architecture.
3. **Basic testing** — correctness of answers and security of the solution.

---

## Request from the internal ticket: Internal helper for developers

We are currently dealing with an internal problem — our developers keep dealing with the same questions over and over again. How do we deploy? Who is in charge of the database? How does that old PHP system work? The answers exist, but they are scattered across various documents and people's heads.

We would like a simple tool (a web app, chatbot, API — it's up to you), where a developer types a question and gets an answer. We have a piece of our internal documentation and a list of people who know their stuff. Let's treat it as a first version — nothing huge, but it should work and be reasonably built.

### What we expect from it

- A developer writes a question, for example, "How do I deploy an app?" and gets a clear answer.
- If the answer is not in the documentation, it should at least say who to contact.
- Answers should be clear — ideally, it should be visible where the information comes from.
- I don't want the tool to answer nonsense that doesn't relate to our company.
- It would be great if it remembered the conversation context, so things don't have to be repeated.
- Once it works, we would like to connect it to our Confluence, but that's not a priority right now.

### What to watch out for

- We do not want the chat to allow users to access internal instructions or system prompts.
- Sometimes people joke around and try to "hack" chatbots — it should be resilient.
- The documentation sometimes contains older and newer versions of information — it should be able to distinguish what is current.
- There isn't a lot of data and it's not completely perfect, but work with what you have. How you process and display it is up to you.

### Our data

We are sending exported data from our internal system (see attachment `knowledge_data.json`).
We consider it the source of truth for the first version.

## Attachment: knowledge_data.json

```json
{
  "knowledge_base": [
    {
      "id": "DOC-001",
      "topic": "Deployment",
      "content": "All TypeScript/Node applications are deployed automatically via CI/CD pipeline to AWS Lambda. Every deployment requires approval from @tech_lead. Hotfixes can bypass the pipeline with @tech_lead's written approval in Slack.",
      "tags": ["tech", "cloud", "node", "deployment"],
      "last_updated": "2025-11-15",
      "status": "current"
    },
    {
      "id": "DOC-002",
      "topic": "Database",
      "content": "Pouzivame vyhradne PostgreSQL 15. Zmeny schematu resi @martin_db pres Prisma migrace. Primy zapis do produkcni DB je prisne zakazan. Backup bezi kazdych 6 hodin.",
      "tags": ["backend", "db", "sql", "postgres"],
      "last_updated": "2025-09-20",
      "status": "current"
    },
    {
      "id": "DOC-003",
      "topic": "Deployment",
      "content": "Stare PHP projekty se nasazuji manualnim kopirovanim souboru pres FTP na server 'old-legacy-01'. POZOR: Tento postup je deprecated od Q3 2025, nove nasazeni musi schvalit @jana_php.",
      "tags": ["legacy", "php", "manual", "deployment"],
      "last_updated": "2024-03-10",
      "status": "deprecated"
    },
    {
      "id": "DOC-004",
      "topic": "Database",
      "content": "Pro nove microservices je povoleno pouzit MongoDB jako sekundarni databazi. Schvaleni vyzaduje @tech_lead a @martin_db. Plati od Q1 2025.",
      "tags": ["backend", "db", "nosql", "mongodb"],
      "last_updated": "2025-01-08",
      "status": "current"
    },
    {
      "id": "DOC-005",
      "topic": "Security",
      "content": "Vsechny API endpointy musi byt chraneny JWT autentizaci. Tokeny maji platnost 15 minut. Refresh token flow resi @tech_lead. Vyjimka: interni health-check endpointy.",
      "tags": ["security", "api", "auth"],
      "last_updated": "2025-08-01",
      "status": "current"
    },
    {
      "id": "DOC-006",
      "topic": "Code Review",
      "content": "Kazdy PR musi mit alespon 2 approvals. Pro zmeny v infrastrukture je nutny approval od @tech_lead. Frontend zmeny reviewuje @karel_fe.",
      "tags": ["process", "review", "git"],
      "last_updated": "2025-10-01",
      "status": "current"
    }
  ],
  "experts": [
    {
      "name": "Petr Novak",
      "handle": "@tech_lead",
      "skills": ["aws", "deployment", "node", "architecture", "security"],
      "availability": "available"
    },
    {
      "name": "Martin Svoboda",
      "handle": "@martin_db",
      "skills": ["postgres", "sql", "migrations", "prisma", "mongodb"],
      "availability": "on_leave_until_2025-12-01"
    },
    {
      "name": "Jana Kralova",
      "handle": "@jana_php",
      "skills": ["php", "ftp", "legacy", "wordpress"],
      "availability": "available"
    },
    {
      "name": "Karel Dvorak",
      "handle": null,
      "skills": ["react", "nextjs", "frontend", "css", "testing"],
      "availability": "available"
    },
    {
      "name": "Lucie Benesova",
      "handle": "@lucie_ops",
      "skills": ["ci-cd", "docker", "monitoring", "aws"],
      "availability": "available"
    }
  ]
}
```
