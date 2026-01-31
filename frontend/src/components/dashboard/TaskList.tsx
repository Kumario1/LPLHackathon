import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Task {
  id: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  completed: boolean;
}

const aiTasks: Task[] = [
  { id: "1", title: "Review Smith portfolio recommendations", priority: "High", dueDate: "Today", completed: false },
  { id: "2", title: "Analyze Chen retirement projections", priority: "Medium", dueDate: "Tomorrow", completed: false },
  { id: "3", title: "Generate quarterly report summary", priority: "Low", dueDate: "Dec 18", completed: true },
];

const employeeTasks: Task[] = [
  { id: "4", title: "Call Martinez regarding docs", priority: "High", dueDate: "Today", completed: false },
  { id: "5", title: "Schedule team review meeting", priority: "Medium", dueDate: "Dec 16", completed: false },
  { id: "6", title: "Update CRM notes for Johnson", priority: "Low", dueDate: "Dec 17", completed: false },
];

function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const styles = {
    High: "status-danger",
    Medium: "status-warning",
    Low: "bg-muted text-muted-foreground",
  };

  return <span className={`status-badge ${styles[priority]}`}>{priority}</span>;
}

function TaskItem({ task }: { task: Task }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <Checkbox 
        id={task.id} 
        checked={task.completed}
        className="mt-0.5 border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <div className="flex-1 min-w-0">
        <label 
          htmlFor={task.id}
          className={`text-sm cursor-pointer ${task.completed ? "text-muted-foreground line-through" : "text-foreground"}`}
        >
          {task.title}
        </label>
        <div className="flex items-center gap-2 mt-1">
          <PriorityBadge priority={task.priority} />
          <span className="text-xs text-muted-foreground">{task.dueDate}</span>
        </div>
      </div>
    </div>
  );
}

export function TaskList() {
  return (
    <div className="dashboard-card flex flex-col h-full">
      <Tabs defaultValue="ai" className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">Tasks</h3>
          <TabsList className="h-7 bg-muted p-0.5">
            <TabsTrigger value="ai" className="h-6 text-xs px-2 data-[state=active]:bg-accent">
              AI Tasks
            </TabsTrigger>
            <TabsTrigger value="employee" className="h-6 text-xs px-2 data-[state=active]:bg-accent">
              Employee
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="ai" className="flex-1 overflow-auto mt-0 space-y-0">
          {aiTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </TabsContent>

        <TabsContent value="employee" className="flex-1 overflow-auto mt-0 space-y-0">
          {employeeTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </TabsContent>

        <Button variant="outline" size="sm" className="mt-auto gap-1.5 w-full">
          <Plus className="w-3.5 h-3.5" />
          Add Task
        </Button>
      </Tabs>
    </div>
  );
}
