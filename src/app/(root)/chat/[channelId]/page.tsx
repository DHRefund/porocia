import { ChatPanel } from "@/components/chat/chat-panel";

export default async function ChannelPage({ params }: { params: Promise<{ channelId: string }> }) {
  const { channelId } = await params;
  return <ChatPanel channelId={channelId} />;
}
