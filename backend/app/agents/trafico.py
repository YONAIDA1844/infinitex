"""
Agente Tráfico — supervisión del ciclo completo de carga internacional.

Fuentes de datos:
  - Monday.com  : Tabla "Tráfico 2026"
  - Email       : logistica@sicobenediciones.com (Google Workspace)

Destinatarios fijos:
  - Producción : Daniel Benarroch, Paulet, Ruth — WhatsApp + Email
  - Comercial  : Orlando — WhatsApp + Email
  - Admin      : Marlenis, Stephannie — Solo Email

Los contactos reales (email/whatsapp) se pasan en el evento como listas de dicts;
esta clase solo define la lógica de enrutamiento y los mensajes.
"""
import asyncio
import logging
from enum import Enum
from .base import BaseAgent, QueueEntry
from app.integrations.gmail_client import send_email

logger = logging.getLogger(__name__)


class CargoState(str, Enum):
    en_puerto_origen  = "En puerto de origen"
    en_transito       = "En tránsito"
    asignado_operador = "Asignado operador"
    arribo_puerto     = "Arribo a puerto"
    en_aduana_normal  = "En aduana"
    en_aduana_critico = "En aduana — CRÍTICO"
    en_bodega_anker   = "En bodega Anker"
    disponible        = "Disponible"


class BodegaSubEstado(str, Enum):
    descarga           = "Descarga"
    segregacion_conteo = "Segregación y conteo"
    ubicacion_pallet   = "Ubicación en pallet"
    contada_cierre     = "Contada y cierre"


class TransitoVariante(str, Enum):
    normal         = "normal"
    retraso        = "retraso"
    doc_incompleta = "doc_incompleta"


class AduanaCriticoTipo(str, Enum):
    retenida        = "Carga retenida"
    docs_rechazados = "Documentos rechazados"
    inspeccion      = "Inspección en curso"


# Canales por grupo de destinatario (regla fija del spec)
_PROD_CH:  tuple[str, ...] = ("email", "whatsapp")
_COM_CH:   tuple[str, ...] = ("email", "whatsapp")
_ADMIN_CH: tuple[str, ...] = ("email",)          # Admin: solo email


