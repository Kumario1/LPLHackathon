import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KimiClient, Message } from "@/services/kimiClient";

export const ClawdbotChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm Clawdbot. How can I assist you with your transitions today?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Get AI response
            const responseContent = await KimiClient.sendMessage([...messages, userMsg]);

            const assistantMsg: Message = { role: 'assistant', content: responseContent };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChat = () => setIsOpen(!isOpen);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {isOpen && (
                <Card className="w-[350px] md:w-[450px] h-[500px] shadow-2xl mb-4 pointer-events-auto flex flex-col glass-card border-slate-700 bg-card/95 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary/20 p-1.5 rounded-full">
                                <Bot className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-base font-semibold">Clawdbot (Powered by Kimi)</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={toggleChat}>
                            <X className="w-4 h-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4 pr-3">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`
                      flex gap-2 max-w-[85%] 
                      ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}
                    `}>
                                            <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1
                        ${msg.role === 'user' ? 'bg-primary/20' : 'bg-secondary'}
                      `}>
                                                {msg.role === 'user' ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-emerald-400" />}
                                            </div>
                                            <div className={`
                        px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${msg.role === 'user'
                                                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                    : 'bg-muted text-foreground rounded-tl-sm'
                                                }
                      `}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="flex gap-2 max-w-[85%]">
                                            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                                                <Bot className="w-4 h-4 text-emerald-400" />
                                            </div>
                                            <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm text-muted-foreground italic flex items-center gap-2">
                                                <span className="animate-pulse">Thinking...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* Invisible element to scroll to */}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>
                        <div className="p-3 bg-muted/30 border-t border-white/5">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex items-center gap-2"
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about households, NIGO..."
                                    className="flex-1 bg-background/50 border-white/10 focus-visible:ring-primary/50"
                                    disabled={isLoading}
                                />
                                <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-primary hover:bg-primary/90">
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Button
                onClick={toggleChat}
                size="lg"
                className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 pointer-events-auto transition-all duration-300 hover:scale-105"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
            </Button>
        </div>
    );
};
