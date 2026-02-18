# v6 — CPM Interview Module: Voice → Plan Pipeline

> **Formål:** Tilføj et førsteklasses Interview-modul til CPM der lader brugeren optage kundeinterviews (browser eller iPhone), transkribere dem til dansk via en dedikeret Whisper-service på Fly.io, redigere transskriptionen og konvertere den direkte til en CPM Plan.
>
> **Forudsætning:** v1–v5 arkitektur forbliver intakt. v6 er additiv — nye tabeller, en ny `@cpm/whisper` Fly.io microservice, og nye UI routes i `@cpm/web`.
>
> **Oprindelse:** Planlægningssession mellem Christian (CEO, WebHouse ApS) og Claude, 18. feb 2026.

---

## 1. Vision: Fra møde til plan på under 5 minutter

CPM bruges til at planlægge og eksekvere AI-assisteret udvikling. Men planer opstår fra steder — fra kundemøder, brugerinterview, stakeholder calls. I dag lander den viden i Apple Notes, på papirlapper eller går tabt.

v6 lukker det hul: **optag → transkribér → redigér → plan** som en sammenhængende workflow direkte i CPM.

### To input-scenarier

**Scenarie A — Browser-optagelse (desk/laptop):**
Brugeren klikker "Start optagelse" i CPM web UI. `MediaRecorder` optager via mikrofon direkte i browseren. Producerer `.webm` format. Velegnet til optagelse på kontoret.

**Scenarie B — iPhone upload (møde/field interview):**
Brugeren optager med iPhones egen Diktafon-app (Voice Memos), der gemmer i Apple's `.m4a` format (AAC-codec, MPEG-4 container). Filen deles til CPM via et simpelt upload-interface — enten via browser-upload, eller via en PWA-version af Interview-sektionen på mobilen. Velegnet til møder og interviews udenfor kontoret.

Begge flows ender i den samme Whisper-service og det samme `Interview`-objekt i databasen.

---

## 2. Arkitektur-overblik

```
┌─────────────────────────────────────────────────────────┐
│                    @cpm/web (Fly.io app)                 │
│                                                          │
│  /interviews         → Interview liste                   │
│  /interviews/new     → Optagelse + upload UI             │
│  /interviews/[id]    → Transcript editor + Plan-gen      │
│                                                          │
│  POST /api/interviews/transcribe                         │
│    → multipart/form-data (audio + metadata)              │
│    → videresender til whisper-service via Fly 6PN        │
│    → gemmer transcript i SQLite/@cpm/db                  │
└─────────────────────────────────────────────────────────┘
                          │
                  Fly.io Private Network (6PN)
                  whisper-svc.internal:8080
                          │
┌─────────────────────────────────────────────────────────┐
│              whisper-service (separat Fly.io app)        │
│                                                          │
│  Trin 1: openai-whisper (medium model som default)       │
│    → rå transkription med timestamps/segmenter           │
│                                                          │
│  Trin 2: Claude Haiku korrektur (~$0.001/kald, ~2 sek)  │
│    → fejlhøringer rettes via udvikler-ordbog             │
│    → returnerer korrigeret tekst + ændringslog           │
│                                                          │
│  Accepterede formater: .webm, .m4a, .mp3, .wav, .ogg    │
│  ffmpeg håndterer konvertering internt                   │
│  Model loades ved startup (ikke per request)             │
│  autostop: stopper når idle > 5 min                      │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Interview Data Model

```typescript
// packages/shared/types/interview.ts

export interface Interview {
  id: string;                          // UUID (crypto.randomUUID())
  projectId: string | null;            // Valgfri projekt-tilknytning
  title: string;                       // Interviewets titel (fx "Kunde: Jens Hansen 18/2")
  description: string | null;          // Kort beskrivelse / kontekst
  
  // Audio metadata
  audioFilename: string | null;        // Original filnavn fra upload
  audioFormat: 'webm' | 'm4a' | 'mp3' | 'wav' | 'ogg';
  audioStoragePath: string | null;     // Lokal sti (v1) eller S3/R2 URL (v3)
  durationSeconds: number | null;      // Varighed i sekunder
  fileSizeBytes: number | null;        // Filstørrelse
  
  // Transkription
  transcript: string;                  // Rå Whisper-output (markdown-afsnit)
  editedTranscript: string | null;     // Bruger-redigeret version
  segments: TranscriptSegment[];       // Whisper-segmenter med timestamps
  transcriptionModel: string;          // fx 'whisper-medium'
  transcriptionLanguage: string;       // ISO 639-1 ('da', 'en', etc.)
  
  // Status
  status: 'uploading' | 'transcribing' | 'ready' | 'archived';
  
  // Linking
  linkedPlanIds: string[];             // Planer genereret fra dette interview
  tags: string[];
  language: 'da' | 'en';              // Primært sprog i interviewet
  
  // Timestamps
  recordedAt: Date | null;             // Hvornår interviewet fandt sted
  createdAt: Date;
  updatedAt: Date;
}

export interface TranscriptSegment {
  id: number;
  start: number;                       // Sekunder fra start
  end: number;
  text: string;
  confidence: number | null;           // 0.0–1.0 (Whisper large returnerer dette)
}
```

---

## 4. Database Schema (Drizzle + SQLite)

```typescript
// packages/db/schema/interviews.ts

