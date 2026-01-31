from __future__ import annotations

from typing import Any, Dict, Optional

import httpx

from openclaw.config import BACKEND_API_KEY, BACKEND_URL


class BackendClient:
    def __init__(self, base_url: str = BACKEND_URL, api_key: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key or BACKEND_API_KEY

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    async def get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Any:
        url = f"{self.base_url}{path}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(url, params=params, headers=self._headers())
            resp.raise_for_status()
            return resp.json()

    async def post(self, path: str, payload: Optional[Dict[str, Any]] = None) -> Any:
        url = f"{self.base_url}{path}"
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, json=payload or {}, headers=self._headers())
            resp.raise_for_status()
            return resp.json()

    async def health(self) -> Any:
        return await self.get("/health/live")

    # Backend API wrappers
    async def list_transitions(self, params: Optional[Dict[str, Any]] = None) -> Any:
        return await self.get("/api/transitions", params=params)

    async def get_transition(self, household_id: str) -> Any:
        return await self.get(f"/api/transitions/{household_id}")

    async def create_workflow(self, payload: Dict[str, Any]) -> Any:
        return await self.post("/workflows", payload)

    async def get_workflow(self, workflow_id: str) -> Any:
        return await self.get(f"/workflows/{workflow_id}")

    async def complete_task(self, task_id: str, note: str = "") -> Any:
        payload = {"status": "COMPLETED", "note": note}
        return await self.post(f"/api/tasks/{task_id}/complete", payload)

    async def validate_document(self, payload: Dict[str, Any]) -> Any:
        return await self.post("/documents/validate", payload)

    async def get_meeting_pack(self, household_id: str) -> Any:
        return await self.get(f"/households/{household_id}/meeting-pack")

    async def get_eta(self, workflow_id: str) -> Any:
        return await self.get(f"/predictions/eta/{workflow_id}")
