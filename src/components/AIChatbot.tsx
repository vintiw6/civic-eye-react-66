
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const AIChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    try {
      setLoading(true);
      // Add user message to chat
      const userMessage: Message = { role: "user", content: input };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      // Here you would make the API call to OpenAI
      // For now, we'll just simulate a response
      const simulatedResponse: Message = {
        role: "assistant",
        content: "I am a simulated AI response. To make this work, you'll need to connect to the OpenAI API.",
      };

      // Add AI response to chat
      setMessages((prev) => [...prev, simulatedResponse]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get AI response. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>AI Assistant</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <div className="mb-4 h-[400px] overflow-y-auto space-y-4 p-4 border rounded-lg">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={loading}
            />
            <Button
              variant="default"
              size="icon"
              onClick={handleSendMessage}
              disabled={loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default AIChatbot;
