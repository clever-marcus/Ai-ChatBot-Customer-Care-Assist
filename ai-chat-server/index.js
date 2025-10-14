import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// health check
app.get("/", (req, res) => {
  res.send("⚡ Gemini AI Chat Assist backend running!");
});

// ✅ updated /api/chat route
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    console.log("Incoming message:", message);

    const result = await model.generateContent([
      `You are an AI customer support assistant. Be polite, professional, and helpful.`,
      `Customer: ${message}`,
    ]);

    console.log("Gemini raw result:", result);

    const reply = result.response.text();
    res.json({ reply });
  } catch (error) {
    console.error("Gemini API Error:", error?.message || error);
    if (error?.response?.data) {
      console.error("Gemini response data:", error.response.data);
    }
    res.status(500).json({ reply: "Something went wrong. Please try again." });
  }
});

app.listen(5000, () =>
  console.log("✅ Gemini backend running on http://localhost:5000")
);