class TraficoAgent(BaseAgent):
    """
    Procesa cambios de estado de cargas desde Monday.com y genera
    notificaciones a los grupos correspondientes.

    Estructura esperada del dict `incoming`:
      cargo_name        : str
      estado            : CargoState
      etd               : str  (dd/mm/aaaa)
      eta               : str
      produccion        : list[dict]  [{nombre, email, whatsapp}]
      comercial         : list[dict]
      admin             : list[dict]
      --- campos por estado ---
      variante          : TransitoVariante           (en_transito)
      razon_retraso     : str                        (en_transito retraso)
      nueva_eta         : str                        (en_transito retraso)
      docs_faltantes    : list[str]                  (en_transito doc_incompleta)
      proveedor         : dict {nombre, email, contacto, pais}
      operador          : dict {nombre, pais, contacto, email, whatsapp}
      puerto_destino    : str                        (arribo_puerto)
      fecha_arribo      : str                        (arribo_puerto)
      tipo_critico      : AduanaCriticoTipo          (en_aduana_critico)
      detalle_critico   : str                        (en_aduana_critico)
      bodega_sub_estado : BodegaSubEstado            (en_bodega_anker)
      fecha_disponible  : str                        (disponible)
    """
    agent_id = "trafico"
    requires_approval = False

    async def process(self, incoming: dict) -> list[QueueEntry]:
        estado = incoming.get("estado")
        entries: list[QueueEntry] = []

        if estado == CargoState.en_puerto_origen:
            entries.extend(self._to_produccion(incoming, self._msg_puerto_origen(incoming)))

        elif estado == CargoState.en_transito:
            variante = incoming.get("variante", TransitoVariante.normal)
            entries.extend(self._to_produccion(incoming, self._msg_transito(incoming, variante)))
            if variante == TransitoVariante.doc_incompleta:
                entries.append(self._correo_fabrica_docs(incoming))

        elif estado == CargoState.asignado_operador:
            entries.extend(self._to_produccion(incoming, self._msg_asignado_operador(incoming)))
            entries.append(self._intro_operador(incoming))

        elif estado == CargoState.arribo_puerto:
            entries.extend(self._to_produccion(incoming, self._msg_arribo_puerto(incoming)))

        elif estado == CargoState.en_aduana_normal:
            entries.extend(self._to_produccion(incoming, self._msg_aduana_normal(incoming)))

        elif estado == CargoState.en_aduana_critico:
            entries.extend(self._to_produccion(incoming, self._msg_aduana_critico(incoming)))
            entries.append(self._accion_operador_aduana(incoming))

        elif estado == CargoState.en_bodega_anker:
            msg = self._msg_bodega_anker(incoming)
            entries.extend(self._to_produccion(incoming, msg))
            entries.extend(self._to_comercial(incoming, msg))
            entries.extend(self._to_admin(incoming, msg))

        elif estado == CargoState.disponible:
            msg = self._msg_disponible(incoming)
            entries.extend(self._to_produccion(incoming, msg))
            entries.extend(self._to_comercial(incoming, msg))

        await self._dispatch_auto(
            entries,
            subject=f"🚢 {incoming.get('cargo_name', 'Carga')} | {incoming.get('estado', '')}",
        )
        return entries

    async def _dispatch_auto(self, entries: list[QueueEntry], subject: str) -> None:
        """Envía inmediatamente los emails que no requieren aprobación del Supervisor."""
        loop = asyncio.get_running_loop()
        for entry in entries:
            if entry.requires_approval or entry.channel != "email" or not entry.recipient_contact:
                continue
            try:
                await loop.run_in_executor(
                    None,
                    lambda e=entry: send_email(
                        to=e.recipient_contact,
                        subject=subject,
                        body_text=e.content,
                    ),
                )
                logger.info("[TraficoAgent] ✉️  %s → %s", subject, entry.recipient_contact)
            except Exception as exc:
                logger.error("[TraficoAgent] ❌ Error enviando a %s: %s", entry.recipient_contact, exc)

    # ── Routing helpers ───────────────────────────────────────────────────────

    def _to_produccion(self, data: dict, content: str) -> list[QueueEntry]:
        return self._fan_out(data.get("produccion", []), "produccion", content, _PROD_CH)

    def _to_comercial(self, data: dict, content: str) -> list[QueueEntry]:
        return self._fan_out(data.get("comercial", []), "comercial", content, _COM_CH)

    def _to_admin(self, data: dict, content: str) -> list[QueueEntry]:
        return self._fan_out(data.get("admin", []), "admin", content, _ADMIN_CH)

    def _fan_out(
        self,
        contacts: list[dict],
        recipient_type: str,
        content: str,
        channels: tuple[str, ...],
    ) -> list[QueueEntry]:
        entries: list[QueueEntry] = []
        for contact in contacts:
            for channel in channels:
                address = contact.get("email") if channel == "email" else contact.get("whatsapp")
                if address:
                    entries.append(
                        self.build_entry(
                            recipient_type=recipient_type,
                            recipient_contact=address,
                            channel=channel,
                            content=content,
                            requires_approval=False,
                        )
                    )
        return entries

    # ── Header compartido ─────────────────────────────────────────────────────

    @staticmethod
    def _header(data: dict) -> str:
        return (
            f"🚢 *{data.get('cargo_name', 'Carga sin nombre')}*\n"
            f"Estado : {data.get('estado', '—')}\n"
            f"ETD    : {data.get('etd', '—')} | ETA: {data.get('eta', '—')}\n\n"
        )

    # ── Mensajes automáticos ──────────────────────────────────────────────────

    def _msg_puerto_origen(self, data: dict) -> str:
        return (
            self._header(data) +
            "La carga se encuentra en puerto de origen, pendiente de embarque."
        )

    def _msg_transito(self, data: dict, variante: str) -> str:
        header = self._header(data)
        if variante == TransitoVariante.retraso:
            return (
                header +
                "⚠️ RETRASO EN TRÁNSITO\n"
                f"Motivo     : {data.get('razon_retraso', 'No especificado')}\n"
                f"Nueva ETA  : {data.get('nueva_eta', '—')}"
            )
        if variante == TransitoVariante.doc_incompleta:
            faltantes = ", ".join(data.get("docs_faltantes", []))
            return (
                header +
                "⚠️ DOCUMENTACIÓN INCOMPLETA EN TRÁNSITO\n"
                f"Pendiente  : {faltantes}\n"
                "Se ha generado solicitud formal a la fábrica para su envío urgente."
            )
        return header + "La carga está en tránsito marítimo. Sin novedades."

    def _msg_asignado_operador(self, data: dict) -> str:
        op = data.get("operador", {})
        return (
            self._header(data) +
            "Se ha asignado operador logístico para esta carga:\n"
            f"  Operador : {op.get('nombre', '—')}\n"
            f"  País     : {op.get('pais', '—')}\n"
            f"  Contacto : {op.get('contacto', '—')}"
        )

    def _msg_arribo_puerto(self, data: dict) -> str:
        return (
            self._header(data) +
            "La carga ha arribado al puerto de destino.\n"
            f"Puerto       : {data.get('puerto_destino', '—')}\n"
            f"Fecha arribo : {data.get('fecha_arribo', '—')}"
        )

    def _msg_aduana_normal(self, data: dict) -> str:
        return (
            self._header(data) +
            "La carga se encuentra en proceso de despacho aduanero. Sin inconvenientes."
        )

    def _msg_aduana_critico(self, data: dict) -> str:
        return (
            self._header(data) +
            "🚨 SITUACIÓN CRÍTICA EN ADUANA\n"
            f"Tipo    : {data.get('tipo_critico', '—')}\n"
            f"Detalle : {data.get('detalle_critico', '—')}\n"
            "Se está gestionando con el operador. Se notificará resolución."
        )

    def _msg_bodega_anker(self, data: dict) -> str:
        return (
            self._header(data) +
            "La carga se encuentra en Bodega Anker.\n"
            f"Sub-estado : {data.get('bodega_sub_estado', '—')}"
        )

    def _msg_disponible(self, data: dict) -> str:
        return (
            self._header(data) +
            "✅ CARGA DISPONIBLE\n"
            f"Fecha disponible : {data.get('fecha_disponible', '—')}"
        )

    # ── Entradas que requieren aprobación del Supervisor ─────────────────────

    def _correo_fabrica_docs(self, data: dict) -> QueueEntry:
        """
        Correo formal a fábrica solicitando documentos faltantes.
        Requiere aprobación del Supervisor antes de enviarse.
        incoming: docs_faltantes (list[str]), proveedor {nombre, email, contacto}, cargo_name, eta
        """
        proveedor = data.get("proveedor", {})
        faltantes_txt = "\n".join(f"  • {doc}" for doc in data.get("docs_faltantes", []))
        content = (
            f"Estimado equipo de {proveedor.get('nombre', 'Proveedor')},\n\n"
            f"Por medio del presente nos dirigimos a ustedes en relación al embarque "
            f"*{data.get('cargo_name')}*, actualmente en tránsito con ETA {data.get('eta', '—')}.\n\n"
            "Les solicitamos con carácter urgente el envío de los siguientes documentos pendientes:\n"
            f"{faltantes_txt}\n\n"
            "La documentación completa es indispensable para agilizar el proceso de despacho "
            "aduanero a la llegada del embarque. Agradecemos su gestión a la brevedad.\n\n"
            "Quedo a su disposición para cualquier consulta.\n\n"
            "Saludos cordiales,\n"
            "Departamento de Logística — Sicoben Ediciones"
        )
        return self.build_entry(
            recipient_type="proveedor",
            recipient_contact=proveedor.get("email", ""),
            channel="email",
            content=content,
            requires_approval=True,
        )

    def _intro_operador(self, data: dict) -> QueueEntry:
        """
        Email de presentación operador ↔ proveedor al asignar operador.
        Requiere aprobación del Supervisor antes de enviarse.
        incoming: operador {nombre, pais, contacto, email}, proveedor {nombre, contacto}, cargo_name, etd, eta
        """
        op = data.get("operador", {})
        proveedor = data.get("proveedor", {})
        content = (
            f"Estimado {op.get('nombre', 'Operador')},\n\n"
            "Por medio del presente les presentamos al equipo de "
            f"{proveedor.get('nombre', 'nuestro proveedor')}, quienes estarán coordinando "
            f"el embarque *{data.get('cargo_name')}*.\n\n"
            "Datos del embarque:\n"
            f"  • ETD : {data.get('etd', '—')}\n"
            f"  • ETA : {data.get('eta', '—')}\n\n"
            f"Contacto del proveedor : {proveedor.get('contacto', '—')}\n\n"
            "Quedamos a su disposición para coordinar los detalles operativos.\n\n"
            "Saludos cordiales,\n"
            "Departamento de Logística — Sicoben Ediciones"
        )
        return self.build_entry(
            recipient_type="operador",
            recipient_contact=op.get("email", ""),
            channel="email",
            content=content,
            requires_approval=True,
        )

    def _accion_operador_aduana(self, data: dict) -> QueueEntry:
        """
        Comunicación urgente con operador ante situación crítica en aduana.
        Requiere aprobación del Supervisor antes de enviarse.
        incoming: operador {nombre, email, whatsapp}, tipo_critico, detalle_critico, cargo_name
        """
        op = data.get("operador", {})
        channel = "email" if op.get("email") else "whatsapp"
        contact = op.get("email") or op.get("whatsapp", "")
        content = (
            f"Estimado {op.get('nombre', 'Operador')},\n\n"
            f"Les contactamos de manera urgente en relación al embarque *{data.get('cargo_name')}*.\n\n"
            f"Situación : {data.get('tipo_critico', '—')}\n"
            f"Detalle   : {data.get('detalle_critico', '—')}\n\n"
            "Solicitamos su intervención inmediata para resolver esta situación y evitar "
            "demoras adicionales. Por favor confirmen las acciones que están tomando a la brevedad.\n\n"
            "Saludos cordiales,\n"
            "Departamento de Logística — Sicoben Ediciones"
        )
        return self.build_entry(
            recipient_type="operador",
            recipient_contact=contact,
            channel=channel,
            content=content,
            requires_approval=True,
        )

    # ── Reporte diario (programado 8:30 AM lun-vie) ───────────────────────────

    async def daily_report(self, cargas_activas: list[dict]) -> list[QueueEntry]:
        """
        Genera un reporte consolidado de todas las cargas activas.
        Llamado por el scheduler a las 8:30 AM de lunes a viernes.
        cargas_activas: lista de dicts con la misma estructura que process().
        """
        if not cargas_activas:
            return []

        lines = ["📊 *REPORTE DIARIO DE TRÁFICO*\n"]
        for carga in cargas_activas:
            lines.append(
                f"• {carga.get('cargo_name')} — {carga.get('estado')}\n"
                f"  ETD: {carga.get('etd', '—')} | ETA: {carga.get('eta', '—')}"
            )
        content = "\n".join(lines)

        # Deduplica: un solo mensaje por dirección aunque haya varias cargas
        seen: set[str] = set()
        entries: list[QueueEntry] = []

        for carga in cargas_activas:
            for group, channels in (
                (carga.get("produccion", []), _PROD_CH),
                (carga.get("comercial",  []), _COM_CH),
            ):
                for contact in group:
                    for channel in channels:
                        address = contact.get("email") if channel == "email" else contact.get("whatsapp")
                        key = f"{address}:{channel}"
                        if address and key not in seen:
                            seen.add(key)
                            entries.append(
                                self.build_entry(
                                    recipient_type=contact.get("tipo", "produccion"),
                                    recipient_contact=address,
                                    channel=channel,
                                    content=content,
                                    requires_approval=False,
                                )
                            )
        return entries
