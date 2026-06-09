"""
Agente Clientes — TODA comunicación requiere aprobación del Supervisor.
Notifica confirmación de despacho y entrega documentación al cliente final.
"""
from .base import BaseAgent, QueueEntry


class ClientesAgent(BaseAgent):
    agent_id = "clientes"
    requires_approval = True  # INVARIANT: every message needs Supervisor approval

    async def process(self, incoming: dict) -> list[QueueEntry]:
        dispatched = incoming.get("dispatched", False)
        if dispatched:
            return [self._dispatch_confirmed(incoming)]
        return [self._dispatch_delayed(incoming)]

    def _dispatch_confirmed(self, data: dict) -> QueueEntry:
        content = (
            f"Estimado cliente, le confirmamos que su pedido #{data.get('order_id')} "
            f"fue despachado el {data.get('dispatch_date')}.\n"
            f"Documentación adjunta: guía de despacho, factura.\n"
            f"¡Gracias por su preferencia!"
        )
        # requires_approval=True is enforced by class default
        return self.build_entry("clientes", data["contact"], data["channel"], content)

    def _dispatch_delayed(self, data: dict) -> QueueEntry:
        content = (
            f"Estimado cliente, le informamos que su pedido #{data.get('order_id')} "
            f"presenta un retraso. Motivo: {data.get('reason')}.\n"
            f"Nueva fecha estimada de despacho: {data.get('new_date')}.\n"
            f"Lamentamos los inconvenientes causados."
        )
        return self.build_entry("clientes", data["contact"], data["channel"], content)
