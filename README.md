# 🏠 PropAI — AI Powered Real Estate Assistant

PropAI is an intelligent Real Estate AI Assistant built to simplify Indian real estate concepts using natural language conversations.

The application leverages Groq's ultra-fast Llama 3.1 model, FastAPI, and a modern web interface to provide instant answers to property-related questions. Whether users need information about RERA regulations, home loans, stamp duty, carpet area calculations, or investment opportunities, PropAI delivers contextual and source-backed responses.

---

## 🚀 Features

### 🤖 AI-Powered Question Answering

Ask real estate questions in plain English and receive accurate, contextual answers.

### 🏘️ Real Estate Knowledge Assistant

Get insights about:

* RERA Regulations
* Property Buying Process
* Home Loans
* Stamp Duty & Registration
* Property Investment
* Carpet Area vs Built-Up Area
* Property Documentation
* Tax Benefits on Home Loans

### 💬 Multi-Turn Conversations

Maintains conversational context for a more natural chat experience.

### ⚡ Lightning Fast Responses

Powered by Groq's high-performance inference infrastructure.

### 📚 Source Attribution

Responses include information sources to improve transparency and trust.

### 🎨 Modern User Interface

Responsive frontend built using:

* HTML
* CSS
* JavaScript

Works seamlessly across desktop and mobile devices.

---

## 🏗️ System Architecture

User Query
↓
Frontend (HTML/CSS/JS)
↓
FastAPI Backend
↓
Prompt Processing Layer
↓
Groq Llama 3.1 Model
↓
Knowledge Sources
↓
AI Response with Sources

---

## 🛠️ Technology Stack

| Component              | Technology                |
| ---------------------- | ------------------------- |
| Backend                | FastAPI                   |
| AI Model               | Groq Llama 3.1 8B Instant |
| Programming Language   | Python                    |
| Frontend               | HTML, CSS, JavaScript     |
| Web Scraping           | BeautifulSoup4            |
| HTTP Client            | HTTPX                     |
| Environment Management | Python Dotenv             |

---

## 📂 Project Structure

```text
PropAI/
│
├── api.py
├── scraper.py
├── requirements.txt
├── .env
│
├── static/
│   ├── css/
│   ├── js/
│   └── images/
│
├── templates/
│
├── knowledge/
│
└── README.md
```

## 📸 Application Preview

### Home Screen

![Home Screen](images_project-demo.png)

### Chat Interface

![Chat Interface](image_project_demo_2.png)

---

## 💬 Example Questions

* What is RERA and why is it important?
* What documents are required for purchasing a flat?
* What is the difference between carpet area and built-up area?
* How is stamp duty calculated in Maharashtra?
* What are the tax benefits of a home loan?
* Is Thane a good location for real estate investment?
* What should I verify before buying an under-construction property?

---

## 📡 API Documentation

### Health Check Endpoint

```http
GET /health
```

Response:

```json
{
  "status": "healthy"
}
```

### Chat Endpoint

```http
POST /chat
```

Request:

```json
{
  "question": "What is RERA?"
}
```

Response:

```json
{
  "answer": "RERA stands for Real Estate Regulatory Authority...",
  "sources": [
    "Housing.com",
    "MagicBricks"
  ]
}
```

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/PropAI.git

cd PropAI
```

### Create Virtual Environment

```bash
python -m venv venv
```

Activate environment:

Windows

```bash
venv\Scripts\activate
```

Linux/Mac

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_api_key_here
```

---

## ▶️ Run Application

Start FastAPI server:

```bash
uvicorn api:app --reload
```

Application will be available at:

```text
http://127.0.0.1:8000
```

---

## 📚 Knowledge Sources

PropAI gathers information from trusted Indian real estate platforms:

* MagicBricks
* 99acres
* Housing.com
* Government RERA Resources

---

## 🔮 Future Enhancements

* Property Price Prediction
* Vector Database Integration
* Retrieval Augmented Generation (RAG)
* Voice Assistant Support
* Multi-Language Queries
* Property Comparison Engine
* Real-Time Market Trends
* RERA Project Verification
* Property Recommendation System

---

## 🤝 Contributing

Contributions are welcome.

To contribute:

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Sumedh Dikshit**

AI & Python Developer

Focused on building intelligent applications using:

* FastAPI
* Large Language Models (LLMs)
* RAG Architectures
* Generative AI
* Backend Engineering

⭐ If you found this project useful, consider giving it a star on GitHub.