import { sqliteTable, text, integer, blob, real } from 'drizzle-orm/sqlite-core';

export const interviews = sqliteTable('interviews', {
  id: text('id').primaryKey(),
  projectId: text('project_id'),
  title: text('title').notNull(),
  description: text('description'),
  
  // Audio
  audioFilename: text('audio_filename'),
  audioFormat: text('audio_format', { 
    enum: ['webm', 'm4a', 'mp3', 'wav', 'ogg'] 
  }),
  audioStoragePath: text('audio_storage_path'),
  durationSeconds: real('duration_seconds'),
  fileSizeBytes: integer('file_size_bytes'),
  
  // Transcript
  transcript: text('transcript').notNull().default(''),
  editedTranscript: text('edited_transcript'),
  segments: text('segments', { mode: 'json' })
    .$type<TranscriptSegment[]>()
    .default([]),
  transcriptionModel: text('transcription_model'),
  transcriptionLanguage: text('transcription_language').default('da'),
  
  // Status
  status: text('status', { 
    enum: ['uploading', 'transcribing', 'ready', 'archived'] 
  }).default('uploading'),
  
  // Linking
  linkedPlanIds: text('linked_plan_ids', { mode: 'json' })
    .$type<string[]>()
    .default([]),
  tags: text('tags', { mode: 'json' })
    .$type<string[]>()
    .default([]),
  language: text('language', { enum: ['da', 'en'] }).default('da'),
  
  recordedAt: integer('recorded_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).defaultNow(),
});
```

---

## 5. Whisper-service — Fly.io Microservice

Dette er en selvstændig Python FastAPI-app der deployes som en separat Fly.io app og udelukkende kommunikerer med `@cpm/web` over Fly.io's private IPv6-netværk (6PN). Den er **aldrig eksponeret til internet**.

### 5.1 Filstruktur

```
whisper-service/
├── Dockerfile
├── fly.toml
├── requirements.txt
├── main.py
└── .env.example
```

### 5.2 `requirements.txt`

```
fastapi==0.115.0
uvicorn[standard]==0.30.0
openai-whisper==20240930
python-multipart==0.0.9
ffmpeg-python==0.2.0
torch==2.3.1
httpx==0.27.0
```

### 5.3 `main.py` — FastAPI app (to-trins pipeline)

```python
# whisper-service/main.py
#
# To-trins pipeline — baseret på testresultater fra cbroberg/openai-whisper-docker:
#   Trin 1: Whisper medium → rå dansk transskription
#   Trin 2: Claude Haiku → korrektur med udvikler-ordbog
#
# Konklusion fra tests: Whisper alene laver fejl som "tekstbil" og "mokke".
# Haiku med ordbog fanger og retter dem præcist (~$0.001/kald, ~2 sek).
# Ollama (lokal) er IKKE egnet til Fly.io — for tung (4-5 GB RAM, ingen GPU).

import whisper
import tempfile
import os
import time
import httpx
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
import uvicorn

app = FastAPI(title="CPM Whisper Service", version="2.0.0")

# Trin 1: Whisper model loades ved startup
# 'medium' er testet og virker godt til dansk (~10 sek processing, god accuracy)
# 'large-v3' er bedre men 2.88 GB download — for tungt til 4GB Fly.io maskine
# Kan overrides med env var: WHISPER_MODEL=large-v3
WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "medium")
print(f"Loading Whisper model: {WHISPER_MODEL}...")
model = whisper.load_model(WHISPER_MODEL)
print(f"Whisper model loaded.")

# Trin 2: Haiku API til korrektur
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages"

SUPPORTED_FORMATS = {'.webm', '.m4a', '.mp3', '.wav', '.ogg', '.mp4', '.caf'}

