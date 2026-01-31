import * as React from "react"
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Briefcase,
    TrendingUp,
    FileText
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"

export function CommandPalette() {
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <>
            <div className="fixed bottom-4 right-4 z-50">
                <div className="text-[10px] text-muted-foreground bg-accent/50 px-2 py-1 rounded border border-border backdrop-blur">
                    Press <kbd className="font-mono">⌘K</kbd> to search
                </div>
            </div>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search client..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                        <CommandItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>Calendar</span>
                        </CommandItem>
                        <CommandItem>
                            <Smile className="mr-2 h-4 w-4" />
                            <span>Search Emoji</span>
                        </CommandItem>
                        <CommandItem>
                            <Calculator className="mr-2 h-4 w-4" />
                            <span>Calculator</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Financial Actions">
                        <CommandItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Go to: Eddie Lake Account</span>
                            <CommandShortcut>⌘E</CommandShortcut>
                        </CommandItem>
                        <CommandItem>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            <span>Run: Update Risk Profile</span>
                            <CommandShortcut>⌘R</CommandShortcut>
                        </CommandItem>
                        <CommandItem>
                            <Briefcase className="mr-2 h-4 w-4" />
                            <span>View: Smith Household</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                    <CommandGroup heading="System">
                        <CommandItem>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>View Transaction Logs</span>
                        </CommandItem>
                        <CommandItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                            <CommandShortcut>⌘S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
