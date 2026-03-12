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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type PracticeArea = { id: string; name: string };
type CaseStudy = {
  id: string;
  title: string;
  slug: string;
  practice_area_id: string | null;
  challenge: string;
  approach: string;
  outcome: string;
  cover_image_url: string;
  is_active: boolean;
};

const emptyForm = {
  title: "",
  slug: "",
  practice_area_id: "",
  challenge: "",
  approach: "",
  outcome: "",
  cover_image_url: "",
  is_active: true,
};

export default function CaseStudiesAdmin() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [practiceAreas, setPracticeAreas] = useState<PracticeArea[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from("case_studies").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    const { data: pa } = await supabase.from("practice_areas").select("id, name").order("display_order");
    setPracticeAreas(pa ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    const payload = {
      ...form,
      slug: form.slug || generateSlug(form.title),
      practice_area_id: form.practice_area_id || null,
    };

    if (editingId) {
      const { error } = await supabase.from("case_studies").update(payload).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Updated", description: "Case study updated." });
    } else {
      const { error } = await supabase.from("case_studies").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Created", description: "Case study created." });
    }
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(false);
    fetchItems();
  };

  const handleEdit = (item: CaseStudy) => {
    setForm({
      title: item.title,
      slug: item.slug,
      practice_area_id: item.practice_area_id || "",
      challenge: item.challenge || "",
      approach: item.approach || "",
      outcome: item.outcome || "",
      cover_image_url: item.cover_image_url || "",
      is_active: item.is_active,
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("case_studies").delete().eq("id", id);
    toast({ title: "Deleted", description: "Case study removed." });
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Case Studies</h1>
          <p className="text-muted-foreground mt-1">Showcase your successful outcomes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setForm(emptyForm); setEditingId(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" />Add Case Study</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline">{editingId ? "Edit" : "Add"} Case Study</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Case title" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Practice Area</Label>
                  <Select value={form.practice_area_id} onValueChange={(v) => setForm({ ...form, practice_area_id: v })}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select area" /></SelectTrigger>
                    <SelectContent>
                      {practiceAreas.map((pa) => <SelectItem key={pa.id} value={pa.id}>{pa.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cover Image URL</Label>
                <Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} placeholder="https://..." className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label>Challenge</Label>
                <Textarea value={form.challenge} onChange={(e) => setForm({ ...form, challenge: e.target.value })} placeholder="What was the client facing?" className="bg-background" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Approach</Label>
                <Textarea value={form.approach} onChange={(e) => setForm({ ...form, approach: e.target.value })} placeholder="How did your team tackle it?" className="bg-background" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Outcome</Label>
                <Textarea value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} placeholder="What was the result?" className="bg-background" rows={3} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
                <Label>Active</Label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">{editingId ? "Update" : "Create"}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(2)].map((_, i) => <Card key={i} className="bg-card border-border animate-pulse"><CardContent className="p-4 h-16" /></Card>)}</div>
      ) : items.length === 0 ? (
        <Card className="bg-card border-border"><CardContent className="p-8 text-center text-muted-foreground">No case studies yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{item.title}</p>
                    {!item.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Hidden</span>}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{item.outcome || item.challenge}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={item.is_active} onCheckedChange={async (checked) => { await supabase.from("case_studies").update({ is_active: checked }).eq("id", item.id); fetchItems(); }} />
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete &quot;{item.title}&quot;?</AlertDialogTitle>
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
