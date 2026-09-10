# Saarthi — Your Museum Guide

Saarthi is a prototype voice-first museum guide for Indian museums and heritage
sites. A visitor selects a museum and exhibit, scans an exhibit QR code or
browses the exhibit list, hears an introduction, and can ask follow-up
questions by typing or speaking.

> **Prototype scope:** The current build is intentionally focused on **English
> only**. Hindi, Marathi, and other-language UI, speech recognition, answer
> generation, and text-to-speech are not part of this prototype release.

## Problem statement

Museums and heritage sites are among India's richest cultural assets, but the
visitor experience often stops at photographs or a short placard. Visitors
typically have to hire a guide, read dense or incomplete text, or search on a
phone after leaving the exhibit. These options can be costly, unavailable,
visually inaccessible, disconnected from the moment, and difficult for people
who are not comfortable reading long historical descriptions.

The result is an access problem: many visitors cannot easily ask questions,
receive spoken explanations, or explore an exhibit at their own pace.

## Product solution

A QR code beside an exhibit opens a conversational voice guide for that
specific object. Saarthi:

1. lets the visitor select a museum;
2. supports exhibit discovery through QR codes, search, and exhibit lists;
3. introduces the selected exhibit aloud;
4. accepts typed questions or recorded voice questions;
5. transcribes voice questions when the configured STT provider is available;
6. generates an answer using the exhibit context and the current question; and
7. speaks the answer using Rime audio or the browser speech fallback.

The voice-first interaction is designed to keep the visitor looking at the
artifact instead of looking away to type or search.

## Product requirements / current prototype

### Visitor journey

- Open Saarthi and browse or search museums.
- Select a museum and view its exhibits.
- Scan an exhibit QR code or select an exhibit manually.
- Hear an automatic English introduction.
- Ask a question by typing or by holding a browser microphone recording.
- See the transcript and answer in the conversation history.
- Play the answer using Rime audio when available, otherwise use browser speech.
- Stop audio or interrupt the current response and ask another question.

### Functional requirements implemented

- Museum and exhibit browsing.
- Museum-specific visual themes.
- Exhibit QR lookup and direct exhibit routes.
- English typed questions.
- Browser `MediaRecorder` voice capture.
- Groq Whisper transcription.
- Gemini answer generation.
- Context-based fallback answers when Gemini is unavailable.
- Rime Coda text-to-speech.
- Browser `SpeechSynthesis` audio fallback.
- Visible transcripts, answer history, source links when grounding metadata is
  returned, and provider status in the UI.
- Server-only provider credentials through environment variables.

## Architecture

Saarthi is a TanStack Start application with a React client and server-side
provider orchestration.

```text
Browser
  |
  | React routes, exhibit UI, typed input, MediaRecorder/SpeechRecognition
  v
TanStack Start server
  |
  |-- Museum/exhibit/session/message API
  |-- In-memory session state
  |-- Context fallback answer selection
  |-- Provider credentials kept server-side
  |
  |--> Groq Whisper: audio -> transcript
  |--> Gemini: exhibit context + current question -> answer
  |--> Rime Coda: answer text -> WAV audio
  `--> Browser SpeechSynthesis when Rime is unavailable or slow
```

### Main code areas

- `src/routes/index.tsx` — museum search and home journey.
- `src/routes/museum.$id.tsx` — museum exhibit listing and QR entry.
- `src/routes/exhibit.$id.tsx` — introduction, conversation UI, recording,
  playback, interruption, and language selection surface (currently English
  only).
- `src/lib/museums.ts` — museum and exhibit source content.
- `src/lib/museum-api.ts` — museum, exhibit, session, STT, Gemini, fallback,
  Rime, and evidence handling.
- `src/lib/i18n.ts` — current English UI copy and language configuration.
- `src/components/saarthi.tsx` — shared branding, top bar, theme shell, and
  controls.
- `src/server.ts` — routes requests to the museum API handler.

### Request flow

1. The client creates a session with `POST /sessions`.
2. The client submits typed text or multipart audio to
   `POST /sessions/:id/message`.
3. Audio is sent to the configured STT service and its transcript is returned.
4. The server asks Gemini for an answer using the selected exhibit's name,
   gallery, period, context, and the current question.
5. If Gemini fails or returns no usable text, Saarthi selects the best matching
   sentence from the exhibit context.
6. The server attempts Rime synthesis with a short timeout.
7. The response returns the transcript, answer, sources, audio data URL, and
   active provider.

## Technology stack

- React 19
- TanStack Start and TanStack Router
- Vite
- TypeScript
- Tailwind CSS
- Node-compatible server runtime
- In-memory session storage for the prototype

## Third-party services

### Groq Whisper STT

Used for recorded voice transcription.

- Endpoint: value of `STT_API_URL`, default
  `https://api.groq.com/openai/v1/audio/transcriptions`
