# Agente Tráfico — Especificación Completa

**Versión:** 1.0 | **Fecha:** Junio 2026 | **Archivo:** `backend/app/agents/trafico.py`

---

## 1. Resumen

El Agente Tráfico supervisa el ciclo completo de cada carga de importación internacional: desde que sale del puerto de origen hasta que queda disponible en Bodega Anker. Lee el estado de las cargas desde **Monday.com** (Tabla "Tráfico 2026") y genera notificaciones automáticas o encoladas para aprobación del Supervisor, enviadas por **Gmail** y **WhatsApp**.

---

## 2. Fuentes de Datos

| Fuente | Detalle |
|--------|---------|
| **Monday.com** | Tabla "Tráfico 2026". Cada ítem es una carga activa. El agente se dispara cuando cambia el estado (`estado` column) de un ítem. |
| **Email entrante** | `logistica@sicobenediciones.com` (Google Workspace). Puede recibir actualizaciones de operadores y fábricas que se procesan como eventos. |

---

## 3. Destinatarios y Canales

| Grupo | Personas | Email | WhatsApp |
|-------|----------|-------|----------|
| **Producción** | Daniel Benarroch, Paulet, Ruth | ✅ | ✅ |
| **Comercial** | Orlando | ✅ | ✅ |
| **Admin** | Marlenis, Stephannie | ✅ | ❌ Solo email |

Los contactos reales (direcciones de email y números de WhatsApp) se almacenan como configuración y se pasan al agente en el evento de entrada. El agente no hardcodea contactos — solo define las reglas de enrutamiento por grupo.

---

## 4. Máquina de Estados

Exactamente 8 estados en orden de ciclo (no omitir ni agregar):

```
En puerto de origen
       ↓
En tránsito
       ↓
Asignado operador
       ↓
Arribo a puerto
       ↓
En aduana  (normal o crítico)
       ↓
En bodega Anker  (4 sub-estados)
       ↓
Disponible
```

### Sub-estados de Bodega Anker

| # | Sub-estado | Descripción |
|---|-----------|-------------|
| 1 | Descarga | La carga está siendo descargada del contenedor |
| 2 | Segregación y conteo | Se separa y cuenta la mercancía |
| 3 | Ubicación en pallet | Se palletiza y ubica en el espacio asignado |
| 4 | Contada y cierre | Inventario cerrado, carga lista para distribución |

### Variantes de "En tránsito"

| Variante | Condición | Requiere aprobación |
|----------|-----------|---------------------|
| `normal` | Sin novedades | No |
| `retraso` | ETA modificada | No |
| `doc_incompleta` | Documentos faltantes | Sí — correo a fábrica |

### Tipos de "En aduana crítico"

| Tipo | Descripción |
|------|-------------|
| `Carga retenida` | La aduana retuvo el contenedor |
| `Documentos rechazados` | Documentación rechazada por aduana |
| `Inspección en curso` | Inspección física ordenada |

---

## 5. Mensajes por Estado

Para cada estado se indica: a quién se envía, por qué canales, si es automático o requiere aprobación, y el contenido del mensaje.

Todos los mensajes incluyen un **header estándar**:
```
🚢 *[Nombre de la carga]*
Estado : [Estado actual]
ETD    : [dd/mm/aaaa] | ETA: [dd/mm/aaaa]
```

---

### 5.1 En puerto de origen

| Campo | Valor |
|-------|-------|
| **Destinatario** | Producción |
| **Canales** | Email + WhatsApp |
| **Aprobación** | Automático |

**Contenido adicional:**
> La carga se encuentra en puerto de origen, pendiente de embarque.

---

### 5.2 En tránsito

| Variante | Destinatario | Canales | Aprobación |
|----------|-------------|---------|------------|
| Normal | Producción | Email + WhatsApp | Automático |
| Retraso | Producción | Email + WhatsApp | Automático |
| Doc. incompleta | Producción | Email + WhatsApp | Automático |
| Doc. incompleta → correo a fábrica | Proveedor | Email | **Requiere Supervisor** |

**Contenido variante normal:**
> La carga está en tránsito marítimo. Sin novedades.

**Contenido variante retraso:**
> ⚠️ RETRASO EN TRÁNSITO  
> Motivo     : [razón]  
> Nueva ETA  : [dd/mm/aaaa]

**Contenido variante doc. incompleta (a Producción):**
> ⚠️ DOCUMENTACIÓN INCOMPLETA EN TRÁNSITO  
> Pendiente  : [lista de documentos]  
> Se ha generado solicitud formal a la fábrica para su envío urgente.

**Correo formal a fábrica (requiere aprobación del Supervisor):**
```
Estimado equipo de [Nombre Proveedor],

Por medio del presente nos dirigimos a ustedes en relación al embarque
*[nombre carga]*, actualmente en tránsito con ETA [fecha].

Les solicitamos con carácter urgente el envío de los siguientes
documentos pendientes:
  • [documento 1]
  • [documento 2]

La documentación completa es indispensable para agilizar el proceso de
despacho aduanero a la llegada del embarque. Agradecemos su gestión
a la brevedad.

Saludos cordiales,
Departamento de Logística — Sicoben Ediciones
```

