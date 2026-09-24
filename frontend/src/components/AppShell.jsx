import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation, NavLink } from "react-router-dom";
import { toast } from "sonner";
import {
  Home, FolderGit2, LayoutTemplate, Bot, Plug, CreditCard, Settings as SettingsIcon,
  HelpCircle, BookOpen, PanelLeftClose, PanelLeft, Search, Bell, ChevronDown,
  Sun, Moon, Monitor, LogOut, User as UserIcon, Check, ChevronsUpDown,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Kbd } from "@/components/ds/Kbd";
import { CommandPalette } from "@/components/CommandPalette";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/projects", label: "Projects", icon: FolderGit2 },
  { to: "/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/agents", label: "Agents", icon: Bot },
  { to: "/integrations", label: "Integrations", icon: Plug },
  { to: "/usage", label: "Usage & Billing", icon: CreditCard },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

const NOTIFS = [
  { id: 1, title: "Build finished", body: "Northwind Analytics is ready to preview.", time: "2m", dot: "success" },
  { id: 2, title: "Deploy failed", body: "Ledger Mobile — missing environment variable.", time: "1h", dot: "danger" },
  { id: 3, title: "New comment", body: "Maya pinned a note on the pricing card.", time: "3h", dot: "info" },
];

function NavItem({ item, collapsed }) {
  return (
    <NavLink
      to={item.to}
      data-testid={`nav-${item.label.toLowerCase().replace(/[^a-z]/g, "-")}`}
      className={({ isActive }) =>
        cn(
          "group relative flex h-9 items-center gap-3 rounded-[8px] px-2.5 text-[13px] font-medium transition-colors",
          collapsed && "justify-center px-0",
          isActive ? "bg-ac-elevated text-ac-text" : "text-ac-text-secondary hover:bg-ac-elevated hover:text-ac-text"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-0 h-4 w-0.5 rounded-full bg-ac-accent" />}
          <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          {!collapsed && <span>{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

export function AppShell() {
  const { user, logout } = useAuth();
  const { theme, setTheme, resolved } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("ac_sidebar") === "1");
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => { localStorage.setItem("ac_sidebar", collapsed ? "1" : "0"); }, [collapsed]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((o) => !o); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const doLogout = async () => { await logout(); navigate("/", { replace: true }); };
  const initials = (user?.name || "U").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden bg-ac-base">
      {/* Sidebar */}
      <aside className={cn("flex shrink-0 flex-col border-r border-ac-line bg-ac-surface transition-[width] duration-200", collapsed ? "w-16" : "w-60")}>
        {/* workspace switcher */}
        <div className="flex h-14 items-center gap-2 border-b border-ac-line px-3">
          {collapsed ? (
            <Logo showWord={false} size={20} className="mx-auto" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-1 items-center gap-2 rounded-[8px] px-2 py-1.5 hover:bg-ac-elevated" data-testid="workspace-switcher">
                  <Logo showWord={false} size={18} />
                  <span className="text-[13px] font-medium text-ac-text">{user?.name?.split(" ")[0] || "My"}'s workspace</span>
                  <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-ac-text-muted" strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 border-ac-line bg-ac-elevated">
                <DropdownMenuLabel className="text-ac-text-muted">Workspaces</DropdownMenuLabel>
                <DropdownMenuItem className="text-ac-text"><Check className="mr-2 h-4 w-4 text-ac-accent" />{user?.name?.split(" ")[0] || "My"}'s workspace</DropdownMenuItem>
                <DropdownMenuItem className="text-ac-text-secondary" onClick={() => toast("Team workspaces", { description: "Invite teammates from Usage & Billing." })}>Create a workspace</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {NAV.map((item) => <NavItem key={item.to} item={item} collapsed={collapsed} />)}
        </nav>

        <div className="space-y-0.5 border-t border-ac-line p-2">
          <button onClick={() => toast("Help center", { description: "Guides and shortcuts are on the way." })} className={cn("flex h-9 w-full items-center gap-3 rounded-[8px] px-2.5 text-[13px] text-ac-text-secondary hover:bg-ac-elevated hover:text-ac-text", collapsed && "justify-center px-0")} data-testid="nav-help">
            <HelpCircle className="h-4 w-4" strokeWidth={1.5} />{!collapsed && "Help"}
          </button>
          <button onClick={() => toast("Docs", { description: "Documentation opens in a new tab in production." })} className={cn("flex h-9 w-full items-center gap-3 rounded-[8px] px-2.5 text-[13px] text-ac-text-secondary hover:bg-ac-elevated hover:text-ac-text", collapsed && "justify-center px-0")} data-testid="nav-docs">
            <BookOpen className="h-4 w-4" strokeWidth={1.5} />{!collapsed && "Docs"}
          </button>
          <button onClick={() => setCollapsed((c) => !c)} className={cn("flex h-9 w-full items-center gap-3 rounded-[8px] px-2.5 text-[13px] text-ac-text-muted hover:bg-ac-elevated hover:text-ac-text", collapsed && "justify-center px-0")} data-testid="sidebar-collapse">
            {collapsed ? <PanelLeft className="h-4 w-4" strokeWidth={1.5} /> : <><PanelLeftClose className="h-4 w-4" strokeWidth={1.5} /> Collapse</>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-ac-line bg-ac-base px-5">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex h-9 w-full max-w-sm items-center gap-2.5 rounded-[8px] border border-ac-line bg-ac-surface px-3 text-[13px] text-ac-text-muted transition-colors hover:border-ac-line-strong"
            data-testid="open-command-palette"
          >
            <Search className="h-4 w-4" strokeWidth={1.5} />
            <span>Search or run a command</span>
            <span className="ml-auto flex items-center gap-1"><Kbd>⌘</Kbd><Kbd>K</Kbd></span>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            {/* notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative rounded-[8px] p-2 text-ac-text-secondary hover:bg-ac-elevated hover:text-ac-text" aria-label="Notifications" data-testid="notifications-bell">
                  <Bell className="h-4 w-4" strokeWidth={1.5} />
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-ac-accent" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 border-ac-line bg-ac-elevated p-0">
                <div className="flex items-center justify-between border-b border-ac-line px-3 py-2.5">
                  <span className="text-[13px] font-semibold text-ac-text">Notifications</span>
                  <button className="text-[12px] text-ac-text-muted hover:text-ac-text" onClick={() => toast("Marked all as read")}>Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {NOTIFS.map((n) => (
                    <div key={n.id} className="flex gap-3 border-b border-ac-line px-3 py-3 last:border-0">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ac-${n.dot}`} />
                      <div>
                        <div className="text-[13px] font-medium text-ac-text">{n.title}</div>
                        <div className="text-[12px] text-ac-text-muted">{n.body}</div>
                        <div className="mt-0.5 text-[11px] text-ac-text-muted">{n.time} ago</div>
                      </div>
                    </div>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* user menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-[8px] p-1 pr-2 hover:bg-ac-elevated" data-testid="user-menu">
                  <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-ac-elevated text-[12px] font-semibold text-ac-text">
                    {user?.picture ? <img src={user.picture} alt="" className="h-full w-full object-cover" /> : initials}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-ac-text-muted" strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 border-ac-line bg-ac-elevated">
                <div className="px-2 py-2">
                  <div className="text-[13px] font-medium text-ac-text">{user?.name}</div>
                  <div className="text-[12px] text-ac-text-muted">{user?.email}</div>
                </div>
                <DropdownMenuSeparator className="bg-ac-line" />
                <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-ac-text-muted">Theme</DropdownMenuLabel>
                <div className="flex gap-1 px-2 pb-1.5">
                  {[{ k: "light", i: Sun }, { k: "dark", i: Moon }, { k: "system", i: Monitor }].map((t) => (
                    <button key={t.k} onClick={() => setTheme(t.k)} className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-[6px] border px-2 py-1.5 text-[12px]", theme === t.k ? "border-ac-accent text-ac-text" : "border-ac-line text-ac-text-secondary hover:bg-ac-surface")} data-testid={`theme-${t.k}`}>
                      <t.i className="h-3.5 w-3.5" strokeWidth={1.5} /> {t.k[0].toUpperCase() + t.k.slice(1)}
                    </button>
                  ))}
                </div>
                <DropdownMenuSeparator className="bg-ac-line" />
                <DropdownMenuItem className="text-ac-text-secondary" onClick={() => navigate("/settings")}><UserIcon className="mr-2 h-4 w-4" /> Account settings</DropdownMenuItem>
                <DropdownMenuItem className="text-ac-danger focus:text-ac-danger" onClick={doLogout} data-testid="logout-btn"><LogOut className="mr-2 h-4 w-4" /> Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={paletteOpen} setOpen={setPaletteOpen} />
    </div>
  );
}
