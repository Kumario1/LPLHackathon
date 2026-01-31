#!/usr/bin/env python3
"""
Import Transition OS demo dataset CSV/JSON into the configured database.

Default target is sqlite:///./transition_os.db unless --db is provided.
"""

import argparse
import csv
import json
import os
import sys
from datetime import datetime
from pathlib import Path


def parse_dt(value: str | None) -> datetime | None:
    if not value:
        return None
    text = value.strip()
    if not text:
        return None
    if text.endswith("Z"):
        text = text.replace("Z", "+00:00")
    try:
        return datetime.fromisoformat(text)
    except ValueError:
        return None


def load_csv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="ascii") as handle:
        return list(csv.DictReader(handle))


def load_jsonl(path: Path) -> list[dict]:
    items = []
    with path.open(encoding="ascii") as handle:
        for line in handle:
            line = line.strip()
            if not line:
                continue
            items.append(json.loads(line))
    return items


def slugify(value: str) -> str:
    cleaned = "".join(ch.lower() if ch.isalnum() else "." for ch in value.strip())
    cleaned = ".".join(filter(None, cleaned.split(".")))
    return cleaned or "demo"


def main() -> None:
    parser = argparse.ArgumentParser(description="Import demo dataset into Transition OS DB")
    parser.add_argument(
        "--data",
        default="demo_data/transition_os_demo_v1",
        help="Path to demo dataset folder",
    )
    parser.add_argument(
        "--db",
        default=os.getenv("DATABASE_URL", "sqlite:///./transition_os.db"),
        help="Database URL (overrides DATABASE_URL)",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Drop and recreate tables before import",
    )
    args = parser.parse_args()

    data_dir = Path(args.data)
    if not data_dir.exists():
        raise SystemExit(f"Dataset folder not found: {data_dir}")

    # Ensure DB URL is set before importing backend modules.
    os.environ["DATABASE_URL"] = args.db
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    from backend.database import SessionLocal, engine
    from backend.models import Base, Advisor, Household, Account, Task, Document, Workflow, AuditEvent

    if args.reset:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    advisors_rows = load_csv(data_dir / "advisors.csv")
    households_rows = load_csv(data_dir / "households.csv")
    accounts_rows = load_csv(data_dir / "accounts.csv")
    tasks_rows = load_csv(data_dir / "tasks.csv")
    documents_rows = load_csv(data_dir / "documents.csv")
    audit_rows = load_jsonl(data_dir / "audit_events.jsonl")

    # Precompute workflow timing from tasks.
    workflow_times: dict[str, dict[str, datetime]] = {}
    household_eta: dict[str, datetime] = {}
    for row in tasks_rows:
        wf_id = row.get("workflow_id", "")
        created_at = parse_dt(row.get("created_at"))
        due_at = parse_dt(row.get("due_at"))
        task_name = (row.get("task_name") or "").strip()
        if wf_id:
            entry = workflow_times.setdefault(wf_id, {})
            if created_at:
                entry.setdefault("started_at", created_at)
                if created_at < entry["started_at"]:
                    entry["started_at"] = created_at
            if due_at:
                entry.setdefault("target_completion_at", due_at)
                if due_at > entry["target_completion_at"]:
                    entry["target_completion_at"] = due_at

        household_id = row.get("household_id", "")
        if household_id and due_at:
            if task_name == "Transition complete":
                household_eta[household_id] = due_at
            else:
                existing = household_eta.get(household_id)
                if existing is None or due_at > existing:
                    household_eta[household_id] = due_at

    db = SessionLocal()
    try:
        # Advisors
        advisor_map: dict[str, Advisor] = {}
        for row in advisors_rows:
            name = (row.get("advisor_name") or "Demo Advisor").strip()
            channel = (row.get("channel") or "independent").strip()
            start_date = parse_dt(row.get("start_date"))
            experience_years = 0
            if start_date:
                delta = datetime.utcnow() - start_date
                experience_years = max(0, int(delta.days / 365))

            email = f"{slugify(name)}@example.com"
            existing = db.query(Advisor).filter(Advisor.email == email).first()
            if existing:
                advisor = existing
            else:
                advisor = Advisor(
                    name=name,
                    email=email,
                    channel=channel,
                    experience_years=experience_years,
                )
                db.add(advisor)
            advisor_map[row.get("advisor_id", name)] = advisor

        db.commit()

        # Use first advisor as default
        default_advisor = next(iter(advisor_map.values()))

        # Workflows
        workflow_map: dict[str, Workflow] = {}
        for wf_id, timing in workflow_times.items():
            workflow = Workflow(
                advisor_id=default_advisor.id,
                name=f"Transition Workflow {wf_id}",
                type="RECRUITED_ADVISOR",
                started_at=timing.get("started_at"),
                target_completion_at=timing.get("target_completion_at"),
            )
            db.add(workflow)
            workflow_map[wf_id] = workflow

        db.commit()

        # Households
        household_map: dict[str, Household] = {}
        for row in households_rows:
            stall_risk = float(row.get("stall_risk") or 0)
            attrition_risk = float(row.get("attrition_risk") or 0)
            risk_score = round((stall_risk + attrition_risk) / 2.0, 1)
            household_id = row.get("household_id", "")
            household = Household(
                advisor_id=default_advisor.id,
                name=row.get("household_name") or household_id,
                status=row.get("status") or "IN_PROGRESS",
                eta_date=household_eta.get(household_id),
                risk_score=risk_score,
            )
            db.add(household)
            household_map[household_id] = household

        db.commit()

        # Accounts
        account_map: dict[str, Account] = {}
        for row in accounts_rows:
            household = household_map.get(row.get("household_id", ""))
            if not household:
                continue
            raw_type = (row.get("account_type") or "OTHER").upper()
            if "TAXABLE" in raw_type or "BROKERAGE" in raw_type:
                acct_type = "BROKERAGE"
            elif "IRA" in raw_type:
                acct_type = "IRA"
            else:
                acct_type = raw_type

            account = Account(
                household_id=household.id,
                account_number=row.get("account_id") or f"ACC-{household.id}",
                type=acct_type,
                custodian=row.get("delivering_institution") or "Custodian Demo",
                status=row.get("status") or "PENDING",
                asset_value=float(row.get("estimated_assets_usd") or 0),
            )
            db.add(account)
            account_map[row.get("account_id", "")] = account

        db.commit()

        # Documents
        for row in documents_rows:
            household = household_map.get(row.get("household_id", ""))
            if not household:
                continue
            account = account_map.get(row.get("account_id", "")) if row.get("account_id") else None
            raw_nigo = (row.get("nigo_status") or "OK").upper()
            if raw_nigo == "OK":
                nigo_status = "CLEAN"
                defects = None
            else:
                nigo_status = "DEFECTS_FOUND"
                severity = "MEDIUM"
                if raw_nigo in {"MISSING_SIGNATURE", "PLAN_TYPE_MISMATCH", "ILLEGIBLE"}:
                    severity = "HIGH"
                defects = [
                    {
                        "rule": raw_nigo,
                        "severity": severity,
                        "evidence": row.get("doc_type"),
                    }
                ]

            document = Document(
                household_id=household.id,
                account_id=account.id if account else None,
                type=row.get("doc_type") or "OTHER",
                name=row.get("filename") or "document.txt",
                storage_url=str(Path(args.data) / "docs" / (row.get("filename") or "document.txt")),
                nigo_status=nigo_status,
                defects_json=defects,
            )
            db.add(document)

        db.commit()

        # Tasks
        task_map: dict[str, Task] = {}
        for row in tasks_rows:
            household = household_map.get(row.get("household_id", ""))
            workflow = workflow_map.get(row.get("workflow_id", ""))
            if not workflow:
                workflow = Workflow(
                    advisor_id=default_advisor.id,
                    name=f"Transition Workflow {row.get('workflow_id', 'WF')}",
                    type="RECRUITED_ADVISOR",
                )
                db.add(workflow)
                db.flush()
                workflow_map[row.get("workflow_id", "")] = workflow

            owner_queue = (row.get("owner_queue") or "Ops").upper()
            if owner_queue == "OPS":
                owner_role = "OPS"
            elif owner_queue == "COMPLIANCE":
                owner_role = "COMPLIANCE"
            else:
                owner_role = "ADVISOR"

            status = row.get("status") or "PENDING"
            priority = 1
            if status in {"BREACHED"}:
                priority = 3
            elif status in {"NEAR_BREACH"}:
                priority = 2

            task = Task(
                workflow_id=workflow.id,
                household_id=household.id if household else None,
                name=row.get("task_name") or "Task",
                owner_role=owner_role,
                status=status,
                priority=priority,
                sla_due_at=parse_dt(row.get("due_at")),
            )
            db.add(task)
            task_map[row.get("task_id", "")] = task

        db.commit()

        # Link dependencies
        for row in tasks_rows:
            depends_on = row.get("depends_on_task_id") or ""
            if not depends_on:
                continue
            task = task_map.get(row.get("task_id", ""))
            blocker = task_map.get(depends_on)
            if task and blocker:
                task.blocked_by_task_id = blocker.id

        db.commit()

        # Audit events
        for row in audit_rows:
            created_at = parse_dt(row.get("timestamp"))
            actor_role = (row.get("actor_role") or "system").upper()
            actor_type = "SYSTEM"
            if actor_role in {"OPS", "COMPLIANCE", "ADVISOR"}:
                actor_type = actor_role
            audit = AuditEvent(
                created_at=created_at,
                actor_type=actor_type,
                actor_id=row.get("actor") or "system",
                event_type=row.get("event_type") or "EVENT",
                entity_type=row.get("entity_type"),
                entity_id=row.get("entity_id"),
                payload_json=row.get("payload") or {},
            )
            db.add(audit)

        db.commit()

        print("✅ Import complete")
        print(f"   Advisors:   {db.query(Advisor).count()}")
        print(f"   Households: {db.query(Household).count()}")
        print(f"   Accounts:   {db.query(Account).count()}")
        print(f"   Workflows:  {db.query(Workflow).count()}")
        print(f"   Tasks:      {db.query(Task).count()}")
        print(f"   Documents:  {db.query(Document).count()}")
        print(f"   AuditEvents:{db.query(AuditEvent).count()}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
