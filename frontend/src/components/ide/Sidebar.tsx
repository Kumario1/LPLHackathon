import { ChevronDown, ChevronRight, AlertCircle, AlertTriangle, FileText, User, Briefcase, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

const TreeItem = ({ label, icon: Icon, color, children, defaultExpanded = false }: any) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const hasChildren = Boolean(children);

    return (
        <div className="select-none">
            <div
                className={cn(
                    "flex items-center gap-1.5 py-1 px-2 hover:bg-accent/50 text-muted-foreground hover:text-foreground cursor-pointer text-sm transition-colors",
                    expanded && "text-foreground"
                )}
                onClick={() => setExpanded(!expanded)}
            >
                {hasChildren ? (
                    expanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />
                ) : (
                    <span className="w-3" />
                )}
                {Icon && <Icon className={cn("h-3.5 w-3.5 shrink-0", color)} />}
                <span className="truncate">{label}</span>
            </div>
            {expanded && hasChildren && (
                <div className="pl-4 border-l border-border/40 ml-2.5">
                    {children}
                </div>
            )}
        </div>
    );
};

export const Sidebar = ({ collapsed }: { collapsed: boolean }) => {
    if (collapsed) {
        return (
            <div className="h-full flex flex-col items-center py-4 gap-4 text-muted-foreground">
                <Briefcase className="h-5 w-5" />
                <AlertCircle className="h-5 w-5 text-destructive" />
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-[#18181b] border border-white/15 rounded-xl clip-hidden shadow-sm overflow-hidden">
            <div className="text-xs font-semibold px-4 py-3 text-muted-foreground uppercase tracking-wider bg-white/5 border-b border-white/10">
                Workspace
            </div>

            <ScrollArea className="flex-1 px-2 py-2">
                <TreeItem label="Active Transitions" icon={Briefcase} defaultExpanded={true}>
                    <TreeItem label="Smith Household.json" icon={FileJson} color="text-blue-400" />
                    <TreeItem label="Jones Transfer.log" icon={FileText} />
                    <TreeItem label="Eddie Lake IRA" icon={User} />
                </TreeItem>

                <TreeItem label="At Risk Households" icon={AlertCircle} color="text-destructive" defaultExpanded={true}>
                    <TreeItem label="Miller Estate" icon={User} color="text-destructive" />
                    <TreeItem label="High Yield Corp" icon={Briefcase} />
                </TreeItem>

                <TreeItem label="Pending NIGO" icon={AlertTriangle} color="text-yellow-500">
                    <TreeItem label="Signature Missing" icon={FileText} />
                </TreeItem>
            </ScrollArea>
        </div>
    );
};
