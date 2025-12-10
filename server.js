import "dotenv/config";
import express from "express";
import cors from "cors";
import { OpenAI } from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Necesario para obtener __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------------
// MIDDLEWARES
// ---------------------------
app.use(express.json());
app.use(cors({
  origin: "*",         // Permitir que AMIKO frontend se conecte sin bloqueos
  methods: "GET,POST",
}));

// Permitir servir archivos estáticos (index.html, css, js, images, etc.)
app.use(express.static(__dirname));

// ---------------------------
// CLIENTE OPENAI
// ---------------------------
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ ERROR: Falta la variable OPENAI_API_KEY en el archivo .env");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------------------------
// ENDPOINT DEL CHAT IA
// ---------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const { message, personality } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "No enviaste ningún mensaje.",
      });
    }

    const prompt = `
Eres AMIKO, un asistente emocional empático y con enfoque psicológico.
Tu personalidad es: ${personality || "empático"}.

Reglas:
- Responde con calidez, empatía y contención.
- Sé breve pero profundo.
- Evita respuestas clínicas o diagnósticos.
- Nunca reemplazas a un psicólogo.
- Habla como un acompañante emocional humano.

Usuario: ${message}
AMIKO:
    `;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      max_output_tokens: 180,
    });

    const reply = response.output_text || "Lo siento, no pude generar una respuesta.";

    res.json({ reply });

  } catch (error) {
    console.error("❌ ERROR DE OPENAI:", error);

    res.status(500).json({
      reply: "Lo siento, ocurrió un error al procesar tu mensaje.",
    });
  }
});

// ---------------------------
// SERVIR INDEX.HTML
// ---------------------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ---------------------------
// INICIAR SERVIDOR
// ---------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 AMIKO server running on port ${PORT}`);
});
