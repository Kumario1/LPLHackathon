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

1. Decide scope and stack
Pick one demo scenario so everything feels cohesive; “Transition Radar” (live dashboard + ETA + risk + alerts) is the strongest fit. Choose a boring stack: FastAPI + Python backend, Postgres or SQLite for data, and either simple server‑rendered HTML or a tiny React front‑end.
2. Get Claude to build the skills
Feed Claude the five skill prompts (NIGO, entity resolution, workflow engine, ETA/risk, GenAI copilot) in order so it generates self‑contained Python modules. Then use the integration prompt so it adds a TransitionCommandCenter that orchestrates all skills and exposes a simple Python demo function.
3. Add database and models
Have Claude add SQLAlchemy (or similar) models for advisors, households, accounts, tasks, documents, and audit_events bound to Postgres/SQLite. Ask it to include an init_db.py to create tables and seed_db.py to insert one advisor, a handful of households, and some accounts/tasks.
4. Wrap everything in a FastAPI backend
Ask Claude to wrap TransitionCommandCenter and the DB into a FastAPI app with endpoints for webhooks, listing transitions, household detail, completing tasks, getting “what’s left,” and drafting emails. Include a simple mock auth layer with hard‑coded advisor/ops roles and role checks on write endpoints.
5. Build a tiny “Transition Radar” UI
Have Claude generate either two Jinja templates or a tiny React app that calls those FastAPI endpoints. One page is a radar (table of households with status, ETA, risk), and the other is a household detail view showing tasks, NIGO issues, timeline, and a “Draft status email” button.
6. Simulate webhooks and notifications
Ask Claude to create small scripts that POST fake webhook events (e.g., ACAT rejected, e‑sign complete, document uploaded) into your /webhooks/{source} endpoint. Each script should be runnable from the command line and cause visible changes in the dashboard (risk, ETA, new tasks, NIGO flags).
7. Add a minimal “Clawdbot” CLI
Have Claude build a cli.py that calls your FastAPI API so you can run commands like status Smith, complete-task T_001, and draft-email Smith. This CLI becomes your stand‑in for Clawdbot, showing how chat or phone commands would drive the same APIs.
8. Dry‑run and script the live demo
Run through an end‑to‑end flow: show the radar, fire a webhook script, refresh to show updated risk/ETA, complete a task via CLI, and show a drafted email. Write a short script (who talks when, what commands you run, what screens you show) so the 3–5 minute demo is tight and repeatable.
9. Prepare slides and one‑pager
Create 3–4 slides: problem (LPL onboarding pain), architecture (Transition OS + skills + API + UI), demo flow, and impact metrics. Add a one‑pager that highlights safety/compliance (RBAC, audit trail, human‑in‑the‑loop) and how this ties directly to LPL’s public risk language.
10. Final polish and contingency
Do at least two full rehearsals on your actual laptops with bad‑network assumptions (e.g., refreshes may be slow, so have screenshots ready). Add simple fallbacks: if an endpoint breaks, you can show pre‑saved JSON responses or screenshots while still telling the same story.


Build an “Onboarding & Transition Command Center” that turns messy, multi-system transitions (advisor + accounts + assets + home-office integration) into a governed, automated pipeline with measurable SLAs, while keeping humans in control for compliance decisions. LPL publicly flags “difficulties and delays in onboarding… acquired, recruited, or transitioned advisors” and the risk of business disruption/clients not opening accounts, so your solution should directly reduce cycle time, NIGO rates, and retention risk.
Target problem to solve
The operational reality is thousands of small tasks across many parties: advisor teams, clients, prior firm/custodian, LPL ops, supervision, and sometimes a whole acquired broker-dealer being converted (LPL cites converting “seven distinct broker-dealers” in the Atria integration). The failure modes are predictable: missing paperwork, inconsistent data, exceptions that bounce between queues, delays waiting on approvals, and poor visibility into what’s stuck and why.
Detailed solution (architecture) (Read perplexity chat, defines what this actually is, and how we will integrate clawdot to do this.)
A) “Transition OS” data layer (cloud)
Create a cloud-native canonical data model for transitions so every account/advisor has a single “transition record” with status, dependencies, and audit history. Ingest events from sources like: CRM/export files, account opening system, ACAT/transfer status feeds, document/e-sign platform, ticketing/case systems, and advisor portal telemetry (what steps completed).​
Core objects you track:
Advisor/team: registrations/appointments status, affiliation model, users/entitlements, key dates.​
Household/client: identity/KYC flags, contact preferences, communication history.​
Account: type, eligibility (ACAT-able or not), product constraints, transfer method, NIGO reasons, current step.​
Tasks: owner, SLA, blocking dependencies, evidence attachments, timestamps, escalation path.​
B) Workflow engine + policy-as-code (automation)https://www.perplexity.ai/search/b-workflow-engine-policy-as-co-QnGI5noNRr6zw4XeD8E_Lg

