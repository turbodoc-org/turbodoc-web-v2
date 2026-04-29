import * as React from "react";
import { AppHeader } from "@/components/shared/app-header";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/context";
import type { LucideIcon } from "lucide-react";
import { BookmarkIcon, StickyNote, Code2, Workflow, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authed/dashboard")({
  component: Dashboard,
});

interface ModuleConfig {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  to: string;
  color: string;
  iconColor: string;
  iconBg: string;
  borderHover: string;
  shadowHover: string;
  arrowColor: string;
}

const MODULES: ModuleConfig[] = [
  {
    id: "bookmarks",
    title: "Bookmarks",
    description: "Save, organize, and search your favorite links from anywhere.",
    icon: BookmarkIcon,
    to: "/bookmarks",
    color: "from-blue-500/10 to-indigo-500/10",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-500/10",
    borderHover: "hover:border-blue-400/40",
    shadowHover: "hover:shadow-blue-500/10",
    arrowColor: "group-hover:text-blue-600",
  },
  {
    id: "notes",
    title: "Notes",
    description: "Create rich markdown notes that auto-save as you type.",
    icon: StickyNote,
    to: "/notes",
    color: "from-amber-500/10 to-orange-500/10",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-500/10",
    borderHover: "hover:border-amber-400/40",
    shadowHover: "hover:shadow-amber-500/10",
    arrowColor: "group-hover:text-amber-600",
  },
  {
    id: "code",
    title: "Code Snippets",
    description: "Create beautiful screenshots with syntax highlighting.",
    icon: Code2,
    to: "/code-snippets",
    color: "from-emerald-500/10 to-green-500/10",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-500/10",
    borderHover: "hover:border-emerald-400/40",
    shadowHover: "hover:shadow-emerald-500/10",
    arrowColor: "group-hover:text-emerald-600",
  },
  {
    id: "diagrams",
    title: "Diagrams",
    description: "Sketch flowcharts and architecture with drag-and-drop.",
    icon: Workflow,
    to: "/diagrams",
    color: "from-purple-500/10 to-violet-500/10",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-500/10",
    borderHover: "hover:border-purple-400/40",
    shadowHover: "hover:shadow-purple-500/10",
    arrowColor: "group-hover:text-purple-600",
  },
];

interface DashboardCardProps {
  module: ModuleConfig;
}

const DashboardCard = React.memo(function DashboardCard({ module }: DashboardCardProps) {
  const Icon = module.icon;
  return (
    <Link
      key={module.id}
      to={module.to}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8 transition-all duration-300 hover:shadow-lg ${module.shadowHover} hover:-translate-y-1 ${module.borderHover} animate-in fade-in slide-in-from-bottom-5 duration-500 fill-mode-forwards`}
      style={{ animationDelay: "150ms" }}
    >
      {/* Background gradient blob */}
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 bg-linear-to-br ${module.color} rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div
            className={`p-3.5 rounded-xl ${module.iconBg} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className={`h-7 w-7 ${module.iconColor}`} />
          </div>
          <ArrowRight
            className={`h-5 w-5 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 ${module.arrowColor}`}
          />
        </div>

        <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">{module.title}</h2>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          {module.description}
        </p>
      </div>
    </Link>
  );
});

function Dashboard() {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <AppHeader />

      <div className="flex-1 w-full max-w-7xl mx-auto p-3 md:p-6 pt-4 md:pt-8 mobile-safe-area">
        {/* Welcome Section */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-2">
            Welcome back,{" "}
            <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              {displayName}
            </span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl">
            Pick up where you left off or jump into something new.
          </p>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-12">
          {MODULES.map((module) => (
            <DashboardCard key={module.id} module={module} />
          ))}
        </div>
      </div>
    </main>
  );
}
