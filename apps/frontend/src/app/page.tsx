import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const Navigation = () => {
  return (
    <nav className="flex items-center justify-between p-6">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8">
          <svg viewBox="0 0 24 24" className="h-full w-full">
            <circle cx="12" cy="12" r="4" className="fill-primary" />
            <circle cx="4" cy="12" r="3" className="fill-secondary" />
            <circle cx="20" cy="12" r="3" className="fill-accent" />
          </svg>
        </div>
        <span className="text-xl font-bold">BrainDance</span>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost">Log in</Button>
        <Button>Sign up</Button>
      </div>
    </nav>
  );
};


interface TimeSlotProps {
  time: string;
  isAddNew?: boolean;
}

const TimeSlot = ({ time, isAddNew = false }: TimeSlotProps) => {
  if (isAddNew) {
    return (
      <button className="w-full flex items-center justify-center gap-2 p-3 rounded-md border-2 border-dashed border-muted hover:border-muted-foreground transition-colors">
        <svg width="16" height="16" viewBox="0 0 16 16" className="text-muted-foreground">
          <path d="M8 4v8M4 8h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="text-sm text-muted-foreground">Add new event</span>
      </button>
    );
  }

  return (
    <button className="w-full flex items-center gap-2 p-3 rounded-md hover:bg-accent/10 transition-colors">
      <div className="h-4 w-4 rounded-full border-2 border-muted" />
      <span className="text-sm">{time}</span>
    </button>
  );
};

const StatusCard = () => {
  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-card p-4 rounded-lg shadow-lg w-64">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
          <span className="text-accent">👤</span>
        </div>
        <div>
          <div className="text-sm font-medium">Sophia</div>
          <div className="text-xs text-muted-foreground">5m ago</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">Upcoming events</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Jan 28</div>
            <div className="text-sm">Design sync</div>
            <div className="text-xs text-muted-foreground ml-auto">1pm—2pm</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded">Jan 29</div>
            <div className="text-sm">Board meeting</div>
            <div className="text-xs text-muted-foreground ml-auto">3pm—5pm</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      
      <div className="container mx-auto px-6 pt-16 pb-24">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 tracking-tight">
            Your Producitivy
            <br />
            maximised
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The joyful productivity app. Collaborate with your team to maximise your productivity.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg">Try it now</Button>
            <div className="text-sm text-muted-foreground">free for personal use</div>
          </div>
        </div>

        <div className="relative max-w-xl mx-auto">
          {/* <StatusCard /> */}
        </div>
      </div>
    </main>
  );
}
