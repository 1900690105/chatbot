"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { usePathname, useSearchParams } from "next/navigation";

export default function ChatBot() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullUrl = `${pathname}?${searchParams.toString()}`;

  const [url, setUrl] = useState("https://avsarmarg.vercel.app/");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = {
      type: "user",
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setQuestion("");

    try {
      const res = await fetch("/api/scrape-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, question }),
      });

      const data = await res.json();

      const botMessage = {
        type: "bot",
        content: data.answer || "Sorry, I couldn't process your request.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        type: "bot",
        content:
          "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">ChatBot</h1>
        <button
          onClick={clearChat}
          className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded text-sm"
        >
          Clear Chat
        </button>
      </div>

      {/* URL Input */}
      {/* <div className="p-4 border-b bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Website URL:
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL to analyze"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div> */}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-lg">Hi! I&#39;m your ChatBot assistant.</p>
            <p className="text-sm">
              Ask me anything about the website content above.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {message.type === "bot" ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{message.content}</p>
                )}
                <div
                  className={`text-xs mt-1 ${
                    message.type === "user" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {formatTime(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md transition-colors"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}

// "use client";
// import { useState } from "react";
// import ReactMarkdown from "react-markdown";
// import { usePathname, useSearchParams } from "next/navigation";

// export default function ChatBotForm() {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const fullUrl = `${pathname}?${searchParams.toString()}`;
//   const [url, setUrl] = useState(fullUrl);
//   const [question, setQuestion] = useState("");
//   const [response, setResponse] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const res = await fetch("/api/scrape-chat", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ url, question }),
//     });
//     const data = await res.json();
//     setResponse(data.answer);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
//       <textarea
//         value={question}
//         onChange={(e) => setQuestion(e.target.value)}
//         placeholder="Ask your question"
//         className="border p-2 w-full rounded"
//         required
//       />
//       <button
//         type="submit"
//         className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         Ask
//       </button>

//       {response && (
//         <div className="mt-4 p-4 border rounded bg-gray-50 prose prose-slate">
//           <ReactMarkdown>{response}</ReactMarkdown>
//         </div>
//       )}
//     </form>
//   );
// }
