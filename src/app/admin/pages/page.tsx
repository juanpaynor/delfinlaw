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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { RichEditor } from "@/components/admin/rich-editor";

type Page = { id: string; title: string; slug: string; meta_description: string; is_published: boolean; show_in_nav: boolean; display_order: number };
type PageSection = { id: string; page_id: string; section_type: string; content: any; display_order: number; is_visible: boolean };

const sectionTypes = [
  { value: "hero", label: "Hero Banner" }, { value: "text", label: "Text Block" },
  { value: "image_text", label: "Image + Text" }, { value: "card_grid", label: "Card Grid" },
  { value: "cta_banner", label: "Call to Action" }, { value: "gallery", label: "Image Gallery" },
];

const defaultContent: Record<string, any> = {
  hero: { headline: "", subheadline: "", cta_text: "", cta_link: "", background_image_url: "" },
  text: { body: "" }, image_text: { image_url: "", body: "", image_position: "left" },
  card_grid: { cards: [{ title: "", description: "", icon_name: "" }] },
  cta_banner: { headline: "", description: "", button_text: "", button_link: "" },
  gallery: { images: [{ url: "", caption: "" }] },
};

function SectionEditor({ content, type, onChange }: { content: any; type: string; onChange: (c: any) => void }) {
  const u = (k: string, v: any) => onChange({ ...content, [k]: v });
  if (type === "hero") return (<div className="space-y-3">
    <div className="space-y-1.5"><Label className="text-[13px]">Headline</Label><Input value={content.headline||""} onChange={e=>u("headline",e.target.value)} className="bg-[#fafafa] border-border/60 h-10 rounded-lg"/></div>
    <div className="space-y-1.5"><Label className="text-[13px]">Subheadline</Label><Input value={content.subheadline||""} onChange={e=>u("subheadline",e.target.value)} className="bg-[#fafafa] border-border/60 h-10 rounded-lg"/></div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1.5"><Label className="text-[13px]">CTA Text</Label><Input value={content.cta_text||""} onChange={e=>u("cta_text",e.target.value)} className="bg-[#fafafa] border-border/60 h-10 rounded-lg"/></div>
      <div className="space-y-1.5"><Label className="text-[13px]">CTA Link</Label><Input value={content.cta_link||""} onChange={e=>u("cta_link",e.target.value)} className="bg-[#fafafa] border-border/60 h-10 rounded-lg"/></div>
    </div>
    <div className="space-y-1.5"><Label className="text-[13px]">Background Image URL</Label><Input value={content.background_image_url||""} onChange={e=>u("background_image_url",e.target.value)} className="bg-[#fafafa] border-border/60 h-10 rounded-lg"/></div>
  </div>);
  if (type === "text") return (<div className="space-y-1.5"><Label className="text-[13px]">Content</Label><RichEditor content={content.body||""} onChange={v=>u("body",v)} placeholder="Write your content here..."/></div>);
  if (type === "image_text") return (<div className="space-y-3">
    <div className="space-y-1.5"><Label className="text-[13px]">Image URL</Label><Input value={content.image_url||""} onChange={e=>u("image_url",e.target.value)} className="bg-[#fafafa] border-border/60 h-10 rounded-lg"/></div>
    <div className="space-y-1.5"><Label className="text-[13px]">Text</Label><RichEditor content={content.body||""} onChange={v=>u("body",v)} placeholder="Write your content..."/></div>
    <Select value={content.image_position||"left"} onValueChange={v=>u("image_position",v)}><SelectTrigger className="bg-[#fafafa] border-border/60 h-10 rounded-lg w-32"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="left">Left</SelectItem><SelectItem value="right">Right</SelectItem></SelectContent></Select>
  </div>);
  if (type === "cta_banner") return (<div className="space-y-3">
    <div className="space-y-1.5"><Label className="text-[13px]">Headline</Label><Input value={content.headline||""} onChange={e=>u("headline",e.target.value)} className="bg-[#fafafa] border-border/60 h-10 rounded-lg"/></div>
    <div className="space-y-1.5"><Label className="text-[13px]">Description</Label><RichEditor content={content.description||""} onChange={v=>u("description",v)} placeholder="CTA description..."/></div>
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1.5"><Label className="text-[13px]">Button Text</Label><Input value={content.button_text||""} onChange={e=>u("button_text",e.target.value)} className="bg-[#fafafa] border-border/60 h-10 rounded-lg"/></div>
      <div className="space-y-1.5"><Label className="text-[13px]">Button Link</Label><Input value={content.button_link||""} onChange={e=>u("button_link",e.target.value)} className="bg-[#fafafa] border-border/60 h-10 rounded-lg"/></div>
    </div>
  </div>);
  return (<div className="space-y-1.5"><Label className="text-[13px]">Content (JSON)</Label><Textarea value={JSON.stringify(content,null,2)} onChange={e=>{try{onChange(JSON.parse(e.target.value))}catch{}}} className="bg-[#fafafa] border-border/60 rounded-lg font-mono text-sm" rows={10}/></div>);
}

export default function PagesAdmin() {
  const [pages, setPages] = useState<Page[]>([]);
  const [pf, setPf] = useState({ title: "", slug: "", meta_description: "", is_published: false, show_in_nav: false, display_order: 0 });
  const [editPid, setEditPid] = useState<string|null>(null);
  const [pdOpen, setPdOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selPage, setSelPage] = useState<Page|null>(null);
  const [secs, setSecs] = useState<PageSection[]>([]);
  const [sf, setSf] = useState<any>(null);
  const [editSid, setEditSid] = useState<string|null>(null);
  const [sdOpen, setSdOpen] = useState(false);
  const [nst, setNst] = useState("text");
  const { toast } = useToast();

  const slug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
  const fetchP = async () => { const { data } = await supabase.from("pages").select("*").order("display_order"); setPages(data??[]); setLoading(false); };
  const fetchS = async (pid: string) => { const { data } = await supabase.from("page_sections").select("*").eq("page_id",pid).order("display_order"); setSecs(data??[]); };
  useEffect(() => { fetchP(); }, []);

  const saveP = async () => {
    const pl = { ...pf, slug: pf.slug||slug(pf.title) };
    if (editPid) { await supabase.from("pages").update(pl).eq("id",editPid); toast({title:"Updated"}); }
    else { pl.display_order = pages.length+1; await supabase.from("pages").insert(pl); toast({title:"Created"}); }
    setPf({ title:"",slug:"",meta_description:"",is_published:false,show_in_nav:false,display_order:0 }); setEditPid(null); setPdOpen(false); fetchP();
  };

  const saveS = async () => {
    if (!selPage) return;
    const pl = { page_id:selPage.id, section_type:sf.section_type, content:sf.content, is_visible:sf.is_visible, display_order: editSid?undefined:secs.length+1 };
    if (editSid) { await supabase.from("page_sections").update(pl).eq("id",editSid); } else { await supabase.from("page_sections").insert(pl); }
    setSdOpen(false); fetchS(selPage.id); toast({title: editSid?"Updated":"Added"});
  };

  if (selPage) return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={()=>{setSelPage(null);setSecs([]);}}>← Back</Button>
        <div><h1 className="font-headline text-3xl font-bold">{selPage.title}</h1><p className="text-muted-foreground text-sm">/{selPage.slug}</p></div>
      </div>
      <div className="flex items-center gap-4">
        <Select value={nst} onValueChange={setNst}><SelectTrigger className="bg-[#fafafa] border-border/60 h-10 rounded-lg w-48"><SelectValue/></SelectTrigger><SelectContent>{sectionTypes.map(st=><SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>)}</SelectContent></Select>
        <Button onClick={()=>{setSf({section_type:nst,content:{...defaultContent[nst]},is_visible:true});setEditSid(null);setSdOpen(true);}} className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-2"/>Add Section</Button>
      </div>
      <Dialog open={sdOpen} onOpenChange={setSdOpen}>
        <DialogContent className="bg-card border-border max-w-3xl w-[95vw] h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-8 pt-6 pb-4 border-b border-border/60 shrink-0">
            <DialogTitle className="font-headline text-xl">{editSid?"Edit":"Add"} Section</DialogTitle>
            <p className="text-sm text-muted-foreground">Configure the content for this section.</p>
          </DialogHeader>
          {sf && <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
            <div className="flex items-center gap-2"><Badge>{sf.section_type}</Badge><div className="ml-auto flex items-center gap-2"><Switch checked={sf.is_visible} onCheckedChange={c=>setSf({...sf,is_visible:c})}/><Label className="text-[13px]">Visible</Label></div></div>
            <div className="h-px bg-border/60" />
            <SectionEditor content={sf.content} type={sf.section_type} onChange={c=>setSf({...sf,content:c})}/>
          </div>}
          <div className="px-8 py-4 border-t border-border/60 shrink-0 flex justify-end gap-3">
            <DialogClose asChild><Button variant="outline" className="rounded-lg">Cancel</Button></DialogClose>
            <Button onClick={saveS} className="bg-primary hover:bg-primary/90 rounded-lg px-8">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
      {secs.length===0 ? <Card className="bg-card border-border"><CardContent className="p-8 text-center text-muted-foreground">No sections yet.</CardContent></Card> : (
        <div className="space-y-2">{secs.map((s,i)=>(
          <Card key={s.id} className="bg-card border-border"><CardContent className="p-4 flex items-center gap-4">
            <span className="text-xs text-muted-foreground w-6">{i+1}</span>
            <Badge variant="outline">{sectionTypes.find(st=>st.value===s.section_type)?.label||s.section_type}</Badge>
            <span className="flex-1 text-sm text-muted-foreground truncate">{s.content?.headline||s.content?.body?.slice(0,60)||""}</span>
            {!s.is_visible&&<Badge variant="secondary">Hidden</Badge>}
            <Button variant="ghost" size="icon" onClick={()=>{setSf({section_type:s.section_type,content:s.content,is_visible:s.is_visible});setEditSid(s.id);setSdOpen(true);}}><Pencil className="h-4 w-4"/></Button>
            <Button variant="ghost" size="icon" className="text-destructive" onClick={async()=>{await supabase.from("page_sections").delete().eq("id",s.id);fetchS(selPage.id);}}><Trash2 className="h-4 w-4"/></Button>
          </CardContent></Card>
        ))}</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-headline text-3xl font-bold">Pages</h1><p className="text-muted-foreground mt-1">Create and manage custom pages</p></div>
        <Dialog open={pdOpen} onOpenChange={o=>{setPdOpen(o);if(!o){setPf({title:"",slug:"",meta_description:"",is_published:false,show_in_nav:false,display_order:0});setEditPid(null);}}}>
          <DialogTrigger asChild><Button className="bg-primary hover:bg-primary/90"><Plus className="h-4 w-4 mr-2"/>New Page</Button></DialogTrigger>
          <DialogContent className="bg-card border-border max-w-lg">
            <DialogHeader><DialogTitle className="font-headline">{editPid?"Edit":"New"} Page</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2"><Label>Title</Label><Input value={pf.title} onChange={e=>setPf({...pf,title:e.target.value})} className="bg-background"/></div>
              <div className="space-y-2"><Label>Slug</Label><Input value={pf.slug||slug(pf.title)} onChange={e=>setPf({...pf,slug:e.target.value})} className="bg-background"/></div>
              <div className="space-y-2"><Label>Meta Description</Label><Textarea value={pf.meta_description} onChange={e=>setPf({...pf,meta_description:e.target.value})} className="bg-background" rows={2}/></div>
              <div className="flex gap-6">
                <div className="flex items-center gap-2"><Switch checked={pf.is_published} onCheckedChange={c=>setPf({...pf,is_published:c})}/><Label>Published</Label></div>
                <div className="flex items-center gap-2"><Switch checked={pf.show_in_nav} onCheckedChange={c=>setPf({...pf,show_in_nav:c})}/><Label>Show in Nav</Label></div>
              </div>
              <div className="flex justify-end gap-2"><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={saveP} className="bg-primary hover:bg-primary/90">{editPid?"Update":"Create"}</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <div className="space-y-3">{[...Array(2)].map((_,i)=><Card key={i} className="bg-card border-border animate-pulse"><CardContent className="p-4 h-16"/></Card>)}</div>
      : pages.length===0 ? <Card className="bg-card border-border"><CardContent className="p-8 text-center text-muted-foreground">No custom pages yet.</CardContent></Card>
      : <div className="space-y-2">{pages.map(p=>(
        <Card key={p.id} className="bg-card border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={()=>{setSelPage(p);fetchS(p.id);}}>
          <CardContent className="p-4 flex items-center gap-4">
            <Layers className="h-5 w-5 text-muted-foreground"/>
            <div className="flex-1"><div className="flex items-center gap-2"><p className="font-medium">{p.title}</p><Badge className={p.is_published?"bg-green-500/10 text-green-500 border-none":""}>{p.is_published?"Published":"Draft"}</Badge>{p.show_in_nav&&<Badge variant="outline" className="text-xs">Nav</Badge>}</div><p className="text-sm text-muted-foreground">/{p.slug}</p></div>
            <div className="flex gap-2" onClick={e=>e.stopPropagation()}>
              <Button variant="ghost" size="icon" onClick={()=>{setPf({title:p.title,slug:p.slug,meta_description:p.meta_description||"",is_published:p.is_published,show_in_nav:p.show_in_nav,display_order:p.display_order});setEditPid(p.id);setPdOpen(true);}}><Pencil className="h-4 w-4"/></Button>
              <AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4"/></Button></AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border"><AlertDialogHeader><AlertDialogTitle>Delete &quot;{p.title}&quot;?</AlertDialogTitle><AlertDialogDescription>All sections will be deleted too.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async()=>{await supabase.from("pages").delete().eq("id",p.id);if(selPage?.id===p.id){setSelPage(null);setSecs([]);}fetchP();}} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      ))}</div>}
    </div>
  );
}
