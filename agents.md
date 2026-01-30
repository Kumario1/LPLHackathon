Project Overview

This repo implements Transition OS, a backend + agent stack for LPL‑style advisor onboarding and transitions. The goal is to turn messy multi‑system transitions into a governed, automated pipeline with SLAs, audit trails, and AI assistance, while keeping humans in control for compliance decisions.

There are three main layers:

    Frontend: whatever UI or chat client the user interacts with.

    Clawdbot (agent): runs on AWS EC2, interprets user intent, and calls skills.

    Backend (Transition OS): FastAPI + DB providing a canonical data model and REST APIs.

The most important rule: all reads/writes go through the backend API, not directly to the database.
High‑Level Architecture

    Frontend → Clawdbot (EC2)

        User types things like:

            “What’s left for the Smith household?”

            “Mark this task complete.”

            “I have a meeting with the Smiths, grab all the files for me.”

        Clawdbot uses tools/skills to translate those into API calls.

    Clawdbot → Transition OS Backend

        Clawdbot never touches the DB directly.

        Skills call HTTPS endpoints on the backend (e.g., /api/transitions, /api/tasks/{id}/complete, /api/households/{id}/meeting-pack).

        Backend enforces validation, RBAC, business rules, and writes audit events.

    Backend → Database

        Backend is FastAPI + SQLAlchemy + Postgres/SQLite.

        It owns the canonical transition data model (advisors, households, accounts, workflows, tasks, documents, audit_events).

        It also handles webhook ingestion from external systems (e‑sign, ACAT feeds, etc.).

    Database → External clients / UI / Clawdbot

        Nobody talks to the DB except the backend.

        LPL clients and internal users see the same data via the UI and APIs that Clawdbot uses.

Canonical Data Model (Conceptual)

Core entities:

    Advisor – who is being onboarded / owns households.

    Household – client or family being transitioned.

    Account – investment accounts per household, with custodian & product info.

    Workflow – a transition workflow (e.g., recruited advisor onboarding, acquisition conversion).

    Task – operational steps with status, dependencies, owner, SLAs.

    Document – forms and paperwork, with NIGO status and defect metadata.

    AuditEvent – immutable log of every significant change and webhook event.

Skills and APIs should treat these as the source of truth and avoid inventing new shapes unless necessary.
Clawdbot & Skills

Clawdbot is the orchestrator that sits between users and Transition OS. It has skills (tools) that call into the backend and/or local Python modules.

Main skills you should expect:

    Workflow Engine Skill

        Understands workflows and tasks.

        Called to create workflows, update task status, compute “what’s left”, and manage dependencies/SLAs.

    Document Intelligence / NIGO Skill

        Validates documents and detects NIGO issues (missing signatures, wrong versions, etc.).

        Writes structured defect info back through the backend, not directly to files.

    Entity Resolution Skill

        Matches clients/accounts/households across source systems.

        Used primarily during ingestion/acquisition scenarios, again via backend APIs.

    ETA & Risk Prediction Skill

        Predicts time to complete a transition and attrition risk by household/advisor.

        Exposes ETA and risk scores that the UI and Clawdbot can read.

    GenAI Copilot Skill

        Drafts status emails, explanations, and talking points.

        Always returns drafts; never sends messages or mutates data on its own.

    Meeting Prep Skill

        Given a household, prepares a “meeting pack”: key documents, current status, open issues, and talking points.

        Used for queries like “I have a meeting with this client, grab all the files.”

All of these should call backend APIs (or shared Python service classes) rather than bypassing them.
Backend Responsibilities

The backend (Transition OS) should:

    Expose REST endpoints for:

        Listing transitions/households.

        Getting household detail + tasks + docs + ETA + risk.

        Completing tasks and creating exceptions.

        Validating documents and returning NIGO defects.

        Producing meeting packs.

        Receiving webhooks (/webhooks/{source}) from external systems.

    Enforce business rules and RBAC

        Validate input shapes and state transitions.

        Check roles/entitlements (advisor vs ops vs service).

        Block actions that violate sequencing (e.g., cannot move assets before account is open).

    Maintain audit trails

        Every meaningful change (task complete, status update, NIGO result, meeting pack generated) writes an AuditEvent.

        Each event captures actor, timestamp, type, and payload.

    Provide a stable contract

        Clawdbot skills and UIs depend on these APIs; try to evolve them in a backward‑compatible way.

Agent Safety & Guardrails

When writing or modifying skills or backend logic, keep these guardrails:

    No direct DB access from skills

        All persistence goes through backend APIs or shared service classes in the backend.

        This is critical for auditability and to avoid scattered business logic.

    No autonomous external actions

        Skills may draft emails, generate tasks, or propose changes.

        Sending emails, performing transfers, or making irreversible changes must require explicit human approval and go through controlled backend endpoints.

    PII handling

        Avoid logging raw SSNs, full account numbers, or other sensitive data.

        When in doubt, use redaction (e.g., last 4 digits only).

    Explainability

        For predictions (ETA, risk), always return the reasons/features used, so humans can understand and challenge the results.

How to Think About Changes

When you (or another agent) add new code, follow this mental model:

    Is this domain logic or orchestration?

        Domain logic (rules, validations, workflows) belongs in the backend services.

        Orchestration (deciding which backend call to make based on language) belongs in Clawdbot.

    Does this require persistence or audit?

        If yes, it MUST go through the backend and write an AuditEvent.

    Can we reuse existing models/APIs?

        Prefer extending the canonical schema and endpoints rather than creating parallel ones.

This file is here to help AI agents understand the overall architecture and constraints so they generate code that fits the system instead of fighting it.