def load_ordbog(ordbog_path: str) -> str:
    """Læs udvikler-ordbogen — bruges i Haiku-prompten."""
    if not os.path.exists(ordbog_path):
        return ""
    lines = []
    with open(ordbog_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                lines.append(line)
    return "\n".join(lines)

# Ordbogen læses ved startup — sidder i /app/ordbog.txt (kopieres ind i Docker image)
ORDBOG = load_ordbog("/app/ordbog.txt")

async def haiku_correct(raw_text: str, language: str = "da") -> dict:
    """
    Trin 2: Send rå Whisper-tekst til Claude Haiku for korrektur.
    Bruger ordbogen til at rette kendte dansk/engelsk developer-fejlhøringer.
    Returnerer korrigeret tekst + liste af ændringer.
    """
    if not ANTHROPIC_API_KEY:
        # Ingen API key — returner rå tekst uden korrektion
        return {"corrected_text": raw_text, "changes": [], "correction_skipped": True}

    dict_section = f"\nUDVIKLER-ORDBOG (brug til at rette kendte fejl):\n{ORDBOG}\n" if ORDBOG else ""

    prompt = f"""Du er en dansk korrekturlæser af Whisper tale-til-tekst transkriptioner.

Svar i PRÆCIS dette JSON-format og intet andet:
{{
  "corrected_text": "den fulde tekst med ALLE rettelser anvendt",
  "changes": [
    {{"from": "forkert ord", "to": "korrekt ord", "reason": "begrundelse"}}
  ]
}}

REGLER:
- Anvend ALLE rettelser i corrected_text — ingen fejl må stå urettet
- Ret kun ord der tydeligt er fejltransskriberet (lyder ens men forkert ord)
- Bevar talesprog, slang og uformelt sprog
- Ændr IKKE sætningsstruktur eller tegnsætning
- Brug UDVIKLER-ORDBOGEN til at genkende kendte fejlhøringer
- Hvis intet skal rettes, returner changes som tom liste []
{dict_section}
TEKST:
{raw_text}"""

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            ANTHROPIC_API_URL,
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 2048,
                "messages": [{"role": "user", "content": prompt}]
            }
        )

    if response.status_code != 200:
        # Korrektion fejlede — returner rå tekst i stedet for at fejle hele kaldet
        return {"corrected_text": raw_text, "changes": [], "correction_error": response.text}

    import json
    result_text = response.json()["content"][0]["text"]
    try:
        return json.loads(result_text)
    except json.JSONDecodeError:
        return {"corrected_text": raw_text, "changes": [], "correction_error": "JSON parse failed"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "whisper_model": WHISPER_MODEL,
        "haiku_correction": bool(ANTHROPIC_API_KEY),
        "ordbog_entries": len(ORDBOG.splitlines()) if ORDBOG else 0,
    }


@app.post("/transcribe")
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form(default="da"),
    prompt: str = Form(default=""),
    skip_correction: bool = Form(default=False),
):
    """
    To-trins transskription:
    1. Whisper → rå tekst + segmenter
    2. Claude Haiku → korrektur med udvikler-ordbog

    - file: Lydfil (.webm, .m4a, .mp3, .wav, .ogg) — .m4a fra iPhone Diktafon virker direkte
    - language: ISO 639-1 ('da' for dansk)
    - prompt: Valgfri kontekst til Whisper (navne, firmanavn)
    - skip_correction: Spring Haiku-korrektion over (returner rå Whisper-output)

    Returnerer:
    - text: Korrigeret tekst (eller rå hvis korrektion slås fra)
    - raw_text: Rå Whisper-output før korrektion
    - changes: Liste af rettelser Haiku lavede
    - segments: Whisper-segmenter med timestamps
    - duration: Varighed i sekunder
    """
    suffix = Path(file.filename or "audio.webm").suffix.lower()
    if suffix not in SUPPORTED_FORMATS:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {suffix}")

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        start_time = time.time()

        # Trin 1: Whisper
        whisper_result = model.transcribe(
            tmp_path,
            language=language if language else None,
            initial_prompt=prompt or None,
            verbose=False,
            fp16=False,
            condition_on_previous_text=True,
        )

        raw_text = whisper_result["text"].strip()
        segments = [
            {"id": i, "start": round(s["start"], 2), "end": round(s["end"], 2), "text": s["text"].strip()}
            for i, s in enumerate(whisper_result["segments"])
        ]
        duration = round(whisper_result["segments"][-1]["end"], 1) if segments else 0
        whisper_time = round(time.time() - start_time, 1)

        # Trin 2: Haiku korrektion
        correction = {"corrected_text": raw_text, "changes": []}
        if not skip_correction:
            correction = await haiku_correct(raw_text, language)
        haiku_time = round(time.time() - start_time - whisper_time, 1)

        return JSONResponse({
            "text": correction.get("corrected_text", raw_text),  # Korrigeret tekst
            "raw_text": raw_text,                                  # Rå Whisper-output
            "changes": correction.get("changes", []),              # Haiku-rettelser
            "segments": segments,
            "language": whisper_result["language"],
            "duration": duration,
            "whisper_model": WHISPER_MODEL,
            "processing": {
                "whisper_seconds": whisper_time,
                "haiku_seconds": haiku_time if not skip_correction else 0,
                "total_seconds": round(time.time() - start_time, 1),
            }
        })

    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
```

### 5.4 `Dockerfile`

```dockerfile
# whisper-service/Dockerfile

FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

# PyTorch CPU-only — ingen GPU på Fly.io, reducerer image markant
RUN pip install --no-cache-dir torch==2.3.1 --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download Whisper medium model ved build-tid
# Eliminerer download-ventetid ved container-start
# large-v3 er bedre til dansk men 2.88 GB — for tungt til 4GB Fly.io maskine (testet)
RUN python -c "import whisper; whisper.load_model('medium')"

# Kopier ordbog og app
# ordbog.txt migreres fra cbroberg/openai-whisper-docker og vedligeholdes her
COPY ordbog.txt .
COPY main.py .

EXPOSE 8080

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
```

### 5.5 `fly.toml`

```toml
# whisper-service/fly.toml

app = "cpm-whisper-service"
primary_region = "arn"  # Stockholm — tættest på DK

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8080"
  WHISPER_MODEL = "medium"   # Skift til "large-v3" hvis maskine opgraderes til 8GB

# ANTHROPIC_API_KEY sættes som Fly secret (ikke i fly.toml):
# fly secrets set ANTHROPIC_API_KEY=sk-ant-... -a cpm-whisper-service

