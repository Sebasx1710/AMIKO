/* AMIKO v2 - Psych style (Mock) 
   Features added:
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

let conversation = [];
const STORAGE_KEY = "amiko_conversation_v2";

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
  const wrapper = document.createElement("div");
  wrapper.className = `bubble ${role} fadeIn`;

  if (role === "bot") {
    const ava = document.createElement("img");
    ava.className = "bubble-ava";
    try { ava.src = "/images/amiko_logo.png"; } catch {}
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
    "¡Eso suena divertido! 😎",
    "Lo siento, no entendí muy bien, ¿puedes repetir?"
  ];
  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex];
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
    // Simular "tiempo de pensamiento"
    await new Promise(r => setTimeout(r, waitTime));

    const reply = getMockResponse(text);

    // Asignar avatar de emoción de forma segura
    try {
      const emo = detectEmotion(text);
      if (avatarImg) avatarImg.src = `/images/amiko_${emo}.png`;
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
  chatBox.innerHTML = "";
  renderMessage("bot", "Conversación borrada.", true);
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
   UI EVENTS
-------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  restore();

  if (!conversation.length) {
    renderMessage("bot", "Hola, soy Amiko 😊 ¿En qué puedo ayudarte hoy?", true);
  }

  sendBtn?.addEventListener("click", sendMessage);
  userInput?.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

  emoBtns.forEach(b => b.addEventListener("click", () => {
    const emo = b.dataset.emo;
    try {
      if (avatarImg) avatarImg.src = `/images/amiko_${emo}.png`;
      if (avatarMini) avatarMini.src = avatarImg?.src || "";
    } catch {}
    appendStatusNotice(`Estado visualizado: ${emo}`);
  }));

  downloadTranscriptBtn?.addEventListener("click", downloadTranscript);

  darkToggle?.addEventListener("click", () => document.body.classList.toggle("dark"));

  botNameInput?.addEventListener("input", () => {
    const brand = document.getElementById("brandTitle");
    if (brand) brand.textContent = botNameInput.value || "AMIKO";
  });

  document.getElementById("clearAll")?.addEventListener("click", clearConversation);
  document.getElementById("clearHistory")?.addEventListener("click", clearHistoryList);

  renderHistoryList();
  if (avatarMini && avatarImg) avatarMini.src = avatarImg.src;
});

/* -------------------------
   STATUS BUBBLE
-------------------------*/
function appendStatusNotice(text) {
  const div = document.createElement("div");
  div.className = "bubble bot fadeIn";
  const span = document.createElement("div");
  span.className = "bubble-content";
  span.textContent = text;
  div.appendChild(span);
  chatBox.appendChild(div);
  scrollToBottom();
}

/* -------------------------
   SPLASH SCREEN
-------------------------*/
window.addEventListener("load", () => {
  const splash = document.getElementById("splash");
  const sound = document.getElementById("introSound");
  const phraseEl = document.getElementById("phrase");
  const enterBtn = document.getElementById("enterBtn");

  const frases = [
    "Hoy es un buen día para escucharte.",
    "Tu bienestar es importante.",
    "Respira... estoy contigo.",
    "Un paso a la vez.",
    "No tienes que cargar todo solo.",
    "Aquí estoy, escucha lo que sientes."
  ];

  const index = new Date().getDate() % frases.length;
  if (phraseEl) phraseEl.textContent = frases[index];

  const lastVisit = localStorage.getItem("amiko_last_visit");
  const now = Date.now();
  if (!lastVisit || now - lastVisit > 5000) {
    if (sound) {
      sound.volume = 0.4;
      sound.play().catch(() => {});
    }
  }
  localStorage.setItem("amiko_last_visit", now.toString());

  const canvas = document.getElementById("particles");
  const ctx = canvas?.getContext("2d");
  if (canvas && ctx) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 0.6,
        dy: (Math.random() - 0.5) * 0.6
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(255,255,255,.7)";
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  function closeSplash() {
    if (splash) splash.classList.add("fade-out");
    setTimeout(() => { if (splash) splash.style.display = "none"; }, 1500);
  }

  enterBtn?.addEventListener("click", closeSplash);

  let frasesIndex = 0;
  setInterval(() => {
    if (!phraseEl) return;
    phraseEl.style.opacity = 0;
    setTimeout(() => {
      phraseEl.textContent = frases[frasesIndex % frases.length];
      phraseEl.style.opacity = 1;
      frasesIndex++;
    }, 500);
  }, 1800);
});
