import React, { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FiMessageCircle, FiX, FiSend } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import "./chatbot.css";

const chatApi = `${import.meta.env.VITE_API || ""}/api/chat`;

const getMessageText = (message) =>
  message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

const RATE_LIMIT_MESSAGE =
  "It looks like either we are hitting a server error, or we've covered a lot of ground here! To make sure your specific dates and requirements get individual attention, please jump over to our Contact Form or drop James an email directly. He'd love to chat details with you.";

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const transport = useMemo(
    () => new DefaultChatTransport({ api: chatApi }),
    []
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";


  const handleSubmit = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="chatbot-widget">
      {isOpen && (
        <div className="chatbot-window" role="dialog" aria-label="Chat assistant">
          <div className="chatbot-header">
            <h3>James George Music</h3>
            <button
              type="button"
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <FiX />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 && (
              <p className="chatbot-empty">
                Hi! Ask me about performances, booking, or music styles.
              </p>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message chatbot-message--${message.role}`}
              >
                <ReactMarkdown>{getMessageText(message)}</ReactMarkdown>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="chatbot-typing">Thinking...</div>
            )}
          </div>

          {error && (
            <p className="chatbot-error">
              {RATE_LIMIT_MESSAGE}
            </p>
          )}

          <form className="chatbot-input-area" onSubmit={handleSubmit}>
            <input
              className="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
            />
            <button
              type="submit"
              className="chatbot-send"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <FiSend />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="chatbot-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <FiX /> : <FiMessageCircle />}
      </button>
    </div>
  );
}

export default ChatbotWidget;
