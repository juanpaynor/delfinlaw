"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Users, MessageSquareQuote, FileText, FolderOpen, HelpCircle, Inbox } from "lucide-react";
import Link from "next/link";

type DashboardStat = {
  label: string;
  count: number;
  icon: any;
  href: string;
  color: string;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentInquiries, setRecentInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const tables = [
        { table: "practice_areas", label: "Practice Areas", icon: Scale, href: "/admin/practice-areas", color: "text-green-500" },
        { table: "attorneys", label: "Attorneys", icon: Users, href: "/admin/attorneys", color: "text-blue-500" },
        { table: "testimonials", label: "Testimonials", icon: MessageSquareQuote, href: "/admin/testimonials", color: "text-amber-500" },
        { table: "blog_posts", label: "Blog Posts", icon: FileText, href: "/admin/blog", color: "text-purple-500" },
        { table: "case_studies", label: "Case Studies", icon: FolderOpen, href: "/admin/case-studies", color: "text-cyan-500" },
        { table: "faqs", label: "FAQs", icon: HelpCircle, href: "/admin/faqs", color: "text-orange-500" },
        { table: "inquiries", label: "Inquiries", icon: Inbox, href: "/admin/inquiries", color: "text-red-500" },
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
        <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(7)].map((_, i) => (
            <Card key={i} className="bg-card border-border animate-pulse">
              <CardContent className="p-6 h-24" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your website content</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="font-headline text-xl font-bold mb-4">Recent Inquiries</h2>
        {recentInquiries.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="p-6 text-center text-muted-foreground">
              No inquiries yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentInquiries.map((inq) => (
              <Card key={inq.id} className="bg-card border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{inq.name}</p>
                    <p className="text-sm text-muted-foreground">{inq.subject || inq.message?.slice(0, 80)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      inq.status === 'new' ? 'bg-red-500/10 text-red-500' :
                      inq.status === 'read' ? 'bg-amber-500/10 text-amber-500' :
                      inq.status === 'replied' ? 'bg-green-500/10 text-green-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {inq.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
