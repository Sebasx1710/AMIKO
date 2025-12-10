/* AMIKO v2 - Psych style (Mock) 
   Features:
   - Single response (no duplicates)
   - Typing animation
   - Sounds (send/receive)
   - Vibration on send
   - LocalStorage conversation memory (persist & restore)
   - Dark mode toggle
   - Bot name editable
   - Avatar per-emotion & small avatar in bot bubble
   - Emojis auto-inserted for history
   - Export / download transcript
   - Decorative intro message + fade animation
*/

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
const micBtn = document.getElementById("micBtn");

/* 👇 fondo psicológico aleatorio en cada recarga */
const bgDecor = document.getElementById("bgDecor");
const BG_THEMES = ["bg-aurora", "bg-clouds", "bg-sunset", "bg-soft-mist"];

if (bgDecor) {
  const theme = BG_THEMES[Math.floor(Math.random() * BG_THEMES.length)];
  bgDecor.classList.add(theme);
}

let conversation = [];
const STORAGE_KEY = "amiko_conversation_v2";
const SALUDO_INICIAL = "Hola, soy Amiko 😊 ¿En qué puedo ayudarte hoy?";

/* -------------------------
   UTILITIES
-------------------------*/
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
    renderHistoryList();
  } catch (e) {
    console.warn("No se pudo guardar en localStorage", e);
  }
}

function restore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    conversation = JSON.parse(raw);
    chatBox.innerHTML = "";
    conversation.forEach(m => renderMessage(m.role, m.text, false));
    scrollToBottom();
  } catch (e) {
    console.warn("Error restaurando conversación", e);
  }
}

function addToConversation(role, text) {
  const item = { role, text, timestamp: Date.now() };
  conversation.push(item);
  persist();
}

