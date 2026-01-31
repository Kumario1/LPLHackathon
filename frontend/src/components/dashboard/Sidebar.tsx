import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Sparkles, 
  CheckSquare, 
  MessageSquare, 
  Settings,
  Plus,
  Building2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: ArrowLeftRight, label: "Transitions", active: false },
  { icon: Sparkles, label: "AI Financial Editor", active: false },
  { icon: CheckSquare, label: "Tasks", active: false },
  { icon: MessageSquare, label: "Chats", active: false },
  { icon: Settings, label: "Settings", active: false },
];

export function Sidebar() {
  return (
    <aside className="w-60 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-foreground">Acme Financial</span>
        </div>
      </div>

      {/* Quick Create */}
      <div className="p-4">
        <Button className="w-full justify-start gap-2 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Quick Create
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <a
                href="#"
                className={`nav-item ${item.active ? "nav-item-active" : ""}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
            <AvatarFallback>SJ</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">Sarah Johnson</p>
            <p className="text-xs text-muted-foreground truncate">Senior Advisor</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
