import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Presentation, Mail, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MockService, Household, Task, Document, AuditEvent, ComplianceAlert } from "@/services/mockData";
import { TimelineStepper } from "@/components/timeline/TimelineStepper";
import { AuditLog } from "@/components/timeline/AuditLog";
import { AlertsPanel } from "@/components/alerts/AlertsPanel";
import { IntelligenceCard } from "@/components/intelligence/IntelligenceCard";
import { PresentationModal } from "@/components/presentation/PresentationModal";
import { EmailDraftModal } from "@/components/actions/EmailDraftModal";

const getStatusBadge = (status: Household['status']) => {
    switch (status) {
        case 'COMPLETED': return { className: "bg-green-500/15 text-green-500 border-0", label: "Completed" };
        case 'ON_TRACK': return { className: "bg-blue-500/15 text-blue-500 border-0", label: "On Track" };
        case 'AT_RISK': return { className: "bg-yellow-500/15 text-yellow-500 border-0", label: "At Risk" };
        case 'CRITICAL': return { className: "bg-red-500/15 text-red-500 border-0", label: "Critical" };
        default: return { className: "bg-gray-500/15 text-gray-400 border-0", label: status };
    }
};

const HouseholdDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [household, setHousehold] = useState<Household | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
    const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPresentationModal, setShowPresentationModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);

    useEffect(() => {
        if (id) {
            setLoading(true);
            Promise.all([
                MockService.getHousehold(id),
                MockService.getTasks(id),
                MockService.getDocuments(id),
                MockService.getAuditEvents(id),
                MockService.getAlerts(id)
            ]).then(([hh, tsk, doc, audit, alrt]) => {
                setHousehold(hh || null);
                setTasks(tsk);
                setDocuments(doc);
                setAuditEvents(audit);
                setAlerts(alrt);
                setLoading(false);
            });
        }
    }, [id]);

    if (loading) {
        return (
            <div className="h-screen w-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
        );
    }

    if (!household) {
        return (
            <div className="h-screen w-screen bg-background flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-4">Household not found</p>
                <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
            </div>
        );
    }

    const status = getStatusBadge(household.status);
    const pendingTasks = tasks.filter(t => t.status !== 'COMPLETED');
    const nigoDocuments = documents.filter(d => d.status === 'NIGO');

    return (
        <div className="min-h-screen bg-background p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{household.name}</h1>
                        <p className="text-sm text-muted-foreground">{household.advisor} • {household.primaryClient}</p>
                    </div>
                    <Badge className={status.className}>{status.label}</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2" onClick={() => setShowEmailModal(true)}>
                        <Mail className="h-4 w-4" />
                        Draft Email
                    </Button>
                    <Button className="gap-2" onClick={() => setShowPresentationModal(true)}>
                        <Presentation className="h-4 w-4" />
                        Create Slides
                    </Button>
                </div>
            </div>

            {/* Timeline Stepper */}
            <Card className="bg-[#18181b] border-white/15 mb-6">
                <CardContent className="p-6 pb-16">
                    <TimelineStepper currentStage={household.currentStage} />
                </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Card className="bg-[#18181b] border-white/15">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Assets</p>
                                <p className="text-2xl font-bold mt-1">${(household.totalAssets / 1000000).toFixed(2)}M</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-primary/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-[#18181b] border-white/15">
                    <CardContent className="p-4">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Risk Score</p>
                            <p className={`text-2xl font-bold mt-1 ${household.riskScore >= 60 ? 'text-red-400' : household.riskScore >= 30 ? 'text-yellow-400' : 'text-green-400'}`}>
                                {household.riskScore}/100
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-[#18181b] border-white/15">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">ETA</p>
                                <p className="text-2xl font-bold mt-1">{household.eta}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500/50" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-[#18181b] border-white/15">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider">NIGO Issues</p>
                                <p className={`text-2xl font-bold mt-1 ${nigoDocuments.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    {nigoDocuments.length}
                                </p>
                            </div>
                            {nigoDocuments.length > 0 && <AlertCircle className="h-8 w-8 text-red-500/50 animate-pulse" />}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-5 gap-6">
                {/* Left Column - Intelligence + Alerts */}
                <div className="col-span-2 space-y-6">
                    <IntelligenceCard household={household} />
                    <AlertsPanel alerts={alerts} householdId={household.id} />
                </div>

                {/* Right Column - Tabs for Tasks, Documents, Audit */}
                <div className="col-span-3">
                    <Card className="bg-[#18181b] border-white/15">
                        <Tabs defaultValue="tasks" className="w-full">
                            <CardHeader className="p-0 border-b border-white/10">
                                <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
                                    <TabsTrigger value="tasks" className="data-[state=active]:bg-[#18181b] data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none h-12 px-6">
                                        Tasks <Badge variant="outline" className="ml-2 text-[10px]">{pendingTasks.length}</Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="documents" className="data-[state=active]:bg-[#18181b] data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none h-12 px-6">
                                        Documents <Badge variant="outline" className="ml-2 text-[10px]">{documents.length}</Badge>
                                    </TabsTrigger>
                                    <TabsTrigger value="audit" className="data-[state=active]:bg-[#18181b] data-[state=active]:border-b-2 data-[state=active]:border-b-primary rounded-none h-12 px-6">
                                        Audit Trail
                                    </TabsTrigger>
                                </TabsList>
                            </CardHeader>
                            <CardContent className="p-4">
                                <TabsContent value="tasks" className="m-0">
                                    <ScrollArea className="h-[500px]">
                                        <div className="space-y-3 pr-4">
                                            {tasks.map(task => (
                                                <div
                                                    key={task.id}
                                                    className={`p-4 rounded-lg border ${task.slaBreached
                                                            ? 'bg-red-500/5 border-red-500/20'
                                                            : 'bg-white/5 border-white/10'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                                                                    {task.title}
                                                                </span>
                                                                {task.slaBreached && (
                                                                    <Badge variant="destructive" className="text-[10px]">SLA BREACHED</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                                <span>Owner: {task.owner}</span>
                                                                <span>Due: {task.dueDate}</span>
                                                            </div>
                                                        </div>
                                                        <Badge className={
                                                            task.status === 'COMPLETED' ? 'bg-green-500/15 text-green-500' :
                                                                task.status === 'BLOCKED' ? 'bg-red-500/15 text-red-500' :
                                                                    task.status === 'IN_PROGRESS' ? 'bg-blue-500/15 text-blue-500' :
                                                                        'bg-yellow-500/15 text-yellow-500'
                                                        }>
                                                            {task.status.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="documents" className="m-0">
                                    <ScrollArea className="h-[500px]">
                                        <div className="space-y-3 pr-4">
                                            {documents.map(doc => (
                                                <div
                                                    key={doc.id}
                                                    className={`p-4 rounded-lg border ${doc.status === 'NIGO'
                                                            ? 'bg-red-500/5 border-red-500/20'
                                                            : 'bg-white/5 border-white/10'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <span className="font-medium">{doc.name}</span>
                                                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                                                <span>Type: {doc.type}</span>
                                                                <span>Uploaded: {doc.uploadedAt}</span>
                                                                <span>By: {doc.uploadedBy}</span>
                                                            </div>
                                                            {doc.status === 'NIGO' && doc.nigoIssues && (
                                                                <div className="mt-2 p-2 bg-red-500/10 rounded text-xs text-red-400">
                                                                    {doc.nigoIssues.map(issue => (
                                                                        <div key={issue.id}>
                                                                            ⚠️ {issue.description} (Page {issue.page})
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <Badge className={
                                                            doc.status === 'OK' ? 'bg-green-500/15 text-green-500' :
                                                                doc.status === 'NIGO' ? 'bg-red-500/15 text-red-500' :
                                                                    'bg-yellow-500/15 text-yellow-500'
                                                        }>
                                                            {doc.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                <TabsContent value="audit" className="m-0">
                                    <AuditLog events={auditEvents} />
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <PresentationModal
                isOpen={showPresentationModal}
                onClose={() => setShowPresentationModal(false)}
                householdId={household.id}
            />
            <EmailDraftModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                householdId={household.id}
            />
        </div>
    );
};

export default HouseholdDetail;
