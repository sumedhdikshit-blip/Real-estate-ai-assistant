"""
Real Estate AI Assistant - FastAPI Backend
Uses Groq's Llama 3 to answer real estate questions with pre-loaded knowledge sources.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
from dotenv import load_dotenv
import httpx
from bs4 import BeautifulSoup
import time

# Load environment variables from .env file
load_dotenv()
print("Groq API Key Loaded Successfully")

# Initialize FastAPI app
app = FastAPI(
    title="Real Estate AI Assistant",
    description="AI-powered real estate Q&A using Groq Llama 3",
    version="1.0.0"
)

# Allow frontend to talk to backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client with API key from .env
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ─────────────────────────────────────────────
# PRE-LOADED REAL ESTATE KNOWLEDGE SOURCES
# These are fetched once at startup and stored in memory.
# ─────────────────────────────────────────────
KNOWLEDGE_SOURCES = [
    {
        "name": "MagicBricks - Real Estate Guide",
        "url": "https://www.magicbricks.com/blog/real-estate-terms-glossary/115454.html",
        "description": "Comprehensive glossary of Indian real estate terms"
    },
    {
        "name": "99acres - Property Buying Guide",
        "url": "https://www.99acres.com/articles/guide-to-buying-property-in-india.html",
        "description": "Step-by-step guide to buying property in India"
    },
    {
        "name": "Housing.com - RERA Guide",
        "url": "https://housing.com/news/rera-real-estate-regulatory-authority/",
        "description": "Complete RERA guide for homebuyers"
    }
]

# Global variable to store scraped knowledge
knowledge_base = {}

def scrape_website(url: str, timeout: int = 10) -> str:
    """
    Scrapes plain text from a URL using BeautifulSoup.
    Returns cleaned text or an empty string on failure.
    """
    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; RealEstateBot/1.0)"}
        response = httpx.get(url, headers=headers, timeout=timeout, follow_redirects=True)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")

        # Remove script/style tags to get clean text
        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()

        text = soup.get_text(separator="\n", strip=True)
        # Limit to ~3000 chars to stay within Groq token limits
        return text[:3000]
    except Exception as e:
        print(f"⚠️  Could not scrape {url}: {e}")
        return ""


# ─────────────────────────────────────────────
# STARTUP: Load knowledge base from websites
# ─────────────────────────────────────────────
@app.on_event("startup")
async def load_knowledge_base():
    """Scrape all pre-defined real estate websites on server startup."""
    print("🏠 Loading real estate knowledge base...")
    for source in KNOWLEDGE_SOURCES:
        print(f"  Fetching: {source['url']}")
        content = scrape_website(source["url"])
        knowledge_base[source["name"]] = {
            "url": source["url"],
            "description": source["description"],
            "content": content if content else source["description"]  # fallback
        }
    print(f"✅ Knowledge base loaded with {len(knowledge_base)} sources.")


# ─────────────────────────────────────────────
# Pydantic models for request/response
# ─────────────────────────────────────────────
class ChatRequest(BaseModel):
    question: str
    chat_history: list[dict] = []  # Previous messages for context


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]
    model_used: str


# ─────────────────────────────────────────────
# Build the system prompt with injected knowledge
# ─────────────────────────────────────────────
def build_system_prompt() -> str:
    """
    Constructs a system prompt that includes scraped real estate content.
    This is the 'RAG' (Retrieval Augmented Generation) step.
    """
    knowledge_text = ""
    for name, data in knowledge_base.items():
        knowledge_text += f"\n\n--- SOURCE: {name} ({data['url']}) ---\n"
        knowledge_text += data["content"]

    return f"""You are a knowledgeable and friendly Real Estate AI Assistant specializing in Indian real estate.
You help users understand property buying, legal terms, RERA regulations, stamp duty, carpet area, 
home loans, and all aspects of Indian real estate.

Use the following real estate knowledge to answer questions accurately:
{knowledge_text}

Guidelines:
- Answer clearly and concisely in simple language
- Use bullet points for lists of documents or steps
- Always mention relevant Indian laws or regulations when applicable
- If unsure, say so honestly — don't make up data
- Format currency in Indian style (₹ lakhs/crores)
- Be helpful and encouraging to first-time homebuyers
"""


# ─────────────────────────────────────────────
# API ENDPOINTS
# ─────────────────────────────────────────────

@app.get("/status")
async def get_status():
    """
    Health check endpoint.
    Returns server status and knowledge base info.
    """
    return {
        "status": "online",
    "model": "llama-3.1-8b-instant",
    "knowledge_sources": len(knowledge_base),
        
        
        "sources": [
            {"name": name, "url": data["url"]}
            for name, data in knowledge_base.items()
        ]
    }


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint.
    Accepts a user question + chat history, returns AI answer + sources.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # Build message history for Groq (multi-turn conversation)
    messages = [{"role": "system", "content": build_system_prompt()}]

    # Add previous chat history for context
    for msg in request.chat_history[-6:]:  # Last 6 messages to stay within limits
        if msg.get("role") in ["user", "assistant"]:
            messages.append({"role": msg["role"], "content": msg["content"]})

    # Add the current user question
    messages.append({"role": "user", "content": request.question})

    try:
        # Call Groq API with Llama 3
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            max_tokens=800,
            temperature=0.7,
        )

        answer = response.choices[0].message.content

        # Return the sources used (all pre-loaded sources are considered relevant)
        sources = [
            {"name": name, "url": data["url"], "description": data["description"]}
            for name, data in knowledge_base.items()
        ]

        return ChatResponse(
            answer=answer,
            sources=sources,
            model_used="llama-3.1-8b-instant (Groq)"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API error: {str(e)}")


# ─────────────────────────────────────────────
# Run server (for local development)
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
