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
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ImageUpload } from "@/components/admin/image-upload";

type Attorney = { id: string; name: string };
type BlogPost = {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  excerpt: string;
  cover_image_url: string;
  author_id: string | null;
  status: "draft" | "published";
  is_featured: boolean;
  published_at: string | null;
};

const emptyForm = {
  title: "",
  slug: "",
  category: "",
  content: "",
  excerpt: "",
  cover_image_url: "",
  author_id: "",
  status: "draft" as "draft" | "published",
  is_featured: false,
};

export default function BlogAdmin() {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
    const { data: atts } = await supabase.from("attorneys").select("id, name").order("display_order");
    setAttorneys(atts ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    const payload: any = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      category: form.category,
      content: form.content,
      excerpt: form.excerpt,
      cover_image_url: form.cover_image_url,
      author_id: form.author_id || null,
      status: form.status,
      is_featured: form.is_featured,
    };
    if (form.status === "published" && !editingId) {
      payload.published_at = new Date().toISOString();
    }

    if (editingId) {
      const { error } = await supabase.from("blog_posts").update(payload).eq("id", editingId);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Updated", description: "Blog post updated." });
    } else {
      const { error } = await supabase.from("blog_posts").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Created", description: "Blog post created." });
    }
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(false);
    fetchItems();
  };

  const handleEdit = (item: BlogPost) => {
    setForm({
      title: item.title,
      slug: item.slug,
      category: item.category,
      content: item.content || "",
      excerpt: item.excerpt || "",
      cover_image_url: item.cover_image_url || "",
      author_id: item.author_id || "",
      status: item.status,
      is_featured: item.is_featured,
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await supabase.from("blog_posts").delete().eq("id", id);
    toast({ title: "Deleted", description: "Blog post removed." });
    fetchItems();
  };

  const handlePublish = async (id: string, status: "draft" | "published") => {
    const update: any = { status };
    if (status === "published") update.published_at = new Date().toISOString();
    await supabase.from("blog_posts").update(update).eq("id", id);
    fetchItems();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground mt-1">Manage legal insights and news</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setForm(emptyForm); setEditingId(null); } }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-2" />New Post</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline">{editingId ? "Edit" : "New"} Blog Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" className="bg-background" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Corporate Law" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Select value={form.author_id} onValueChange={(v) => setForm({ ...form, author_id: v })}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select author" /></SelectTrigger>
                    <SelectContent>
                      {attorneys.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <ImageUpload
                  folder="blog"
                  currentUrl={form.cover_image_url}
                  onUpload={(url) => setForm({ ...form, cover_image_url: url })}
                />
              </div>
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief summary..." className="bg-background" rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Content (Markdown)</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Write your article in markdown..." className="bg-background font-mono text-sm" rows={12} />
              </div>
              <div className="flex items-center gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v: "draft" | "published") => setForm({ ...form, status: v })}>
                    <SelectTrigger className="bg-background w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={form.is_featured} onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })} />
                  <Label>Featured</Label>
                </div>
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
        <Card className="bg-card border-border"><CardContent className="p-8 text-center text-muted-foreground">No blog posts yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{item.title}</p>
                    <Badge variant={item.status === "published" ? "default" : "secondary"} className={item.status === "published" ? "bg-green-500/10 text-green-500 border-none" : ""}>
                      {item.status}
                    </Badge>
                    {item.is_featured && <Badge className="bg-accent/10 text-accent border-none">Featured</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.category} {item.published_at && `• ${new Date(item.published_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {item.status === "draft" ? (
                    <Button variant="outline" size="sm" onClick={() => handlePublish(item.id, "published")} className="text-green-500 border-green-500/30">Publish</Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handlePublish(item.id, "draft")} className="text-amber-500 border-amber-500/30">Unpublish</Button>
                  )}
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
