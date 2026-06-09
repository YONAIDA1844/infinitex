"""Agente Ventas — reportes de estado de pedidos al Área Comercial."""
from .base import BaseAgent, QueueEntry


class VentasAgent(BaseAgent):
    agent_id = "ventas"
    requires_approval = False

    async def process(self, incoming: dict) -> list[QueueEntry]:
        event_type = incoming.get("event_type")
        requires_approval = event_type == "delay_alert"
        content = self._build_message(incoming, event_type)
        return [self.build_entry("ventas", incoming["contact"], incoming["channel"], content, requires_approval)]

    def _build_message(self, data: dict, event_type: str | None) -> str:
        if event_type == "status_update":
            return (
                f"Actualización de estado — Pedido #{data.get('order_id')}\n"
                f"Estado: {data.get('status')}\n"
                f"Fecha estimada de despacho: {data.get('estimated_date', 'Por confirmar')}"
            )
        elif event_type == "delay_alert":
            return (
                f"⚠️ ALERTA DE RETRASO — Pedido #{data.get('order_id')}\n"
                f"El despacho presenta retraso. Motivo: {data.get('reason')}\n"
                f"Nueva fecha estimada: {data.get('new_date')}\n"
                f"Este mensaje requiere aprobación del Supervisor."
            )
        elif event_type == "ready_to_dispatch":
            return (
                f"Pedido listo para despacho ✅ — #{data.get('order_id')}\n"
                f"El pedido está listo para ser retirado por el agente de despacho."
            )
        return data.get("body", "")
