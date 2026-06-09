"""
Agente Administración — gestión financiera y cierre de importaciones.
Disparadores clave: recordatorios de pago, cierres, reclamos.
"""
from .base import BaseAgent, QueueEntry


class AdminAgent(BaseAgent):
    agent_id = "admin"
    requires_approval = False

    async def process(self, incoming: dict) -> list[QueueEntry]:
        event_type = incoming.get("event_type")

        if event_type == "quote_approved":
            return [self._quote_confirmed(incoming)]
        elif event_type == "payment_reminder":
            return [self._payment_reminder(incoming)]
        elif event_type == "import_closed":
            return [self._closure_summary(incoming)]
        elif event_type == "claim":
            return [self._claim(incoming)]
        return []

    def _quote_confirmed(self, data: dict) -> QueueEntry:
        content = (
            f"Cotización aprobada registrada — #{data.get('quote_id')}\n"
            f"Monto: {data.get('amount')}\n"
            f"Proveedor: {data.get('supplier')}\n"
            f"Importación: {data.get('import_code')}"
        )
        return self.build_entry("admin", data["contact"], data["channel"], content, requires_approval=False)

    def _payment_reminder(self, data: dict) -> QueueEntry:
        days = data.get("days_until_due")
        content = (
            f"Recordatorio de pago — vence en {days} días\n"
            f"Agente: {data.get('agent_name')}\n"
            f"Monto: {data.get('amount')}\n"
            f"Créditos vigentes: {data.get('credits', 'ninguno')}\n\n"
            f"Este pago requiere aprobación del Supervisor antes de procesarse."
        )
        # reminder is automatic, but the actual disbursement requires Supervisor approval
        return self.build_entry("admin", data["contact"], data["channel"], content, requires_approval=False)

    def _closure_summary(self, data: dict) -> QueueEntry:
        content = (
            f"Resumen de cierre de importación — {data.get('import_code')}\n\n"
            f"Estado de carga: {data.get('load_status', 'Completa')}\n"
            f"Puntos críticos: {data.get('critical_points', 'Ninguno')}\n"
            f"Reclamos activos: {data.get('active_claims', 'Ninguno')}"
        )
        return self.build_entry("admin", data["contact"], data["channel"], content, requires_approval=False)

    def _claim(self, data: dict) -> QueueEntry:
        claim_types = {
            "shortage": "Faltante de mercancía",
            "surplus": "Sobrante de mercancía",
            "mixed": "Ítems mezclados",
            "misclassified": "Mala clasificación de carga",
            "extra_costs": "Gastos extras por mal manejo en contenedores",
        }
        claim_label = claim_types.get(data.get("claim_type", ""), "Reclamo")
        content = (
            f"RECLAMO FORMAL — {claim_label}\n"
            f"Importación: {data.get('import_code')}\n"
            f"Detalle: {data.get('description')}\n"
            f"Monto estimado: {data.get('estimated_amount', 'Por determinar')}\n\n"
            f"Este reclamo requiere aprobación del Supervisor antes de enviarse al proveedor/agente."
        )
        return self.build_entry("admin", data["contact"], data["channel"], content, requires_approval=True)
