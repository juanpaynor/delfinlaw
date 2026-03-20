"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, AuthProvider } from "@/lib/auth";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Scale, Users, MessageSquareQuote, FileText,
  FolderOpen, HelpCircle, Inbox, Settings, FilePlus2, LogOut, ExternalLink,
  Menu, X, Images,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { divider: true, label: "Content" },
  { name: "Hero Slides", href: "/admin/hero-slides", icon: Images },
  { name: "Practice Areas", href: "/admin/practice-areas", icon: Scale },
  { name: "Attorneys", href: "/admin/attorneys", icon: Users },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
  { name: "Blog Posts", href: "/admin/blog", icon: FileText },
  { name: "Case Studies", href: "/admin/case-studies", icon: FolderOpen },
  { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
  { divider: true, label: "System" },
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
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
  if (!user && pathname !== "/admin/login") return null;
  return <>{children}</>;
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const { signOut, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Scale className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-headline text-base font-bold text-foreground leading-tight">Delfin Law</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {sidebarLinks.map((link, i) => {
          if ('divider' in link) {
            return (
              <div key={i} className="pt-5 pb-2 px-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">{link.label}</p>
              </div>
            );
          }
          const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href!));
          return (
            <Link
              key={link.name}
              href={link.href!}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          href="/"
          target="_blank"
          onClick={onLinkClick}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View Live Site
        </Link>
        <button
          onClick={async () => { await signOut(); router.push("/admin/login"); }}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
        {user && (
          <div className="px-3 pt-2 pb-1">
            <p className="text-[11px] text-muted-foreground/60 truncate">{user.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#f5f5f7]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-[260px] bg-white border-r border-border/60 flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile header + sheet */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-border/60 px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Scale className="h-4 w-4 text-primary-foreground" />
            </div>
            <p className="font-headline text-sm font-bold">Delfin Law</p>
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] p-0 bg-white">
              <SidebarContent onLinkClick={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-5 md:p-8 max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
