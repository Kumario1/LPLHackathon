import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Home, Sparkles, CheckSquare, Clock, AlertTriangle, FileText, ArrowRight, Upload, TrendingUp, AlertCircle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { MockService, Household, Task } from "@/services/mockData";
import { NIGOShield } from "@/components/nigo/NIGOShield";

const CodeLine = ({ num, label, value, error }: { num: number; label: string; value: string; error?: boolean }) => (
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

const Widget = ({ title, icon: Icon, color, children }: { title: string; icon: React.ElementType; color: string; children: React.ReactNode }) => (
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

const WidgetItem = ({ label, meta, icon: Icon, alert }: { label: string; meta: string; icon?: React.ElementType; alert?: boolean }) => (
    <div className="flex items-center justify-between p-3 border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />}
            <span className="text-sm font-medium text-foreground/90 truncate">{label}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
            {alert && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
            <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{meta}</span>
        </div>
    </div>
)

// Risk badge color helper
const getRiskBadge = (score: number) => {
    if (score < 30) return { className: "bg-green-500/15 text-green-500 border-0", label: "Low" };
    if (score < 60) return { className: "bg-yellow-500/15 text-yellow-500 border-0", label: "Medium" };
    return { className: "bg-red-500/15 text-red-500 border-0", label: "High" };
};

// Status badge helper
const getStatusBadge = (status: Household['status']) => {
    switch (status) {
        case 'COMPLETED': return { className: "bg-green-500/15 text-green-500 border-0", label: "Completed" };
        case 'ON_TRACK': return { className: "bg-blue-500/15 text-blue-500 border-0", label: "On Track" };
        case 'AT_RISK': return { className: "bg-yellow-500/15 text-yellow-500 border-0", label: "At Risk" };
        case 'CRITICAL': return { className: "bg-red-500/15 text-red-500 border-0", label: "Critical" };
        default: return { className: "bg-gray-500/15 text-gray-400 border-0", label: status };
    }
};

// Transition Radar Dashboard Component
const TransitionRadar = () => {
    const [households, setHouseholds] = useState<Household[]>([]);
    const [atRiskHouseholds, setAtRiskHouseholds] = useState<Household[]>([]);
    const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        MockService.getHouseholds().then(setHouseholds);
        MockService.getAtRiskHouseholds().then(setAtRiskHouseholds);
        MockService.getTasks().then(tasks => {
            setPendingTasks(tasks.filter(t => t.status !== 'COMPLETED').slice(0, 4));
        });
    }, []);

    const totalAssets = households.reduce((sum, h) => sum + h.totalAssets, 0);
    const avgCompletion = households.length > 0
        ? households.reduce((sum, h) => sum + h.transferCompleteness, 0) / households.length
        : 0;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
                <Card className="bg-[#18181b] border-white/15">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Households</p>
                                <p className="text-2xl font-bold mt-1">{households.length}</p>
                            </div>
                            <Users className="h-8 w-8 text-primary/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-[#18181b] border-white/15">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Assets Under Transition</p>
                                <p className="text-2xl font-bold mt-1">${(totalAssets / 1000000).toFixed(1)}M</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-500/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-[#18181b] border-white/15">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">At Risk</p>
                                <p className="text-2xl font-bold mt-1 text-yellow-500">{atRiskHouseholds.length}</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-yellow-500/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-[#18181b] border-white/15">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg. Completion</p>
                                <p className="text-2xl font-bold mt-1">{avgCompletion.toFixed(0)}%</p>
                            </div>
                            <Progress value={avgCompletion} className="w-16 h-2" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Household Table - Transition Radar */}
            <Card className="bg-[#18181b] border-white/15">
                <CardHeader className="p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Home className="h-4 w-4" /> Transition Radar
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] bg-background/50 border-white/10">
                            {households.filter(h => h.status !== 'COMPLETED').length} Active
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-white/10">
                                <TableHead className="text-xs font-medium text-muted-foreground">Household</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground text-right">Assets</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground text-center">Status</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground text-center">Risk</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground text-center">Progress</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground text-right">ETA</TableHead>
                                <TableHead className="text-xs font-medium text-muted-foreground text-center">Alerts</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {households.map((household) => {
                                const risk = getRiskBadge(household.riskScore);
                                const status = getStatusBadge(household.status);
                                return (
                                    <TableRow
                                        key={household.id}
                                        className={`border-white/10 hover:bg-white/5 cursor-pointer transition-colors ${household.status === 'CRITICAL' ? 'bg-red-500/5' : ''}`}
                                        onClick={() => navigate(`/household/${household.id}`)}
                                    >
                                        <TableCell className="py-3">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{household.name}</span>
                                                <span className="text-xs text-muted-foreground">{household.advisor}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            ${(household.totalAssets / 1000000).toFixed(2)}M
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={status.className}>{status.label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge className={risk.className}>{household.riskScore}</Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center gap-2 justify-center">
                                                <Progress value={household.transferCompleteness} className="w-16 h-2" />
                                                <span className="text-xs text-muted-foreground">{household.transferCompleteness}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-sm font-medium">{household.eta}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {household.hasNIGO && (
                                                <div className="flex items-center justify-center gap-1" title={household.stuckReason}>
                                                    <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
                                                    <span className="text-xs text-red-400">NIGO</span>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Bottom Widgets */}
            <div className="grid grid-cols-2 gap-4">
                <Widget title="Households At Risk Today" icon={AlertTriangle} color="text-destructive">
                    {atRiskHouseholds.slice(0, 3).map(h => (
                        <WidgetItem
                            key={h.id}
                            label={h.name}
                            meta={h.stuckReason || `Risk: ${h.riskScore}`}
                            alert={h.status === 'CRITICAL'}
                            icon={Home}
                        />
                    ))}
                </Widget>
                <Widget title="Pending Priority Tasks" icon={CheckSquare} color="text-yellow-500">
                    {pendingTasks.map(t => (
                        <WidgetItem
                            key={t.id}
                            label={t.title}
                            meta={`Due: ${t.dueDate}`}
                            alert={t.slaBreached}
                            icon={t.priority === 'CRITICAL' ? AlertCircle : FileText}
                        />
                    ))}
                </Widget>
            </div>
        </div>
    );
};

export const EditorPane = () => {
    return (
        <div className="h-full flex flex-col bg-[#18181b] border border-white/15 rounded-xl clip-hidden shadow-sm overflow-hidden">
            <Tabs defaultValue="radar" className="w-full h-full flex flex-col">
                <div className="border-b border-white/10 bg-white/5 backdrop-blur">
                    <TabsList className="h-10 w-full justify-start rounded-none bg-transparent p-0">
                        <TabsTrigger value="radar" className="data-[state=active]:bg-[#18181b] data-[state=active]:border-t-2 data-[state=active]:border-t-primary rounded-none border-r border-white/10 h-10 px-4 text-xs gap-2">
                            <Home className="h-3.5 w-3.5" /> Transition Radar
                        </TabsTrigger>
                        <TabsTrigger value="nigo" className="data-[state=active]:bg-[#18181b] data-[state=active]:border-t-2 data-[state=active]:border-t-primary rounded-none border-r border-white/10 h-10 px-4 text-xs gap-2">
                            <Upload className="h-3.5 w-3.5 text-yellow-400" /> NIGO Shield
                        </TabsTrigger>
                        <TabsTrigger value="editor" className="data-[state=active]:bg-background data-[state=active]:border-t-2 data-[state=active]:border-t-primary rounded-none border-r border-border h-10 px-4 text-xs gap-2">
                            <Sparkles className="h-3.5 w-3.5 text-blue-400" /> AI Editor: Smith Household
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="data-[state=active]:bg-background data-[state=active]:border-t-2 data-[state=active]:border-t-primary rounded-none border-r border-border h-10 px-4 text-xs gap-2">
                            <CheckSquare className="h-3.5 w-3.5 text-green-500" /> Tasks
                            <Badge className="h-4 px-1 ml-1 bg-muted text-muted-foreground hover:bg-muted font-mono text-[9px]">3</Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* TAB: TRANSITION RADAR */}
                <TabsContent value="radar" className="flex-1 m-0 p-4 overflow-hidden bg-background/50">
                    <ScrollArea className="h-full">
                        <TransitionRadar />
                    </ScrollArea>
                </TabsContent>

                {/* TAB: NIGO SHIELD */}
                <TabsContent value="nigo" className="flex-1 m-0 p-4 overflow-hidden bg-background/50">
                    <ScrollArea className="h-full">
                        <NIGOShield />
                    </ScrollArea>
                </TabsContent>

                {/* TAB: AI EDITOR */}
                <TabsContent value="editor" className="flex-1 m-0 p-0 overflow-hidden">
                    <ScrollArea className="h-full py-4">
                        <div className="px-2 space-y-0.5">
                            <CodeLine num={1} label="household_id" value="HH-002" />
                            <CodeLine num={2} label="primary_client" value="John Smith" />
                            <CodeLine num={3} label="aum_current" value="$1,250,000.00" />
                            <CodeLine num={4} label="risk_score" value="25" />
                            <CodeLine num={5} label="last_rebal" value="2024-01-15" />
                            <CodeLine num={6} label="cash_drag" value="1.5%" />

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
