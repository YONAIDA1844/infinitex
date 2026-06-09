# InfiniteX — Sistema de Agentes de Supervisión Logística
### Product Requirements Document (PRD)

**Versión:** 2.0 | **Fecha:** Junio 2026 | **Estado:** Draft  
**Plataforma de desarrollo:** Claude Code

> *InfiniteX es una red de inteligencia operativa compuesta por 7 agentes especializados, orquestados por un hub central, que supervisan y comunican en tiempo real todas las operaciones de logística, importaciones y administración — reportando siempre al Supervisor con control total.*

---

## 1. Resumen Ejecutivo

InfiniteX es un sistema multiagente de supervisión operacional donde Logística actúa como hub central. Los 7 agentes coordinan comunicaciones entre Bodega Anker, Área Comercial, Agente de Despacho, Clientes, Producción Kadi Internacional y Administración. El Supervisor mantiene control total: aprueba mensajes críticos y visualiza el estado consolidado de todas las operaciones en un dashboard en tiempo real.

---

## 2. Objetivos del Producto

- Centralizar toda la comunicación operativa de logística en un sistema inteligente y automatizado.
- Eliminar la coordinación manual entre los 6 actores externos del ecosistema.
- Garantizar visibilidad total al Supervisor con control sobre comunicaciones críticas.
- Reducir errores en el ciclo completo: importación → bodega → despacho → cliente → cierre administrativo.
- Generar trazabilidad documental y financiera de cada importación.

---

## 3. Mapa de Actores del Sistema

| Actor | Rol | Canal |
|-------|-----|-------|
| Supervisor (Usuario) | Control y aprobación total | Dashboard + Email + WhatsApp |
| Agente Orquestador | Hub central que coordina todos los agentes | — |
| Bodega Anker | Operativa de carga y almacenamiento | Email + WhatsApp |
| Área Comercial / Ventas | Recibe estatus de pedidos | Email + WhatsApp |
| Agente de Despacho | Retira y despacha pedidos | Email + WhatsApp |
| Clientes | Reciben confirmación y documentación | Email + WhatsApp |
| Producción Kadi Internacional | Recibe trazabilidad de importaciones | Email + Grupos WhatsApp |
| Administración | Gestión financiera y cierre de importaciones | Email + WhatsApp + Dashboard |

---

## 4. Los 7 Agentes de InfiniteX

| # | Nombre del Agente | Área | Tipo |
|---|-------------------|------|------|
| 1 | Orquestador Central | Todos | Hub / Router |
| 2 | Agente Bodega | Logística ↔ Bodega Anker | Bidireccional |
| 3 | Agente Ventas | Logística → Ventas | Salida |
| 4 | Agente Despacho | Logística → Agente de Despacho | Salida |
| 5 | Agente Clientes | Logística → Clientes | Salida |
| 6 | Agente Importaciones Kadi | Logística → Producción Kadi | Salida |
| 7 | Agente Administración | Logística → Administración | Bidireccional |

---

## 5. Flujos de Comunicación

### Flujo 1 — Logística ↔ Bodega Anker
**Agente:** Agente Bodega | **Dirección:** Bidireccional  
**Propósito:** Coordinación operativa completa de la carga

Información comunicada:
- Confirmación de recepción de mercadería
- Alertas de stock bajo o faltantes
- Notificaciones de despacho inminente
- Información completa de la carga: Packing List (PL), peso total, volumen CBM, medidas de pallets
- Cualquier dato operativo relevante

**Aprobación:**
- Automático → confirmaciones y actualizaciones de estado
- Requiere Supervisor → alertas de faltantes o discrepancias

---

### Flujo 2 — Logística → Ventas
**Agente:** Agente Ventas | **Dirección:** Unidireccional  
**Propósito:** Mantener al equipo comercial informado del estado de pedidos

Información comunicada:
- Estado actual de cada pedido (en preparación / listo / despachado / con retraso)
- Alertas de retrasos que afecten fechas de entrega
- Confirmación de pedidos listos para despacho

**Aprobación:**
- Automático → reportes de estado rutinarios
- Requiere Supervisor → alertas de retraso que afecten compromisos comerciales

---

