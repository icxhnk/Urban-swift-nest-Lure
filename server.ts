import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, Modality } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Multi-turn Gemini Chat endpoint for Swift Conservation, Nest Box Placement & Acoustics
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model = "gemini-3.5-flash", systemInstruction } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const validModels = [
      "gemini-3.5-flash",
      "gemini-3.1-pro-preview",
      "gemini-3.1-flash-lite",
      "gemini-3.7-flash",
    ];
    const selectedModel = validModels.includes(model) ? model : "gemini-3.5-flash";

    const ai = getAi();

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const defaultSystem = `You are the Urban Swift Conservation & Bioacoustics Specialist ("Apus Expert").
Your expertise covers:
1. Common Swift (Apus apus) biology, migration patterns, and rapid urban nesting habitat loss.
2. Swift attraction call mechanics: Screaming party calls (5-8 kHz), duplex nest-cavity duets, begging chick calls, and banger prospecting behaviors.
3. Acoustic broadcast scheduling: Optimal dawn hours (sunrise - 30m to +2.5h) and dusk hours (sunset - 1.5h to +30m) when young non-breeders actively prospect.
4. Speaker placement: Mounting right next to the entrance hole (<15cm), aimed outward/downward, weatherproofing, avoiding disturbance to neighbors (targeted directional volume, ~70-80dB at 1m).
5. Artificial nest box specifications: Minimum dimensions (28x15x15 cm), entrance slot (65x30 mm oval or 65x28 mm rectangle), internal nest concave, orientation (N, NE, NW or shaded south under deep eaves), and height (minimum 4-5m with clear flight drop).
Provide concise, actionable, ornithologically accurate advice. Format with clean markdown, bullet points, and practical steps.`;

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction || defaultSystem,
        temperature: 0.7,
      },
    });

    const reply = response.text || "No response generated.";
    return res.json({ reply, model: selectedModel });
  } catch (error: any) {
    console.error("Chat error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate chat response.",
    });
  }
});

// Text-to-Speech endpoint using gemini-3.1-flash-tts-preview
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice = "Kore" } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text prompt is required for TTS." });
    }

    const ai = getAi();
    const validVoices = ["Puck", "Charon", "Kore", "Fenrir", "Zephyr"];
    const voiceName = validVoices.includes(voice) ? voice : "Kore";

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: "No audio data received from TTS model." });
    }

    return res.json({
      audio: base64Audio,
      sampleRate: 24000,
      mimeType: "audio/pcm;rate=24000",
    });
  } catch (error: any) {
    console.error("TTS error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate speech audio.",
    });
  }
});

// Image generation endpoint using gemini-3-pro-image-preview
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1", imageSize = "1K" } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required for image generation." });
    }

    const validSizes = ["512px", "1K", "2K", "4K"];
    const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];

    const selectedSize = validSizes.includes(imageSize) ? imageSize : "1K";
    const selectedAspectRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : "1:1";

    const ai = getAi();

    // Use gemini-3-pro-image-preview or gemini-3.1-flash-image
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: {
          parts: [
            {
              text: `High architectural and biological clarity photograph/rendering: ${prompt}. Natural outdoor lighting, crisp sharp details.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: selectedAspectRatio as any,
            imageSize: selectedSize as any,
          },
        },
      });
    } catch (fallbackErr: any) {
      console.warn("Primary image model failed, trying gemini-3.1-flash-image...", fallbackErr?.message);
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: selectedAspectRatio as any,
            imageSize: selectedSize as any,
          },
        },
      });
    }

    let imageUrl: string | null = null;
    let descriptionText = "";

    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType || "image/png";
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
      } else if (part.text) {
        descriptionText += part.text + " ";
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: "No image was returned by the model." });
    }

    return res.json({
      imageUrl,
      description: descriptionText.trim(),
      imageSize: selectedSize,
      aspectRatio: selectedAspectRatio,
    });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate image.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Swift Nest Sound & Broadcaster Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
