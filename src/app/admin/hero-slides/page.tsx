"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/admin/image-upload";
import { Plus, Trash2, GripVertical, Loader2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type HeroSlide = {
  id: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
};

export default function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const fetchSlides = async () => {
    const { data } = await supabase
      .from("hero_slides")
      .select("*")
      .order("display_order");
    setSlides(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchSlides(); }, []);

  const addSlide = async (imageUrl: string) => {
    setSaving(true);
    const nextOrder = slides.length > 0 ? Math.max(...slides.map(s => s.display_order)) + 1 : 0;
    await supabase.from("hero_slides").insert({
      image_url: imageUrl,
      display_order: nextOrder,
      is_active: true,
    });
    setShowUpload(false);
    await fetchSlides();
    setSaving(false);
  };

  const removeSlide = async (id: string) => {
    if (!confirm("Remove this slide?")) return;
    await supabase.from("hero_slides").delete().eq("id", id);
    await fetchSlides();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await supabase.from("hero_slides").update({ is_active: !isActive }).eq("id", id);
    await fetchSlides();
  };

  const moveSlide = async (index: number, direction: "up" | "down") => {
    const sorted = [...slides];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    // Swap display_order values
    const orderA = sorted[index].display_order;
    const orderB = sorted[swapIndex].display_order;

    await Promise.all([
      supabase.from("hero_slides").update({ display_order: orderB }).eq("id", sorted[index].id),
      supabase.from("hero_slides").update({ display_order: orderA }).eq("id", sorted[swapIndex].id),
    ]);
    await fetchSlides();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="font-headline text-2xl font-bold">Hero Slides</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-video bg-white rounded-xl border border-border/60 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold">Hero Slides</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the hero carousel images (max 10). Drag to reorder.
          </p>
        </div>
        {slides.length < 10 && (
          <Button
            onClick={() => setShowUpload(true)}
            className="bg-primary hover:bg-primary/90"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Slide
          </Button>
        )}
      </div>

      {/* Upload area */}
      {showUpload && (
        <div className="bg-white rounded-xl border border-border/60 p-6">
          <h3 className="text-sm font-medium mb-3">Upload New Slide</h3>
          <ImageUpload
            folder="hero"
            currentUrl=""
            onUpload={(url) => addSlide(url)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowUpload(false)}
            className="mt-3"
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Slides grid */}
      {slides.length === 0 && !showUpload ? (
        <div className="bg-white rounded-xl border border-border/60 p-16 text-center">
          <ImageIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="font-medium text-foreground">No hero slides yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Add up to 10 images for the hero carousel
          </p>
          <Button onClick={() => setShowUpload(true)} size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add First Slide
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                "bg-white rounded-xl border border-border/60 overflow-hidden group relative",
                !slide.is_active && "opacity-50"
              )}
            >
              <div className="aspect-video relative">
                <Image
                  src={slide.image_url}
                  alt={`Hero slide ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {/* Overlay controls */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {index > 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => moveSlide(index, "up")}
                      className="h-8 px-2"
                    >
                      ← Move Up
                    </Button>
                  )}
                  {index < slides.length - 1 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => moveSlide(index, "down")}
                      className="h-8 px-2"
                    >
                      Move Down →
                    </Button>
                  )}
                </div>

                {/* Order badge */}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-md font-medium">
                  #{index + 1}
                </div>
              </div>

              <div className="p-3 flex items-center justify-between">
                <button
                  onClick={() => toggleActive(slide.id, slide.is_active)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full font-medium transition-colors",
                    slide.is_active
                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {slide.is_active ? "Active" : "Inactive"}
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSlide(slide.id)}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {slides.length}/10 slides • Active slides will auto-cycle every 6 seconds on the homepage
      </p>
    </div>
  );
}