[http_service]
  internal_port = 8080
  force_https = false

  auto_stop_machines = "stop"
  auto_start_machines = true
  min_machines_running = 0

  [http_service.concurrency]
    type = "requests"
    hard_limit = 2
    soft_limit = 1

# 4GB RAM kræves til Whisper medium + ffmpeg + torch + Haiku httpx calls
[[vm]]
  size = "performance-2x"
  memory = "4gb"

[[services]]
  internal_port = 8080
  protocol = "tcp"
```

### 5.6 Deploy kommandoer

```bash
# Første gang
cd whisper-service

# Kopier ordbog fra test-repo (udgangspunkt)
cp ../openai-whisper-docker/ordbog.txt .

fly apps create cpm-whisper-service

# KRITISK: Sæt Anthropic API key som secret (bruges til Haiku-korrektion)
# Haiku koster ~$0.001/kald — meget billigt til denne use case
fly secrets set ANTHROPIC_API_KEY=sk-ant-... -a cpm-whisper-service

fly deploy

# Tjek at begge trin virker
fly logs -a cpm-whisper-service
curl http://cpm-whisper-service.internal:8080/health
# → {"status":"ok","whisper_model":"medium","haiku_correction":true,"ordbog_entries":65}

# Skalér ned manuelt (autostop gør det automatisk efter idle)
fly scale count 0 -a cpm-whisper-service
```

### 5.7 Lokal udvikling uden Fly.io

```bash
# Kør whisper-service lokalt under dev
cd whisper-service
pip install -r requirements.txt
python main.py
# Kører på http://localhost:8080

# I @cpm/web .env.local:
WHISPER_SERVICE_URL=http://localhost:8080
```

```bash
# Produktion .env.local (på Fly.io):
WHISPER_SERVICE_URL=http://cpm-whisper-service.internal:8080
```

---

## 6. CPM Web API Routes

### `POST /api/interviews/transcribe`

```typescript
// packages/web/src/app/api/interviews/transcribe/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@cpm/db';
import { interviews } from '@cpm/db/schema/interviews';
import { nanoid } from 'nanoid';

const WHISPER_URL = process.env.WHISPER_SERVICE_URL ?? 'http://localhost:8080';

// Accepted MIME types → file extension mapping
const MIME_TO_EXT: Record<string, string> = {
  'audio/webm':                  '.webm',
  'audio/mp4':                   '.m4a',
  'audio/x-m4a':                 '.m4a',
  'audio/mpeg':                  '.mp3',
  'audio/wav':                   '.wav',
  'audio/ogg':                   '.ogg',
  'audio/x-caf':                 '.caf',   // Apples Core Audio Format (ubehandlet)
  'video/webm':                  '.webm',  // Chrome MediaRecorder bruger denne MIME type
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const audioFile = formData.get('audio') as File | null;
  const projectId = formData.get('projectId') as string | null;
  const title = formData.get('title') as string ?? 'Interview';
  const language = formData.get('language') as string ?? 'da';
  const interviewContext = formData.get('context') as string ?? ''; // Navne, firmanavn etc.
  
  if (!audioFile) {
    return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
  }
  
  // Bestem filformat
  const ext = MIME_TO_EXT[audioFile.type] ?? '.webm';
  const format = ext.replace('.', '') as 'webm' | 'm4a' | 'mp3' | 'wav' | 'ogg';
  
  // Opret interview-record med status 'transcribing'
  const id = nanoid();
  await db.insert(interviews).values({
    id,
    projectId: projectId ?? null,
    title,
    audioFilename: audioFile.name,
    audioFormat: format,
    fileSizeBytes: audioFile.size,
    status: 'transcribing',
    transcriptionLanguage: language,
    transcript: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  // Send til whisper-service
  const whisperForm = new FormData();
  whisperForm.append('file', audioFile, `audio${ext}`);
  whisperForm.append('language', language);
  whisperForm.append('prompt', interviewContext);
  
  let whisperResult;
  try {
    const whisperRes = await fetch(`${WHISPER_URL}/transcribe`, {
      method: 'POST',
      body: whisperForm,
      signal: AbortSignal.timeout(300_000), // 5 min timeout for lange optagelser
    });
    
    if (!whisperRes.ok) {
      const err = await whisperRes.text();
      throw new Error(`Whisper error ${whisperRes.status}: ${err}`);
    }
    
    whisperResult = await whisperRes.json();
  } catch (err) {
    // Opdater status til fejl så UI kan vise det
    await db.update(interviews)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(interviews.id, id));
    
    return NextResponse.json({ 
      error: 'Transcription failed', 
      details: String(err) 
    }, { status: 500 });
  }
  
  // Gem transskription
  await db.update(interviews)
    .set({
      transcript: whisperResult.text,
      segments: whisperResult.segments,
      durationSeconds: whisperResult.duration,
      transcriptionModel: whisperResult.model,
      transcriptionLanguage: whisperResult.language,
      status: 'ready',
      updatedAt: new Date(),
    })
    .where(eq(interviews.id, id));
  
  return NextResponse.json({ 
    id,
    transcript: whisperResult.text,
    duration: whisperResult.duration,
    segments: whisperResult.segments,
  });
}
```

### `GET /api/interviews` og `PATCH /api/interviews/[id]`

```typescript
// packages/web/src/app/api/interviews/route.ts
// Standard list endpoint — returnerer interviews sorteret by createdAt DESC

// packages/web/src/app/api/interviews/[id]/route.ts
// PATCH: opdatér editedTranscript, title, tags, status, linkedPlanIds
// GET: hent enkelt interview med alle felter
```

---

## 7. Frontend — UI Komponenter

### 7.1 Optagelse-komponent (browser `MediaRecorder`)

```typescript
// packages/web/src/components/interviews/AudioRecorder.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Pause } from 'lucide-react';

type RecorderState = 'idle' | 'recording' | 'paused' | 'stopped';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob, durationSeconds: number) => void;
}