- Model: value of `STT_MODEL`, default `whisper-large-v3-turbo`
- Transport: HTTPS `POST` with multipart `FormData`
- Authentication: server-side bearer API key in `STT_API_KEY`

### Google Gemini

Used for answer generation.

- Endpoint:
  `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- Model: value of `GEMINI_MODEL` (the example configuration uses
  `gemini-3.6-flash`)
- Transport: HTTPS `POST` with a JSON request
- Authentication: server-side API key in `GEMINI_API_KEY`
- Input: exhibit metadata, exhibit context, and the visitor's current question
- Output: current answer text and optional grounding metadata

### Rime Coda TTS

Used to turn an answer into playable speech.

- **Exact model ID:** `coda`
- **Exact speaker:** value of `RIME_ENGLISH_SPEAKER`; default fallback is
  `astra`
- **Exact language:** `en`
- **Exact endpoint:** `https://users.rime.ai/v1/rime-tts`
- **Transport:** HTTPS `POST` with a JSON request body
- **Authentication:** `Authorization: Bearer <RIME_API_KEY>` on the server
- **Request fields:** `text`, `modelId`, `speaker`, and `lang`
- **Audio format:** WAV
- **Accept header:** `audio/wav`
- **Response:** raw audio bytes, converted by the server to a browser data URL

The application limits synthesized text to a short prefix for responsiveness.
If Rime is not configured, times out, or returns an error, the answer remains
available as text and the browser speech fallback is used where supported.

### Browser speech APIs

- `MediaRecorder` captures microphone audio before server transcription.
- `SpeechRecognition` / `webkitSpeechRecognition` is used as a browser-side
  fallback when microphone recording cannot start.
- `SpeechSynthesis` speaks the answer when Rime audio is unavailable or cannot
  play.

## Setup

### Requirements

- Node.js 20+ recommended
- npm
- A browser with microphone support for voice features
- Provider keys for live STT, Gemini, and Rime behavior

### Install and run

```sh
git clone https://github.com/Rajvardhan1823/saarthi-your-museum-guide.git
cd saarthi-your-museum-guide
npm install
copy .env.example .env
npm run dev
```

On PowerShell, use `npm.cmd` if PowerShell execution policy blocks
`npm.ps1`:

```powershell
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev
```

The development server normally runs at `http://127.0.0.1:8080/`.

### Environment variables

Populate `.env` locally. Never commit it.

```dotenv
STT_API_KEY=
STT_API_URL=https://api.groq.com/openai/v1/audio/transcriptions
STT_MODEL=whisper-large-v3-turbo
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
RIME_API_KEY=
RIME_ENGLISH_SPEAKER=astra
SAARTHI_PROVIDER_MODE=mock
```

`SAARTHI_PROVIDER_MODE` is retained for prototype configuration compatibility;
provider availability is determined by the corresponding credentials and
runtime responses.

## API surface

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/museums` | List or search museums |
| `GET` | `/museums/:id` | Get one museum |
| `GET` | `/exhibits/:id` | Get one exhibit |
| `POST` | `/sessions` | Create an English exhibit session |
| `POST` | `/sessions/:id/message` | Submit typed text or multipart audio |
| `GET` | `/qr/:code` | Redirect an exhibit QR code to its exhibit route |

## Failure behavior

Saarthi is designed to degrade without turning every provider failure into a
blank conversation:

- Rime is attempted with a short timeout so text answers are not blocked by
  slow audio generation.
- Rime errors are surfaced in server evidence and the client falls back to
  browser speech when possible.

## Known limitations

- English-only prototype; multilingual UI and provider routing are not enabled.
- Answer quality depends on the exhibit context and Gemini quota/model access.
- Context fallback cannot reliably answer facts absent from the local exhibit
  notes.
- Museum, exhibit, and session data are stored in memory rather than a
  persistent database.
- The current server is intended for a single prototype process, not horizontal
  scaling.
- Rime audio is generated as a base64 data URL, which is convenient for the
  prototype but not ideal for large or long responses.
- Browser speech APIs vary by browser, operating system, microphone, and
  permission settings.
- Source links depend on grounding metadata being returned by the configured
  Gemini model.
- No production authentication, rate limiting, analytics, admin CMS, or
  exhibit-content management workflow is included yet.
- Provider keys must be configured by the deployer; this repository does not
  include credentials.

## Verification

```sh
npm run build
npm run lint
```

The production build is the primary validation command. The repository may
contain existing formatting/lint findings caused by line-ending differences;
these are separate from runtime build validation.

## Branding and design

Saarthi uses a shared logo, museum-specific themes, responsive mobile-first
layouts, exhibit imagery, and a Saarthi favicon. The visual shell changes by
museum theme while retaining consistent navigation and conversation controls.
