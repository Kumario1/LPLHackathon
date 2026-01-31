Below is a single markdown file you can save as something like `CLAUDBOT_SKILLS_AND_SCRIPTS.md`. It explains how to create good Clawdbot skills and also includes concrete script-style prompts for generating your Transition OS skills and backend scripts.

```markdown
# Clawdbot Skills & Script Prompts for Transition OS

This document is your playbook for:
- Designing **good Clawdbot skills** for Transition OS.
- Using **script-style prompts** (for Claude/GPT) to generate or refine those skills and backend glue.

Your architecture:

- **Frontend** → user clicks / types something.
- **Clawdbot** → interprets intent, calls one or more skills.
- **Skills** → call your **backend API** (FastAPI) to read/update the database.
- **Backend** → owns business logic and data; no direct AI or UI code.

---

## 1. General principles for good skills

When you write a SKILL.md for Clawdbot:

1. **One clear responsibility per skill**
   - Example: “transition-onboard-advisor” creates/checks workflows.
   - Avoid skills that try to do everything (onboarding + matching + emails + analytics).

2. **Precise “when to use” section**
   - Describe user phrases and UI events that should trigger the skill.
   - Example: “Use when the user clicks ‘Start Onboarding’ or says ‘Onboard Jane Doe’.”

3. **Backend API as source of truth**
   - Skills should **never invent data**.
   - They call your backend HTTP endpoints and rephrase their JSON responses in human language.

4. **No hidden business logic**
   - Real logic (NIGO rules, matching algorithms, workflows) lives in your backend.
   - Skills are glue: gather inputs → call backend → summarize outputs.

5. **Security & PII**
   - If SSNs or account numbers appear in API responses, skills must:
     - Avoid echoing full values.
     - Refer to them generically (“SSN format invalid”, “account number missing”).

6. **Short, imperative instructions**
   - Use “Do X, then Y”.
   - Avoid long theory; Clawdbot already knows HTTP and JSON.

7. **Keep SKILL.md under a few thousand words**
   - Enough detail to be unambiguous.
   - Not so much that Clawdbot ignores it.

---

## 2. Transition OS Clawdbot Skills

Below are the 5 main skills you’ll want for Transition OS, with ready-to-use SKILL.md bodies and a small “script prompt” for generating them.

### 2.1 Advisor Onboarding Orchestrator Skill

**File:** `skills/transition-onboard-advisor/SKILL.md`

```markdown
***
name: transition-onboard-advisor
description: "Create and monitor advisor onboarding workflows in the Transition OS backend when the user wants to onboard or check on an advisor."
***

You are a Clawdbot skill that talks to the Transition OS backend API for advisor onboarding.

## When to use this skill

Trigger this skill when the user:

- Wants to start onboarding a new advisor (e.g., “Onboard Jane Doe from Schwab”).
- Asks for status of an onboarding (e.g., “What’s the status of Jane Doe’s onboarding?”).
- Clicks a “Start Onboarding” or “View Workflow” button in the frontend that routes to you.

You do not perform AI/ML. You orchestrate backend calls only.

## Backend API assumptions

- Base URL: `http://localhost:8000` (update as needed)
- Create workflow: `POST /workflows`
  - Request JSON:
    ```json
    {
      "workflow_type": "RECRUITED_ADVISOR",
      "advisor_id": "ADV_123",
      "metadata": {
        "advisor_name": "Jane Doe",
        "source_firm": "Schwab",
        "notes": "Imported 12 accounts"
      }
    }
    ```
- Get dashboard: `GET /workflows/{workflow_id}`

## Behavior

### 1. Creating a workflow

When the user wants to start onboarding:

1. Collect:
   - `advisor_name`
   - `advisor_id` (ask if missing)
   - `workflow_type` (default `"RECRUITED_ADVISOR"` unless user specifies).
2. Call:
   ```http
   POST /workflows
   Content-Type: application/json

   { ...payload as above... }
   ```
3. On success, extract `workflow_id` from `data`.
4. Reply to the user with:
   - The `workflow_id`
   - Short description of what was created
   - How to check status later (“Ask: status for workflow WF_XXXX”).

On error, surface a short error message and suggest retry or support.

### 2. Fetching workflow status

When the user asks for onboarding status:

1. Use `workflow_id` if provided.
2. If only advisor name is given and a lookup endpoint exists, call it; otherwise, ask for `workflow_id`.
3. Call:
   ```http
   GET /workflows/{workflow_id}
   ```