export function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [state, setState] = useState<RecorderState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  // Vælg bedste tilgængelige MIME type
  // Safari understøtter ikke audio/webm — brug mp4 som fallback
  const getMimeType = () => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',                // Safari fallback
      'audio/ogg;codecs=opus',
    ];
    return types.find(t => MediaRecorder.isTypeSupported(t)) ?? '';
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,        // Whisper's native sample rate — reducerer filstørrelse
        } 
      });
      
      chunksRef.current = [];
      const mimeType = getMimeType();
      const recorder = new MediaRecorder(stream, { 
        mimeType,
        audioBitsPerSecond: 128_000,
      });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        onRecordingComplete(blob, elapsed);
        stream.getTracks().forEach(t => t.stop());
      };
      
      recorder.start(1000); // Chunk hvert sekund — giver progress-feedback
      recorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setState('recording');
      
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
      
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Mikrofon-adgang blev afvist. Tjek browser-tilladelser.');
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current);
    recorderRef.current?.stop();
    setState('stopped');
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-xl">
      {state === 'idle' && (
        <Button onClick={startRecording} size="lg" variant="destructive">
          <Mic className="mr-2 h-5 w-5" />
          Start optagelse
        </Button>
      )}
      
      {state === 'recording' && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-red-500">
            <span className="animate-pulse h-3 w-3 rounded-full bg-red-500" />
            <span className="font-mono text-2xl">{formatTime(duration)}</span>
          </div>
          <Button onClick={stopRecording} size="lg" variant="outline">
            <Square className="mr-2 h-5 w-5" />
            Stop optagelse
          </Button>
        </div>
      )}
      
      {state === 'stopped' && audioUrl && (
        <div className="flex flex-col gap-2 w-full">
          <audio controls src={audioUrl} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            Optagelse klar ({formatTime(duration)}) — klik Transkribér nedenfor
          </p>
        </div>
      )}
    </div>
  );
}
```

### 7.2 Upload-komponent (iPhone m4a + alle andre formater)

```typescript
// packages/web/src/components/interviews/AudioUploader.tsx
'use client';

import { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface AudioUploaderProps {
  onFileSelected: (file: File) => void;
}

// Accepterede MIME types — inkluderer alle Apple-formater
const ACCEPTED_AUDIO = [
  'audio/webm',           // Chrome/Firefox browser optagelse
  'audio/mp4',            // iPhone m4a (MPEG-4 container)
  'audio/x-m4a',          // iPhone m4a (alternativ MIME)
  'audio/mpeg',           // MP3
  'audio/wav',            // WAV
  'audio/ogg',            // Ogg Vorbis
  'audio/x-caf',          // Apple Core Audio Format (sjælden)
].join(',');

export function AudioUploader({ onFileSelected }: AudioUploaderProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelected(file);
  }, [onFileSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFileSelected(file);
  }, [onFileSelected]);

  return (
    <label
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="flex flex-col items-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary transition-colors"
    >
      <Upload className="h-10 w-10 text-muted-foreground" />
      <div className="text-center">
        <p className="font-medium">Upload lydfil</p>
        <p className="text-sm text-muted-foreground">
          .m4a (iPhone Diktafon), .webm, .mp3, .wav — eller træk fil hertil
        </p>
      </div>
      <input 
        type="file" 
        accept={ACCEPTED_AUDIO}
        onChange={handleChange}
        className="hidden"
        // capture="user" — aktiverer native mikrofon-dialog på mobil
        // IKKE sat her — vi vil bruge fil-upload, ikke direkte optagelse via input
      />
    </label>
  );
}
```

### 7.3 Transcript Editor

```typescript
// packages/web/src/components/interviews/TranscriptEditor.tsx
'use client';

// Split-pane: Venstre = audio-afspiller med segment-highlighting
//             Højre = redigerbar tekstboks

// Klik på et segment → audio springer til det tidspunkt
// Redigér tekst direkte → gemmes lokalt, "Gem ændringer" uploader til API
// "Generer Plan →" åbner Plan-generator pre-udfyldt med editedTranscript som kontekst
```

### 7.4 Interview-liste side

```
/interviews
  → Tabel med: Titel | Projekt | Varighed | Dato | Status | Handlinger
  → Filtrer på: projekt, tags, status, dato-interval
  → Søg i: titel, transcript-indhold
  → "Nyt interview" knap → /interviews/new
