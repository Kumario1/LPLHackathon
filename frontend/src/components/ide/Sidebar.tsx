import { ChevronDown, ChevronRight, AlertCircle, AlertTriangle, FileText, User, Briefcase, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface TreeItemProps {
    label: string;
    icon?: any;
    color?: string;
    children?: React.ReactNode;
    defaultExpanded?: boolean;
    householdId?: string; // If provided, clicking navigates to household detail
}

const TreeItem = ({ label, icon: Icon, color, children, defaultExpanded = false, householdId }: TreeItemProps) => {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const hasChildren = Boolean(children);
    const navigate = useNavigate();

    const handleClick = () => {
        if (householdId) {
            // Navigate to household detail page
            navigate(`/household/${householdId}`);
        } else if (hasChildren) {
            setExpanded(!expanded);
        }
    };

    return (
        <div className="select-none">
            <div
                className={cn(
                    "flex items-center gap-1.5 py-1.5 px-2 hover:bg-accent/50 text-muted-foreground hover:text-foreground cursor-pointer text-sm transition-colors rounded-md",
                    expanded && "text-foreground",
                    householdId && "hover:bg-primary/20 hover:text-primary"
                )}
                onClick={handleClick}
            >
                {hasChildren ? (
                    expanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />
                ) : (
                    <span className="w-3" />
                )}
                {Icon && <Icon className={cn("h-3.5 w-3.5 shrink-0", color)} />}
                <span className="truncate">{label}</span>
                {householdId && (
                    <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground/50" />
                )}
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
    const navigate = useNavigate();

    if (collapsed) {
        return (
            <div className="h-full flex flex-col items-center py-4 gap-4 text-muted-foreground">
                <Home className="h-5 w-5 cursor-pointer hover:text-primary" onClick={() => navigate('/')} />
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
                {/* Active Transitions */}
                <TreeItem label="Active Transitions" icon={Briefcase} defaultExpanded={true}>
                    <TreeItem
                        label="Johnson Family"
                        icon={User}
                        color="text-yellow-400"
                        householdId="HH-001"
                    />
                    <TreeItem
                        label="Smith Household"
                        icon={User}
                        color="text-blue-400"
                        householdId="HH-002"
                    />
                    <TreeItem
                        label="Thompson Trust"
                        icon={User}
                        color="text-green-400"
                        householdId="HH-004"
                    />
                    <TreeItem
                        label="Garcia Family"
                        icon={User}
                        color="text-purple-400"
                        householdId="HH-005"
                    />
                    <TreeItem
                        label="Wilson Portfolio"
                        icon={User}
                        color="text-cyan-400"
                        householdId="HH-006"
                    />
                </TreeItem>

                {/* At Risk Households */}
                <TreeItem label="At Risk Households" icon={AlertCircle} color="text-destructive" defaultExpanded={true}>
                    <TreeItem
                        label="Miller Estate"
                        icon={User}
                        color="text-red-400"
                        householdId="HH-003"
                    />
                    <TreeItem
                        label="Johnson Family"
                        icon={User}
                        color="text-yellow-400"
                        householdId="HH-001"
                    />
                </TreeItem>

                {/* Pending NIGO */}
                <TreeItem label="Pending NIGO" icon={AlertTriangle} color="text-yellow-500" defaultExpanded={true}>
                    <TreeItem
                        label="Johnson - Signature"
                        icon={FileText}
                        color="text-yellow-400"
                        householdId="HH-001"
                    />
                    <TreeItem
                        label="Miller - Wrong Date"
                        icon={FileText}
                        color="text-red-400"
                        householdId="HH-003"
                    />
                </TreeItem>
            </ScrollArea>
        </div>
    );
};
