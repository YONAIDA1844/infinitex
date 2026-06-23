"""
Cliente Gmail OAuth2 para InfiniteX.
Lee las credenciales desde backend/credentials/gmail_token.json.
"""
import base64
import json
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import truststore
truststore.inject_into_ssl()  # usa el almacén de certificados del sistema (proxy corporativo)

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]
SENDER = "logistica@sicobenediciones.com"

_CREDENTIALS_PATH = os.path.join(
    os.path.dirname(__file__),   # app/integrations/
    "..", "..", "credentials",   # → backend/credentials/
    "gmail_token.json",
)


def _service():
    with open(os.path.normpath(_CREDENTIALS_PATH)) as f:
        token = json.load(f)
    creds = Credentials(
        token=None,
        refresh_token=token["refresh_token"],
        token_uri=token["token_uri"],
        client_id=token["client_id"],
        client_secret=token["client_secret"],
        scopes=SCOPES,
    )
    return build("gmail", "v1", credentials=creds)


def send_email(
    to: str,
    subject: str,
    body_html: str = "",
    body_text: str = "",
    sender: str = SENDER,
) -> dict:
    """
    Envía un email vía Gmail API.

    Args:
        to:        Dirección destino
        subject:   Asunto
        body_html: Cuerpo HTML (opcional pero recomendado)
        body_text: Cuerpo texto plano (fallback)
        sender:    Remitente (default: logistica@sicobenediciones.com)

    Returns:
        Respuesta de la API de Gmail (dict con 'id', 'threadId', etc.)
    """
    msg = MIMEMultipart("alternative")
    msg["To"] = to
    msg["From"] = sender
    msg["Subject"] = subject

    if body_text:
        msg.attach(MIMEText(body_text, "plain", "utf-8"))
    if body_html:
        msg.attach(MIMEText(body_html, "html", "utf-8"))
    if not body_text and not body_html:
        msg.attach(MIMEText("(sin contenido)", "plain", "utf-8"))

    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    result = _service().users().messages().send(
        userId="me", body={"raw": raw}
    ).execute()
    return result
