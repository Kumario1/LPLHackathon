import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Sidebar } from "../ide/Sidebar";
import { EditorPane } from "../ide/EditorPane";
import { CommandPalette } from "../ide/CommandPalette";
import { TransitionsPanel } from "../ide/TransitionsPanel";
import { cn } from "@/lib/utils";
import { FolderGit2, Check, Bell, Wifi, BookText } from "lucide-react";

export const IDE = () => {
    const [leftCollapsed, setLeftCollapsed] = useState(false);

    return (
        <div className="h-screen w-screen bg-[#000000] text-foreground flex flex-col font-sans overflow-hidden">
            <CommandPalette />
            {/* Main Workspace Area with Gaps */}
            <div className="flex-1 flex overflow-hidden p-2 gap-2">
                <ResizablePanelGroup direction="horizontal" className="gap-2">

                    {/* Left Sidebar: Explorer */}
                    <ResizablePanel
                        defaultSize={16}
                        minSize={12}
                        maxSize={25}
                        collapsible={true}
                        onCollapse={() => setLeftCollapsed(true)}
                        onExpand={() => setLeftCollapsed(false)}
                        className={cn("transition-all duration-300 ease-in-out bg-transparent border-none")}
                    >
                        <Sidebar collapsed={leftCollapsed} />
                    </ResizablePanel>

                    <ResizableHandle className="bg-transparent w-2 hover:bg-primary/20 transition-colors rounded-full" />

                    {/* Center Stage: Vertical Split (Editor Top / Transitions Bottom) */}
                    <ResizablePanel defaultSize={84} minSize={40} className="bg-transparent border-none">
                        <ResizablePanelGroup direction="vertical" className="gap-2">
                            {/* Top: Editor Tabs */}
                            <ResizablePanel defaultSize={70} minSize={30} className="bg-transparent border-none">
                                <EditorPane />
                            </ResizablePanel>

                            <ResizableHandle className="bg-transparent h-2 hover:bg-primary/20 transition-colors rounded-full" />

                            {/* Bottom: Transitions Panel */}
                            <ResizablePanel defaultSize={30} minSize={20} className="bg-transparent border-none">
                                <TransitionsPanel />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    </ResizablePanel>

                </ResizablePanelGroup>
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-accent border-t border-border flex items-center justify-between px-3 text-[10px] text-muted-foreground font-mono select-none">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-primary">
                        <Check className="h-3 w-3" />
                        <span>Ready</span>
                    </div>
                    <div className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                        <FolderGit2 className="h-3 w-3" />
                        <span>main/smith-transition</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 hover:text-foreground cursor-pointer">
                            <span className="h-1.5 w-1.5 rounded-full bg-transparent border border-muted-foreground"></span>
                            0 Errors
                        </span>
                        <span className="flex items-center gap-1 text-yellow-500 hover:text-yellow-400 cursor-pointer">
                            <Bell className="h-3 w-3" />
                            2 Warnings (NIGO)
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Wifi className="h-3 w-3 text-green-500" />
                        <span>API: Connected</span>
                    </div>
                    <span>Ln 42, Col 5</span>
                    <span>UTF-8</span>
                    <BookText className="h-3 w-3 hover:text-foreground cursor-pointer" />
                </div>
            </div>
        </div>
    );
};
