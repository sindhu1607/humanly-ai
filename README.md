# HumanlyAI — AI Humanization & Natural Language Refinement Platform

> **Google Student Club Welcome Hackathon 2026**  
> **Problem Statement 02:** AI Humanization & Natural Language Refinement

---

## 1. Problem Statement & Mission

Machine-generated text often suffers from telltale robotic markers: formulaic transitions (*"Furthermore"*, *"In conclusion"*), excessive corporate boilerplate (*"I hope this email finds you well"*, *"delve into"*), unnatural passivity, and awkward cadences. However, attempts to "humanize" text frequently backfire by inventing ungrounded claims, dropping critical numbers, hallucinating promises, or distorting technical nuance.

**HumanlyAI** establishes a trustworthy human-like communication layer. It detects robotic phrasing, adapts the writing style to the user's specific workplace context, and applies dual-layer validation (deterministic fact/entity checks + AI semantic auditing) to help identify changes to important entities and meaning.

---

## 2. Supported Contexts & Tones

### Supported Contexts
1. **Recruiter Feedback**: Empathetic, direct, constructive guidance for job applicants without corporate rejection formulas.
2. **Candidate Communication**: Warm, clear scheduling notices, prep notes, and interview synchronization.
3. **Interview Questions**: Conversational, engaging prompts that allow candidates to comfortably share real depth.
4. **Interview Summaries**: Objective evaluation debriefs highlighting strengths and growth opportunities clearly.
5. **Professional Reports**: High executive clarity, active voice, punchy observations, and structured takeaways.
6. **General Professional Communication**: Authentic, personable workplace correspondence between colleagues.

### Humanization Styles (Tones)
- **Professional**: Clear, authoritative, respectful, measured, and direct without stiffness.
- **Polished**: Articulate, smooth, elegant, engaging, with fluid sentence rhythm and high precision.
- **Conversational**: Approachable, friendly, authentic, and relaxed while keeping workplace decorum.

---

## 3. End-to-End Workflow Architecture

```
[User Text Input] (Counts, Validation, Protected Terms)
        │
        ├──> Step 4: [Robotic Language Analysis]
        │             • Repetitive phrases & awkward transitions
        │             • Over-formal formulas & unnecessary verbosity
        │             • Structured observations & natural suggestions
        │
        ├──> Step 5: [Contextual AI Humanization] (Gemini gemini-3.8-flash)
        │             • Strict preservation instructions
        │             • Factuality & entity grounding
        │
        └──> Step 6: [Factuality & Meaning Validation]
                      ├── A. Deterministic Extraction & Comparison
                      │      (Numbers, % , $, Dates, Names, Tech terms)
                      │
                      ├── B. AI-Assisted Semantic Audit
                      │      (Omissions, additions, contradictions)
                      │
                      └── C. Transparent Outcome: PASS / REVIEW / FAIL
                                │
[Interactive Results Dashboard] <─┘
  • Side-by-side comparison
  • Preserved entity matrix
  • Editable rewrite with "Rerun Validation"
  • Copy & TXT export
```

---

## 4. Technology Stack & Architectural Decision

### Full-Stack Architecture (Active in AI Studio)
- **Frontend**: React 19 SPA, Tailwind CSS v4, Lucide Icons, Motion.
- **Backend**: Node.js / Express with TypeScript (`server.ts`), running unified with Vite dev middleware on port 3000.
- **AI Integration**: Official `@google/genai` TypeScript SDK with model `gemini-3.8-flash`.
- **Validation Engine**: High-precision deterministic regex & token parser (`deterministicValidator.ts`) + Gemini semantic auditor (`aiServices.ts`).

### Python FastAPI Alternative (`backend_python/`)
In accordance with the hackathon's preferred stack guidelines, a complete Python FastAPI backend is also provided in `backend_python/` with:
- `deterministic_validator.py`: Python entity extractor and factual checker.
- `main.py`: FastAPI server with endpoints, Pydantic schemas, and CORS.
- `requirements.txt`: FastAPI, Uvicorn, Pydantic, google-genai, pytest.

---

## 5. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check, uptime, configured model, and key status |
| `GET` | `/api/config-status` | Connectivity verification for Gemini AI integration |
| `POST` | `/api/analyze` | Step 4: Identifies robotic phrasing markers and suggestions |
| `POST` | `/api/humanize` | Step 5: Generates natural rewrite tailored to context and tone |
| `POST` | `/api/validate` | Step 6: Revalidates arbitrary or edited text against source |
| `POST` | `/api/process-all` | Full unified pipeline (Analyze + Humanize + Validate) |

---

## 6. How to Configure the Gemini API Key

1. Obtain a Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/).
2. In the AI Studio interface, go to **Settings > Secrets** and set:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```
3. For local development, create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   GEMINI_MODEL="gemini-3.8-flash"
   PORT=3000
   ```
4. The backend automatically reads `process.env.GEMINI_API_KEY`. The frontend never accesses or exposes the API key.

---

## 7. Local Setup & Execution Commands

### Running the Full-Stack Application (Node.js + React + Express)

```bash
# 1. Install dependencies
npm install

# 2. Run automated verification tests
npm test

# 3. Start development server (serves on http://localhost:3000)
npm run dev

# 4. Build for production
npm run build

# 5. Start production server
npm start
```

### Running the Python FastAPI Backend (Alternative)

```bash
cd backend_python

# 1. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start FastAPI server (serves on http://localhost:8000)
uvicorn main:app --reload --port 8000
```

---

## 8. Automated Testing & Verification

The project includes an automated test suite (`test_api.ts`) covering:
- Empty and invalid input handling
- Entity extraction: scores (`4.8/5.0`), currencies (`$145,000`), percentages (`15%`), dates (`October 14`), names (`Alex Mercer`), and technical terms (`Kubernetes`)
- Faithful preservation verification (`PASS`)
- Missing number/metric detection (`FAIL`)
- Missing user-protected terms (`FAIL`)
- Introduced unverified facts/numbers (`REVIEW`)
- Multi-context validation across all 6 scenarios

Run tests with:
```bash
npm test
```
The test suite validates deterministic entity extraction, flexible matching, error handling, missing key states, and dual-layer status aggregation.

---

## 9. Privacy & Responsible AI Commitments

- **No Data Persistence**: User communication is processed in transient memory; never stored in persistent databases or tracking logs.
- **Assistance, Not Infallibility**: Automated validation assists humans in verifying preservation. A `PASS` status signifies that implemented checks detected no discrepancies; users retain final review authority.
- **Zero Scraping**: No contact scraping, device telemetry, or personal tracking.
- **Protected Entities**: Users can define non-negotiable protected terms (names, acronyms, sensitive figures) that the engine strictly enforces.
