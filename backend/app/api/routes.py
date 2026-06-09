from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any

router = APIRouter()


class IncomingMessage(BaseModel):
    source: str  # email | whatsapp
    sender: str
    subject: str | None = None
    body: str
    attachments: list[str] = []


class ApprovalAction(BaseModel):
    action: str  # approved | rejected
    edited_content: str | None = None


@router.post("/messages/incoming")
async def receive_message(msg: IncomingMessage) -> dict[str, Any]:
    """Entry point for incoming email and WhatsApp messages."""
    # TODO: route through OrchestratorAgent
    return {"status": "queued", "message_id": "placeholder"}


@router.get("/queue")
async def get_approval_queue() -> dict[str, Any]:
    """Return all messages pending Supervisor approval."""
    # TODO: query MessageQueue with requires_approval=True and status=pending
    return {"items": []}


@router.post("/queue/{message_id}/approve")
async def approve_message(message_id: str, action: ApprovalAction) -> dict[str, Any]:
    """Supervisor approves or rejects a queued message."""
    if action.action not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="action must be 'approved' or 'rejected'")
    # TODO: update approval_status and trigger send if approved
    return {"status": action.action, "message_id": message_id}


@router.get("/imports")
async def list_imports() -> dict[str, Any]:
    """Return active import tracking records (Kadi module)."""
    return {"imports": []}


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
