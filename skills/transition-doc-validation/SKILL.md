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
