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
import { RichEditor } from "@/components/admin/rich-editor";
import { ImageUpload } from "@/components/admin/image-upload";

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
          <DialogContent className="bg-card border-border max-w-4xl w-[95vw] h-[85vh] flex flex-col p-0">
            <DialogHeader className="px-8 pt-6 pb-4 border-b border-border/60 shrink-0">
              <DialogTitle className="font-headline text-xl">{editingId ? "Edit" : "Add"} Case Study</DialogTitle>
              <p className="text-sm text-muted-foreground">Document a successful case outcome.</p>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="grid md:grid-cols-[280px_1fr] gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</h3>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-[13px]">Title</Label>
                        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Case title" className="bg-[#fafafa] border-border/60 h-10 rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[13px]">Practice Area</Label>
                        <Select value={form.practice_area_id} onValueChange={(v) => setForm({ ...form, practice_area_id: v })}>
                          <SelectTrigger className="bg-[#fafafa] border-border/60 h-10 rounded-lg"><SelectValue placeholder="Select area" /></SelectTrigger>
                          <SelectContent>
                            {practiceAreas.map((pa) => <SelectItem key={pa.id} value={pa.id}>{pa.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cover Image</h3>
                    <ImageUpload
                      folder="blog"
                      currentUrl={form.cover_image_url}
                      onUpload={(url) => setForm({ ...form, cover_image_url: url })}
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

                {/* Right Column */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Challenge</h3>
                    <RichEditor
                      content={form.challenge}
                      onChange={(html) => setForm({ ...form, challenge: html })}
                      placeholder="What was the client facing?"
                    />
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Approach</h3>
                    <RichEditor
                      content={form.approach}
                      onChange={(html) => setForm({ ...form, approach: html })}
                      placeholder="How did your team tackle it?"
                    />
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outcome</h3>
                    <RichEditor
                      content={form.outcome}
                      onChange={(html) => setForm({ ...form, outcome: html })}
                      placeholder="What was the result?"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-4 border-t border-border/60 shrink-0 flex justify-end gap-3">
              <DialogClose asChild><Button variant="outline" className="rounded-lg">Cancel</Button></DialogClose>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 rounded-lg px-8">{editingId ? "Save Changes" : "Add Case Study"}</Button>
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