---

### 5.3 Asignado operador

| Campo | Valor |
|-------|-------|
| **Destinatario principal** | Producción |
| **Canales principales** | Email + WhatsApp |
| **Aprobación principal** | Automático |
| **Email de presentación** | Operador ↔ Proveedor |
| **Aprobación presentación** | **Requiere Supervisor** |

**Contenido a Producción (automático):**
> Se ha asignado operador logístico para esta carga:  
>   Operador : [nombre]  
>   País     : [país]  
>   Contacto : [nombre contacto]

**Email de presentación operador/proveedor (requiere aprobación):**
```
Estimado [Nombre Operador],

Por medio del presente les presentamos al equipo de [Nombre Proveedor],
quienes estarán coordinando el embarque *[nombre carga]*.

Datos del embarque:
  • ETD : [fecha]
  • ETA : [fecha]

Contacto del proveedor : [nombre contacto]

Quedamos a su disposición para coordinar los detalles operativos.

Saludos cordiales,
Departamento de Logística — Sicoben Ediciones
```

---

### 5.4 Arribo a puerto

| Campo | Valor |
|-------|-------|
| **Destinatario** | Producción |
| **Canales** | Email + WhatsApp |
| **Aprobación** | Automático |

**Contenido adicional:**
> La carga ha arribado al puerto de destino.  
> Puerto       : [Manzanillo / Cristóbal / Rodman]  
> Fecha arribo : [dd/mm/aaaa]

---

### 5.5 En aduana — Normal

| Campo | Valor |
|-------|-------|
| **Destinatario** | Producción |
| **Canales** | Email + WhatsApp |
| **Aprobación** | Automático |

**Contenido adicional:**
> La carga se encuentra en proceso de despacho aduanero. Sin inconvenientes.

---

### 5.6 En aduana — CRÍTICO

| Campo | Valor |
|-------|-------|
| **Destinatario principal** | Producción |
| **Canales** | Email + WhatsApp |
| **Aprobación principal** | Automático |
| **Comunicación con operador** | Email o WhatsApp |
| **Aprobación operador** | **Requiere Supervisor** |

**Contenido a Producción (automático):**
> 🚨 SITUACIÓN CRÍTICA EN ADUANA  
> Tipo    : [tipo crítico]  
> Detalle : [descripción]  
> Se está gestionando con el operador. Se notificará resolución.

**Comunicación urgente con operador (requiere aprobación):**
```
Estimado [Nombre Operador],

Les contactamos de manera urgente en relación al embarque *[nombre carga]*.

Situación : [tipo crítico]
Detalle   : [descripción]

Solicitamos su intervención inmediata para resolver esta situación y
evitar demoras adicionales. Por favor confirmen las acciones que están
tomando a la brevedad.

Saludos cordiales,
Departamento de Logística — Sicoben Ediciones
```

---

### 5.7 En bodega Anker

| Campo | Valor |
|-------|-------|
| **Destinatarios** | Producción + Comercial + Admin |
| **Canales Producción** | Email + WhatsApp |
| **Canales Comercial** | Email + WhatsApp |
| **Canales Admin** | Solo Email |
| **Aprobación** | Automático (todos) |

**Contenido adicional:**
> La carga se encuentra en Bodega Anker.  
> Sub-estado : [Descarga / Segregación y conteo / Ubicación en pallet / Contada y cierre]

---

### 5.8 Disponible

| Campo | Valor |
|-------|-------|
| **Destinatarios** | Producción + Comercial |
| **Canales** | Email + WhatsApp |
| **Aprobación** | Automático |

**Contenido adicional:**
> ✅ CARGA DISPONIBLE  
> Fecha disponible : [dd/mm/aaaa]

---

## 6. Resumen de Flujos de Aprobación

| Situación | Tipo de mensaje | Aprobación |
|-----------|----------------|------------|
| En tránsito con doc. incompleta | Correo formal a fábrica | **Supervisor** |
| Asignación de operador | Email de presentación operador/proveedor | **Supervisor** |
| Aduana crítica | Comunicación urgente con operador | **Supervisor** |
| Todos los demás estados | Notificaciones a grupos internos | Automático |

### Flujo de aprobación (mensajes críticos)

```
1. Agente genera el mensaje → lo encola con requires_approval = True
2. Supervisor recibe notificación en Dashboard (tab Aprobaciones)
3. Supervisor lee el mensaje en la Cola de Aprobaciones
4. Supervisor aprueba → envío inmediato por el canal configurado
5. Supervisor rechaza → el mensaje queda archivado, no se envía
```

---

## 7. Reporte Diario

