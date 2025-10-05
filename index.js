import "dotenv/config";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";  // Import fileURLToPath from 'url'
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Get the current directory path in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// === Inisialisasi Gemini client ===
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = "gemini-2.5-flash"; // Change to your desired model

// === Fungsi bantu untuk ekstraksi text ===
function extractText(result) {
  try {
    return result.response.text();
  } catch (err) {
    console.error("Error extractText:", err);
    return "(gagal mengekstrak respons)";
  }
}

// Helper function to build chat history for the API
const buildChatHistory = (messages) => {
  const history = messages.slice(0, -1).map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));
  const lastMessage = messages[messages.length - 1];

  return {
    history: history,
    prompt: lastMessage.content
  };
};

// === Endpoint utama ===
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages harus array dan tidak boleh kosong" });
    }

    const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

    const { history, prompt } = buildChatHistory(messages);
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(prompt);

    res.json({ success: true, reply: extractText(result) });
  } catch (err) {
    console.error("❌ Error /api/chat:", err);
    res.status(500).json({ error: err.message });
  }
});

// === Endpoint streaming ===
app.post("/api/chat-stream", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages harus array dan tidak boleh kosong" });
    }

    const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

    const { history, prompt } = buildChatHistory(messages);
    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(prompt);

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(chunkText);
    }

    res.end();
  } catch (err) {
    console.error("❌ Error /api/chat-stream:", err);
    res.status(500).send(`Error: ${err.message}`);
  }
});

// Serve the 'index.html' when visiting the root URL (e.g., localhost:3000)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server berjalan di http://localhost:${PORT}`);
});
