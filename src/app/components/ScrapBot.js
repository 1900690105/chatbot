"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { usePathname, useSearchParams } from "next/navigation";

export default function ChatBot({ setIsOpen }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullUrl = `${pathname}?${searchParams.toString()}`;

  // State management
  const [url, setUrl] = useState("https://nikhilkandhare.vercel.app/");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Effects
  useEffect(() => {
    if (fullUrl === "http://localhost:3000/") {
      setUrl("https://nikhilkandhare.vercel.app/");
    }
  }, [fullUrl]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when component mounts or reopens
  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: question.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setQuestion("");
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const res = await fetch("/api/scrape-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, question: userMessage.content }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      const botMessage = {
        id: Date.now() + 1,
        type: "bot",
        content:
          data.answer || "I couldn't find a relevant answer to your question.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      let errorContent = "Sorry, there was an error processing your request.";

      if (error.name === "AbortError") {
        errorContent =
          "Request timed out. Please try again with a shorter question.";
      } else if (error.message.includes("Failed to fetch")) {
        errorContent =
          "Network error. Please check your connection and try again.";
      }

      const errorMessage = {
        id: Date.now() + 2,
        type: "bot",
        content: errorContent,
        timestamp: new Date(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  // Clear chat with confirmation
  const clearChat = () => {
    if (messages.length > 0) {
      if (window.confirm("Are you sure you want to clear all messages?")) {
        setMessages([]);
        setError(null);
      }
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Toggle minimize
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  // Close handler
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 md:bg-transparent md:relative md:inset-auto md:p-0">
      {/* Main chat container */}
      <div
        ref={chatContainerRef}
        className={`
          flex flex-col bg-white border border-gray-200 rounded-lg shadow-2xl
          w-full max-w-md h-full max-h-[90vh]
          md:w-96 md:h-auto md:max-h-[600px]
          lg:w-[450px] lg:max-h-[700px]
          transition-all duration-300 ease-in-out
          ${isMinimized ? "md:h-auto md:max-h-16" : ""}
        `}
      >
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-bold">
              🤖
            </div>
            <h1 className="text-lg font-semibold">ChatBot Assistant</h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Minimize button (desktop only) */}
            <button
              onClick={toggleMinimize}
              className="hidden md:block p-1 hover:bg-blue-500 rounded transition-colors"
              aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                {isMinimized ? (
                  <path
                    fillRule="evenodd"
                    d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
            </button>

            {/* Clear chat button */}
            <button
              onClick={clearChat}
              className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded text-sm transition-colors"
              disabled={messages.length === 0}
            >
              Clear
            </button>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="p-1 hover:bg-blue-500 rounded transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Container */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-4xl mb-4">🤖</div>
                  <p className="text-lg font-medium">
                    Hi! I&#39;m your ChatBot assistant.
                  </p>
                  <p className="text-sm mt-2 text-gray-400">
                    Ask me anything about the website content.
                  </p>
                  <div className="mt-4 text-xs text-gray-400">
                    <p>💡 Tips:</p>
                    <p>• Press Ctrl+Enter to send</p>
                    <p>• Press Esc to close</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2 rounded-lg ${
                        message.type === "user"
                          ? "bg-blue-500 text-white rounded-br-sm"
                          : message.isError
                          ? "bg-red-100 text-red-800 border border-red-200 rounded-bl-sm"
                          : "bg-gray-100 text-gray-800 rounded-bl-sm"
                      }`}
                    >
                      {message.type === "bot" ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0">{children}</p>
                              ),
                              code: ({ children }) => (
                                <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">
                                  {children}
                                </code>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                      <div
                        className={`text-xs mt-1 ${
                          message.type === "user"
                            ? "text-blue-100"
                            : message.isError
                            ? "text-red-500"
                            : "text-gray-500"
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
                  <div className="bg-gray-100 text-gray-800 max-w-[85%] px-4 py-2 rounded-lg rounded-bl-sm">
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
            <form
              onSubmit={handleSubmit}
              className="p-4 border-t bg-gray-50 rounded-b-lg"
            >
              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  Network error. Please try again.
                </div>
              )}
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (Ctrl+Enter to send)"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                  maxLength={500}
                />
                <button
                  type="submit"
                  disabled={isLoading || !question.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-1"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                  )}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                {question.length}/500 characters
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// "use client";
// import { useState, useRef, useEffect } from "react";
// import ReactMarkdown from "react-markdown";
// import { usePathname, useSearchParams } from "next/navigation";

// export default function ChatBot({ setIsOpen }) {
//   const pathname = usePathname();
//   const searchParams = useSearchParams();
//   const fullUrl = `${pathname}?${searchParams.toString()}`;
//   const [url, setUrl] = useState("https://nikhilkandhare.vercel.app/");
//   const [question, setQuestion] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };
//   useEffect(() => {
//     if (fullUrl === "http://localhost:3000/") {
//       setUrl("https://nikhilkandhare.vercel.app/");
//     }
//   }, [fullUrl]);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!question.trim()) return;

//     const userMessage = {
//       type: "user",
//       content: question,
//       timestamp: new Date(),
//     };
//     setMessages((prev) => [...prev, userMessage]);
//     setIsLoading(true);
//     setQuestion("");

//     try {
//       const res = await fetch("/api/scrape-chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ url, question }),
//       });

//       const data = await res.json();

//       const botMessage = {
//         type: "bot",
//         content: data.answer || "Sorry, I couldn't process your request.",
//         timestamp: new Date(),
//       };

//       setMessages((prev) => [...prev, botMessage]);
//     } catch (error) {
//       const errorMessage = {
//         type: "bot",
//         content:
//           "Sorry, there was an error processing your request. Please try again.",
//         timestamp: new Date(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const clearChat = () => {
//     setMessages([]);
//   };

//   const formatTime = (timestamp) => {
//     return timestamp.toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   return (
//     <div className="flex flex-col h-auto w-[450px] mt-[200px] md:mt-[250px] md:ml-[650px] max-w-3xl mx-auto bg-white border">
//       {/* Header */}
//       <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
//         <h1 className="text-xl font-semibold">ChatBot</h1>
//         <div className="flex gap-5">
//           <button
//             onClick={clearChat}
//             className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded text-sm"
//           >
//             Clear Chat
//           </button>
//           <button
//             className="cursor-pointer"
//             onClick={() => {
//               setIsOpen(false);
//             }}
//           >
//             Close
//           </button>
//         </div>
//       </div>

//       {/* Messages Container */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.length === 0 ? (
//           <div className="text-center text-gray-500 mt-20">
//             <div className="text-6xl mb-4">🤖</div>
//             <p className="text-lg">Hi! I&#39;m your ChatBot assistant.</p>
//             <p className="text-sm">
//               Ask me anything about the website content above.
//             </p>
//           </div>
//         ) : (
//           messages.map((message, index) => (
//             <div
//               key={index}
//               className={`flex ${
//                 message.type === "user" ? "justify-end" : "justify-start"
//               }`}
//             >
//               <div
//                 className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
//                   message.type === "user"
//                     ? "bg-blue-500 text-white"
//                     : "bg-gray-200 text-gray-800"
//                 }`}
//               >
//                 {message.type === "bot" ? (
//                   <div className="prose prose-sm max-w-none">
//                     <ReactMarkdown>{message.content}</ReactMarkdown>
//                   </div>
//                 ) : (
//                   <p>{message.content}</p>
//                 )}
//                 <div
//                   className={`text-xs mt-1 ${
//                     message.type === "user" ? "text-blue-100" : "text-gray-500"
//                   }`}
//                 >
//                   {formatTime(message.timestamp)}
//                 </div>
//               </div>
//             </div>
//           ))
//         )}

//         {/* Loading indicator */}
//         {isLoading && (
//           <div className="flex justify-start">
//             <div className="bg-gray-200 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
//               <div className="flex items-center space-x-2">
//                 <div className="flex space-x-1">
//                   <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
//                   <div
//                     className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
//                     style={{ animationDelay: "0.1s" }}
//                   ></div>
//                   <div
//                     className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
//                     style={{ animationDelay: "0.2s" }}
//                   ></div>
//                 </div>
//                 <span className="text-sm text-gray-600">Thinking...</span>
//               </div>
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Form */}
//       <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
//         <div className="flex space-x-2">
//           <input
//             type="text"
//             value={question}
//             onChange={(e) => setQuestion(e.target.value)}
//             placeholder="Type your message..."
//             className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             disabled={isLoading}
//           />
//           <button
//             type="submit"
//             disabled={isLoading || !question.trim()}
//             className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md transition-colors"
//           >
//             {isLoading ? "..." : "Send"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
