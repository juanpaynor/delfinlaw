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

type PracticeArea = {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  short_description: string;
  long_description: string;
  display_order: number;
  is_active: boolean;
};

const emptyForm: Omit<PracticeArea, "id"> = {
  name: "",
  slug: "",
  icon_name: "Briefcase",
  short_description: "",
  long_description: "",
  display_order: 0,
  is_active: true,
};

const iconOptions = [
  "Users", "Building2", "Home", "HeartHandshake", "Briefcase",
  "NotebookText", "Gavel", "Scale", "Shield", "FileText",
  "Landmark", "HandCoins", "Car", "Stethoscope", "Globe",
];

export default function PracticeAreasAdmin() {
  const [items, setItems] = useState<PracticeArea[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from("practice_areas").select("*").order("display_order");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    const payload = { ...form, slug: form.slug || generateSlug(form.name) };

    if (editingId) {
      const { error } = await supabase.from("practice_areas").update(payload).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Updated", description: `${form.name} has been updated.` });
    } else {
      payload.display_order = items.length + 1;
      const { error } = await supabase.from("practice_areas").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Created", description: `${form.name} has been created.` });
    }

    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(false);
    fetchItems();
  };

  const handleEdit = (item: PracticeArea) => {
    setForm({
      name: item.name,
      slug: item.slug,
      icon_name: item.icon_name,
      short_description: item.short_description,
      long_description: item.long_description,
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("practice_areas").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted", description: "Practice area removed." });
    fetchItems();
  };

  const handleToggleActive = async (id: string, is_active: boolean) => {
    await supabase.from("practice_areas").update({ is_active }).eq("id", id);
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Practice Areas</h1>
          <p className="text-muted-foreground mt-1">Manage your firm&apos;s legal services</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setForm(emptyForm); setEditingId(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" />Add Practice Area</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-4xl w-[95vw] h-[85vh] flex flex-col p-0">
            <DialogHeader className="px-8 pt-6 pb-4 border-b border-border/60 shrink-0">
              <DialogTitle className="font-headline text-xl">{editingId ? "Edit" : "Add"} Practice Area</DialogTitle>
              <p className="text-sm text-muted-foreground">Define the legal services your firm offers.</p>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="grid md:grid-cols-[280px_1fr] gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Details</h3>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-[13px]">Name</Label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Corporate Law" className="bg-[#fafafa] border-border/60 h-10 rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[13px]">Slug</Label>
                        <Input value={form.slug || generateSlug(form.name)} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="bg-[#fafafa] border-border/60 h-10 rounded-lg" />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Icon</h3>
                    <div className="flex flex-wrap gap-2">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setForm({ ...form, icon_name: icon })}
                          className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${form.icon_name === icon ? "bg-primary text-primary-foreground border-primary" : "bg-[#fafafa] border-border/60 hover:border-primary/50"}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
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
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Short Description</h3>
                    <Textarea
                      value={form.short_description}
                      onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                      placeholder="Brief description shown on cards..."
                      className="bg-[#fafafa] border-border/60 rounded-lg text-justify min-h-[80px] leading-relaxed resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Description</h3>
                    <RichEditor
                      content={form.long_description}
                      onChange={(html) => setForm({ ...form, long_description: html })}
                      placeholder="Detailed description for the dedicated page..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-8 py-4 border-t border-border/60 shrink-0 flex justify-end gap-3">
              <DialogClose asChild><Button variant="outline" className="rounded-lg">Cancel</Button></DialogClose>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 rounded-lg px-8">{editingId ? "Save Changes" : "Add Practice Area"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Card key={i} className="bg-card border-border animate-pulse"><CardContent className="p-4 h-16" /></Card>)}</div>
      ) : items.length === 0 ? (
        <Card className="bg-card border-border"><CardContent className="p-8 text-center text-muted-foreground">No practice areas yet. Click &quot;Add Practice Area&quot; to create one.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{item.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{item.icon_name}</span>
                    {!item.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Hidden</span>}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{item.short_description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={item.is_active} onCheckedChange={(checked) => handleToggleActive(item.id, checked)} />
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete &quot;{item.name}&quot;?</AlertDialogTitle>
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
