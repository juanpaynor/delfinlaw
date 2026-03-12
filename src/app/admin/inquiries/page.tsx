"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Mail, Phone, Eye, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  practice_area_id: string | null;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "archived";
  admin_notes: string;
  created_at: string;
};

const statusColors: Record<string, string> = {
  new: "bg-red-500/10 text-red-500",
  read: "bg-amber-500/10 text-amber-500",
  replied: "bg-green-500/10 text-green-500",
  archived: "bg-muted text-muted-foreground",
};

export default function InquiriesAdmin() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    let query = supabase.from("inquiries").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [filter]);

  const handleStatusChange = async (id: string, status: string) => {
    await supabase.from("inquiries").update({ status }).eq("id", id);
    if (selected && selected.id === id) setSelected({ ...selected, status: status as any });
    fetchItems();
  };

  const handleNotesUpdate = async (id: string, admin_notes: string) => {
    await supabase.from("inquiries").update({ admin_notes }).eq("id", id);
  };

  const handleView = async (item: Inquiry) => {
    setSelected(item);
    setDialogOpen(true);
    if (item.status === "new") {
      await supabase.from("inquiries").update({ status: "read" }).eq("id", item.id);
      fetchItems();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("inquiries").delete().eq("id", id);
    toast({ title: "Deleted", description: "Inquiry removed." });
    fetchItems();
  };

  const newCount = items.filter(i => i.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">
            Inquiries
            {newCount > 0 && <Badge className="ml-3 bg-red-500 text-white">{newCount} new</Badge>}
          </h1>
          <p className="text-muted-foreground mt-1">Manage consultation requests and messages</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-32 bg-background"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="read">Read</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-headline">Inquiry from {selected.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-4 text-sm">
                  <a href={`mailto:${selected.email}`} className="flex items-center gap-1.5 text-primary hover:underline">
                    <Mail className="h-4 w-4" />{selected.email}
                  </a>
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} className="flex items-center gap-1.5 text-primary hover:underline">
                      <Phone className="h-4 w-4" />{selected.phone}
                    </a>
                  )}
                </div>
                {selected.subject && (
                  <div>
                    <Label className="text-muted-foreground text-xs">Subject</Label>
                    <p className="font-medium">{selected.subject}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground text-xs">Message</Label>
                  <p className="text-sm whitespace-pre-wrap mt-1 p-3 bg-background rounded-md">{selected.message}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <Select value={selected.status} onValueChange={(v) => handleStatusChange(selected.id, v)}>
                    <SelectTrigger className="bg-background w-32 mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="replied">Replied</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Admin Notes</Label>
                  <Textarea
                    defaultValue={selected.admin_notes || ""}
                    onBlur={(e) => handleNotesUpdate(selected.id, e.target.value)}
                    placeholder="Internal notes..."
                    className="bg-background mt-1"
                    rows={3}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Received: {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Card key={i} className="bg-card border-border animate-pulse"><CardContent className="p-4 h-16" /></Card>)}</div>
      ) : items.length === 0 ? (
        <Card className="bg-card border-border"><CardContent className="p-8 text-center text-muted-foreground">No inquiries {filter !== "all" ? `with status "${filter}"` : "yet"}.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className={`bg-card border-border cursor-pointer hover:border-primary/30 transition-colors ${item.status === "new" ? "border-l-2 border-l-red-500" : ""}`} onClick={() => handleView(item)}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-medium ${item.status === "new" ? "text-foreground" : "text-muted-foreground"}`}>{item.name}</p>
                    <Badge className={`${statusColors[item.status]} border-none text-xs`}>{item.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{item.subject || item.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleStatusChange(item.id, "archived")}>
                    <Archive className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this inquiry?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
