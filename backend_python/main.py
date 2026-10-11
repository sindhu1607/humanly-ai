import os
import time
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

from deterministic_validator import run_deterministic_validation

app = FastAPI(
    title="HumanlyAI Backend API",
    description="AI Humanization & Natural Language Refinement Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")


class HumanizeRequest(BaseModel):
    text: str = Field(..., min_length=5, max_length=20000)
    context: str = Field(default="general_professional")
    tone: str = Field(default="professional")
    protectedTerms: Optional[List[str]] = Field(default_factory=list)


class RevalidateRequest(BaseModel):
    originalText: str = Field(..., min_length=5)
    rewrittenText: str = Field(..., min_length=5)
    context: str = Field(default="general_professional")
    protectedTerms: Optional[List[str]] = Field(default_factory=list)


def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY environment variable is not configured."
        )
    if genai is None:
        raise HTTPException(
            status_code=500,
            detail="google-genai package is not installed."
        )
    return genai.Client(api_key=api_key)


@app.get("/health")
def health_check():
    api_key_set = bool(os.environ.get("GEMINI_API_KEY"))
    return {
        "status": "ok",
        "service": "HumanlyAI FastAPI Backend",
        "model": GEMINI_MODEL,
        "aiKeyConfigured": api_key_set,
        "timestamp": time.time()
    }


@app.get("/api/config-status")
def config_status():
    configured = bool(os.environ.get("GEMINI_API_KEY"))
    return {
        "configured": configured,
        "model": GEMINI_MODEL,
        "status": "ready" if configured else "missing_api_key",
        "message": "Connected to Gemini" if configured else "GEMINI_API_KEY is missing."
    }


@app.post("/api/validate-deterministic")
def validate_deterministic(payload: RevalidateRequest):
    result = run_deterministic_validation(
        payload.originalText,
        payload.rewrittenText,
        payload.protectedTerms
    )
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