```

### 7.5 Ny interview side (`/interviews/new`)

```
1. Titel + projekt-tilknytning (valgfri)
2. Valgfri kontekst-prompt til Whisper (navne, firmatermer — hjælper stavning)
3. To tabs:
   - "Optag nu" → AudioRecorder (browser)
   - "Upload fil" → AudioUploader (iPhone m4a, MP3, etc.)
4. Sprog-valg: Dansk (default) / Engelsk / Auto-detect
5. "Transkribér" knap → POST /api/interviews/transcribe
6. Loading state med progress-feedback ("Sender til Whisper..." → "Transkriberer..." → "Klar!")
7. Redirect til /interviews/[id] ved success
```

---

## 8. Udvikler-ordbog (CPM Ressource)

### Baggrund

Whisper fejlhører systematisk dansk/engelsk developer-jargon — ord som "mocke", "committe", "deploye" og "pipelinen" der ikke er i Whisper's træningsdata som dansk tekst. Tests i `cbroberg/openai-whisper-docker` dokumenterede 65+ sådanne fejlhøringer og viste at Haiku-korrektion med en ordbog løser problemet præcist.

Ordbogen skal leve i CPM som en redigerbar ressource — ikke begraves i Docker-imaget.

### Ordbog Data Model

```typescript
// packages/shared/types/ordbog.ts

export interface OrdbogEntry {
  id: string;
  wrong: string;        // Whispers fejlhøring (fx "mokke")
  correct: string;      // Korrekt form (fx "mocke")
  explanation: string;  // Forklaring (fx "at lave mock/staffage i kode")
  category: OrdbogCategory;
  projectId: string | null;  // null = global, string = projekt-specifik
  language: 'da' | 'en';
  createdAt: Date;
}

export type OrdbogCategory = 
  | 'git'
  | 'kode'
  | 'devops'
  | 'agilt'
  | 'generelt'
  | 'forkortelser'
  | 'custom';
```

### Ordbog Database Schema

```typescript
// packages/db/schema/ordbog.ts

export const ordbog = sqliteTable('ordbog', {
  id: text('id').primaryKey(),
  wrong: text('wrong').notNull(),
  correct: text('correct').notNull(),
  explanation: text('explanation').notNull().default(''),
  category: text('category').notNull().default('custom'),
  projectId: text('project_id'),           // null = global
  language: text('language').default('da'),
  createdAt: integer('created_at', { mode: 'timestamp' }).defaultNow(),
});

// Indeks til hurtig opslag
CREATE INDEX idx_ordbog_project ON ordbog(project_id);
CREATE INDEX idx_ordbog_category ON ordbog(category);
```

### Seed: Import fra `ordbog.txt`

De 65 eksisterende opslag fra test-repo'et seedes ved første opstart:

```typescript
// packages/db/seeds/ordbog-seed.ts
// Kør: pnpm --filter @cpm/db seed:ordbog

// Importerer alle kategorier fra den testede ordbog:
// git (13 opslag), kode (19), devops (12), agilt (8), generelt (11), forkortelser (6)
```

### API Route

```typescript
// packages/web/src/app/api/ordbog/route.ts

// GET  /api/ordbog           → alle globale opslag
// GET  /api/ordbog?project=x → globale + projekt-specifikke
// POST /api/ordbog           → opret nyt opslag
// DELETE /api/ordbog/[id]    → slet opslag
```

### Ordbog UI (`/settings/ordbog`)

```
Tabel med: Fejlhøring | Korrekt | Kategori | Projekt | Handlinger
Filtrer på: kategori, projekt (global/projekt-specifik)
Søg i: fejlhøring, korrekt, forklaring
"Tilføj opslag" → inline form
Import/Export: .txt format (kompatibelt med wt-check scripts)
```

### Ordbog → Whisper-service

Ordbogen sendes dynamisk til whisper-servicen per request (ikke bagt ind i Docker-image):

```typescript
// I /api/interviews/transcribe/route.ts

// Hent relevant ordbog (global + projekt-specifik)
const entries = await db.select().from(ordbog)
  .where(or(isNull(ordbog.projectId), eq(ordbog.projectId, projectId)));

// Formattér til samme format som ordbog.txt
const ordbogText = entries
  .map(e => `${e.wrong} -> ${e.correct} (${e.explanation})`)
  .join('\n');

// Send med til whisper-service
whisperForm.append('ordbog', ordbogText);
```

Dette betyder at ordbogen kan opdateres i CPM UI uden at gendeploye whisper-servicen.

---

```typescript
// packages/web/src/app/api/interviews/[id]/generate-plan/route.ts

// POST: Tager interviewets editedTranscript (eller transcript hvis ikke redigeret)
//       → Claude API kald med system prompt der instruerer den til at lave en Plan
//       → Returnerer Plan-objekt der gemmes og linkes til interviewet

