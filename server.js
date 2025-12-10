import "dotenv/config";
import express from "express";
import cors from "cors";
import { OpenAI } from "openai";

const app = express();

// ---------------------------
// MIDDLEWARES
// ---------------------------
app.use(express.json());
app.use(cors({
  origin: "*",         // Permitir que AMIKO frontend se conecte sin bloqueos
  methods: "GET,POST",
}));

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

    // Validación básica
    if (!message) {
      return res.status(400).json({
        reply: "No enviaste ningún mensaje.",
      });
    }

    // Prompt psicológico
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

    // Llamada a OpenAI
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      max_output_tokens: 180,
    });

    const reply = response.output_text || "Lo siento, no pude generar una respuesta.";

    // Enviar respuesta al frontend
    res.json({ reply });

  } catch (error) {
    console.error("❌ ERROR DE OPENAI:", error);

    // Respuesta de error segura
    res.status(500).json({
      reply: "Lo siento, ocurrió un error al procesar tu mensaje.",
    });
  }
});

// ---------------------------
// INICIAR SERVIDOR
// ---------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 AMIKO server running on port ${PORT}`);
});
