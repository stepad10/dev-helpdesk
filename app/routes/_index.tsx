import ChatInterface from "~/components/ChatInterface";

export function meta() {
  return [
    { title: "Dev Q&A Assistant" },
    {
      name: "description",
      content: "Internal developer knowledge base assistant",
    },
  ];
}

export default function Index() {
  return <ChatInterface />;
}
