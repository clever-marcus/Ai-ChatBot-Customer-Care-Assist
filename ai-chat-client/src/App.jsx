import React, { useState } from "react";
import axios from "axios";
import { FiSend, FiCopy } from "react-icons/fi";


export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
  if (!input.trim()) return;

  // 👇 User message (adds timestamp)
  const userMsg = {
      sender: "user",
      text: input,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:5000/api/chat", { message: input });

      // 👇 AI message (adds timestamp too)
      const aiMsg = {
        sender: "ai",
        text: res.data.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);

      const errorMsg = {
        sender: "ai",
        text: "⚠️ Sorry, something went wrong connecting to the AI server.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };


  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-5 flex flex-col">
        <h1 className="text-xl font-bold text-center mb-4">AI Chat Assist 🤖</h1>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`relative max-w-[75%] p-3 rounded-2xl shadow-sm ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white self-end rounded-br-none"
                  : "bg-gray-200 text-gray-900 self-start rounded-bl-none"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <p className="pr-10 break-words">{msg.text}</p>
                {msg.sender === "ai" && (
                  <button
                    onClick={() => copyToClipboard(msg.text)}
                    className="text-gray-500 hover:text-gray-700"
                    title="Copy response"
                  >
                    <FiCopy size={16} />
                  </button>
                )}
              </div>

              {/* 🕒 Timestamp inside bubble, bottom-right */}
              <span
                className={`absolute bottom-1 right-2 text-[0.7rem] ${
                  msg.sender === "user" ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {msg.time}
              </span>
            </div>
          ))}
          {loading && (
            <p className="text-gray-400 text-sm animate-pulse">
              AI is typing...
            </p>
          )}
        </div>

        {/* Input field */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 transition"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
