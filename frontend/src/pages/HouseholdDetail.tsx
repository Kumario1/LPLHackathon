import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MockService, Household, Task, Document } from "@/services/mockData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, FileText, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function HouseholdDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [household, setHousehold] = useState<Household | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);

    useEffect(() => {
        if (id) {
            MockService.getHousehold(id).then(h => setHousehold(h || null));
            MockService.getTasks(id).then(setTasks);
            MockService.getDocuments(id).then(setDocuments);
        }
    }, [id]);

    if (!household) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-8 space-y-6 max-w-[1200px] mx-auto">
            <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{household.name}</h1>
                    <div className="flex gap-4 text-muted-foreground">
                        <span>Status: <span className="text-foreground font-medium">{household.status}</span></span>
                        <span>Assets: <span className="text-foreground font-medium">{`$${(household.totalAssets / 1000000).toFixed(1)}M`}</span></span>
                        <span>ETA: <span className="text-foreground font-medium">{household.eta}</span></span>
                    </div>
                </div>
                <div className="bg-card border p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Risk Score</p>
                    <p className={`text-2xl font-bold ${household.riskScore > 50 ? 'text-destructive' : 'text-success'}`}>
                        {household.riskScore}/100
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle>Tasks</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {tasks.map(t => (
                                <li key={t.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        {t.status === 'COMPLETED' ?
                                            <CheckCircle className="text-success h-5 w-5" /> :
                                            <div className="h-5 w-5 border-2 border-muted-foreground rounded-full" />
                                        }
                                        <span className={t.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}>
                                            {t.title}
                                        </span>
                                    </div>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {t.dueDate}
                                    </span>
                                </li>
                            ))}
                            {tasks.length === 0 && <p className="text-muted-foreground italic">No tasks pending.</p>}
                        </ul>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {documents.map(d => (
                                <li key={d.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-primary h-5 w-5" />
                                        <span>{d.name}</span>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded ${d.status === 'NIGO' ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'}`}>
                                        {d.status}
                                    </span>
                                </li>
                            ))}
                            {documents.length === 0 && <p className="text-muted-foreground italic">No documents uploaded.</p>}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
