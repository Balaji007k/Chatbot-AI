import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow() {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const [messages, setMessages] = useState([
    { text: "Hi there! How can I help you?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef(null);

  // Speech Recognition Setup
  const recognitionRef = useRef(null);
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
    setIsListening((prev) => !prev);
  };

  const formatBotReply = (text) => {
  if (!text) return "";

  let formatted = text.replace(/\n{2,}/g, "\n\n");

  // Add 🎬 to movie titles (e.g., The Exorcist (1973):)
  formatted = formatted.replace(
    /^([A-Z][^\n:()]{2,}\s\(\d{4}\)):/gm,
    "🎬 $1:"
  );

  const categoryIcons = [
      { icon: "🎬", keywords: ["horror", "movie", "thriller"] },
      { icon: "😱", keywords: ["scary", "terrifying", "disturbing"] },
      { icon: "🎉", keywords: ["fun", "comedy", "campy", "light-hearted"] },
      { icon: "📺", keywords: ["platform", "netflix", "prime", "hulu", "watching on"] },
      { icon: "🧑‍🤝‍🧑", keywords: ["watching alone", "with a group", "partner", "friends"] },
      { icon: "⚠️", keywords: ["trigger", "avoid", "sensitive", "violence"] },
      { icon: "🎞️", keywords: ["recent movies", "favorites", "enjoyed"] },
      { icon: "😂", keywords: ["joke", "laugh", "funny", "make you laugh", "because they"] },
      { icon: "🧠", keywords: ["fact", "did you know", "truth"] },
      { icon: "💡", keywords: ["tip", "trick", "pro tip"] },
      { icon: "📚", keywords: ["define", "definition", "meaning"] },
      { icon: "🔍", keywords: ["explain", "how does", "why"] },
      { icon: "🎨", keywords: ["story", "poem", "creative"] },
      { icon: "👨‍🏫", keywords: ["advice", "suggestion"] },
      { icon: "🔧", keywords: ["how to", "steps", "instruction"] },
    ];

  // Break into sentences/paragraphs
  const parts = formatted.split("\n\n");

  const processed = parts.map((line) => {
    // Don't double-format movie titles
    if (line.startsWith("🎬")) return line;

    for (const { icon, keywords } of categoryIcons) {
      const regex = new RegExp(`\\b(${keywords.join("|")})\\b`, "i");
      if (regex.test(line)) {
        return `${icon} ${line}`;
      }
    }

    return line; // No match, return original
  });

  return processed.join("\n\n").trim();
};

  const handleSend = async () => {
  if (input.trim() === "") return;

    // Prevent multiple clicks while waiting
    setLoading(true);
  if (messages.some(msg => msg.id === "thinking")) return;

  const newMessage = { text: input, sender: "user" };
  const updatedMessages = [...messages, newMessage];

  setMessages([
    ...updatedMessages,
    { text: "Thinking...", sender: "bot", id: "thinking" }
  ]);
  setInput("");

  const lastMessages = updatedMessages.slice(-6);

  const formattedMessages = lastMessages.map((msg) => ({
    role: msg.sender === "user" ? "user" : "model",
    parts: [{ text: msg.text }],
  }));

  try {

    //https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`
 
    const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: formattedMessages,
    }),
  }
);

    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a minute and try again.");
    }

    if (!response.ok) {
      throw new Error("Something went wrong. Try again later.");
    }

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    const formattedReply = formatBotReply(reply);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === "thinking"
          ? { text: formattedReply, sender: "bot" }
          : msg
      )
    );

  } catch (error) {
    console.error("Fetch error:", error.message);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === "thinking"
          ? { text: error.message, sender: "bot" }
          : msg
      )
    );
  }finally {
    setLoading(false);
  }
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto bg-white border rounded-2xl shadow-lg overflow-hidden">
      <div className="flex items-center justify-center p-4 border-b bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 font-semibold text-lg">
        🤖 AI Chatbot
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            text={msg.text}
            sender={msg.sender}
            messages={messages}
          />
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="p-3 border-t flex items-center gap-2 bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-3 border rounded-full focus:outline-none cursor-text caret-black"
          placeholder="Type your message..."
        />

        {/* Mic Button */}
        <button
          onClick={handleMicClick}
          className={`p-2 rounded-full transition ${isListening ? "bg-red-500" : "bg-gray-200"
            } hover:bg-blue-500 hover:text-white`}
          title="Voice Input"
        >
          🎤
        </button>

        {/* Send Button */}
        <button disabled={loading}
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
