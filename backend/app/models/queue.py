from sqlalchemy import Column, String, Boolean, DateTime, Text, Enum as SAEnum
from sqlalchemy.orm import DeclarativeBase
from datetime import datetime, timezone
import enum


class Base(DeclarativeBase):
    pass


class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class MessageQueue(Base):
    __tablename__ = "message_queue"

    id = Column(String, primary_key=True)
    agent_id = Column(String, nullable=False)
    recipient_type = Column(String, nullable=False)  # bodega | ventas | despacho | clientes | kadi | admin
    recipient_contact = Column(String, nullable=False)  # email or phone
    channel = Column(String, nullable=False)  # email | whatsapp
    content = Column(Text, nullable=False)
    requires_approval = Column(Boolean, default=False)
    approval_status = Column(SAEnum(ApprovalStatus), default=ApprovalStatus.pending)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    sent_at = Column(DateTime, nullable=True)
    error = Column(Text, nullable=True)