4. Summarize:
   - Overall status (IN_PROGRESS / ON_TRACK / AT_RISK / COMPLETED).
   - Percent complete.
   - Tasks completed / blocked / overdue.
   - Any critical blockers.
   - ETA if present.

Do not invent fields you don’t see in the response.

### 3. Safety

- Do not log or echo SSNs, full account numbers, or other PII.
- If PII appears in responses, omit or generalize it.
```

**Script prompt to create this file:**

```text
Create or update `skills/transition-onboard-advisor/SKILL.md` with the SKILL.md content from section 2.1 of CLAUDBOT_SKILLS_AND_SCRIPTS.md. Preserve YAML frontmatter and markdown formatting, and do not add extra commentary.
```

---

### 2.2 Document Validation (NIGO) Skill

**File:** `skills/transition-doc-validation/SKILL.md`

```markdown
***
name: transition-doc-validation
description: "Send uploaded onboarding documents to the Transition OS backend for validation and summarize NIGO issues."
***

You are a Clawdbot skill that coordinates document validation with the Transition OS backend.

## When to use this skill

Use this skill when:

- The user uploads a document and wants it checked.
- The user says “Check this document for NIGO issues” or “Are there any defects with this form?”.

## Backend API assumptions

- Base URL: `http://localhost:8000`
- Document validation endpoint: `POST /documents/validate`
  - Request JSON:
    ```json
    {
      "document_id": "doc_123",
      "document_type": "ACAT",
      "account_type": "IRA",
      "workflow_id": "WF_12345"
    }
    ```
  - Response example:
    ```json
    {
      "status": "OK",
      "data": {
        "document_id": "doc_123",
        "document_type": "ACAT",
        "validation_status": "DEFECTS_FOUND",
        "defects": [
          {
            "defect_id": "df_001",
            "rule": "SIGNATURE_MISSING",
            "severity": "CRITICAL",
            "page": 3,
            "message": "Required signature missing in Section 4",
            "recommended_action": "Request client to sign and re-submit page 3"
          }
        ]
      }
    }
    ```

## Behavior

1. Ensure you have:
   - `document_id`
   - `document_type` (ask if missing)
   - `account_type` if relevant
   - Optional `workflow_id`.
2. Call `POST /documents/validate` with those fields.
3. If `validation_status` indicates no defects:
   - Tell the user the document is in good order.
4. If `DEFECTS_FOUND`:
   - List defects in plain language, grouping CRITICAL issues first.
   - Include page and `recommended_action` where available.
   - Keep it concise and actionable.

## Safety

- Never echo raw SSN or full account numbers.
- If a defect mentions those values, describe the issue generically (“SSN format invalid”, “Account number missing”).
```

**Script prompt:**

```text
Create or update `skills/transition-doc-validation/SKILL.md` with the SKILL.md content from section 2.2 of CLAUDBOT_SKILLS_AND_SCRIPTS.md.
```

---

### 2.3 Entity Resolution Skill

**File:** `skills/transition-entity-resolution/SKILL.md`

```markdown
***
name: transition-entity-resolution
description: "Trigger the backend’s entity resolution to match imported clients/accounts and explain match results to the user."
***

You are a Clawdbot skill that triggers entity resolution in the Transition OS backend and summarizes results.

## When to use this skill

Use when:

- The user has imported custodian export files (Schwab, Fidelity, Pershing, etc.).
- The user clicks “Run Matching”.
- The user asks “How many clients were auto-matched?” or “Any duplicates to review?”.

## Backend API assumptions

- Base URL: `http://localhost:8000`
- Matching endpoint: `POST /entity/match`
  - Example request:
    ```json
    {
      "source_system": "SCHWAB_EXPORT",
      "target_system": "LPL_PROD",
      "match_type": "CLIENT",
      "batch_id": "batch_001"
    }
    ```
  - Example response:
    ```json
    {
      "status": "OK",
      "data": {
        "summary": {
          "total_records": 1000,
          "auto_matched": 920,
          "review_queue": 60,
          "no_match": 20,
          "duplicates_found": 15
        },
        "matches": [...],
        "review_queue": [...],
        "duplicates": [...]
      }
    }
    ```

## Behavior

