"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RichEditor } from "@/components/admin/rich-editor";

type Testimonial = {
  id: string;
  client_name: string;
  case_type: string;
  quote: string;
  rating: number;
  is_featured: boolean;
  is_active: boolean;
};

const emptyForm = {
  client_name: "",
  case_type: "",
  quote: "",
  rating: 5,
  is_featured: false,
  is_active: true,
};

export default function TestimonialsAdmin() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSave = async () => {
    if (editingId) {
      const { error } = await supabase.from("testimonials").update(form).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Updated", description: "Testimonial updated." });
    } else {
      const { error } = await supabase.from("testimonials").insert(form);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Created", description: "Testimonial added." });
    }
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(false);
    fetchItems();
  };

  const handleEdit = (item: Testimonial) => {
    setForm({
      client_name: item.client_name,
      case_type: item.case_type,
      quote: item.quote,
      rating: item.rating,
      is_featured: item.is_featured,
      is_active: item.is_active,
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("testimonials").delete().eq("id", id);
    toast({ title: "Deleted", description: "Testimonial removed." });
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground mt-1">Manage client testimonials</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setForm(emptyForm); setEditingId(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" />Add Testimonial</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl w-[90vw] flex flex-col p-0">
            <DialogHeader className="px-8 pt-6 pb-4 border-b border-border/60 shrink-0">
              <DialogTitle className="font-headline text-xl">{editingId ? "Edit" : "Add"} Testimonial</DialogTitle>
              <p className="text-sm text-muted-foreground">Capture client feedback and praise.</p>
            </DialogHeader>

            <div className="overflow-y-auto px-8 py-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client Info</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[13px]">Client Name</Label>
                    <Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="J. Doe" className="bg-[#fafafa] border-border/60 h-10 rounded-lg" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[13px]">Case Type</Label>
                    <Input value={form.case_type} onChange={(e) => setForm({ ...form, case_type: e.target.value })} placeholder="Corporate Law" className="bg-[#fafafa] border-border/60 h-10 rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="h-px bg-border/60" />

              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Testimonial</h3>
                <RichEditor
                  content={form.quote}
                  onChange={(html) => setForm({ ...form, quote: html })}
                  placeholder="Write the client's testimonial here..."
                />
              </div>

              <div className="h-px bg-border/60" />

              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rating & Visibility</h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-[13px]">Rating</Label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setForm({ ...form, rating: star })}>
                          <Star className={`h-6 w-6 ${star <= form.rating ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <Label className="text-[13px]">Featured</Label>
                      <p className="text-[11px] text-muted-foreground/60">Highlight on homepage</p>
                    </div>
                    <Switch checked={form.is_featured} onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })} />
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <Label className="text-[13px]">Active</Label>
                      <p className="text-[11px] text-muted-foreground/60">Show on public site</p>
                    </div>
                    <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-4 border-t border-border/60 shrink-0 flex justify-end gap-3">
              <DialogClose asChild><Button variant="outline" className="rounded-lg">Cancel</Button></DialogClose>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 rounded-lg px-8">{editingId ? "Save Changes" : "Add Testimonial"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Card key={i} className="bg-card border-border animate-pulse"><CardContent className="p-4 h-20" /></Card>)}</div>
      ) : items.length === 0 ? (
        <Card className="bg-card border-border"><CardContent className="p-8 text-center text-muted-foreground">No testimonials yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{item.client_name}</p>
                    <span className="text-xs text-muted-foreground">• {item.case_type}</span>
                    {item.is_featured && <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">Featured</span>}
                    {!item.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Hidden</span>}
                  </div>
                  <div className="flex gap-0.5 mb-1">
                    {[...Array(item.rating)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-accent fill-accent" />)}
                  </div>
                  <p className="text-sm text-muted-foreground italic line-clamp-2">&quot;{item.quote}&quot;</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this testimonial?</AlertDialogTitle>
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