Add a workflow/orchestration layer that enforces sequencing (you cannot “move assets” before account open, you cannot open without required data, etc.) and writes every action to an immutable audit log. Encode playbooks for common moves (independent advisor join, bank program conversion, acquisition conversion) so transitions are repeatable instead of bespoke.​
Examples of automations:
Auto-generate task checklists per account type and product mix (IRA rollover vs brokerage vs advisory, alternatives, annuities constraints).​
Auto-route exceptions to the right team with required context attached (forms missing, signature mismatch, transfer rejection reason).​
C) AI/ML components (where models actually help)
Document intelligence + NIGO prevention
Use OCR + document classification + field extraction to pre-fill forms, validate completeness, and catch “not-in-good-order” issues before submission (missing signatures, wrong form version, inconsistent SSN/DOB, stale dates). Output: a structured “defect list” with recommended fixes and confidence, plus citations to the exact document region.​
Entity resolution + reconciliation
Transitions often involve duplicate client records, name variations, and inconsistent account identifiers; use probabilistic matching to link households/accounts across exports and systems. Output: match graph + confidence + human review queue for low-confidence pairs.​
ETA + risk prediction
Train models to predict “time-to-complete” and “attrition risk” using features like account type, custodian, advisor experience, exception counts, and historical bottlenecks. Output: early warning list (“these 50 households are at high risk of not completing/opening”) aligned to LPL’s stated risk that clients may choose not to open accounts.
GenAI copilot (bounded)
Provide a copilot that drafts client/advisor communications, summarizes what’s pending, and generates next-best-actions—but only from approved internal data and with redaction.​
How to use “Clawdbot” safely (and still impress judges)
Clawdbot-style agents can read/write files and execute commands, which is powerful but dangerous if you give them broad access; sources explicitly warn that this kind of agent can access local files, run scripts, and create security risk without strong containment. For a financial-services use case, position Clawdbot as an automation runner inside a sandbox, not as an unconstrained superuser over production data.
A safe pattern:
Run Clawdbot in a container with least-privilege, “workspaceAccess: ro” (read-only) for any sensitive artifacts, and no direct access to prod systems.​
Give it tool functions that are already governed: “extract_fields(document_id)”, “create_task(record_id, type)”, “suggest_email(template_id, variables)”—not “access entire file share.”
Require human approval for any external communications, account actions, or changes to records (“four-eyes” control).​
Implementation plan (hackathon-ready)
Week 0–1 (prototype): Build canonical transition record + ingest a sample dataset (CSV exports + sample docs), implement status dashboard and a simple workflow.​
Week 1–2 (AI): Add doc extraction + NIGO checks, plus an exception queue; demo how it prevents rejections and reduces cycle time.​
Week 2+ (scale): Add ETA/retention risk model and role-based access/audit trails; demo measurable KPIs tied to LPL’s onboarding delay risk statements.
Success metrics to show:
Time from advisor join → first 80% accounts transferred.
NIGO rate (submissions rejected / total submissions).
“Stuck > X days” accounts count.
Predicted vs actual completion time accuracy.
Asset retention proxy: % households completing within 30/60 days (ties to LPL’s concern about clients not opening accounts).​
Pick one of these for your demo scope:
“NIGO Shield”: document AI + workflow gates.
“Transition Radar”: live dashboard + ETA + risk alerts.
“Acquisition Converter”: multi-broker-dealer mapping + reconciliation + exception management (aligned to LPL describing converting seven broker-dealers in Atria).​
Which scenario are you building for: recruited advisors, institutional program transitions, or acquisition onboarding (e.g., Commonwealth-style onboarding)?

