"use client";
import React, { Suspense, useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatBot from "./components/ScrapBot";

const CompanyChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-2xl transition-all duration-300 transform hover:scale-110 animate-pulse"
        >
          <MessageCircle size={24} />
        </button>
        <div></div>

        {/* Chat Window */}
      </div>
      {isOpen && (
        <>
          <Suspense>
            <ChatBot setIsOpen={setIsOpen} />
          </Suspense>
        </>
      )}
    </>
  );
};

export default CompanyChatbot;
