# 🏠 PropAI — Real Estate AI Assistant

PropAI is an AI-powered Real Estate Assistant designed to help users understand Indian real estate concepts through natural language conversations.

Built using FastAPI, Groq's Llama 3.1 model, and a modern web interface, PropAI can answer questions related to RERA regulations, property buying, stamp duty, home loans, carpet area, and real estate investment.

---

## 🚀 Key Features

* AI-powered Real Estate Question Answering
* Groq Llama 3.1 Integration
* FastAPI REST API Backend
* Multi-turn Conversational Chat
* Real Estate Knowledge Source Integration
* Source Attribution for Responses
* Responsive HTML, CSS & JavaScript Frontend

---

## 🛠️ Technology Stack

| Component    | Technology                |
| ------------ | ------------------------- |
| Backend      | FastAPI                   |
| AI Model     | Groq Llama 3.1 8B Instant |
| Language     | Python                    |
| Frontend     | HTML, CSS, JavaScript     |
| Web Scraping | BeautifulSoup4, HTTPX     |

---

## 📸 Application Preview

![Home Screen](images_project-demo.png)

![Chat Interface](image_project_demo_2.png)

---

## 💬 Example Queries

* What is RERA and why is it important?
* What documents are required to purchase a flat?
* What is the difference between carpet area and built-up area?
* How is stamp duty calculated in Maharashtra?
* Is Thane a good location for real estate investment?

---

## ⚙️ Getting Started

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
GROQ_API_KEY=your_api_key_here
```

Start the application:

```bash
uvicorn api:app --reload
```

Open `index.html` in your browser.

---

## 📚 Knowledge Sources

* MagicBricks
* 99acres
* Housing.com

---

## 👨‍💻 Author

**Sumedh Dikshit**
