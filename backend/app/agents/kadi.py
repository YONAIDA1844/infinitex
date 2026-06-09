"""
Agente Kadi — trazabilidad de importaciones para Producción Kadi Internacional.
Rastrea 8 estados del ciclo de importación. Cada reporte incluye tabla de fechas
y checklist documental.
"""
from .base import BaseAgent, QueueEntry
from enum import Enum


class ImportState(str, Enum):
    en_documentacion = "En documentación"
    en_cotizacion = "En cotización"
    con_agente = "Con asignación de agente"
    en_transito = "En tránsito"
    en_puerto_destino = "En puerto destino"
    en_bodega = "En bodega"
    en_descarga_anker = "En descarga en Anker"
    descargado = "Descargado"


VALID_PORTS = {"Manzanillo", "Cristóbal", "Rodman"}

DOC_FIELDS = [
    "bill_of_lading",
    "factura_comercial",
    "packing_list",
    "certificado_origen",
    "permiso_importacion",
    "poliza_seguro",
]

DOC_LABELS = {
    "bill_of_lading": "Bill of Lading (BL)",
    "factura_comercial": "Factura comercial",
    "packing_list": "Packing List",
    "certificado_origen": "Certificado de origen",
    "permiso_importacion": "Permiso de importación",
    "poliza_seguro": "Póliza de seguro",
}


class KadiAgent(BaseAgent):
    agent_id = "kadi"
    requires_approval = False

    async def process(self, incoming: dict) -> list[QueueEntry]:
        state = incoming.get("state")
        docs = incoming.get("docs", {})
        missing = [DOC_LABELS[f] for f in DOC_FIELDS if not docs.get(f)]

        requires_approval = bool(missing) or state in (
            ImportState.en_puerto_destino,
            ImportState.en_descarga_anker,
        )

        content = self._build_report(incoming, missing)
        return [self.build_entry("kadi", incoming["contact"], incoming["channel"], content, requires_approval)]

    def _build_report(self, data: dict, missing: list[str]) -> str:
        port = data.get("port", "—")
        assert port in VALID_PORTS or port == "—", f"Puerto inválido: {port}"

        doc_status = "Documentación COMPLETA ✅" if not missing else (
            f"Documentación INCOMPLETA ⚠️ — Pendiente: {', '.join(missing)}"
        )

        checklist = "\n".join(
            f"  {'[x]' if not (DOC_LABELS[f] in missing) else '[ ]'} {DOC_LABELS[f]}"
            for f in DOC_FIELDS
        )

        return (
            f"ACTUALIZACIÓN DE IMPORTACIÓN — {data.get('import_code')}\n\n"
            f"| Importación | Puerto Destino | Fecha Salida Buque | Fecha Llegada Panamá | Estado Actual |\n"
            f"|-------------|----------------|-------------------|---------------------|---------------|\n"
            f"| {data.get('import_code')} | {port} | {data.get('departure_date', '—')} "
            f"| {data.get('arrival_date', '—')} | {data.get('state', '—')} |\n\n"
            f"Checklist Documental:\n{checklist}\n\n"
            f"{doc_status}"
        )
