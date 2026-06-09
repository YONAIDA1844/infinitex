"""Agente Despacho — notificaciones de pedidos listos. Siempre automático."""
from .base import BaseAgent, QueueEntry


class DespachoAgent(BaseAgent):
    agent_id = "despacho"
    requires_approval = False  # dispatch notifications are always automatic

    async def process(self, incoming: dict) -> list[QueueEntry]:
        content = (
            f"Pedidos listos para retiro y despacho:\n\n"
            f"Pedido #{incoming.get('order_id')}\n"
            f"Peso: {incoming.get('weight_kg')} kg | Volumen: {incoming.get('cbm')} CBM\n"
            f"Pallets: {incoming.get('pallets')}\n"
            f"Packing List adjunto.\n"
        )
        if incoming.get("special_instructions"):
            content += f"\nInstrucciones especiales: {incoming['special_instructions']}"

        return [self.build_entry("despacho", incoming["contact"], incoming["channel"], content)]
