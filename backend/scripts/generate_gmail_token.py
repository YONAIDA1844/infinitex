"""
Genera el refresh_token de Gmail OAuth2 para logistica@sicobenediciones.com.

Uso:
    cd backend
    python scripts/generate_gmail_token.py

El script abre el navegador, pide autorización y luego imprime el
refresh_token que debes copiar a backend/.env como GMAIL_REFRESH_TOKEN.
"""
import json
import os
import glob

from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

CREDENTIALS_DIR = os.path.join(os.path.dirname(__file__), "..", "credentials")


def find_client_secret() -> str:
    pattern = os.path.join(CREDENTIALS_DIR, "client_secret_*.json")
    matches = glob.glob(pattern)
    if not matches:
        raise FileNotFoundError(
            f"No se encontró ningún client_secret_*.json en {CREDENTIALS_DIR}"
        )
    return matches[0]


def main() -> None:
    client_secret_path = find_client_secret()
    print(f"Usando credencial: {os.path.basename(client_secret_path)}")
    print("Abriendo el navegador para autorizar el acceso a Gmail...\n")

    flow = InstalledAppFlow.from_client_secrets_file(client_secret_path, SCOPES)
    # port=0 → elige un puerto libre automáticamente
    creds = flow.run_local_server(port=0, prompt="consent", access_type="offline")

    print("\n" + "=" * 60)
    print("AUTORIZACIÓN COMPLETADA")
    print("=" * 60)
    print(f"\nGMAIL_CLIENT_ID     = {creds.client_id}")
    print(f"GMAIL_CLIENT_SECRET = {creds.client_secret}")
    print(f"GMAIL_REFRESH_TOKEN = {creds.refresh_token}")
    print("\nCopia GMAIL_REFRESH_TOKEN (y confirma CLIENT_ID/SECRET) en backend/.env")
    print("=" * 60)

    # También vuelca todo en un JSON local por si necesitas referencia
    token_path = os.path.join(CREDENTIALS_DIR, "gmail_token.json")
    with open(token_path, "w") as f:
        json.dump(
            {
                "client_id": creds.client_id,
                "client_secret": creds.client_secret,
                "refresh_token": creds.refresh_token,
                "token_uri": "https://oauth2.googleapis.com/token",
            },
            f,
            indent=2,
        )
    print(f"\nTambién guardado en: {token_path}  (no subir al repo)")


if __name__ == "__main__":
    main()
