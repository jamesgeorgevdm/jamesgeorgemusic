import React, { useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { FiMessageCircle, FiX, FiSend } from "react-icons/fi";
import ReactMarkdown from "react-markdown";

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
    <div className="fixed bottom-6 right-6 z-[9999] font-['Crimson_Pro']">
      {isOpen && (
        <div
          className="absolute bottom-[72px] right-0 w-[380px] max-w-[calc(100vw-48px)] h-[520px] max-h-[calc(100vh-120px)] bg-[var(--navy)] border border-[rgba(212,164,85,0.35)] rounded-2xl flex flex-col overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_24px_rgba(212,164,85,0.15)] animate-[chatbot-slide-up_0.25s_ease]"
          role="dialog"
          aria-label="Chat assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-[14px] bg-[#0f2240] border-b border-[rgba(212,164,85,0.25)]">
            <h3 className="m-0 font-['BruneyClassy'] text-[1.15rem] text-[var(--gold)] font-normal">
              James George Music
            </h3>
            <button
              type="button"
              className="bg-transparent border-none text-[var(--cream)] cursor-pointer text-[1.25rem] p-1 leading-none opacity-80 transition-[opacity,color] duration-200 hover:opacity-100 hover:text-[var(--gold)]"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <FiX />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[var(--navy)]">
            {messages.length === 0 && (
              <p className="text-[rgba(246,242,237,0.6)] text-center m-auto text-[0.95rem] leading-[1.5]">
                Hi! Ask me about performances, booking, or music styles.
              </p>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] px-[14px] py-[10px] rounded-xl text-[0.95rem] leading-[1.5] break-words [&_p]:m-0 [&_p]:mb-[6px] [&_p:last-child]:mb-0 [&_ul]:mt-1 [&_ul]:mb-[6px] [&_ul]:pl-[18px] [&_ol]:mt-1 [&_ol]:mb-[6px] [&_ol]:pl-[18px] [&_li]:mb-[2px] [&_strong]:font-bold [&_em]:italic
                  ${message.role === "user"
                    ? "self-end bg-[var(--gold)] text-[var(--navy)] rounded-br-[4px]"
                    : "self-start bg-[#0f2240] text-[var(--cream)] border border-[rgba(212,164,85,0.2)] rounded-bl-[4px]"
                  }`}
              >
                <ReactMarkdown>{getMessageText(message)}</ReactMarkdown>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="self-start px-[14px] py-[10px] bg-[#0f2240] border border-[rgba(212,164,85,0.2)] rounded-xl text-[rgba(246,242,237,0.6)] text-[0.9rem] italic">
                Thinking...
              </div>
            )}
          </div>

          {error && (
            <p className="mx-4 px-3 py-2 bg-[rgba(180,40,40,0.2)] border border-[rgba(220,80,80,0.4)] rounded-lg text-[#f5a5a5] text-[0.85rem]">
              {RATE_LIMIT_MESSAGE}
            </p>
          )}

          {/* Input area */}
          <form
            className="flex gap-2 px-4 py-3 border-t border-[rgba(212,164,85,0.25)] bg-[#0f2240]"
            onSubmit={handleSubmit}
          >
            <input
              className="flex-1 px-[14px] py-[10px] rounded-lg border border-[rgba(212,164,85,0.3)] bg-[var(--navy)] text-[var(--cream)] font-['Crimson_Pro'] text-[0.95rem] outline-none transition-[border-color] duration-200 focus:border-[var(--gold)] placeholder:text-[rgba(246,242,237,0.45)]"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
            />
            <button
              type="submit"
              className="w-[42px] h-[42px] rounded-lg border-none bg-[var(--gold)] text-[var(--navy)] cursor-pointer flex items-center justify-center text-[1.1rem] transition-[background,opacity] duration-200 hover:bg-[#f1d97c] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <FiSend />
            </button>
          </form>
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        className="w-14 h-14 rounded-full border-2 border-[var(--gold)] bg-[var(--navy)] text-[var(--gold)] cursor-pointer flex items-center justify-center text-[1.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.35),0_0_16px_rgba(212,164,85,0.25)] transition-[transform,box-shadow,background] duration-200 hover:scale-[1.05] hover:bg-[#0f2240] hover:shadow-[0_6px_24px_rgba(0,0,0,0.4),0_0_20px_rgba(212,164,85,0.35)]"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <FiX /> : <FiMessageCircle />}
      </button>
    </div>
  );
}

export default ChatbotWidget;
