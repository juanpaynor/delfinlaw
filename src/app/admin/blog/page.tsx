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
import { RichEditor } from "@/components/admin/rich-editor";

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
          <DialogContent className="bg-card border-border max-w-4xl w-[95vw] h-[85vh] flex flex-col p-0">
            <DialogHeader className="px-8 pt-6 pb-4 border-b border-border/60 shrink-0">
              <DialogTitle className="font-headline text-xl">{editingId ? "Edit" : "New"} Blog Post</DialogTitle>
              <p className="text-sm text-muted-foreground">Write and publish legal insights.</p>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="grid md:grid-cols-[280px_1fr] gap-8">
                {/* Left Column: Meta */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Post Details</h3>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-[13px]">Title</Label>
                        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Post title" className="bg-[#fafafa] border-border/60 h-10 rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[13px]">Category</Label>
                        <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Corporate Law" className="bg-[#fafafa] border-border/60 h-10 rounded-lg" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[13px]">Author</Label>
                        <Select value={form.author_id} onValueChange={(v) => setForm({ ...form, author_id: v })}>
                          <SelectTrigger className="bg-[#fafafa] border-border/60 h-10 rounded-lg"><SelectValue placeholder="Select author" /></SelectTrigger>
                          <SelectContent>
                            {attorneys.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
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

                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Publishing</h3>
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-[13px]">Status</Label>
                        <Select value={form.status} onValueChange={(v: "draft" | "published") => setForm({ ...form, status: v })}>
                          <SelectTrigger className="bg-[#fafafa] border-border/60 h-10 rounded-lg"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <div>
                          <Label className="text-[13px]">Featured</Label>
                          <p className="text-[11px] text-muted-foreground/60">Highlight on homepage</p>
                        </div>
                        <Switch checked={form.is_featured} onCheckedChange={(checked) => setForm({ ...form, is_featured: checked })} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Content */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Excerpt</h3>
                    <div className="space-y-1.5">
                      <Textarea
                        value={form.excerpt}
                        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                        placeholder="Brief summary of the article..."
                        className="bg-[#fafafa] border-border/60 rounded-lg text-justify min-h-[80px] leading-relaxed resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="space-y-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</h3>
                    <RichEditor
                      content={form.content}
                      onChange={(html) => setForm({ ...form, content: html })}
                      placeholder="Write your article..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="px-8 py-4 border-t border-border/60 shrink-0 flex justify-end gap-3">
              <DialogClose asChild><Button variant="outline" className="rounded-lg">Cancel</Button></DialogClose>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 rounded-lg px-8">{editingId ? "Save Changes" : "Publish Post"}</Button>
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
