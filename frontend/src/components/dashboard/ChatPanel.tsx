import { Send, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  id: string;
  content: string;
  isAI?: boolean;
  sender?: {
    name: string;
    avatar: string;
    initials: string;
  };
  timestamp: string;
}

const aiMessages: Message[] = [
  {
    id: "1",
    content: "I've analyzed the Smith portfolio. The current allocation shows 65% equities, 30% fixed income, and 5% alternatives. Based on their risk profile, I recommend increasing fixed income to 35%.",
    isAI: true,
    timestamp: "10:32 AM",
  },
  {
    id: "2",
    content: "What would be the expected impact on returns?",
    isAI: false,
    timestamp: "10:34 AM",
  },
  {
    id: "3",
    content: "The projected annual return would decrease by approximately 0.8%, but volatility would reduce by 15%. This aligns better with their retirement timeline of 8 years.",
    isAI: true,
    timestamp: "10:34 AM",
  },
];

const teamMessages: Message[] = [
  {
    id: "1",
    content: "Hi team, the Martinez documents are ready for review.",
    sender: { name: "Alex Kim", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", initials: "AK" },
    timestamp: "9:15 AM",
  },
  {
    id: "2",
    content: "Thanks Alex! I'll review them this afternoon.",
    sender: { name: "Sarah Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", initials: "SJ" },
    timestamp: "9:18 AM",
  },
  {
    id: "3",
    content: "Mr. Martinez confirmed he can sign tomorrow at 2 PM.",
    sender: { name: "Client: J. Martinez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Martinez", initials: "JM" },
    timestamp: "11:42 AM",
  },
];

interface ChatPanelProps {
  type: "ai" | "team";
}

export function ChatPanel({ type }: ChatPanelProps) {
  const messages = type === "ai" ? aiMessages : teamMessages;
  const title = type === "ai" ? "AI Assistant" : "Team & Client Comms";

  return (
    <div className="dashboard-card flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        {type === "ai" && (
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-primary" />
          </div>
        )}
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto space-y-3 mb-3">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex gap-2 ${msg.isAI === false || (!msg.isAI && !msg.sender) ? "flex-row-reverse" : ""}`}
          >
            {msg.isAI && (
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3 h-3 text-primary" />
              </div>
            )}
            {msg.sender && (
              <Avatar className="w-6 h-6 flex-shrink-0 mt-0.5">
                <AvatarImage src={msg.sender.avatar} />
                <AvatarFallback className="text-[10px]">{msg.sender.initials}</AvatarFallback>
              </Avatar>
            )}
            <div className={msg.isAI || msg.sender ? "chat-bubble-ai" : "chat-bubble-user"}>
              {msg.sender && (
                <p className="text-[10px] text-muted-foreground mb-0.5">{msg.sender.name}</p>
              )}
              <p className="text-sm text-foreground leading-relaxed">{msg.content}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{msg.timestamp}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Input 
          placeholder={type === "ai" ? "Ask the AI assistant..." : "Type a message..."}
          className="flex-1 h-9 bg-muted border-border text-sm"
        />
        <Button size="icon" className="h-9 w-9 bg-primary hover:bg-primary/90">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