| Campo | Valor |
|-------|-------|
| **Horario** | 8:30 AM, lunes a viernes |
| **Destinatarios** | Producción + Comercial |
| **Canales** | Email + WhatsApp |
| **Aprobación** | Automático |
| **Contenido** | Resumen de todas las cargas activas |

**Formato:**
```
📊 *REPORTE DIARIO DE TRÁFICO*

• [Nombre carga 1] — [Estado actual]
  ETD: [fecha] | ETA: [fecha]

• [Nombre carga 2] — [Estado actual]
  ETD: [fecha] | ETA: [fecha]
```

El reporte se deduplica: cada dirección de email/WhatsApp recibe un único mensaje aunque tenga múltiples cargas asignadas.

Implementado en `TraficoAgent.daily_report(cargas_activas)` — llamado por APScheduler (Fase 4).

---

## 8. Base de Datos (Supabase)

### Tabla: `test.proveedores`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | PK, auto-generado |
| `nombre` | TEXT NOT NULL | Nombre de la empresa |
| `pais` | TEXT NOT NULL | País de origen |
| `contacto` | TEXT NOT NULL | Nombre del contacto principal |
| `email` | TEXT | Correo del proveedor |
| `whatsapp` | TEXT | Número de WhatsApp |
| `tipo` | TEXT | fabricante / distribuidor / agente / otro |
| `notas` | TEXT | Observaciones |
| `activo` | BOOLEAN | Default TRUE |
| `created_at` | TIMESTAMPTZ | Auto |
| `updated_at` | TIMESTAMPTZ | Auto (trigger) |

### Tabla: `test.operadores`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | PK, auto-generado |
| `nombre` | TEXT NOT NULL | Nombre del operador |
| `pais` | TEXT NOT NULL | País donde opera |
| `contacto` | TEXT NOT NULL | Nombre del contacto principal |
| `email` | TEXT | Correo del operador |
| `whatsapp` | TEXT | Número de WhatsApp |
| `notas` | TEXT | Puertos que cubre, especialidad, etc. |
| `activo` | BOOLEAN | Default TRUE |
| `created_at` | TIMESTAMPTZ | Auto |
| `updated_at` | TIMESTAMPTZ | Auto (trigger) |

Ambas tablas tienen Row Level Security habilitado con políticas CRUD para el rol `authenticated`.

---

## 9. Variables de Entorno Requeridas

```bash
# backend/.env
MONDAY_API_KEY=         # Token de la API de Monday.com
MONDAY_BOARD_ID=        # ID numérico de la tabla "Tráfico 2026"
MONDAY_BOARD_NAME=Tráfico 2026

# Ya existentes (también requeridas por este agente)
ANTHROPIC_API_KEY=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
WHATSAPP_FROM_NUMBER=
```

---

## 10. Estructura del Evento (`incoming` dict)

Campos requeridos para todos los estados:

```python
{
    "cargo_name":  str,           # Nombre del embarque
    "estado":      CargoState,    # Estado actual (enum)
    "etd":         str,           # "dd/mm/aaaa"
    "eta":         str,           # "dd/mm/aaaa"

    # Listas de contactos por grupo
    "produccion": [
        {"nombre": str, "email": str, "whatsapp": str, "tipo": "produccion"}
    ],
    "comercial": [
        {"nombre": str, "email": str, "whatsapp": str, "tipo": "comercial"}
    ],
    "admin": [
        {"nombre": str, "email": str, "tipo": "admin"}   # Sin whatsapp
    ],
}
```

Campos adicionales por estado:

```python
# en_transito
"variante":        "normal" | "retraso" | "doc_incompleta"
"razon_retraso":   str                   # si variante == retraso
"nueva_eta":       str                   # si variante == retraso
"docs_faltantes":  list[str]             # si variante == doc_incompleta
"proveedor":       {"nombre": str, "email": str, "contacto": str}

# asignado_operador
"operador":   {"nombre": str, "pais": str, "contacto": str, "email": str, "whatsapp": str}
"proveedor":  {"nombre": str, "contacto": str}

# arribo_puerto
"puerto_destino":  str   # Manzanillo | Cristóbal | Rodman
"fecha_arribo":    str

# en_aduana_critico
"tipo_critico":    str   # AduanaCriticoTipo
"detalle_critico": str
"operador":        {"nombre": str, "email": str, "whatsapp": str}

# en_bodega_anker
"bodega_sub_estado": str   # BodegaSubEstado

# disponible
"fecha_disponible": str
```

---

## 11. Pendientes de Implementación

| Ítem | Fase | Estado |
|------|------|--------|
| Webhook Monday.com → `POST /api/v1/messages/incoming` | 2 | 🚧 Pendiente |
| Envío real por Gmail API | 3 | 🚧 Pendiente |
| Envío real por WhatsApp (Twilio) | 3 | 🚧 Pendiente |
| Scheduler APScheduler para reporte 8:30 AM | 4 | 📋 Planeado |
| Sección Embarques en Dashboard (vista Monday activos) | 4 | 📋 Planeado |
