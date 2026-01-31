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
