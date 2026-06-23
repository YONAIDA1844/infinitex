"""
Envía un email de prueba real vía Gmail API para verificar la integración.

Uso:
    cd backend
    python scripts/test_email.py
"""
import sys
import os

# Permite importar desde backend/app/ sin instalar el paquete
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.integrations.gmail_client import send_email

TO      = "daniel.benarroch@sicobenediciones.com"
SUBJECT = "🚢 TEST InfiniteX | Agente de Tráfico activo ✅"

BODY_TEXT = (
    "Este es el primer email de prueba del Agente de Tráfico de InfiniteX.\n"
    "El sistema está funcionando correctamente."
)

BODY_HTML = """\
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#030712;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="background:#030712;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0"
               style="background:#111827;border:1px solid #1f2937;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:28px 32px;border-bottom:1px solid #1f2937;">
              <span style="font-size:20px;font-weight:900;letter-spacing:4px;color:#60a5fa;">INFINITE</span>
              <span style="font-size:20px;font-weight:900;letter-spacing:4px;color:#ffffff;">X</span>
              &nbsp;&nbsp;
              <span style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#4b5563;">
                Agente de Tráfico
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#ffffff;">
                🚢 Sistema activo ✅
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#9ca3af;">
                Este es el primer email de prueba del <strong style="color:#e5e7eb;">Agente de Tráfico</strong>
                de InfiniteX.<br>
                El sistema está funcionando correctamente.
              </p>
              <table cellpadding="0" cellspacing="0"
                     style="background:#1f2937;border:1px solid #374151;border-radius:8px;width:100%;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:2px;
                               color:#6b7280;">Remitente</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#e5e7eb;">
                      logistica@sicobenediciones.com
                    </p>
                  </td>
                  <td style="padding:16px 20px;border-left:1px solid #374151;">
                    <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:2px;
                               color:#6b7280;">Estado</p>
                    <p style="margin:4px 0 0;font-size:14px;color:#34d399;font-weight:600;">
                      ● Operativo
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #1f2937;">
              <p style="margin:0;font-size:11px;color:#4b5563;">
                InfiniteX — Sistema multiagente de supervisión logística · Sicoben Ediciones
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def main() -> None:
    print(f"Enviando email de prueba a {TO} ...")
    try:
        result = send_email(
            to=TO,
            subject=SUBJECT,
            body_html=BODY_HTML,
            body_text=BODY_TEXT,
        )
        print(f"✅ Email enviado correctamente.")
        print(f"   Message ID : {result.get('id')}")
        print(f"   Thread ID  : {result.get('threadId')}")
    except Exception as exc:
        print(f"❌ Error al enviar: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
