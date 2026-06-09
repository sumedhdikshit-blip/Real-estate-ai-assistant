/**
 * PropAI — Real Estate Assistant
 * script.js: Handles all frontend logic
 * - Chat UI rendering
 * - API calls to FastAPI backend
 * - Chat history management
 * - Mobile sidebar toggle
 */

// ─────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────
const API_BASE = "http://localhost:8000"; // Change to your server address if deployed

// ─────────────────────────────────────────────
// DOM REFERENCES
// ─────────────────────────────────────────────
const chatMessages   = document.getElementById("chatMessages");
const welcomeScreen  = document.getElementById("welcomeScreen");
const userInput      = document.getElementById("userInput");
const sendBtn        = document.getElementById("sendBtn");
const clearBtn       = document.getElementById("clearBtn");
const menuToggle     = document.getElementById("menuToggle");
const sidebar        = document.querySelector(".sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const statusDot      = document.getElementById("statusDot");
const statusText     = document.getElementById("statusText");
const sourceList     = document.getElementById("sourceList");

// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
let chatHistory = []; // Stores {role, content} objects for multi-turn context
let isLoading   = false;

// ─────────────────────────────────────────────
// INIT: Check backend status on page load
// ─────────────────────────────────────────────
async function checkStatus() {
  try {
    const res  = await fetch(`${API_BASE}/status`);
    const data = await res.json();

    // Update status indicator
    statusDot.classList.add("online");
    statusText.textContent = "Online";

    // Render knowledge sources in sidebar
    renderSourceList(data.sources || []);
  } catch (err) {
    statusDot.classList.add("offline");
    statusText.textContent = "Offline";
    sourceList.innerHTML = `
      <li class="source-item" style="color: #cf6679;">
        Cannot reach backend. Start the FastAPI server.
      </li>`;
  }
}

/**
 * Renders the list of knowledge sources in the sidebar.
 * @param {Array} sources - Array of {name, url} objects
 */
function renderSourceList(sources) {
  sourceList.innerHTML = sources.map(src => `
    <li class="source-item">
      <a href="${src.url}" target="_blank" rel="noopener">${src.name}</a>
      <span class="src-desc">${src.description || src.url}</span>
    </li>
  `).join("");
}

// ─────────────────────────────────────────────
// SEND MESSAGE
// ─────────────────────────────────────────────
async function sendMessage(text) {
  const question = (text || userInput.value).trim();
  if (!question || isLoading) return;

  // Clear input & hide welcome screen
  userInput.value = "";
  autoResize();
  hideWelcome();

  // Render user's message
  appendMessage("user", question);

  // Add to history
  chatHistory.push({ role: "user", content: question });

  // Show loading indicator
  const typingId = showTypingIndicator();
  setLoading(true);

  try {
    // POST to /chat endpoint
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question,
        chat_history: chatHistory.slice(-10) // Send last 10 messages for context
      })
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Server error");
    }

    const data = await response.json();

    // Remove typing indicator
    removeTypingIndicator(typingId);

    // Render AI response
    appendAIMessage(data.answer, data.sources, data.model_used);

    // Add AI response to history
    chatHistory.push({ role: "assistant", content: data.answer });

  } catch (err) {
    removeTypingIndicator(typingId);
    appendErrorMessage(err.message);
  } finally {
    setLoading(false);
  }
}

// ─────────────────────────────────────────────
// RENDER HELPERS
// ─────────────────────────────────────────────

/**
 * Appends a user message bubble to the chat.
 */
function appendMessage(role, content) {
  const row = document.createElement("div");
  row.className = `message-row ${role}`;
  row.innerHTML = `
    <div class="avatar ${role}">
      <i class="ph-bold ${role === "user" ? "ph-user" : "ph-robot"}"></i>
    </div>
    <div class="bubble ${role}">${escapeHtml(content)}</div>
  `;
  chatMessages.appendChild(row);
  scrollToBottom();
}

/**
 * Appends the AI's response bubble with formatted text + sources.
 * @param {string} answer - The AI's response text
 * @param {Array}  sources - Array of source objects
 * @param {string} model - Model name string
 */
