

# Pipeline Documente Automatizat 🚀

Proiect de procesare inteligentă a facturilor folosind React, n8n și Google Gemini AI.

## 🛠️ Ghid de Pornire pentru Colege

Urmați acești pași exacți pentru a rula proiectul pe calculatorul vostru:

### 1. Pornirea n8n în Docker
Asigurați-vă că aveți **Docker Desktop** deschis și pornit. Rulați următoarea comandă în Terminal (CMD / PowerShell):

```bash
docker run -it --rm --name n8n-ai -p 5678:5678 -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=false -e N8N_CORS_ALLOWED_ORIGINS=* -v n8n_data:/home/node/.n8n n8nio/n8n