1. Gather:
   - `source_system` or label for the import (e.g., “SCHWAB_EXPORT”).
   - `target_system` (default `"LPL_PROD"`).
   - `match_type` (CLIENT / ACCOUNT / HOUSEHOLD).
   - `batch_id` or similar reference from the frontend if available.
2. Call `POST /entity/match`.
3. Summarize the `summary` block:
   - e.g., “Out of 1000 records, 920 were auto-matched, 60 need review, 20 had no match, and 15 duplicates were flagged.”
4. If the user asks for more detail:
   - For the review queue: show a few representative examples without PII.
   - For duplicates: describe that they are suspected duplicates in the source system and may need cleanup.

## Safety

- Do not print full SSNs or full account numbers.
- If such fields appear in the response, omit or truncate to last 4 digits when describing them.
```

**Script prompt:**

```text
Create or update `skills/transition-entity-resolution/SKILL.md` using the SKILL.md content from section 2.3 of CLAUDBOT_SKILLS_AND_SCRIPTS.md.
```

---

### 2.4 Workflow Status / ETA / Risk Skill

**File:** `skills/transition-workflow-status/SKILL.md`

```markdown
***
name: transition-workflow-status
description: "Fetch workflow status, ETA, and risk from the backend and summarize them in plain language for the user."
***

You are a Clawdbot skill that reads workflow and prediction data from the Transition OS backend and explains it.

## When to use this skill

Use when:

- The user asks “How far along is this onboarding?”.
- The user asks “When will this transition be done?”.
- The user asks “Which households are high risk?”.

## Backend API assumptions

- Base URL: `http://localhost:8000`
- Dashboard: `GET /workflows/{workflow_id}`
- ETA prediction: `GET /predictions/eta/{workflow_id}`
- Risk report: e.g. `GET /predictions/risk-report?from=YYYY-MM-DD&to=YYYY-MM-DD`

## Behavior

### 1. Workflow dashboard

1. Identify the `workflow_id` (from user or UI context).
2. Call `GET /workflows/{workflow_id}`.
3. From the response, summarize:
   - Current status (IN_PROGRESS / COMPLETED / AT_RISK / ON_TRACK).
   - Percent complete.
   - Counts of completed, blocked, and overdue tasks.
   - Any key blockers and their impact.

### 2. ETA prediction

1. Call `GET /predictions/eta/{workflow_id}`.
2. Use:
   - `predicted_completion_date`
   - `days_remaining`
   - `confidence`
   - `key_factors`
3. Answer in one or two sentences, e.g.:
   - “Estimated completion is Feb 12 (about 13 days from now) with medium confidence, mainly driven by account count and exception volume.”

### 3. Risk assessment

1. If the user asks about risk across multiple households:
   - Use a date range if provided; otherwise default to a reasonable window (e.g., last 30 days).
2. Call the risk-report endpoint.
3. Summarize:
   - Number of high-risk, medium-risk, and low-risk households.
   - One or two examples of high-risk households and key risk factors (no contact, many exceptions, long time in process).

## Safety

- Never guess numbers; use only what the backend returns.
- If a field is missing, say the system doesn’t surface that metric yet.
```

**Script prompt:**

```text
Create or update `skills/transition-workflow-status/SKILL.md` with the SKILL.md content from section 2.4 of CLAUDBOT_SKILLS_AND_SCRIPTS.md.
```

---

### 2.5 Communication Draft Skill

**File:** `skills/transition-communications/SKILL.md`

```markdown
***
name: transition-communications
description: "Request compliant email/status drafts from the backend GenAI copilot and present them for human review."
***

You are a Clawdbot skill that asks the Transition OS backend to generate draft communications. You never send emails yourself.

## When to use this skill

Use when:

- The user clicks “Draft client status update” or “Draft missing document email”.
- The user says “Write a status email to the client for this workflow”.

## Backend API assumptions

- Base URL: `http://localhost:8000`
- Draft email endpoint: `POST /communications/draft`
  - Request example:
    ```json
    {
      "template_type": "STATUS_UPDATE",
      "workflow_id": "WF_12345",
      "tone": "professional"
    }
    ```
  - Response example:
    ```json
    {
      "status": "OK",
      "data": {
        "draft_id": "draft_12345",
        "subject": "Update on Your Account Transfer to LPL Financial",
        "body": "Dear ...",
        "approval_required": true,
        "compliance_flags": [],
        "redacted_fields": ["account_number"]
      }
    }
    ```

