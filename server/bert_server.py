"""
callSecure - Python FastAPI BERT Classifier Server
Serves the fine-tuned Hugging Face transformer model in `model/bert_binary_final`
"""

import os
import json
import hashlib
from typing import List, Optional
from pydantic import BaseModel

try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

app = FastAPI(title="callSecure BERT Detection API", version="1.0.0")

if TRANSFORMERS_AVAILABLE:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../model/bert_binary_final"))

tokenizer = None
model = None

def load_model():
    global tokenizer, model
    if not TRANSFORMERS_AVAILABLE:
        print("[BERT Server] Note: PyTorch/Transformers not installed. Run 'pip install torch transformers fastapi uvicorn'.")
        return
    try:
        print(f"[BERT Server] Loading model from {MODEL_DIR}...")
        tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
        model.eval()
        print("[BERT Server] Model loaded successfully.")
    except Exception as e:
        print(f"[BERT Server] Error loading model weights: {e}")

class TranscriptItem(BaseModel):
    speaker: Optional[str] = "Caller"
    text: str
    timestamp: Optional[str] = None

class AnalyzeRequest(BaseModel):
    transcript: List[TranscriptItem]
    callerPhone: Optional[str] = "Unknown"
    callerName: Optional[str] = "Unknown"
    currentStep: Optional[int] = 0

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "transformersAvailable": TRANSFORMERS_AVAILABLE,
        "modelLoaded": model is not None,
        "modelDir": MODEL_DIR
    }

@app.post("/api/call/analyze")
def analyze_call(payload: AnalyzeRequest):
    full_text = "\n".join([f"{item.speaker}: {item.text}" for item in payload.transcript])
    
    risk_score = 50
    risk_level = "MEDIUM"
    scam_type = "Suspicious Telephony Activity"
    threat_indicators = []

    if model is not None and tokenizer is not None:
        inputs = tokenizer(full_text, return_tensors="pt", truncation=True, max_length=512)
        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.softmax(outputs.logits, dim=-1)
            # Label 1 is SCAM
            scam_prob = probs[0][1].item()
            risk_score = int(scam_prob * 100)
    
    if risk_score >= 70:
        risk_level = "CRITICAL"
        threat_indicators.append("BERT Classifier: High Confidence Scam Sequence")
    elif risk_score >= 40:
        risk_level = "HIGH"
        threat_indicators.append("BERT Classifier: Elevated Extortion Probability")
    else:
        risk_level = "SAFE"

    sha256 = hashlib.sha256(full_text.encode('utf-8')).hexdigest()

    return {
        "riskScore": risk_score,
        "riskLevel": risk_level,
        "scamType": scam_type,
        "threatIndicators": threat_indicators,
        "reasoning": f"Deep sequence classification evaluated scam probability at {risk_score}%.",
        "recommendedAction": "Exercise vigilance. Do not share OTPs or transfer money under verbal duress.",
        "sha256Hash": sha256
    }

if __name__ == "__main__":
    load_model()
    if TRANSFORMERS_AVAILABLE:
        uvicorn.run(app, host="0.0.0.0", port=3000)
    else:
        print("Please install requirements: pip install fastapi uvicorn torch transformers")