function scrollToBottom() {
  if (!chatBox) return;
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* -------------------------
   SOUNDS & VIBRATION
-------------------------*/
function playSend() {
  if (sendSound) {
    try { sendSound.currentTime = 0; sendSound.play(); } catch {}
  }
  if (autovibe && autovibe.checked && navigator.vibrate) navigator.vibrate(40);
}

function playReceive() {
  if (receiveSound) {
    try { receiveSound.currentTime = 0; receiveSound.play(); } catch {}
  }
}

/* -------------------------
   TYPING INDICATOR
-------------------------*/
function showTyping(on = true) {
  if (typingIndicator) typingIndicator.style.display = on ? "flex" : "none";
}

/* -------------------------
   RENDER MESSAGE
-------------------------*/
function renderMessage(role, text, save = true) {
  if (!chatBox) return;

  const wrapper = document.createElement("div");
  wrapper.className = `bubble ${role} fadeIn`;

  if (role === "bot") {
    const ava = document.createElement("img");
    ava.className = "bubble-ava";
    try { ava.src = "images/amiko_logo.png"; } catch {}
    wrapper.appendChild(ava);
  }

  const content = document.createElement("div");
  content.className = "bubble-content";
  content.textContent = text;
  wrapper.appendChild(content);

  chatBox.appendChild(wrapper);
  scrollToBottom();

  if (role === "bot") playReceive();
  else playSend();

  if (save) addToConversation(role, text);
}

/* -------------------------
   EMOTION DETECTION
-------------------------*/
function detectEmotion(text) {
  const t = (text || "").toLowerCase();
  if (!t) return "neutral";
  if (t.includes("triste") || t.includes("deprim") || t.includes("llor")) return "sad";
  if (t.includes("ansio") || t.includes("estres") || t.includes("nervi")) return "stressed";
  if (t.includes("feliz") || t.includes("content") || t.includes("bien")) return "happy";
  return "neutral";
}

/* -------------------------
   MOCK RESPONSES
-------------------------*/
function getMockResponse(userMessage) {
  const responses = [
    "Hola, ¿cómo estás? 😊",
    "Cuéntame más sobre eso...",
    "Interesante, ¿puedes explicar un poco más?",
    "¡Eso suena importante para ti! 😌",
    "Lo siento, no entendí muy bien, ¿puedes repetir?"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

/* -------------------------
   SEND MESSAGE (MOCK)
-------------------------*/
let sending = false;

async function sendMessage() {
  if (sending) return;

  const text = (userInput?.value || "").trim();
  if (!text) return;

  renderMessage("user", text, true);
  if (userInput) userInput.value = "";
  playSend();
  showTyping(true);

  const waitTime = Math.min(2000, 600 + text.length * 8);
  sending = true;

  try {
    await new Promise(r => setTimeout(r, waitTime));
    const reply = getMockResponse(text);

    try {
      const emo = detectEmotion(text);
      if (avatarImg) avatarImg.src = `images/amiko_${emo}.png`;
      if (avatarMini) avatarMini.src = avatarImg?.src || "";
    } catch {}

    showTyping(false);
    renderMessage("bot", reply, true);

  } catch (err) {
    showTyping(false);
    renderMessage("bot", "Hubo un error procesando tu mensaje.", true);
  }

  sending = false;
}

/* -------------------------
   HISTORY + EXPORT
-------------------------*/
function renderHistoryList() {
  if (!historyList) return;
  historyList.innerHTML = "";

  for (let i = conversation.length - 1; i >= 0; i--) {
    const it = conversation[i];
    const div = document.createElement("div");
    div.className = "history-item";
    const time = new Date(it.timestamp).toLocaleString();
    div.textContent = `${time} · ${it.role === "user" ? "🟦" : "🟪"} ${it.text.slice(0, 80)}`;
    historyList.appendChild(div);
  }
}

function downloadTranscript() {
  const lines = conversation.map(
    it => `[${new Date(it.timestamp).toLocaleString()}] ${it.role.toUpperCase()}: ${it.text}`
  );
  const blob = new Blob([lines.join("\n\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `amiko_transcript_${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/* -------------------------
   CLEAR CONVERSATION
-------------------------*/
function clearConversation() {
  if (!confirm("¿Seguro que deseas borrar la conversación?")) return;
  conversation = [];
  persist();
  if (chatBox) chatBox.innerHTML = "";
  renderMessage("bot", SALUDO_INICIAL, true);
}

/* -------------------------
   CLEAR HISTORY
-------------------------*/
function clearHistoryList() {
  if (!confirm("¿Eliminar historial emocional?")) return;
  if (historyList) historyList.innerHTML = "";
  localStorage.removeItem(STORAGE_KEY);
}

/* -------------------------
   AUTH MODAL
-------------------------*/
function openAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("show");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("show");
}

/* -------------------------
   MICRÓFONO
-------------------------*/
let recognition;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "es-ES";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    userInput.value = text;
    if (text.trim().length > 0) sendMessage();
  };
}

micBtn?.addEventListener("click", () => {
  if (recognition) recognition.start();
});

/* -------------------------
   UI EVENTS
-------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  restore();

  chatBox.innerHTML = "";
  renderMessage("bot", SALUDO_INICIAL, true);

  sendBtn?.addEventListener("click", sendMessage);
  userInput?.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

  emoBtns.forEach(b => b.addEventListener("click", () => {
    const emo = b.dataset.emo;
    try {
      if (avatarImg) avatarImg.src = `images/amiko_${emo}.png`;
      if (avatarMini) avatarMini.src = avatarImg?.src || "";
    } catch {}
  }));

  downloadTranscriptBtn?.addEventListener("click", downloadTranscript);
  darkToggle?.addEventListener("click", () => document.body.classList.toggle("dark"));

  botNameInput?.addEventListener("input", () => {
    const brand = document.getElementById("brandTitle");
    if (brand) brand.textContent = botNameInput.value || "AMIKO";
  });

  document.getElementById("clearAll")?.addEventListener("click", clearConversation);
  document.getElementById("clearHistory")?.addEventListener("click", clearHistoryList);

  document.getElementById("guestBtn")?.addEventListener("click", closeAuthModal);
  document.getElementById("loginBtn")?.addEventListener("click", closeAuthModal);
  document.getElementById("registerBtn")?.addEventListener("click", closeAuthModal);

  renderHistoryList();
  if (avatarMini && avatarImg) avatarMini.src = avatarImg.src || "images/amiko_logo.png";
});

/* ===============================
   ✅ FIX REAL: FRASES ROTANDO
=============================== */
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const sound = document.getElementById("introSound");
  const phraseEl = document.getElementById("phrase");
  const enterBtn = document.getElementById("enterBtn");
  const loader = document.getElementById("loader");

  const frases = [
    "Hoy es un buen día para escucharte.",
    "Tu bienestar es importante.",
    "Respira... estoy contigo.",
    "Un paso a la vez.",
    "No tienes que cargar todo solo.",
    "Aquí estoy, escucha lo que sientes."
  ];

  let indexFrase = 0;

  function rotarFrase() {
    phraseEl.style.opacity = 0;
    setTimeout(() => {
      phraseEl.textContent = frases[indexFrase];
      phraseEl.style.opacity = 1;
      indexFrase = (indexFrase + 1) % frases.length;
    }, 300);
  }

  rotarFrase();
  setInterval(rotarFrase, 2200);

  const canvas = document.getElementById("particles");
  const ctx = canvas.getContext("2d");
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  const stars = [];
  const rain = [];

  for (let i = 0; i < 80; i++)
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 1
    });

  for (let i = 0; i < 120; i++)
    rain.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 4 + 4
    });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
    });

    ctx.strokeStyle = "rgba(200,200,255,.5)";
    rain.forEach(r => {
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x, r.y + 12);
      ctx.stroke();
      r.y += r.speed;
      if (r.y > canvas.height) {
        r.y = -20;
        r.x = Math.random() * canvas.width;
      }
    });

    requestAnimationFrame(animate);
  }
  animate();

  setTimeout(() => {
    loader.style.display = "none";
    enterBtn.style.display = "block";
    enterBtn.classList.add("show");
    if (sound) {
      sound.volume = 0.4;
      sound.play().catch(() => {});
    }
  }, 3000);

  enterBtn.addEventListener("click", () => {
    splash.classList.add("fade-out");
    setTimeout(() => (splash.style.display = "none"), 1400);
    openAuthModal();
  });
});
