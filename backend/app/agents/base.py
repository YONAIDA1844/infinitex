from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional
import uuid


@dataclass
class QueueEntry:
    agent_id: str
    recipient_type: str
    recipient_contact: str
    channel: str
    content: str
    requires_approval: bool
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class BaseAgent(ABC):
    """Common base for all InfiniteX agents."""

    agent_id: str
    requires_approval: bool = False

    def build_entry(
        self,
        recipient_type: str,
        recipient_contact: str,
        channel: str,
        content: str,
        requires_approval: Optional[bool] = None,
    ) -> QueueEntry:
        """Create a queue entry. Content must be in Spanish."""
        return QueueEntry(
            agent_id=self.agent_id,
            recipient_type=recipient_type,
            recipient_contact=recipient_contact,
            channel=channel,
            content=content,
            requires_approval=requires_approval if requires_approval is not None else self.requires_approval,
        )

    @abstractmethod
    async def process(self, incoming: dict) -> list[QueueEntry]:
        """Process an incoming event and return queue entries to be persisted and sent."""
        ...
