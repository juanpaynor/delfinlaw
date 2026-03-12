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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import { useToast } from "@/hooks/use-toast";

type Attorney = {
  id: string;
  name: string;
  title: string;
  slug: string;
  photo_url: string;
  bio: string;
  education: string;
  bar_admissions: string;
  email: string;
  phone: string;
  specialties: string[];
  display_order: number;
  is_active: boolean;
};

const emptyForm = {
  name: "",
  title: "",
  slug: "",
  photo_url: "",
  bio: "",
  education: "",
  bar_admissions: "",
  email: "",
  phone: "",
  specialties: [] as string[],
  specialtiesInput: "",
  display_order: 0,
  is_active: true,
};

export default function AttorneysAdmin() {
  const [items, setItems] = useState<Attorney[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from("attorneys").select("*").order("display_order");
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    const specialties = form.specialtiesInput.split(",").map((s) => s.trim()).filter(Boolean);
    const payload = {
      name: form.name,
      title: form.title,
      slug: form.slug || generateSlug(form.name),
      photo_url: form.photo_url,
      bio: form.bio,
      education: form.education,
      bar_admissions: form.bar_admissions,
      email: form.email,
      phone: form.phone,
      specialties,
      display_order: form.display_order,
      is_active: form.is_active,
    };

    if (editingId) {
      const { error } = await supabase.from("attorneys").update(payload).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Updated", description: `${form.name} has been updated.` });
    } else {
      payload.display_order = items.length + 1;
      const { error } = await supabase.from("attorneys").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Created", description: `${form.name} has been added.` });
    }

    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(false);
    fetchItems();
  };

  const handleEdit = (item: Attorney) => {
    setForm({
      name: item.name,
      title: item.title,
      slug: item.slug,
      photo_url: item.photo_url,
      bio: item.bio,
      education: item.education || "",
      bar_admissions: item.bar_admissions || "",
      email: item.email || "",
      phone: item.phone || "",
      specialties: item.specialties,
      specialtiesInput: (item.specialties || []).join(", "),
      display_order: item.display_order,
      is_active: item.is_active,
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("attorneys").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted", description: "Attorney removed." });
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Attorneys</h1>
          <p className="text-muted-foreground mt-1">Manage your team members</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setForm(emptyForm); setEditingId(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" />Add Attorney</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline">{editingId ? "Edit" : "Add"} Attorney</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Senior Partner" className="bg-background" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Photo</Label>
                <ImageUpload
                  folder="attorneys"
                  currentUrl={form.photo_url}
                  onUpload={(url) => setForm({ ...form, photo_url: url })}
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Professional biography..." className="bg-background" rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Specialties (comma separated)</Label>
                <Input value={form.specialtiesInput} onChange={(e) => setForm({ ...form, specialtiesInput: e.target.value })} placeholder="Corporate Law, Real Estate Law" className="bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@delfinlaw.com" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(123) 456-7890" className="bg-background" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Education</Label>
                <Textarea value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="J.D., Harvard Law School" className="bg-background" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Bar Admissions</Label>
                <Input value={form.bar_admissions} onChange={(e) => setForm({ ...form, bar_admissions: e.target.value })} placeholder="State of New York, 2005" className="bg-background" />
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
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Card key={i} className="bg-card border-border animate-pulse"><CardContent className="p-4 h-16" /></Card>)}</div>
      ) : items.length === 0 ? (
        <Card className="bg-card border-border"><CardContent className="p-8 text-center text-muted-foreground">No attorneys yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                {item.photo_url ? (
                  <img src={item.photo_url} alt={item.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {item.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{item.name}</p>
                    {!item.is_active && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Hidden</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={item.is_active} onCheckedChange={async (checked) => { await supabase.from("attorneys").update({ is_active: checked }).eq("id", item.id); fetchItems(); }} />
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
