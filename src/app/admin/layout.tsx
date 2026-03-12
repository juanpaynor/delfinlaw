"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, AuthProvider } from "@/lib/auth";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Scale, Users, MessageSquareQuote, FileText,
  FolderOpen, HelpCircle, Inbox, Settings, FilePlus2, LogOut, ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import Logo from "@/components/logo";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Practice Areas", href: "/admin/practice-areas", icon: Scale },
  { name: "Attorneys", href: "/admin/attorneys", icon: Users },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { name: "Blog Posts", href: "/admin/blog", icon: FileText },
  { name: "Case Studies", href: "/admin/case-studies", icon: FolderOpen },
  { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { name: "Inquiries", href: "/admin/inquiries", icon: Inbox },
  { name: "Pages", href: "/admin/pages", icon: FilePlus2 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (!loading && !user && pathname !== "/admin/login") router.push("/admin/login");
  }, [user, loading, pathname, router]);
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!user && pathname !== "/admin/login") return null;
  return <>{children}</>;
}

function AdminSidebar() {
  const { signOut, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      <div className="p-4 border-b border-border"><Logo /><p className="text-xs text-muted-foreground mt-1">Admin Panel</p></div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
          return (<Link key={link.name} href={link.href} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary")}><link.icon className="h-4 w-4 shrink-0" />{link.name}</Link>);
        })}
      </nav>
      <div className="p-3 border-t border-border space-y-2">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><ChevronLeft className="h-4 w-4" />View Site</Link>
        <button onClick={async () => { await signOut(); router.push("/admin/login"); }} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"><LogOut className="h-4 w-4" />Sign Out</button>
        {user && <p className="px-3 text-xs text-muted-foreground truncate">{user.email}</p>}
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  return (
    <AuthProvider>
      <AdminGuard>
        <AdminLayoutInner>{children}</AdminLayoutInner>
      </AdminGuard>
      <Toaster />
    </AuthProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-auto"><div className="p-6 md:p-8 max-w-6xl">{children}</div></main>
    </div>
  );
}
