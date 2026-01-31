# Clawdbot Skills

This directory contains the skill definitions for Clawdbot, the AI agent for Transition OS.

## Overview

Each subdirectory contains a `SKILL.md` file which defines:
- **When to use**: Triggers for the skill.
- **API Assumptions**: Which backend endpoints to call.
- **Behavior**: Step-by-step logic.
- **Safety**: Constraints and PII handling.

## Available Skills

- **transition-communications**: Drafts emails/status updates.
- **transition-doc-validation**: Checks documents for NIGO issues.
- **transition-entity-resolution**: Matches imported data to LPL records.
- **transition-local-package**: Downloads files to local machine.
- **transition-onboard-advisor**: Orchestrates advisor onboarding workflows.
- **transition-workflow-status**: Provides status and ETA predictions.

## Adding a New Skill

1.  Create a new folder: `skills/my-new-skill`.
2.  Add `SKILL.md`.
3.  Follow the standard structure (YAML frontmatter, sections).
4.  Implement corresponding backend support in `backend/orchestrator.py` if needed.