// System prompt til Claude:
const INTERVIEW_TO_PLAN_SYSTEM_PROMPT = `
Du er en erfaren software arkitekt og product manager.
Du får en transskription af et kundeinterview eller stakeholder-møde på dansk.
Din opgave er at konvertere dette til en struktureret udviklingsplan i markdown-format.

Planen skal indeholde:
1. **Baggrund og kontekst** — hvad er projektet/problemet
2. **Identificerede behov** — hvad ønsker kunden/brugeren
3. **Foreslåede features** — prioriteret liste
4. **Tekniske overvejelser** — eventuelle tekniske krav nævnt
5. **Næste skridt** — konkrete handlinger

Brug markdown med overskrifter. Vær konkret og præcis. Undgå vage formuleringer.
Planen skal kunne bruges direkte som input til Prompt Contract-generering i CPM.
`;
```

Knap i `/interviews/[id]`:
```
"Generer Plan fra dette interview →"
  → Kalder /api/interviews/[id]/generate-plan
  → Opretter Plan-objekt med source: 'generated', sourceRef: interview.id
  → Linker Plan til Interview (begge veje)
  → Redirect til /plans/[newPlanId]
```

---

## 9. PWA-konfiguration for Interview-sektionen

Interview-flowet bør fungere som PWA på iPhone så optagelse kan ske mobilt.

### Begrænsning: iOS baggrunds-lyd

Safari/iOS **stopper MediaRecorder** når browseren/appen går i baggrunden. Dette er en iOS-begrænsning der ikke kan overrides i en PWA.

**Løsning:** Brug iPhones native **Diktafon-app** (Voice Memos) til selve optagelsen — den kører i baggrunden. Upload herefter m4a-filen til CPM via PWA upload-interfacet. Dette er den anbefalede workflow til feltoptagelser.

**Hvad PWA'en giver:**
- "Tilføj til hjemmeskærm" → native-lignende app-ikon
- Offline-tolerant UI (kan vise eksisterende interviews uden net)
- Share Sheet integration på iOS: Diktafon → Del → CPM PWA (via Web Share Target API)

### `manifest.json` konfiguration

```json
// packages/web/public/manifest.json
{
  "name": "CPM Interviews",
  "short_name": "CPM",
  "description": "Record and transcribe customer interviews",
  "start_url": "/interviews",
  "display": "standalone",
  "background_color": "#09090b",
  "theme_color": "#09090b",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "share_target": {
    "action": "/interviews/new",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "files": [{ 
        "name": "audio", 
        "accept": ["audio/mp4", "audio/x-m4a", "audio/mpeg", "audio/wav"] 
      }]
    }
  }
}
```

`share_target` giver mulighed for at dele en m4a fra Diktafon-appen direkte til CPM via iOS Share Sheet — den åbner `/interviews/new` med filen pre-loadet.

### `next.config.js` PWA-opsætning

```javascript
// packages/web/next.config.mjs
import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [], // Ingen caching af API-kald
});

export default pwaConfig({
  // Øvrig Next.js config
});
```

---

## 10. CLI Commands

```bash
# Interview CLI (v6 tilføjelse til @cpm/cli)

cpm interview list                          # Vis alle interviews
cpm interview list --project <id>           # Filtrer på projekt
cpm interview upload <file.m4a>             # Upload og transkribér lydfil
cpm interview upload <file.m4a> --lang en   # Engelsk transkription
cpm interview show <id>                     # Vis interview + transcript
cpm interview plan <id>                     # Generer Plan fra interview
cpm interview status                        # Tjek whisper-service status
```

---

## 11. Monorepo-ændringer

### Ny whisper-service (udenfor packages/)

```
codepromptmaker/
├── packages/              # Eksisterende @cpm/* pakker — uændret
├── whisper-service/       # NY — selvstændig Fly.io app
│   ├── Dockerfile
│   ├── fly.toml
│   ├── requirements.txt
│   ├── main.py
│   └── .env.example
```

### Nye filer i eksisterende packages

```
packages/
├── shared/types/
│   └── interview.ts                    # NY — Interview + TranscriptSegment types
├── db/schema/
│   └── interviews.ts                   # NY — Drizzle schema
└── web/src/
    ├── app/
    │   ├── api/interviews/
    │   │   ├── route.ts                # NY — list + create
    │   │   ├── transcribe/route.ts     # NY — audio upload → whisper → db
    │   │   └── [id]/
    │   │       ├── route.ts            # NY — get + patch
    │   │       └── generate-plan/route.ts  # NY — interview → plan
    │   └── interviews/
    │       ├── page.tsx                # NY — interview liste
    │       ├── new/page.tsx            # NY — optag/upload + transkribér
    │       └── [id]/page.tsx           # NY — transcript editor
    └── components/interviews/
        ├── AudioRecorder.tsx           # NY — browser MediaRecorder
        ├── AudioUploader.tsx           # NY — fil-upload (m4a, webm, mp3)
        └── TranscriptEditor.tsx        # NY — split-pane editor
```

---

## 13. Environment Variables

```bash
# packages/web/.env.local

WHISPER_SERVICE_URL=http://localhost:8080          # Lokal dev
# WHISPER_SERVICE_URL=http://cpm-whisper-service.internal:8080  # Fly.io prod

MAX_AUDIO_SIZE_BYTES=104857600   # 100MB
```

```bash
# whisper-service/.env.example
PORT=8080
WHISPER_MODEL=medium             # medium (default) eller large-v3 (bedre, 8GB RAM)

# Anthropic Haiku til korrektion — ~$0.001 per kald
# Sættes som Fly.io secret i prod: fly secrets set ANTHROPIC_API_KEY=sk-ant-...
# Lokalt: kopier til .env (gitignored)
ANTHROPIC_API_KEY=sk-ant-...

