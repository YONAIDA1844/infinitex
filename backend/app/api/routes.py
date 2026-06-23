import asyncio
import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any

from app.integrations.gmail_client import send_email

logger = logging.getLogger(__name__)
router = APIRouter()


class IncomingMessage(BaseModel):
    source: str  # email | whatsapp
    sender: str
    subject: str | None = None
    body: str
    attachments: list[str] = []


class ApprovalAction(BaseModel):
    action: str           # approved | rejected
    content: str | None = None
    edited_content: str | None = None
    recipient_contact: str | None = None
    channel: str | None = None
    subject: str | None = None


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
    """
    Supervisor approves or rejects a queued message.

    When approved and channel='email', sends the email immediately and
    returns status='sent'. On rejection, returns status='rejected'.
    """
    if action.action not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="action must be 'approved' or 'rejected'")

    if action.action == "rejected":
        logger.info("[routes] Message %s rejected by Supervisor", message_id)
        return {"status": "rejected", "message_id": message_id}

    # ── Approved ─────────────────────────────────────────────────────────────
    channel = action.channel or "email"
    contact = action.recipient_contact or ""
    content = action.edited_content or action.content or ""
    subject = action.subject or "🚢 InfiniteX — Agente de Tráfico"

    if channel == "email" and contact:
        loop = asyncio.get_running_loop()
        try:
            await loop.run_in_executor(
                None,
                lambda: send_email(to=contact, subject=subject, body_text=content),
            )
            logger.info("[routes] ✉️  Approved message %s sent to %s", message_id, contact)
        except Exception as exc:
            logger.error("[routes] ❌ Failed to send email for message %s: %s", message_id, exc)
            raise HTTPException(status_code=500, detail=f"Email send failed: {exc}")
    else:
        # WhatsApp or no contact — mark approved but no send yet
        logger.info("[routes] Message %s approved (channel=%s, no email dispatch)", message_id, channel)

    return {"status": "sent", "message_id": message_id}


@router.get("/imports")
async def list_imports() -> dict[str, Any]:
    """Return active import tracking records (Kadi module)."""
    return {"imports": []}


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
