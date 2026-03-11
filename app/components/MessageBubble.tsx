import type { MessageBubbleProps } from "~/types/chat";

function CitationBadge({ docId }: Readonly<{ docId: string }>) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 mr-1 mt-1">
      📄 {docId}
    </span>
  );
}

function parseCitations(content: string): string[] {
  const matches = content.match(/DOC-\d{3}/g);
  return matches ? [...new Set(matches)] : [];
}

export default function MessageBubble({
  message,
}: Readonly<MessageBubbleProps>) {
  const isUser = message.role === "user";
  const citations = isUser ? [] : parseCitations(message.content);

  return (
    <div
      className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mr-2 mt-1 shadow-lg">
          <span className="text-xs font-bold text-white">AI</span>
        </div>
      )}
      <div
        className={`max-w-[75%] flex flex-col ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
            isUser
              ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm"
              : "bg-gray-800/80 text-gray-100 border border-gray-700/50 rounded-bl-sm backdrop-blur-sm"
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        {citations.length > 0 && (
          <div className="flex flex-wrap mt-1.5 px-1">
            {citations.map((docId) => (
              <CitationBadge key={docId} docId={docId} />
            ))}
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center ml-2 mt-1 shadow-lg">
          <span className="text-xs font-bold text-gray-300">U</span>
        </div>
      )}
    </div>
  );
}
