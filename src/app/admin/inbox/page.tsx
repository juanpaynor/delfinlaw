"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MailOpen, Mail, CalendarDays, MessageSquare, ExternalLink, Pencil, Send, Reply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

type Reply = {
  id: string;
  from_email: string;
  from_name: string;
  subject: string;
  body_text: string;
  body_html: string;
  related_inquiry_id: string | null;
  related_appointment_id: string | null;
  is_read: boolean;
  received_at: string;
};

type ComposeState = { to: string; subject: string; body: string };
const EMPTY_COMPOSE: ComposeState = { to: "", subject: "", body: "" };

export default function InboxAdmin() {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Reply | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState<ComposeState>(EMPTY_COMPOSE);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("email_replies")
      .select("*")
      .order("received_at", { ascending: false });
    setReplies(data ?? []);
    setLoading(false);
  }

  async function openReply(reply: Reply) {
    setSelected(reply);
    if (!reply.is_read) {
      await supabase.from("email_replies").update({ is_read: true }).eq("id", reply.id);
      setReplies((prev) =>
        prev.map((r) => (r.id === reply.id ? { ...r, is_read: true } : r))
      );
    }
  }

  async function markAllRead() {
    await supabase.from("email_replies").update({ is_read: true }).eq("is_read", false);
    setReplies((prev) => prev.map((r) => ({ ...r, is_read: true })));
  }

  function openCompose(prefill?: Partial<ComposeState>) {
    setCompose({ ...EMPTY_COMPOSE, ...prefill });
    setComposeOpen(true);
  }

  function openReplyCompose(reply: Reply) {
    openCompose({
      to: reply.from_email,
      subject: reply.subject.startsWith("Re:") ? reply.subject : `Re: ${reply.subject}`,
    });
  }

  async function handleSend() {
    if (!compose.to || !compose.subject || !compose.body) {
      toast({ title: "Missing fields", description: "Fill in all fields before sending.", variant: "destructive" });
      return;
    }
    setSending(true);
    const { error } = await supabase.functions.invoke("compose-email", {
      body: { to: compose.to, subject: compose.subject, body_text: compose.body },
    });
    setSending(false);
    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email sent ✓", description: `Message delivered to ${compose.to}` });
      setComposeOpen(false);
      setCompose(EMPTY_COMPOSE);
    }
  }

  const filtered = filter === "unread" ? replies.filter((r) => !r.is_read) : replies;
  const unreadCount = replies.filter((r) => !r.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
            <MailOpen className="h-7 w-7 text-primary" />
            Inbox
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs ml-1">
                {unreadCount}
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Client email replies received via Resend inbound
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread
          </Button>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 ml-1"
            onClick={() => openCompose()}
          >
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Compose
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-16 p-4" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <MailOpen className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              {filter === "unread" ? "No unread messages." : "No replies received yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((reply) => (
            <Card
              key={reply.id}
              className={`cursor-pointer transition-colors hover:bg-secondary/30 ${
                !reply.is_read ? "border-primary/40 bg-primary/5" : "bg-card"
              }`}
              onClick={() => openReply(reply)}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="mt-0.5 shrink-0">
                  {reply.is_read ? (
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Mail className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm ${!reply.is_read ? "font-semibold" : "font-medium"}`}>
                      {reply.from_name || reply.from_email}
                    </span>
                    <span className="text-xs text-muted-foreground">{reply.from_email}</span>
                    {reply.related_appointment_id && (
                      <Badge variant="outline" className="text-[10px] py-0">
                        <CalendarDays className="h-2.5 w-2.5 mr-1" />
                        Appointment
                      </Badge>
                    )}
                    {reply.related_inquiry_id && (
                      <Badge variant="outline" className="text-[10px] py-0">
                        <MessageSquare className="h-2.5 w-2.5 mr-1" />
                        Inquiry
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm mt-0.5 ${!reply.is_read ? "font-medium" : ""}`}>
                    {reply.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {reply.body_text.slice(0, 120)}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                  {formatDistanceToNow(new Date(reply.received_at), { addSuffix: true })}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-left leading-snug pr-8">
              {selected?.subject}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              {/* Meta */}
              <div className="text-sm text-muted-foreground space-y-1">
                <p>
                  <span className="font-medium text-foreground">From:</span>{" "}
                  {selected.from_name} &lt;{selected.from_email}&gt;
                </p>
                <p>
                  <span className="font-medium text-foreground">Received:</span>{" "}
                  {new Date(selected.received_at).toLocaleString("en-PH", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              {/* Links to related records */}
              {(selected.related_appointment_id || selected.related_inquiry_id) && (
                <div className="flex gap-2">
                  {selected.related_appointment_id && (
                    <Link href="/admin/appointments">
                      <Button variant="outline" size="sm">
                        <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
                        View Appointment
                        <ExternalLink className="h-3 w-3 ml-1.5 opacity-50" />
                      </Button>
                    </Link>
                  )}
                  {selected.related_inquiry_id && (
                    <Link href="/admin/inquiries">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                        View Inquiry
                        <ExternalLink className="h-3 w-3 ml-1.5 opacity-50" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Reply button */}
              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => openReplyCompose(selected)}
                >
                  <Reply className="h-3.5 w-3.5 mr-1.5" />
                  Reply
                </Button>
              </div>

              {/* Body */}
              <div className="border border-border rounded-lg overflow-hidden">
                {selected.body_html ? (
                  <iframe
                    className="w-full h-80 bg-white"
                    srcDoc={`<!DOCTYPE html><html><body style="margin:16px;font-family:sans-serif">${selected.body_html}</body></html>`}
                    sandbox="allow-same-origin"
                    title="Email body"
                  />
                ) : (
                  <pre className="p-4 text-sm whitespace-pre-wrap bg-muted/20 font-sans">
                    {selected.body_text || "(No content)"}
                  </pre>
                )}
              </div>
            </div>
          )}
      </DialogContent>
        </Dialog>

      {/* Compose / Reply dialog */}
      <Dialog open={composeOpen} onOpenChange={(o) => { if (!o) { setComposeOpen(false); setCompose(EMPTY_COMPOSE); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{compose.subject.startsWith("Re:") ? "Reply" : "New Email"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="compose-to">To</Label>
              <Input
                id="compose-to"
                type="email"
                placeholder="client@example.com"
                value={compose.to}
                onChange={(e) => setCompose((p) => ({ ...p, to: e.target.value }))}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="compose-subject">Subject</Label>
              <Input
                id="compose-subject"
                placeholder="Subject"
                value={compose.subject}
                onChange={(e) => setCompose((p) => ({ ...p, subject: e.target.value }))}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="compose-body">Message</Label>
              <Textarea
                id="compose-body"
                placeholder="Write your message here…"
                rows={10}
                value={compose.body}
                onChange={(e) => setCompose((p) => ({ ...p, body: e.target.value }))}
                className="bg-background resize-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setComposeOpen(false); setCompose(EMPTY_COMPOSE); }}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" />
                {sending ? "Sending…" : "Send Email"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}