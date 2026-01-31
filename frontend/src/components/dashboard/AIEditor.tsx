import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const suggestions = [
  { field: "Account Type", value: "Traditional IRA", confidence: 98 },
  { field: "Transfer Amount", value: "$245,000", confidence: 95 },
  { field: "Custodian", value: "Fidelity Investments", confidence: 92 },
  { field: "SSN (Last 4)", value: "****4532", confidence: 100 },
];

export function AIEditor() {
  return (
    <div className="dashboard-card flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-medium text-foreground">AI Record Editor</h3>
      </div>

      <Textarea 
        placeholder="Paste financial record here..."
        className="flex-1 min-h-[80px] resize-none bg-muted border-border text-sm placeholder:text-muted-foreground"
      />

      <Button className="mt-3 gap-2 bg-primary hover:bg-primary/90">
        <Sparkles className="w-4 h-4" />
        Analyze with AI
      </Button>

      <div className="mt-4 pt-4 border-t border-border">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Extracted Data
        </h4>
        <div className="space-y-2">
          {suggestions.map((item) => (
            <div 
              key={item.field}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted-foreground">{item.field}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{item.value}</span>
                <span className="text-[10px] text-success">{item.confidence}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
