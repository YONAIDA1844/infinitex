# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Full product spec and actor map: @docs/MASTERPLAN.md

## Commands

### Backend (Python / FastAPI)
```bash
cd backend
pip install -r requirements.txt           # install dependencies
uvicorn app.main:app --reload             # dev server on port 8000
pytest                                    # full test suite
pytest tests/agents/test_bodega.py -v    # single test file
flake8 app/ && black --check app/         # lint + format check
```

### Frontend Dashboard (React / TypeScript)
```bash
cd frontend
npm install
npm run dev                               # dev server on port 5173
npm test -- --testPathPattern=Landing    # single test file
npm run typecheck                         # tsc --noEmit
npm run lint
```

## Architecture

Hub-and-spoke multi-agent model. The Orquestador Central is the **only** entry point for all incoming email/WhatsApp — it classifies by actor, type, and urgency, then routes to the appropriate specialized agent. Specialized agents never read inbound channels directly.

```
SUPERVISOR (Dashboard)
       │
Orquestador Central         ← único canal de entrada (email + WhatsApp)
  ├── Agente Bodega         (bidireccional)
  ├── Agente Ventas         (salida)
  ├── Agente Despacho       (salida — siempre automático)
  ├── Agente Clientes       (salida — SIEMPRE requiere aprobación del Supervisor)
  ├── Agente Kadi           (salida — ciclo de 8 estados de importación)
  └── Agente Admin          (bidireccional — pagos, cierres, reclamos)
```

All agents subclass `BaseAgent` in `backend/app/agents/base.py`. Messages are written to the queue table **before** sending so the audit log is always complete even on delivery failure.

## IMPORTANT: Reglas No Negociables

- **TODO mensaje a partes externas debe estar en español** — aplica a emails, WhatsApp y documentos generados, sin importar el idioma de entrada
- **Agente Clientes DEBE encolar CADA mensaje para aprobación del Supervisor** — sin excepciones, incluyendo confirmaciones rutinarias de despacho
- **Pagos a agentes y reclamos formales DEBEN tener aprobación del Supervisor** antes de enviar
- **Las credenciales de API DEBEN estar en variables de entorno** — nunca hardcodeadas ni commiteadas

## Required Environment Variables

```bash
# backend/.env
ANTHROPIC_API_KEY=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
WHATSAPP_FROM_NUMBER=
DATABASE_URL=sqlite:///./infinitex.db   # postgres:// en producción
APPROVAL_REMINDER_DAYS=3,7,15           # anticipación para recordatorios de pago
```

## Code Style

### Python
- Async/await para todo I/O (email, WhatsApp, base de datos) — no se aceptan llamadas síncronas en métodos de agentes
- Type hints requeridos en todas las firmas de funciones
- Entradas de cola deben llevar: `agent_id`, `recipient_type`, `content`, `requires_approval: bool`, `created_at`

### React / TypeScript
- TypeScript estricto — no se permite `any`
- Tailwind CSS para todo el styling
- Datos en vivo del dashboard vía WebSocket — no usar polling

## Agente Kadi — State Machine

Exactamente 8 estados en orden (no omitir ni agregar):
`en_documentacion → en_cotizacion → con_agente → en_transito → en_puerto_destino → en_bodega → en_descarga_anker → descargado`

Cada reporte a Kadi debe incluir:
1. Tabla de fechas: código importación | puerto destino | salida buque | llegada Panamá | estado actual
2. Checklist documental (BL, factura comercial, Packing List, certificado origen, permiso importación, póliza seguro)
3. Línea de estado: `Documentación COMPLETA ✅` o `Documentación INCOMPLETA ⚠️ — Pendiente: [items]`

Puertos válidos: Manzanillo, Cristóbal, Rodman.

## Agente Admin — Disparadores Clave

- Recordatorios de pago se envían automáticamente en cada umbral de `APPROVAL_REMINDER_DAYS` — el desembolso real siempre requiere aprobación del Supervisor
- El resumen de cierre se genera automáticamente cuando una importación llega a estado `descargado`
- Los reclamos (faltantes, sobrantes, ítems mezclados, gastos extras de contenedor) deben documentarse internamente antes de cualquier comunicación saliente — siempre requieren aprobación del Supervisor

## Workflow

### Ramas — SOLO existen dos, nunca crear otras sin instrucción explícita

| Rama | Propósito | Aliases reconocidos |
|------|-----------|---------------------|
| `main` | **Producción** — lo que los usuarios ven online | "producción", "prod", "main", "online", "la web", "publicar", "subir a producción", "que los usuarios van a ver" |
| `staging` | **Desarrollo** — donde se prueban los cambios | "desarrollo", "development", "dev", "staging", "ambiente de prueba", "entorno de pruebas" |

**Reglas por defecto:**
- Todos los commits van en `staging`.
- Solo se mergea `staging → main` cuando algo está listo para publicar.
- No crear ninguna rama nueva a menos que el Supervisor pida explícitamente una rama para una funcionalidad concreta — en ese caso crearla a partir de `staging`.

### Contexto compactado
Al compactar contexto, preservar siempre: lista de archivos modificados, agentes con items pendientes en la cola de aprobación, y estados activos de seguimiento de importaciones.
