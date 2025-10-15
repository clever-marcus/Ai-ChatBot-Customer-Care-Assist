import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

// setup email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.COMPANY_EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

// health check
app.get("/", (req, res) => {
  res.send("⚡ Gemini AI Chat Assist backend running!");
});

// ✅ updated /api/chat route
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    console.log("Incoming message:", message);

    // Check if user needs help - trigger email to support
    const helpKeywords = ["help", "issue", "problem", "error", "support"];
    const isHelpRequest = helpKeywords.some((word) => 
      message.toLowerCase().includes(word)
    );

    if (isHelpRequest) {
      try{
        await transporter.sendMail({
          from: process.env.COMPANY_EMAIL,
          to: "marcusogutu430@gmail.com",
          subject: "New Customer Support Request (AI Assist)",
          text: `A customer requsted help:\n\n"${message}"\n\nSent from AI Chat Assistant.`
        });
        console.log(" Help inquiry email sent successfully");
      } catch (mailErr) {
        console.error(" Email sending failed:", mailErr);
      }
      
      return res.json({
        reply: 
        "✅ I've sent your request to our support team — they'll reach out shortly. Meanwhile, is there anything else you'd like to add?",
      });
    }

    // Adding smart system rules (staying relevant, professional and polite)
    const systemPrompt = `
    You are an AI customer support assistant for a company.
    Only respond to questions related to company products or services.
    If asked irrelevant, personal, or unrelated questions (like about sports, opinions, or personal life),
    politely decline and guide the user back to relevant topics.
    Always maintain a polite and calm tone.
    `;

    const result = await model.generateContent([
      systemPrompt,
      `Customer: ${message}`,
    ]);

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