### Flujo 3 — Logística → Agente de Despacho
**Agente:** Agente Despacho | **Dirección:** Unidireccional  
**Propósito:** Indicar que los pedidos están listos para retiro y despacho

Información comunicada:
- Listado de pedidos listos para despacho
- Información operativa de la carga (pesos, medidas, pallets, CBM)
- Packing List adjunto
- Instrucciones especiales si aplica

**Aprobación:** Automático (siempre)

---

### Flujo 4 — Logística → Clientes
**Agente:** Agente Clientes | **Dirección:** Unidireccional  
**Propósito:** Notificar resultado del despacho y entregar documentación

Información comunicada:
- Confirmación de despacho: SÍ / NO
- Si SÍ → documentación adjunta (guía de despacho, factura, otros)
- Si NO → motivo y nueva fecha estimada

**Aprobación:** Siempre requiere Supervisor (comunicación directa con cliente final)

---

### Flujo 5 — Logística → Producción Kadi Internacional
**Agente:** Agente Importaciones Kadi | **Dirección:** Unidireccional  
**Propósito:** Trazabilidad completa del ciclo de importación para el área de producción

**Estados del ciclo (en orden):**
1. En documentación
2. En cotización
3. Con asignación de agente
4. En tránsito
5. En puerto destino
6. En bodega
7. En descarga en Anker
8. Descargado

**Tabla automatizada de fechas** (enviada con cada actualización):

| Importación | Puerto Destino | Fecha Salida Buque | Fecha Llegada Panamá | Estado Actual |
|-------------|----------------|-------------------|---------------------|---------------|
| [Código] | Manzanillo / Cristóbal / Rodman | DD/MM/AAAA | DD/MM/AAAA | [Estado] |

**Checklist de documentación** (incluido en cada reporte):
- [ ] Bill of Lading (BL)
- [ ] Factura comercial
- [ ] Packing List
- [ ] Certificado de origen
- [ ] Permiso de importación
- [ ] Póliza de seguro
- [ ] Otros documentos requeridos

El agente indica claramente: `Documentación COMPLETA ✅` / `Documentación INCOMPLETA ⚠️ — Pendiente: [lista de faltantes]`

**Destinos de envío:** Correos del área de producción + Grupos de WhatsApp configurados

**Aprobación:**
- Automático → actualizaciones de estado y tablas de fechas
- Requiere Supervisor → alertas de documentación incompleta o retrasos críticos

---

### Flujo 6 — Logística → Administración
**Agente:** Agente Administración | **Dirección:** Bidireccional  
**Propósito:** Gestión financiera y cierre formal de importaciones

**Funciones del agente:**

**a) Cotizaciones aprobadas**
- Lee cotizaciones aprobadas de emails/WhatsApp entrantes
- Envía confirmación formal a administración
- Registra en dashboard para seguimiento

**b) Recordatorios de pago a agentes en destino**
- Monitorea fechas de vencimiento de pagos a agentes
- Envía recordatorio automático con X días de anticipación (configurable)
- Incluye detalle de créditos vigentes
- Notifica al Supervisor para aprobación antes de comprometer pagos

**c) Cierre de importaciones**
Al completarse la descarga, genera resumen de cierre con:
- Confirmación de carga completa o con diferencias
- Puntos críticos detectados
- Estado de reclamos activos

**d) Gestión de reclamos y descuentos**
Detecta y documenta incidencias:
- Faltantes de mercancía
- Sobrantes de mercancía
- Ítems mezclados
- Mala clasificación de carga
- Gastos extras por mal manejo en contenedores

Genera comunicación formal de reclamo y/o solicitud de descuento al proveedor/agente. Siempre requiere aprobación del Supervisor antes de enviar.

**Canales:** Email + WhatsApp + Recordatorio en Dashboard

**Aprobación:**
- Automático → recordatorios de fechas, actualizaciones de estado de cierre
- Requiere Supervisor → pagos a agentes, reclamos formales, solicitudes de descuento

---

## 6. Sistema de Aprobaciones