# Hvis ANTHROPIC_API_KEY mangler, returneres rå Whisper-tekst uden korrektion
# (graceful degradation — servicen fejler ikke)
```

---

## 13. Database Migration

```sql
-- Migration: v6_add_interviews

CREATE TABLE interviews (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  title TEXT NOT NULL,
  description TEXT,
  
  audio_filename TEXT,
  audio_format TEXT CHECK(audio_format IN ('webm', 'm4a', 'mp3', 'wav', 'ogg')),
  audio_storage_path TEXT,
  duration_seconds REAL,
  file_size_bytes INTEGER,
  
  transcript TEXT NOT NULL DEFAULT '',
  edited_transcript TEXT,
  segments TEXT DEFAULT '[]',           -- JSON array af TranscriptSegment
  transcription_model TEXT,
  transcription_language TEXT DEFAULT 'da',
  
  status TEXT DEFAULT 'uploading' 
    CHECK(status IN ('uploading', 'transcribing', 'ready', 'archived')),
  
  linked_plan_ids TEXT DEFAULT '[]',    -- JSON array
  tags TEXT DEFAULT '[]',              -- JSON array
  language TEXT DEFAULT 'da' 
    CHECK(language IN ('da', 'en')),
  
  recorded_at INTEGER,                  -- Unix timestamp (valgfri)
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Indekser til søgning og filtrering
CREATE INDEX idx_interviews_project ON interviews(project_id);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_created ON interviews(created_at DESC);

-- Link interviews til planer (plans-tabellen — fra v5)
ALTER TABLE plans ADD COLUMN source_interview_id TEXT REFERENCES interviews(id);
```

---

## 15. Estimeret implementation-tid

| Komponent | Estimat |
|-----------|---------|
| whisper-service: Dockerfile + FastAPI (to-trins pipeline) + fly.toml | 3-4 timer |
| Fly.io deploy + secrets + test | 1-2 timer |
| @cpm/db: interviews schema + ordbog schema + seeds | 1-2 timer |
| @cpm/shared: Interview + OrdbogEntry types | 30 min |
| /api/interviews/* routes (list, transcribe, patch, plan-gen) | 3-4 timer |
| /api/ordbog/* routes + seed import | 1-2 timer |
| AudioRecorder.tsx + AudioUploader.tsx | 3 timer |
| TranscriptEditor.tsx (split-pane med segment-playback) | 3-4 timer |
| /interviews/new + /interviews/[id] sider | 2-3 timer |
| /settings/ordbog UI (tabel + CRUD) | 2-3 timer |
| Interview → Plan generation flow | 2 timer |
| PWA manifest + Share Target | 1-2 timer |
| CLI commands | 2 timer |
| **Total** | **~2-2.5 arbejdsdage** |

---

## 15. Sammenhæng med eksisterende versioner

| Eksisterende version | Påvirkning fra v6 |
|---------------------|-------------------|
| **v1 (Local MVP)** | Interview-tabellen tilføjes. Whisper-service kører lokalt på port 8080. |
| **v2 (RAG)** | Transskriptioner indekseres i RAG-pipeline — søgbar på tværs af interviews og planer. |
| **v3 (SaaS)** | Audio-filer gemmes på Cloudflare R2 i stedet for lokalt. Whisper-service deles af alle lejere. |
| **v4 (Autonomous runner)** | Interview + Plan kan trigge en autonom cc-session direkte. |
| **v5 (AI Command Center)** | Interview linkes til Plan Management og Project Context — komplet kontekst-trail fra møde til kode. |

v6 er **additiv** — bryder ingen eksisterende funktionalitet.

---

## 16. Open Spørgsmål

1. **Whisper model på Fly.io:** `medium` er testet og virker til dansk (~10 sek). `large-v3` er bedre men 2.88 GB download og for tungt til 4GB maskine. Gør det konfigurerbart via `WHISPER_MODEL` env var — start med `medium`, opgrader til `large-v3` hvis maskinen opgraderes til 8GB.

2. **Ordbog per projekt vs. global:** Implementér begge — global ordbog for generel developer-jargon (de 65 testede opslag), og projekt-specifik ordbog for kundenavne og domænetermer. Begge sendes samlet til whisper-servicen.

3. **Haiku graceful degradation:** Servicen returnerer rå Whisper-tekst hvis `ANTHROPIC_API_KEY` mangler — den fejler aldrig pga. manglende korrektion. Vis i UI om korrektion var aktiv.

4. **Segmenteret playback:** Klik på segment i editor → audio hopper til det tidspunkt. Prioritér fra dag ét — det er den primære redigerings-UX der spare tid ved gennemgang.

5. **Diktafon Share Sheet:** `share_target` i PWA manifest virker kun i Safari på iOS. Dokumentér dette klart i onboarding-teksten.

6. **Audio-lagring:** Gem lydfiler i `~/.cpm/audio/` lokalt i v1 (simpelt). Flyt til Cloudflare R2 i v3 SaaS. Overvej om filer skal beholdes efter transskription eller slettes for at spare plads — gør det til en brugerindstilling.