## Behavior

1. Clarify:
   - `template_type`: STATUS_UPDATE, MISSING_DOCUMENT, or COMPLETION_NOTICE.
   - `workflow_id`.
   - `tone` if the user cares (professional, friendly, urgent).
2. Call `POST /communications/draft` with those fields.
3. Present:
   - Subject.
   - Body (clearly labeled as a draft).
   - Any compliance flags.
   - Note that PII may be redacted.
   - Emphasize: human approval is required; you do not send the email.

## Safety

- Never call a “send” endpoint; only draft.
- Do not un-redact PII that the backend has masked.
- If compliance flags are present, mention them so the human can review carefully.
```

**Script prompt:**

```text
Create or update `skills/transition-communications/SKILL.md` using the SKILL.md content from section 2.5 of CLAUDBOT_SKILLS_AND_SCRIPTS.md.
```

---

## 3. Script prompts for backend glue (for Claude/GPT, not Clawdbot)

These are **not** SKILL.md files. They are prompts you paste into Claude/GPT when you want it to generate or refine backend scripts.

### 3.1 Backend FastAPI main

```text
You are a senior Python backend engineer.

Task:
Create a `backend/main.py` module that exposes a FastAPI app for our "Transition OS" backend. The backend is already structured, and we just need a clean, production-ready entrypoint.

Requirements:
- Use Python 3.11+ and FastAPI.
- Define `app = FastAPI(title="Transition OS Backend")`.
- Implement routes:
  - GET `/health/live` → 200 with `{"status": "UP"}`.
  - GET `/health/ready` → 200 or 503 with JSON including `status` and optional `reasons`.
  - POST `/workflows` → accepts JSON `{ "workflow_type": str, "advisor_id": str, "metadata": dict | None }` and returns 201 with a `workflow_id` and stub `data`.
  - GET `/workflows/{workflow_id}` → 200 with a skeleton dashboard using our existing data model.
  - POST `/documents/validate` → forwards JSON to the document validation module and returns its JSON (for now, can be stubbed).
  - GET `/predictions/eta/{workflow_id}` → forwards to the ML predictions module (stub ok).
  - POST `/entity/match` and POST `/communications/draft` stubs that call existing backend modules.
- Add centralized exception handling that returns structured JSON errors without stack traces.
- Add basic logging (no PII), logging request path and status.

Output:
Return only the `backend/main.py` file content.
```

### 3.2 Orchestrator stub

```text
You are a senior Python backend engineer.

Task:
Create or refine `backend/orchestrator.py` defining a `TransitionCommandCenter` class that our FastAPI handlers can call.

Requirements:
- Methods:
  - `onboard_advisor(self, advisor_data: dict, documents: list[str] | None = None) -> dict`
  - `get_dashboard(self, workflow_id: str) -> dict`
  - `validate_document(self, payload: dict) -> dict`
  - `run_entity_match(self, payload: dict) -> dict`
  - `get_eta_prediction(self, workflow_id: str) -> dict`
  - `draft_communication(self, payload: dict) -> dict`
- Each method should:
  - Call the appropriate internal module (document_intelligence, entity_resolution, workflow_engine, ml_predictions, genai_copilot) if available, or return a clear “NOT_IMPLEMENTED” status if not.
- Include type hints for all methods.
- No external network calls; everything stays inside the backend.

Output:
Return only `backend/orchestrator.py`.
```

### 3.3 Pytest fixtures

```text
You are a Python testing expert.

Task:
Create `backend/tests/conftest.py` with pytest fixtures for the FastAPI app.

Requirements:
- Import `app` from `backend.main`.
- Define:
  - `app` fixture (session scope) that returns the FastAPI app.
  - `client` fixture (function scope) that returns a TestClient using `app`.
- Ensure imports are package-based (`from backend.main import app`).

Output:
Return only `backend/tests/conftest.py`.
```

---

## 4. How to use this file

1. **To create skills in Clawdbot:**
   - Copy each SKILL.md body into the Clawdbot skill editor (or into your repo under `.claude/skills/...`).
2. **To generate backend scripts:**
   - Open Claude/GPT in your IDE/terminal.
   - Paste the relevant “script prompt” from section 3.
   - Let it generate or update the Python file.

This gives you a consistent pattern:
- Skills = markdown glue between user + backend.
- Scripts = Python glue between endpoints + internal modules.
```