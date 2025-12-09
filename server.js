import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { OpenAI } from "openai";

// __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, "public")));

// Ruta principal → index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Cliente OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint del chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message, personality } = req.body;

    if (!message) {
      return res.status(400).json({
        reply: "No enviaste ningún mensaje.",
      });
    }

    const prompt = `
Eres AMIKO, un asistente emocional empático. Tu personalidad es: ${personality}.
Da apoyo emocional, comprensión y contención sana.
Habla cálido, breve y humano.
No reemplazas a un psicólogo profesional.

Usuario: ${message}
AMIKO:
    `;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      max_output_tokens: 150,
    });

    const reply = response.output_text || "Lo siento, no pude responder.";

    res.json({ reply });

  } catch (error) {
    console.error("❌ ERROR DE OPENAI:", error?.response?.data || error.message);

    res.status(500).json({
      reply: "Hubo un error procesando tu mensaje.",
      error: error.message,
    });
  }
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 AMIKO server running on http://localhost:${PORT}`);
});
