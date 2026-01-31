import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Mail, Presentation, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KimiClient, Message } from "@/services/kimiClient";
import { PresentationModal } from "@/components/presentation/PresentationModal";
import { EmailDraftModal } from "@/components/actions/EmailDraftModal";
import ReactMarkdown from 'react-markdown';

interface ActionButton {
    type: 'email' | 'slides' | 'view';
    label: string;
    householdId?: string;
}

interface EnhancedMessage extends Message {
    actions?: ActionButton[];
    citations?: { text: string; source: string }[];
}

export const ClawdbotChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<EnhancedMessage[]>([
        {
            role: 'assistant',
            content: "Hello! I'm **Clawdbot**, your AI assistant for Transition OS. I can help you with:\n\n• Check household status\n• Analyze NIGO issues\n• Draft client emails\n• Create meeting slides\n\nHow can I assist you today?",
            actions: []
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPresentationModal, setShowPresentationModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>('HH-001');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(scrollToBottom, 100);
        }
    }, [isOpen]);

    // Parse response for citations and suggested actions
    const parseResponse = (content: string): { text: string; actions: ActionButton[]; citations: { text: string; source: string }[] } => {
        const citations: { text: string; source: string }[] = [];
        const actions: ActionButton[] = [];

        // Extract citations [Source: DB - HouseholdName]
        const citationRegex = /\[Source: (.*?)\]/g;
        let match;
        while ((match = citationRegex.exec(content)) !== null) {
            citations.push({ text: match[0], source: match[1] });
        }

        // Detect household mentions for actions
        const householdMentions = ['Johnson', 'Smith', 'Miller', 'Thompson', 'Garcia', 'Chen'];
        const mentionedHousehold = householdMentions.find(h => content.toLowerCase().includes(h.toLowerCase()));

        if (mentionedHousehold) {
            const householdIds: Record<string, string> = {
                'Johnson': 'HH-001',
                'Smith': 'HH-002',
                'Miller': 'HH-003',
                'Thompson': 'HH-004',
                'Garcia': 'HH-005',
                'Chen': 'HH-006'
            };
            const hId = householdIds[mentionedHousehold];
            actions.push(
                { type: 'email', label: 'Draft Email', householdId: hId },
                { type: 'slides', label: 'Create Slides', householdId: hId }
            );
        }

        // Add generic actions if discussing status or updates
        if (content.toLowerCase().includes('status') || content.toLowerCase().includes('update')) {
            if (actions.length === 0) {
                actions.push({ type: 'email', label: 'Draft Status Update' });
            }
        }

        return { text: content, actions, citations };
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: EnhancedMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Get AI response from Kimi
            const rawMessages = messages.map(m => ({ role: m.role, content: m.content }));
            const responseContent = await KimiClient.sendMessage([...rawMessages, { role: 'user', content: input }]);

            // Parse response for actions and citations
            const { text, actions, citations } = parseResponse(responseContent);

            const assistantMsg: EnhancedMessage = {
                role: 'assistant',
                content: text,
                actions,
                citations
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Sorry, I encountered an error connecting to my AI service. Please try again."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleActionClick = (action: ActionButton) => {
        if (action.householdId) {
            setSelectedHouseholdId(action.householdId);
        }

        if (action.type === 'slides') {
            setShowPresentationModal(true);
        } else if (action.type === 'email') {
            setShowEmailModal(true);
        }
    };

    const toggleChat = () => setIsOpen(!isOpen);

    // Markdown components with custom styling
    const MarkdownContent = ({ content }: { content: string }) => (
        <ReactMarkdown
            components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-sm">{children}</li>,
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                code: ({ children }) => (
                    <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs font-mono text-primary">{children}</code>
                ),
                pre: ({ children }) => (
                    <pre className="bg-black/30 p-2 rounded-md overflow-x-auto text-xs mb-2">{children}</pre>
                ),
                blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-primary/50 pl-3 italic text-muted-foreground mb-2">{children}</blockquote>
                ),
                hr: () => <hr className="border-white/10 my-2" />,
                a: ({ href, children }) => (
                    <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">{children}</a>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );

    return (
        <>
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
                {isOpen && (
                    <Card className="w-[380px] md:w-[480px] h-[550px] shadow-2xl mb-4 pointer-events-auto flex flex-col glass-card border-slate-700 bg-card/95 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="bg-primary/20 p-1.5 rounded-full shrink-0">
                                    <Bot className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-base font-semibold truncate">Clawdbot Copilot</CardTitle>
                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">Kimi K2.5</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white shrink-0" onClick={toggleChat}>
                                <X className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
                            <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
                                <div className="p-4 space-y-4">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`
                                                flex gap-2 max-w-[90%] min-w-0
                                                ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}
                                            `}>
                                                <div className={`
                                                    w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1
                                                    ${msg.role === 'user' ? 'bg-primary/20' : 'bg-secondary'}
                                                `}>
                                                    {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-primary" /> : <Bot className="w-3.5 h-3.5 text-emerald-400" />}
                                                </div>
                                                <div className="flex flex-col gap-2 min-w-0 overflow-hidden">
                                                    <div className={`
                                                        px-3 py-2 rounded-2xl text-sm leading-relaxed overflow-hidden break-words
                                                        ${msg.role === 'user'
                                                            ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                            : 'bg-muted text-foreground rounded-tl-sm'
                                                        }
                                                    `}>
                                                        <MarkdownContent content={msg.content} />
                                                    </div>

                                                    {/* Action Buttons */}
                                                    {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {msg.actions.map((action, actionIdx) => (
                                                                <Button
                                                                    key={actionIdx}
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 text-xs gap-1.5 bg-background/50 border-white/10 hover:bg-primary/10 hover:border-primary/50"
                                                                    onClick={() => handleActionClick(action)}
                                                                >
                                                                    {action.type === 'email' && <Mail className="h-3 w-3" />}
                                                                    {action.type === 'slides' && <Presentation className="h-3 w-3" />}
                                                                    {action.type === 'view' && <ExternalLink className="h-3 w-3" />}
                                                                    {action.label}
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="flex gap-2 max-w-[90%]">
                                                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                                                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                                                </div>
                                                <div className="bg-muted px-3 py-2 rounded-2xl rounded-tl-sm text-sm text-muted-foreground italic flex items-center gap-2">
                                                    <span className="flex gap-1">
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                    </span>
                                                    Thinking...
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Scroll anchor */}
                                    <div ref={messagesEndRef} />
                                </div>
                            </ScrollArea>
                            <div className="p-3 bg-muted/30 border-t border-white/5 shrink-0">
                                {/* Quick Actions */}
                                <div className="flex gap-2 mb-2 overflow-x-auto">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-[10px] text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0"
                                        onClick={() => setInput("What's the status of Johnson Family?")}
                                    >
                                        📊 Johnson Status
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-[10px] text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0"
                                        onClick={() => setInput("Show me at-risk households")}
                                    >
                                        ⚠️ At-Risk
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-[10px] text-muted-foreground hover:text-foreground whitespace-nowrap shrink-0"
                                        onClick={() => setInput("What NIGO issues need attention?")}
                                    >
                                        📋 NIGO Issues
                                    </Button>
                                </div>
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                    className="flex items-center gap-2"
                                >
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask about households, NIGO issues..."
                                        className="flex-1 bg-background/50 border-white/10 focus-visible:ring-primary/50"
                                        disabled={isLoading}
                                    />
                                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="bg-primary hover:bg-primary/90 shrink-0">
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

            {/* Modals */}
            <PresentationModal
                isOpen={showPresentationModal}
                onClose={() => setShowPresentationModal(false)}
                householdId={selectedHouseholdId}
            />
            <EmailDraftModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                householdId={selectedHouseholdId}
            />
        </>
    );
};
