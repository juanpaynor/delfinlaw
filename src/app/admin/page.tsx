"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Users, MessageSquareQuote, FileText, FolderOpen, HelpCircle, Inbox, ArrowUpRight, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type DashboardStat = {
  label: string;
  count: number;
  icon: any;
  href: string;
  color: string;
  bg: string;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const tables = [
        { table: "practice_areas", label: "Practice Areas", icon: Scale, href: "/admin/practice-areas", color: "text-emerald-600", bg: "bg-emerald-50" },
        { table: "attorneys", label: "Attorneys", icon: Users, href: "/admin/attorneys", color: "text-blue-600", bg: "bg-blue-50" },
        { table: "testimonials", label: "Testimonials", icon: MessageSquareQuote, href: "/admin/testimonials", color: "text-amber-600", bg: "bg-amber-50" },
        { table: "blog_posts", label: "Blog Posts", icon: FileText, href: "/admin/blog", color: "text-violet-600", bg: "bg-violet-50" },
        { table: "case_studies", label: "Case Studies", icon: FolderOpen, href: "/admin/case-studies", color: "text-cyan-600", bg: "bg-cyan-50" },
        { table: "faqs", label: "FAQs", icon: HelpCircle, href: "/admin/faqs", color: "text-orange-600", bg: "bg-orange-50" },
        { table: "inquiries", label: "Inquiries", icon: Inbox, href: "/admin/inquiries", color: "text-rose-600", bg: "bg-rose-50" },
      ];

      const results = await Promise.all(
        tables.map(async (t) => {
          const { count } = await supabase.from(t.table).select("*", { count: "exact", head: true });
          return { ...t, count: count ?? 0 };
        })
      );
      setStats(results);

      const { data: inquiries } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentInquiries(inquiries ?? []);

      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-headline text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your website content</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-border/60 animate-pulse h-[88px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your website content</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-white rounded-xl border border-border/60 p-5 hover:shadow-md hover:border-border transition-all cursor-pointer group">
              <div className="flex items-start justify-between">
                <div className={cn("p-2.5 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold tracking-tight">{stat.count}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Inquiries */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline text-lg font-bold">Recent Inquiries</h2>
          <Link href="/admin/inquiries" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        {recentInquiries.length === 0 ? (
          <div className="bg-white rounded-xl border border-border/60 p-10 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No inquiries yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border/60 divide-y divide-border/60">
            {recentInquiries.map((inq) => (
              <div key={inq.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                {/* Avatar */}
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {inq.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{inq.name}</p>
                    <span className={cn(
                      "text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0",
                      inq.status === 'new' ? 'bg-rose-50 text-rose-600' :
                      inq.status === 'read' ? 'bg-amber-50 text-amber-600' :
                      inq.status === 'replied' ? 'bg-emerald-50 text-emerald-600' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {inq.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {inq.subject || inq.message?.slice(0, 100)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 shrink-0">
                  <Clock className="h-3 w-3" />
                  {new Date(inq.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
