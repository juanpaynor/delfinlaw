"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RichEditor } from "@/components/admin/rich-editor";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_active: boolean;
};

const emptyForm = {
  question: "",
  answer: "",
  category: "",
  display_order: 0,
  is_active: true,
};

export default function FAQsAdmin() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from("faqs").select("*").order("display_order");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (editingId) {
      const { error } = await supabase.from("faqs").update(form).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Updated", description: "FAQ updated." });
    } else {
      const payload = { ...form, display_order: items.length + 1 };
      const { error } = await supabase.from("faqs").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Created", description: "FAQ added." });
    }
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(false);
    fetchItems();
  };

  const handleEdit = (item: FAQ) => {
    setForm({
      question: item.question,
      answer: item.answer,
      category: item.category || "",
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("faqs").delete().eq("id", id);
    toast({ title: "Deleted", description: "FAQ removed." });
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">FAQs</h1>
          <p className="text-muted-foreground mt-1">Manage frequently asked questions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setForm(emptyForm); setEditingId(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" />Add FAQ</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl w-[90vw] flex flex-col p-0">
            <DialogHeader className="px-8 pt-6 pb-4 border-b border-border/60 shrink-0">
              <DialogTitle className="font-headline text-xl">{editingId ? "Edit" : "Add"} FAQ</DialogTitle>
              <p className="text-sm text-muted-foreground">Write a clear question and detailed answer.</p>
            </DialogHeader>

            <div className="overflow-y-auto px-8 py-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Question</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[13px]">Question</Label>
                    <Input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="What is...?" className="bg-[#fafafa] border-border/60 h-10 rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px]">Category</Label>
                    <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="General, Billing, etc." className="bg-[#fafafa] border-border/60 h-10 rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Answer</h3>
                <RichEditor
                  content={form.answer}
                  onChange={(html) => setForm({ ...form, answer: html })}
                  placeholder="Write a detailed answer..."
                />
              </div>

              <div className="h-px bg-border/60" />

              <div className="flex items-center justify-between py-1">
                <div>
                  <Label className="text-[13px]">Active</Label>
                  <p className="text-[11px] text-muted-foreground/60">Show on public site</p>
                </div>
                <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
              </div>
            </div>

            <div className="px-8 py-4 border-t border-border/60 shrink-0 flex justify-end gap-3">
              <DialogClose asChild><Button variant="outline" className="rounded-lg">Cancel</Button></DialogClose>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 rounded-lg px-8">{editingId ? "Save Changes" : "Add FAQ"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Card key={i} className="bg-card border-border animate-pulse"><CardContent className="p-4 h-16" /></Card>)}</div>
      ) : items.length === 0 ? (
        <Card className="bg-card border-border"><CardContent className="p-8 text-center text-muted-foreground">No FAQs yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{item.question}</p>
                    {item.category && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{item.category}</span>}
                    {!item.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Hidden</span>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{item.answer}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={item.is_active} onCheckedChange={async (checked) => { await supabase.from("faqs").update({ is_active: checked }).eq("id", item.id); fetchItems(); }} />
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this FAQ?</AlertDialogTitle>
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
