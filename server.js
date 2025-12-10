import "dotenv/config";
import express from "express";
import cors from "cors";
import { OpenAI } from "openai";

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Cliente OpenAI
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // CLAVE OCULTA EN RENDER
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
    console.error("❌ ERROR DE OPENAI:", error?.message);

    res.status(500).json({
      reply: "Hubo un error procesando tu mensaje.",
    });
  }
});

// Puerto automático de Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 AMIKO server running on port ${PORT}`);
});