function appendAIMessage(answer, sources, model) {
  const row = document.createElement("div");
  row.className = "message-row ai";

  // Format the answer: convert markdown-ish bold & bullets to HTML
  const formattedAnswer = formatAnswer(answer);

  // Build sources HTML
  const sourcesHtml = sources && sources.length ? `
    <div class="sources-section">
      <div class="sources-label"><i class="ph-bold ph-books"></i> Sources</div>
      <div class="sources-chips">
        ${sources.map(s => `
          <a class="source-chip" href="${s.url}" target="_blank" rel="noopener">
            <i class="ph-bold ph-link"></i>${s.name}
          </a>
        `).join("")}
      </div>
    </div>
  ` : "";

  const modelBadge = model ? `
    <div class="model-badge">
      <i class="ph-bold ph-cpu"></i> ${model}
    </div>
  ` : "";

  row.innerHTML = `
    <div class="avatar ai">
      <i class="ph-bold ph-robot"></i>
    </div>
    <div class="bubble ai">
      <div class="answer-text">${formattedAnswer}</div>
      ${sourcesHtml}
      ${modelBadge}
    </div>
  `;

  chatMessages.appendChild(row);
  scrollToBottom();
}

/**
 * Appends a red error bubble.
 */
function appendErrorMessage(msg) {
  const row = document.createElement("div");
  row.className = "message-row ai";
  row.innerHTML = `
    <div class="avatar ai"><i class="ph-bold ph-warning"></i></div>
    <div class="bubble error">
      <strong>Error:</strong> ${escapeHtml(msg)}
      <br><small>Make sure the FastAPI server is running on port 8000.</small>
    </div>
  `;
  chatMessages.appendChild(row);
  scrollToBottom();
}

/**
 * Shows animated typing dots while waiting for the API.
 * Returns a unique ID to remove the indicator later.
 */
function showTypingIndicator() {
  const id  = `typing-${Date.now()}`;
  const row = document.createElement("div");
  row.className = "message-row ai";
  row.id = id;
  row.innerHTML = `
    <div class="avatar ai"><i class="ph-bold ph-robot"></i></div>
    <div class="bubble ai">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  chatMessages.appendChild(row);
  scrollToBottom();
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

// ─────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────

/** Hides welcome screen once chat starts */
function hideWelcome() {
  if (welcomeScreen) {
    welcomeScreen.style.display = "none";
  }
}

/** Scrolls chat to the latest message */
function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

/** Disables/enables input while loading */
function setLoading(state) {
  isLoading = state;
  sendBtn.disabled = state;
  userInput.disabled = state;
  sendBtn.innerHTML = state
    ? `<i class="ph-bold ph-circle-notch" style="animation: spin 1s linear infinite;"></i>`
    : `<i class="ph-bold ph-paper-plane-tilt"></i>`;
}

/** Auto-resize textarea as user types */
function autoResize() {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
}

/** Escape HTML special characters to prevent XSS */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Basic markdown → HTML formatter for AI responses.
 * Converts **bold**, bullet lists, and newlines.
 */
function formatAnswer(text) {
  return text
    // Bold: **text** → <strong>
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Bullet points
    .replace(/^[-•]\s+(.+)$/gm, "<li>$1</li>")
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/gs, match => `<ul>${match}</ul>`)
    // Numbered lists
    .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>")
    // Paragraph breaks (double newline)
    .replace(/\n{2,}/g, "</p><p>")
    // Single newline
    .replace(/\n/g, "<br>")
    // Wrap in paragraph
    .replace(/^(?!<[uop])/m, "<p>")
    + "</p>";
}

/** Clear all chat messages and history */
function clearChat() {
  chatHistory = [];
  // Remove all message rows but keep welcome screen
  const rows = chatMessages.querySelectorAll(".message-row");
  rows.forEach(r => r.remove());
  // Re-show welcome screen
  if (welcomeScreen) welcomeScreen.style.display = "flex";
}

// ─────────────────────────────────────────────
// EVENT LISTENERS
// ─────────────────────────────────────────────

// Send on button click
sendBtn.addEventListener("click", () => sendMessage());

// Send on Enter (Shift+Enter = newline)
userInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Auto-resize textarea
userInput.addEventListener("input", autoResize);

// Clear chat
clearBtn.addEventListener("click", clearChat);

// Quick question chips (sidebar)
document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    const q = chip.dataset.q;
    if (q) sendMessage(q);
    // Close mobile sidebar
    sidebar.classList.remove("open");
    sidebarOverlay.classList.remove("active");
  });
});

// Mobile sidebar toggle
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("open");
  sidebarOverlay.classList.toggle("active");
});
sidebarOverlay.addEventListener("click", () => {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("active");
});

// CSS spin animation for loading icon
const style = document.createElement("style");
style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
document.head.appendChild(style);

// ─────────────────────────────────────────────
// STARTUP
// ─────────────────────────────────────────────
checkStatus(); // Check backend health and load sources on page load
