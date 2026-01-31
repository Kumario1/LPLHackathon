import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Home, Sparkles, CheckSquare, Clock, AlertTriangle, FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CodeLine = ({ num, label, value, error }: any) => (
    <div className="flex items-center gap-4 hover:bg-accent/30 group px-2 py-0.5 rounded-sm cursor-text">
        <span className="text-muted-foreground font-mono text-xs w-6 text-right select-none">{num}</span>
        {error ? (
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
        ) : (
            <div className="w-1.5 h-1.5 shrink-0" />
        )}
        <div className="flex items-center gap-4 flex-1">
            <span className="text-purple-400 font-mono text-sm w-[120px] shrink-0">{label}:</span>
            <input
                type="text"
                defaultValue={value}
                className="bg-transparent border-none text-green-400 font-mono text-sm focus:outline-none w-full group-hover:bg-accent/10 rounded px-1"
            />
        </div>
    </div>
);

const Widget = ({ title, icon: Icon, color, children }: any) => (
    <Card className="bg-[#18181b] border-white/15 overflow-hidden shadow-sm">
        <CardHeader className="p-3 border-b border-white/10 bg-white/5 flex flex-row items-center space-y-0 gap-2">
            <Icon className={`h-4 w-4 ${color}`} />
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            {children}
        </CardContent>
    </Card>
)

const WidgetItem = ({ label, meta, icon: Icon, alert }: any) => (
    <div className="flex items-center justify-between p-3 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group">
        <div className="flex items-center gap-3">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />}
            <span className="text-sm font-medium text-foreground/90">{label}</span>
        </div>
        <div className="flex items-center gap-2">
            {alert && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
            <span className="text-xs text-muted-foreground font-mono">{meta}</span>
        </div>
    </div>
)

export const EditorPane = () => {
    return (
        <div className="h-full flex flex-col bg-[#18181b] border border-white/15 rounded-xl clip-hidden shadow-sm overflow-hidden">
            <Tabs defaultValue="dashboard" className="w-full h-full flex flex-col">
                <div className="border-b border-white/10 bg-white/5 backdrop-blur">
                    <TabsList className="h-10 w-full justify-start rounded-none bg-transparent p-0">
                        <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#18181b] data-[state=active]:border-t-2 data-[state=active]:border-t-primary rounded-none border-r border-white/10 h-10 px-4 text-xs gap-2">
                            <Home className="h-3.5 w-3.5" /> Dashboard
                        </TabsTrigger>
                        <TabsTrigger value="editor" className="data-[state=active]:bg-background data-[state=active]:border-t-2 data-[state=active]:border-t-primary rounded-none border-r border-border h-10 px-4 text-xs gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-blue-400" /> AI Editor: Smith Household.json
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="data-[state=active]:bg-background data-[state=active]:border-t-2 data-[state=active]:border-t-primary rounded-none border-r border-border h-10 px-4 text-xs gap-2">
                            <CheckSquare className="h-3.5 w-3.5 text-green-500" /> Tasks
                            <Badge className="h-4 px-1 ml-1 bg-muted text-muted-foreground hover:bg-muted font-mono text-[9px]">4</Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* TAB: DASHBOARD */}
                <TabsContent value="dashboard" className="flex-1 m-0 p-4 overflow-hidden bg-background/50">
                    <ScrollArea className="h-full">
                        <div className="grid grid-cols-2 gap-4">
                            <Widget title="Households At Risk Today" icon={AlertTriangle} color="text-destructive">
                                <WidgetItem label="Miller Estate" meta="SLA Breached" alert={true} icon={Home} />
                                <WidgetItem label="High Yield Corp" meta="Cash Drag > 5%" icon={Home} />
                            </Widget>

                            <Widget title="Docs Pending Signature" icon={FileText} color="text-yellow-500">
                                <WidgetItem label="Schwab 401k Transfer" meta="John Smith" icon={FileText} />
                                <WidgetItem label="Roth IRA Application" meta="Jane Doe" icon={FileText} />
                            </Widget>

                            <Widget title="Items Waiting on Me" icon={Clock} color="text-blue-400">
                                <WidgetItem label="Approve Jones Transfer" meta="Due Today" icon={CheckSquare} />
                                <WidgetItem label="Review Q3 Risk Reports" meta="3 pending" icon={FileText} />
                            </Widget>

                            <Widget title="My Recent Transitions" icon={ArrowRight} color="text-green-500">
                                <WidgetItem label="VTSAX Acat" meta="Completed" icon={ArrowRight} />
                                <WidgetItem label="Fidelity Liquidation" meta="In Progress" icon={ArrowRight} />
                            </Widget>
                        </div>
                    </ScrollArea>
                </TabsContent>

                {/* TAB: AI EDITOR */}
                <TabsContent value="editor" className="flex-1 m-0 p-0 overflow-hidden">
                    <ScrollArea className="h-full py-4">
                        <div className="px-2 space-y-0.5">
                            <CodeLine num={1} label="household_id" value="HH-9283-X" />
                            <CodeLine num={2} label="primary_client" value="John Smith" />
                            <CodeLine num={3} label="aum_current" value="$1,250,000.00" />
                            <CodeLine num={4} label="risk_score" value="72" />
                            <CodeLine num={5} label="last_rebal" value="2024-01-15" />
                            <CodeLine num={6} label="cash_drag" value="4.2%" />

                            <div className="h-4" />
                            <div className="pl-12 text-muted-foreground text-xs italic mb-2">// Beneficiaries Config</div>
                            <CodeLine num={7} label="pri_beneficiary" value="Sarah Smith (Spouse)" />
                            <CodeLine num={8} label="sec_beneficiary" value="Trust #8821" error={true} />
                            <CodeLine num={9} label="allocation" value="100%" />

                            <div className="h-4" />
                            <div className="pl-12 text-muted-foreground text-xs italic mb-2">// Compliance Flags</div>
                            <CodeLine num={10} label="reg_bi_status" value="COMPLIANT" />
                            <CodeLine num={11} label="form_crs" value="DELIVERED" />
                        </div>
                    </ScrollArea>
                </TabsContent>

                {/* TAB: TASKS */}
                <TabsContent value="tasks" className="flex-1 m-0 p-4 bg-background/50">
                    <div className="space-y-2">
                        <div className="flex items-center p-3 bg-card border border-border rounded-lg gap-3">
                            <div className="h-4 w-4 border-2 border-primary rounded-sm cursor-pointer" />
                            <span className="text-sm font-medium line-through text-muted-foreground">Draft Email to Smith regarding NIGO</span>
                            <Badge className="ml-auto bg-green-500/10 text-green-500 hover:bg-green-500/10 border-0">Done</Badge>
                        </div>
                        <div className="flex items-center p-3 bg-card border border-border rounded-lg gap-3">
                            <div className="h-4 w-4 border-2 border-muted-foreground rounded-sm cursor-pointer hover:border-primary" />
                            <span className="text-sm font-medium">Rebalance Miller Estate Portfolio</span>
                            <Badge className="ml-auto bg-red-500/10 text-red-500 hover:bg-red-500/10 border-0">High</Badge>
                        </div>
                        <div className="flex items-center p-3 bg-card border border-border rounded-lg gap-3">
                            <div className="h-4 w-4 border-2 border-muted-foreground rounded-sm cursor-pointer hover:border-primary" />
                            <span className="text-sm font-medium">Schedule Review with Eddie Lake</span>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
