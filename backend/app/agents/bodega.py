"""Agente Bodega — coordinación operativa bidireccional con Bodega Anker."""
from .base import BaseAgent, QueueEntry


class BodegaAgent(BaseAgent):
    agent_id = "bodega"
    requires_approval = False

    async def process(self, incoming: dict) -> list[QueueEntry]:
        event_type = incoming.get("event_type")

        if event_type == "reception_confirmed":
            return [self._confirmation(incoming)]
        elif event_type == "shortage_detected":
            return [self._shortage_alert(incoming)]
        elif event_type == "dispatch_imminent":
            return [self._dispatch_notice(incoming)]
        return []

    def _confirmation(self, data: dict) -> QueueEntry:
        content = (
            f"Confirmación de recepción de mercadería — Pedido #{data.get('order_id')}\n"
            f"Peso total: {data.get('weight_kg')} kg | Volumen: {data.get('cbm')} CBM\n"
            f"Estado: Recibido en bodega ✅"
        )
        return self.build_entry("bodega", data["contact"], data["channel"], content, requires_approval=False)

    def _shortage_alert(self, data: dict) -> QueueEntry:
        content = (
            f"⚠️ ALERTA DE FALTANTE — Pedido #{data.get('order_id')}\n"
            f"Ítem(s) faltante(s): {data.get('missing_items')}\n"
            f"Requiere revisión inmediata del Supervisor."
        )
        # Discrepancies always need Supervisor approval
        return self.build_entry("bodega", data["contact"], data["channel"], content, requires_approval=True)

    def _dispatch_notice(self, data: dict) -> QueueEntry:
        content = (
            f"Notificación de despacho inminente — Pedido #{data.get('order_id')}\n"
            f"Fecha estimada de retiro: {data.get('pickup_date')}"
        )
        return self.build_entry("bodega", data["contact"], data["channel"], content, requires_approval=False)
