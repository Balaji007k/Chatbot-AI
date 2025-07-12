export default function MessageBubble({ text, sender }) {
  const isUser = sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-xs px-4 py-2 rounded-lg shadow-md ${isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"}`}>
        {text}
      </div>
    </div>
  );
}
