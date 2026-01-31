import { Sidebar } from "@/components/dashboard/Sidebar";
import { 
  TransitionsCard, 
  WaitingItemsCard, 
  HouseholdsAtRiskCard, 
  DocsPendingCard 
} from "@/components/dashboard/MetricCard";
import { TransitionsTable } from "@/components/dashboard/TransitionsTable";
import { TaskList } from "@/components/dashboard/TaskList";
import { AIEditor } from "@/components/dashboard/AIEditor";
import { ChatPanel } from "@/components/dashboard/ChatPanel";

const Index = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-[1400px] mx-auto space-y-4">
          {/* Top Widget Row */}
          <div className="grid grid-cols-4 gap-4">
            <TransitionsCard />
            <WaitingItemsCard />
            <HouseholdsAtRiskCard />
            <DocsPendingCard />
          </div>

          {/* Middle Section */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 h-[340px]">
              <TransitionsTable />
            </div>
            <div className="col-span-4 h-[340px]">
              <TaskList />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-3 gap-4">
            <div className="h-[320px]">
              <AIEditor />
            </div>
            <div className="h-[320px]">
              <ChatPanel type="ai" />
            </div>
            <div className="h-[320px]">
              <ChatPanel type="team" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
