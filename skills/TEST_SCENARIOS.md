# Clawdbot Skill Test Scenarios

Since skills are conversational components integrating with the backend, they are best tested via scenario walkthroughs.

## 1. Advisor Onboarding (`transition-onboard-advisor`)

**Scenario:** User wants to onboard a new advisor from Schwab.
**User Input:** "Onboard Jane Doe from Schwab."
**Expected Skill Behavior:**
1. Call `POST /workflows` with `{"advisor_id": "...", "workflow_type": "RECRUITED_ADVISOR", ...}`.
2. Respond with "Started onboarding for Jane Doe. Workflow ID: WF_...".

**Edge Case:** User doesn't provide name.
**Expected:** Skill asks "Which advisor would you like to onboard?".

## 2. Document Validation (`transition-doc-validation`)

**Scenario:** User uploads a PDF and asks for check.
**User Input:** "Check this document for NIGO issues." (with file context)
**Expected Skill Behavior:**
1. Call `POST /documents/validate` with document ID.
2. If Defects found: List them (e.g., "Missing signature on page 2").
3. If Clean: Confirm "Document is in good order."

## 3. Workflow Status (`transition-workflow-status`)

**Scenario:** User checks progress.
**User Input:** "What is the status of Jane Doe's transition?"
**Expected Skill Behavior:**
1. Call `GET /workflows/{id}`.
2. Call `GET /predictions/eta/{id}`.
3. Respond: "Jane Doe is 35% complete. Status: IN_PROGRESS. ETA: Feb 15 (High Confidence)."

## 4. Entity Resolution (`transition-entity-resolution`)

**Scenario:** User runs matching on export.
**User Input:** "Run client matching for the Schwab export."
**Expected:**
1. Call `POST /entity/match`.
2. Summary: "Matched 85/100 records. 10 need review."

## 5. Communications (`transition-communications`)

**Scenario:** Draft email.
**User Input:** "Draft a status update email for the Smith household."
**Expected:**
1. Call `POST /communications/draft`.
2. Show draft subject and body.
3. "Review this draft. I cannot send it effectively."