### Mensajes Automáticos (sin aprobación del Supervisor)
- Confirmaciones de recepción de mercadería a Bodega
- Reportes de estado de pedidos a Ventas
- Notificaciones de pedidos listos al Agente de Despacho
- Actualizaciones de estado de importaciones a Producción Kadi
- Tablas de fechas de buque (salida y llegada)
- Recordatorios de pago con anticipación configurable
- Reportes diarios consolidados a todos los actores

### Mensajes que Requieren Aprobación del Supervisor
- Toda comunicación directa con Clientes (confirmación de despacho)
- Alertas de faltantes o discrepancias en Bodega
- Alertas de retrasos que afecten compromisos comerciales
- Alertas de documentación incompleta en importaciones Kadi
- Pagos a agentes en destino
- Reclamos formales y solicitudes de descuento a proveedores/agentes
- Cualquier mensaje de alto impacto financiero o comercial

### Flujo de Aprobación
1. El agente genera el mensaje y lo pone en cola de revisión
2. El Supervisor recibe notificación vía Dashboard + WhatsApp/Email
3. El Supervisor aprueba, edita o rechaza el mensaje
4. Si aprueba → envío inmediato
5. Si rechaza → el agente espera nueva instrucción

---

## 7. Dashboard de Supervisión

### Módulos del Dashboard

**Panel Principal**
- Estado en tiempo real de todos los pedidos activos
- Indicadores por flujo (Bodega / Ventas / Despacho / Clientes / Kadi / Admin)
- Cola de mensajes pendientes de aprobación
- Alertas activas por resolver

**Módulo Importaciones Kadi**
- Tabla de importaciones activas con estado actual
- Fechas de salida de buque y llegada a puertos (Manzanillo / Cristóbal / Rodman)
- Estado del checklist documental por importación

**Módulo Administración**
- Cotizaciones aprobadas pendientes de pago
- Calendario de vencimientos de pagos a agentes
- Créditos vigentes por agente
- Reclamos activos y su estado

**Reportes**
- Reporte diario automático a hora configurable
- Alertas inmediatas por evento crítico

---

## 8. Canales de Comunicación e Integraciones

| Canal | Uso |
|-------|-----|
| Email | Comunicaciones formales, adjuntos de documentos, reportes |
| WhatsApp Individual | Alertas, confirmaciones rápidas, notificaciones al Supervisor |
| Grupos de WhatsApp | Producción Kadi, equipos operativos |
| Dashboard | Supervisión en tiempo real, cola de aprobaciones, recordatorios Admin |

### Integraciones Requeridas
- Gmail API o SMTP para email
- WhatsApp Business API (Twilio o Meta Cloud API)
- Almacenamiento de documentos (PL, facturas, guías, BL)

---

## 9. Requisitos Funcionales

| ID | Requisito |
|----|-----------|
| RF-01 | El sistema debe leer emails y WhatsApp entrantes y extraer información de pedidos e importaciones automáticamente |
| RF-02 | El Agente Orquestador debe clasificar mensajes por tipo, urgencia y actor de origen |
| RF-03 | Los agentes deben enviar mensajes automáticamente para comunicaciones rutinarias |
| RF-04 | Los mensajes críticos deben encolarse y notificar al Supervisor para su aprobación |
| RF-05 | El Supervisor puede aprobar, editar o rechazar cualquier mensaje en cola |
| RF-06 | El sistema debe adjuntar documentación (PL, guías, facturas, BL) automáticamente |
| RF-07 | Todos los mensajes deben redactarse en español |
| RF-08 | El Agente Kadi debe rastrear 8 estados del ciclo de importación y comunicarlos a producción |
| RF-09 | El Agente Kadi debe generar tabla automatizada con fechas de buque y puertos de destino |
| RF-10 | El Agente Kadi debe incluir checklist de documentación con estado (completo/incompleto) en cada reporte |
| RF-11 | El Agente Admin debe monitorear y recordar fechas de pago a agentes en destino con créditos |
| RF-12 | El Agente Admin debe generar resúmenes de cierre de importación con puntos críticos |
| RF-13 | El Agente Admin debe documentar y gestionar reclamos (faltantes, sobrantes, ítems mezclados, gastos extras) |
| RF-14 | El sistema debe generar un reporte diario consolidado a hora configurable |
| RF-15 | El dashboard debe mostrar estado en tiempo real de todos los pedidos, importaciones y flujos |
| RF-16 | El historial completo de comunicaciones debe quedar registrado y consultable |

