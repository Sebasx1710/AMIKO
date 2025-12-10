/* AMIKO v2 - Psych style (Mock) */

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const typingIndicator = document.getElementById("typingIndicator");
const personaSel = document.getElementById("persona");
const avatarImg = document.getElementById("avatar");
const avatarMini = document.getElementById("avatarMini");
const emoBtns = document.querySelectorAll(".emo-btn");
const historyList = document.getElementById("historyList");
const downloadTranscriptBtn = document.getElementById("downloadTranscript");
const darkToggle = document.getElementById("darkToggle");
const botNameInput = document.getElementById("botName");
const sendSound = document.getElementById("sendSound");
const receiveSound = document.getElementById("receiveSound");
const autovibe = document.getElementById("autovibe");

let conversation = [];
const STORAGE_KEY = "amiko_conversation_v2";

/* -------------------------
   UTILITIES
-------------------------*/
function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
  renderHistoryList();
}

function restore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  conversation = JSON.parse(raw);
  chatBox.innerHTML = "";
  conversation.forEach(m => renderMessage(m.role, m.text, false));
}

function addToConversation(role, text) {
  conversation.push({ role, text, timestamp: Date.now() });
  persist();
}

function playSend() {
  sendSound?.play();
  if (autovibe?.checked && navigator.vibrate) navigator.vibrate(40);
}

function playReceive() {
  receiveSound?.play();
}

function showTyping(on = true) {
  if (typingIndicator) typingIndicator.style.display = on ? "flex" : "none";
}

/* -------------------------
   RENDER MESSAGE
-------------------------*/
function renderMessage(role, text, save = true) {
  const wrapper = document.createElement("div");
  wrapper.className = `bubble ${role} fadeIn`;

  if (role === "bot") {
    const ava = document.createElement("img");
    ava.className = "bubble-ava";
    ava.src = "/images/amiko_logo.png";
    wrapper.appendChild(ava);
  }

  const content = document.createElement("div");
  content.className = "bubble-content";
  content.textContent = text;
  wrapper.appendChild(content);

  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;

  role === "bot" ? playReceive() : playSend();
  if (save) addToConversation(role, text);
}

/* -------------------------
   EMOTION DETECTION
-------------------------*/
function detectEmotion(text) {
  const t = text.toLowerCase();
  if (t.includes("triste")) return "sad";
  if (t.includes("estres")) return "stressed";
  if (t.includes("feliz")) return "happy";
  return "neutral";
}

/* -------------------------
   MOCK
-------------------------*/
function getMockResponse() {
  const r = [
    "Estoy contigo 😊",
    "Respira, todo va a estar bien.",
    "Cuéntame más...",
    "Te escucho."
  ];
  return r[Math.floor(Math.random() * r.length)];
}

/* -------------------------
   SEND MESSAGE
-------------------------*/
let sending = false;

async function sendMessage() {
  if (sending) return;
  const text = userInput.value.trim();
  if (!text) return;

  renderMessage("user", text);
  userInput.value = "";
  showTyping(true);
  sending = true;

  await new Promise(r => setTimeout(r, 900 + text.length * 10));

  const reply = getMockResponse(text);
  const emo = detectEmotion(text);
  avatarImg.src = `/images/amiko_${emo}.png`;
  avatarMini.src = avatarImg.src;

  showTyping(false);
  renderMessage("bot", reply);
  sending = false;
}

/* -------------------------
   UI EVENTS
-------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  restore();
  if (!conversation.length) {
    renderMessage("bot", "Hola, soy Amiko 😊");
  }

  sendBtn?.addEventListener("click", sendMessage);
  userInput?.addEventListener("keypress", e => e.key === "Enter" && sendMessage());

  darkToggle?.addEventListener("click", () => document.body.classList.toggle("dark"));

  botNameInput?.addEventListener("input", () => {
    const brand = document.getElementById("brandTitle");
    if (brand) brand.textContent = botNameInput.value || "AMIKO";
  });
});

/* -------------------------
   SPLASH + LOADER SYSTEM ✅ NUEVO
-------------------------*/
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const loader = document.getElementById("loader");
  const enterBtn = document.getElementById("enterBtn");
  const sound = document.getElementById("introSound");
  const phraseEl = document.getElementById("phrase");

  const frases = [
    "Hoy es un buen día para escucharte.",
    "Tu bienestar es importante.",
    "Respira... estoy contigo.",
    "Un paso a la vez.",
    "Aquí estoy para ti."
  ];

  phraseEl.textContent = frases[Math.floor(Math.random() * frases.length)];

  // 🔥 SIMULACIÓN DE CARGA REAL (3 SEGUNDOS)
  enterBtn.style.display = "none";

  setTimeout(() => {
    loader.style.opacity = "0";

    setTimeout(() => {
      loader.style.display = "none";
      enterBtn.style.display = "block";
      enterBtn.classList.add("show");

      sound.volume = 0.5;
      sound.play().catch(() => {});
    }, 500);

  }, 3000);

  enterBtn?.addEventListener("click", () => {
    splash.classList.add("fade-out");
    setTimeout(() => splash.style.display = "none", 1300);
  });

  let frasesIndex = 0;
  setInterval(() => {
    phraseEl.style.opacity = 0;
    setTimeout(() => {
      phraseEl.textContent = frases[frasesIndex % frases.length];
      phraseEl.style.opacity = 1;
      frasesIndex++;
    }, 500);
  }, 1800);
});
