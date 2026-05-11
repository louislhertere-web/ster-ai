from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import anthropic
import os
import json
import re
import smtplib
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from dotenv import load_dotenv
from googleapiclient.discovery import build
from google.oauth2 import service_account
import io
from googleapiclient.http import MediaIoBaseDownload
import PyPDF2
from pydantic import BaseModel
from typing import List
from docx import Document
import tempfile
from datetime import date

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

app = FastAPI(title="Ster-AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SCOPES = ['https://www.googleapis.com/auth/drive.readonly']
CREDENTIALS_FILE = os.path.join(os.path.dirname(__file__), 'credentials.json')
FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID")
GMAIL_ADDRESS = os.getenv("GMAIL_ADDRESS")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD")

def get_drive_service():
    creds_b64 = os.getenv("GOOGLE_CREDENTIALS_BASE64")
    if creds_b64:
        creds_json = base64.b64decode(creds_b64).decode('utf-8')
        creds_dict = json.loads(creds_json)
        creds = service_account.Credentials.from_service_account_info(creds_dict, scopes=SCOPES)
    else:
        creds = service_account.Credentials.from_service_account_file(CREDENTIALS_FILE, scopes=SCOPES)
    return build('drive', 'v3', credentials=creds)

def lire_pdf(service, file_id):
    request = service.files().get_media(fileId=file_id)
    fh = io.BytesIO()
    downloader = MediaIoBaseDownload(fh, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()
    fh.seek(0)
    reader = PyPDF2.PdfReader(fh)
    texte = ""
    for page in reader.pages:
        texte += page.extract_text()
    return texte

def analyser_paire(id_match, rapport_arbitre, rapport_delegue):
    prompt = f"""Tu es un expert disciplinaire de la Federation Francaise de Football.

Analyse ces deux rapports du meme match et classe le dossier.

ID Match : {id_match}

RAPPORT ARBITRE :
{rapport_arbitre[:2000]}

RAPPORT DELEGUE :
{rapport_delegue[:2000]}

Reponds UNIQUEMENT en JSON avec ce format exact :
{{
  "match": "Equipe A vs Equipe B (extrait des rapports)",
  "priorite": "rouge" ou "jaune" ou "vert",
  "motif": "explication courte en une phrase",
  "action": "ce que le responsable doit faire"
}}

Regles :
- ROUGE : brutalite, propos discriminatoires, pyrotechnique, envahissement terrain, incident grave
- JAUNE : expulsion technique, contradiction entre rapports, rapport manquant, tension sans incident
- VERT : avertissements simples, RAS, match sans incident"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}]
    )
    texte = message.content[0].text
    json_match = re.search(r'\{.*\}', texte, re.DOTALL)
    return json.loads(json_match.group())

def envoyer_email(destinataire, resultats):
    rouge = [r for r in resultats if r['priorite'] == 'rouge']
    jaune = [r for r in resultats if r['priorite'] == 'jaune']
    vert = [r for r in resultats if r['priorite'] == 'vert']

    doc = Document()
    doc.add_heading('Ster-AI - Recapitulatif hebdomadaire', 0)
    doc.add_paragraph(f'Analyse automatique des rapports arbitres et delegues - {date.today().strftime("%d/%m/%Y")}')
    doc.add_paragraph(f'Total : {len(rouge)} prioritaire(s) | {len(jaune)} a verifier | {len(vert)} RAS')
    doc.add_paragraph('')

    if rouge:
        doc.add_heading('PRIORITAIRES', level=1)
        for r in rouge:
            doc.add_heading(r['match'], level=2)
            doc.add_paragraph(f'Motif : {r["motif"]}')
            doc.add_paragraph(f'Action : {r["action"]}')
            doc.add_paragraph('')

    if jaune:
        doc.add_heading('A VERIFIER', level=1)
        for r in jaune:
            doc.add_heading(r['match'], level=2)
            doc.add_paragraph(f'Motif : {r["motif"]}')
            doc.add_paragraph(f'Action : {r["action"]}')
            doc.add_paragraph('')

    if vert:
        doc.add_heading('RAS', level=1)
        for r in vert:
            doc.add_heading(r['match'], level=2)
            doc.add_paragraph(f'Motif : {r["motif"]}')
            doc.add_paragraph('')

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.docx')
    doc.save(tmp.name)
    tmp.close()

    html = f"""
    <html><body style="font-family: Arial; padding: 20px;">
    <h1 style="color: #1a1a2e;">Ster-AI - Recapitulatif hebdomadaire</h1>
    <p>Bonjour,</p>
    <p>Veuillez trouver ci-dessous le recapitulatif automatique de la journee du {date.today().strftime("%d/%m/%Y")}.</p>
    <p>Bien a vous,</p>
    <div style="display: flex; gap: 20px; margin: 20px 0;">
        <div style="background: #fff5f5; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #e53e3e;">{len(rouge)}</div>
            <div>PRIORITAIRES</div>
        </div>
        <div style="background: #fffff0; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #d69e2e;">{len(jaune)}</div>
            <div>A VERIFIER</div>
        </div>
        <div style="background: #f0fff4; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #38a169;">{len(vert)}</div>
            <div>RAS</div>
        </div>
    </div>
    {"".join([f'<div style="background: #fff5f5; border: 1px solid #fc8181; border-radius: 8px; padding: 15px; margin: 10px 0;"><h3>{r["match"]}</h3><p>{r["motif"]}</p><p>Action : {r["action"]}</p></div>' for r in rouge])}
    {"".join([f'<div style="background: #fffff0; border: 1px solid #f6e05e; border-radius: 8px; padding: 15px; margin: 10px 0;"><h3>{r["match"]}</h3><p>{r["motif"]}</p><p>Action : {r["action"]}</p></div>' for r in jaune])}
    {"".join([f'<div style="background: #f0fff4; border: 1px solid #68d391; border-radius: 8px; padding: 15px; margin: 10px 0;"><h3>{r["match"]}</h3><p>{r["motif"]}</p></div>' for r in vert])}
    </body></html>
    """

    msg = MIMEMultipart('mixed')
    msg['Subject'] = f"Ster-AI - {len(rouge)} prioritaire(s), {len(jaune)} a verifier, {len(vert)} RAS"
    msg['From'] = GMAIL_ADDRESS
    msg['To'] = destinataire
    msg.attach(MIMEText(html, 'html'))

    with open(tmp.name, 'rb') as f:
        part = MIMEBase('application', 'octet-stream')
        part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', f'attachment; filename="Recap_SterAI_{date.today().strftime("%d%m%Y")}.docx"')
        msg.attach(part)

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_ADDRESS, destinataire, msg.as_string())

    os.remove(tmp.name)

class RapportRequest(BaseModel):
    match: str
    rapport_arbitre: str
    rapport_delegue: str

class RecapRequest(BaseModel):
    destinataire: str
    resultats: List[dict]

@app.get("/")
def read_root():
    return {"message": "Ster-AI API en ligne", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/drive/rapports")
def lister_rapports():
    try:
        service = get_drive_service()
        results = service.files().list(
            q=f"'{FOLDER_ID}' in parents and mimeType='application/pdf'",
            fields="files(id, name, createdTime)"
        ).execute()
        fichiers = results.get('files', [])
        return {"rapports": fichiers, "total": len(fichiers)}
    except Exception as e:
        return {"error": str(e)}

@app.get("/drive/analyser-tout")
def analyser_tous_rapports():
    try:
        service = get_drive_service()
        results = service.files().list(
            q=f"'{FOLDER_ID}' in parents and mimeType='application/pdf'",
            fields="files(id, name, createdTime)",
            pageSize=50
        ).execute()
        fichiers = results.get('files', [])

        arbitres = {}
        delegues = {}
        for f in fichiers:
            nom = f['name']
            if 'RA_AC_' in nom:
                id_match = nom.split('RA_AC_')[1].replace('.pdf', '')
                arbitres[id_match] = f
            elif 'RA_DP_' in nom:
                id_match = nom.split('RA_DP_')[1].replace('.pdf', '')
                delegues[id_match] = f

        tous_ids = set(arbitres.keys()) | set(delegues.keys())
        resultats = []

        for id_match in list(tous_ids)[:10]:
            rapport_arbitre = ""
            rapport_delegue = ""
            fichier_nom = f"Match {id_match}"

            if id_match in arbitres:
                rapport_arbitre = lire_pdf(service, arbitres[id_match]['id'])
                fichier_nom = arbitres[id_match]['name']
            if id_match in delegues:
                rapport_delegue = lire_pdf(service, delegues[id_match]['id'])

            if not rapport_arbitre:
                rapport_arbitre = "Rapport arbitre non disponible"
            if not rapport_delegue:
                rapport_delegue = "Rapport delegue non disponible"

            analyse = analyser_paire(id_match, rapport_arbitre, rapport_delegue)
            analyse['fichier'] = fichier_nom
            analyse['id'] = id_match
            resultats.append(analyse)

        return {"resultats": resultats, "total": len(resultats)}
    except Exception as e:
        return {"error": str(e)}

@app.post("/envoyer-recap")
def envoyer_recap(req: RecapRequest):
    try:
        envoyer_email(req.destinataire, req.resultats)
        return {"message": f"Email envoye a {req.destinataire}", "total": len(req.resultats)}
    except Exception as e:
        return {"error": str(e)}

@app.post("/analyser")
def analyser_rapport(req: RapportRequest):
    prompt = f"""Tu es un expert disciplinaire de la Federation Francaise de Football.

Match : {req.match}
Rapport arbitre : {req.rapport_arbitre}
Rapport delegue : {req.rapport_delegue}

Reponds UNIQUEMENT en JSON :
{{"priorite": "rouge/jaune/vert", "motif": "...", "action": "..."}}"""

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}]
    )
    texte = message.content[0].text
    json_match = re.search(r'\{.*\}', texte, re.DOTALL)
    return json.loads(json_match.group())
