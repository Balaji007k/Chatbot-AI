import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow() {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;;
  const [messages, setMessages] = useState([
    { text: "Hi there! How can I help you?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const handleSend = async () => {
  if (input.trim() === "") return;

  const newMessage = { text: input, sender: "user" };
  setMessages((prev) => [...prev, newMessage]);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: input }] }],
        }),
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    setMessages((prev) => [...prev, { text: reply, sender: "bot" }]);
  } catch (error) {
    console.error("Fetch error:", error);
    setMessages((prev) => [
      ...prev,
      { text: "Error contacting Gemini API", sender: "bot" },
    ]);
  }

  setInput("");
};



  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto bg-white border rounded-lg shadow-lg">
      <div className="flex items-center justify-center p-4 border-b bg-blue-50 text-blue-800 font-bold">
        Chatbot
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} text={msg.text} sender={msg.sender} />
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="p-4 border-t flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
}
