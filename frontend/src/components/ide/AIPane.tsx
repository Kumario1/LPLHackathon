import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, Sparkles, User, Hash } from "lucide-react";

const AIChat = () => (
    <div className="flex flex-col h-full">
        <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
                {/* AI Message */}
                <div className="flex gap-3">
                    <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center shrink-0 text-primary">
                        <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase">Copilot</span>
                        <div className="bg-muted p-3 rounded-lg rounded-tl-none text-sm leading-relaxed">
                            I noticed 2 items in the <strong>Smith Household</strong> require attention.
                            <br /><br />
                            1. The Schwab 401k transfer is flagged as NIGO (Missing Signature).
                            <br />
                            2. Cash drag is 4.2%, exceeding the 2% target.
                        </div>
                        {/* Smart Action Block */}
                        <div className="bg-card border border-border p-3 rounded-lg mt-1 space-y-2">
                            <span className="text-xs text-muted-foreground block">Suggested Actions:</span>
                            <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                                <Sparkles className="h-3 w-3 mr-2 text-primary" />
                                Draft Client Email (NIGO)
                            </Button>
                            <Button variant="outline" size="sm" className="w-full justify-start text-xs h-8">
                                <Sparkles className="h-3 w-3 mr-2 text-primary" />
                                Rebalance Portfolio
                            </Button>
                        </div>
                    </div>
                </div>

                {/* User Message */}
                <div className="flex gap-3 flex-row-reverse">
                    <div className="h-8 w-8 rounded bg-accent flex items-center justify-center shrink-0">
                        <User className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase">You</span>
                        <div className="bg-primary/20 p-3 rounded-lg rounded-tr-none text-sm leading-relaxed">
                            Draft the email for the missing signature, please.
                        </div>
                    </div>
                </div>
            </div>
        </ScrollArea>
        <div className="p-3 border-t border-border">
            <div className="relative">
                <Input placeholder="Ask AI to rebalance..." className="pr-10 bg-muted/50 border-transparent focus-visible:bg-background focus-visible:border-primary" />
                <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-7 w-7 text-primary hover:text-primary hover:bg-primary/20">
                    <Send className="h-3.5 w-3.5" />
                </Button>
            </div>
        </div>
    </div>
)

const TeamChat = () => (
    <div className="flex flex-col h-full">
        <div className="p-3 border-b border-border flex items-center gap-2 text-sm font-semibold">
            <Hash className="h-4 w-4 text-muted-foreground" />
            smith-transition-team
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm italic">
            No specific team messages yet.
        </div>
    </div>
)

export const AIPane = ({ collapsed }: { collapsed: boolean }) => {
    if (collapsed) return null;

    return (
        <div className="h-full flex flex-col bg-[#18181b] border border-white/15 rounded-xl clip-hidden shadow-sm overflow-hidden">
            <Tabs defaultValue="copilot" className="w-full h-full flex flex-col">
                <div className="px-2 pt-2 pb-0">
                    <TabsList className="w-full grid grid-cols-2 bg-muted/20 p-1 h-9 border border-white/5">
                        <TabsTrigger value="copilot" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-2" /> Copilot
                        </TabsTrigger>
                        <TabsTrigger value="team" className="text-xs">
                            <User className="h-3 w-3 mr-2" /> Team
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="copilot" className="flex-1 overflow-hidden mt-0">
                    <AIChat />
                </TabsContent>
                <TabsContent value="team" className="flex-1 overflow-hidden mt-0">
                    <TeamChat />
                </TabsContent>
            </Tabs>
        </div>
    );
};
