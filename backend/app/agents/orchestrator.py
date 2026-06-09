"""
Orquestador Central — único punto de entrada para email y WhatsApp.
Clasifica mensajes entrantes por actor, tipo y urgencia, luego delega
al agente especializado correspondiente.
"""
from .base import BaseAgent, QueueEntry


ACTOR_MAP = {
    "bodega": "bodega",
    "ventas": "ventas",
    "comercial": "ventas",
    "despacho": "despacho",
    "cliente": "clientes",
    "kadi": "kadi",
    "produccion": "kadi",
    "admin": "admin",
    "administracion": "admin",
}


class OrchestratorAgent(BaseAgent):
    agent_id = "orchestrator"

    async def process(self, incoming: dict) -> list[QueueEntry]:
        """
        incoming: {
          "source": "email" | "whatsapp",
          "from": str,
          "subject": str | None,
          "body": str,
          "attachments": list[str],
        }
        Returns queue entries to route to the appropriate specialized agent.
        """
        actor = self._classify_actor(incoming)
        urgency = self._classify_urgency(incoming)

        # Delegation is handled by routing to the correct agent handler.
        # The orchestrator itself does not send messages — it returns a routing
        # directive that the router service will hand to the correct agent.
        return [
            self.build_entry(
                recipient_type=actor,
                recipient_contact="internal",
                channel="internal",
                content=incoming["body"],
                requires_approval=False,
            )
        ]

    def _classify_actor(self, incoming: dict) -> str:
        sender = incoming.get("from", "").lower()
        body = incoming.get("body", "").lower()
        subject = (incoming.get("subject") or "").lower()
        text = f"{sender} {subject} {body}"
        for keyword, actor in ACTOR_MAP.items():
            if keyword in text:
                return actor
        return "unknown"

    def _classify_urgency(self, incoming: dict) -> str:
        urgent_keywords = ["urgente", "faltante", "discrepancia", "retraso", "crítico", "problema"]
        text = f"{incoming.get('subject', '')} {incoming.get('body', '')}".lower()
        return "high" if any(k in text for k in urgent_keywords) else "normal"
