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