---

## 10. Requisitos No Funcionales

| ID | Requisito |
|----|-----------|
| RNF-01 | Los mensajes automáticos deben enviarse en menos de 2 minutos tras detectar el evento |
| RNF-02 | El dashboard debe actualizarse en tiempo real (máximo 30 segundos de latencia) |
| RNF-03 | El sistema debe mantener un log auditable de todas las comunicaciones |
| RNF-04 | Las credenciales y tokens de API deben almacenarse de forma segura (variables de entorno) |
| RNF-05 | El sistema debe manejar errores de entrega y reintentar el envío automáticamente |
| RNF-06 | Los recordatorios de pago deben dispararse con anticipación configurable (ej. 3, 7, 15 días antes) |

---

## 11. Fases de Desarrollo

### Fase 1 — MVP Core Logístico
- Agente Orquestador central
- Lectura de emails y WhatsApp entrantes
- Flujo 3: Notificación al Agente de Despacho
- Dashboard básico con lista de pedidos activos

### Fase 2 — Comunicación Operativa Completa
- Flujo 1: Agente Bodega Anker (bidireccional)
- Flujo 2: Agente Ventas (reportes de estado)
- Flujo 4: Agente Clientes (confirmación + documentación)
- Sistema de aprobaciones para el Supervisor

### Fase 3 — Importaciones Kadi
- Flujo 5: Agente Importaciones Kadi
- Rastreo de 8 estados del ciclo de importación
- Tabla automatizada de fechas de buque y puertos
- Checklist documental automático
- Envío a correos de producción y grupos de WhatsApp

### Fase 4 — Administración y Cierre Financiero
- Flujo 6: Agente Administración
- Gestión de cotizaciones aprobadas
- Recordatorios de pago con crédito
- Cierres de importación y resúmenes ejecutivos
- Gestión de reclamos y descuentos

### Fase 5 — Optimización y Dashboard Avanzado
- Dashboard completo con todos los módulos
- Alertas inteligentes por evento
- Reportes históricos y métricas de desempeño
- Mejoras en clasificación automática de mensajes

---

## 12. Stack Tecnológico

| Componente | Tecnología |
|-----------|-----------|
| Agentes IA | Claude API (claude-sonnet-4) vía Claude Code |
| Backend | Python (FastAPI) |
| Email | Gmail API / SMTP |
| WhatsApp | Twilio WhatsApp API o Meta Cloud API |
| Dashboard | React + TypeScript |
| Base de datos | SQLite (MVP) → PostgreSQL (producción) |
| Documentos | Google Drive API o almacenamiento local |
| Scheduler | APScheduler (reportes diarios y recordatorios) |

---

## 13. Criterios de Éxito

- El 100% de las comunicaciones rutinarias se envían sin intervención manual
- Los mensajes críticos llegan al Supervisor en menos de 1 minuto para su revisión
- El Supervisor visualiza el estado de todos los pedidos e importaciones sin consultar otras fuentes
- Cero omisiones de comunicación en el ciclo completo de importación
- Los cierres de importación se generan automáticamente con resumen de puntos críticos
- Los reclamos quedan documentados y gestionados desde el sistema

---

## 14. Diagrama del Sistema

```
                       ┌─────────────────┐
                       │   SUPERVISOR    │
                       │   (Dashboard)   │
                       └────────┬────────┘
                                │
                       ┌────────▼────────┐
                       │  ORQUESTADOR    │
                       │    CENTRAL      │
                       └──┬──┬──┬──┬──┬─┘
                          │  │  │  │  │  │
             ┌────────────┘  │  │  │  │  └──────────────┐
             │         ┌─────┘  │  │  └──────┐          │
             ▼         ▼        ▼  ▼         ▼          ▼
          Agente     Agente   Agente Agente  Agente    Agente
          Bodega     Ventas   Desp.  Cliente  Kadi      Admin
          Anker                              Intl.
```

**7 agentes. 6 actores externos. 1 Supervisor. Todo en español. Todo trazado.**
