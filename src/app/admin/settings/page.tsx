"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Save } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import { useToast } from "@/hooks/use-toast";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/admin/map-picker").then(m => ({ default: m.MapPicker })), { ssr: false, loading: () => <div className="h-[300px] bg-muted rounded-lg animate-pulse" /> });

type Setting = { id: string; key: string; value: string; group_name: string };
type HSect = { id: string; section_key: string; label: string; is_visible: boolean; display_order: number };

const settingLabels: Record<string, string> = {
  firm_name: "Firm Name", firm_tagline: "Tagline", firm_description: "Description",
  address_line1: "Address Line 1", address_line2: "Address Line 2",
  phone: "Phone", email: "Email",
  twitter_url: "Twitter URL", linkedin_url: "LinkedIn URL",
  facebook_url: "Facebook URL", instagram_url: "Instagram URL",
  logo_url: "Logo", hero_image_url: "Hero Background Image",
  office_latitude: "Latitude", office_longitude: "Longitude",
  mission: "Mission Statement", vision: "Vision Statement", firm_history: "Firm History / Our Story",
};

// Settings rendered as map picker or image upload, not as text inputs
const hiddenFromInputs = ['office_latitude', 'office_longitude'];
const imageSettings = ['logo_url', 'hero_image_url'];
const textareaSettings = ['mission', 'vision', 'firm_history', 'firm_description'];

const groupLabels: Record<string, string> = {
  general: "General", contact: "Contact Information", social: "Social Media", branding: "Branding", about: "About Page",
};

export default function SettingsAdmin() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [sections, setSections] = useState<HSect[]>([]);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetch() {
      const { data: s } = await supabase.from("site_settings").select("*").order("key");
      setSettings(s ?? []);
      const { data: h } = await supabase.from("homepage_sections").select("*").order("display_order");
      setSections(h ?? []);
      setLoading(false);
    }
    fetch();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    const updates = Object.entries(edited).map(([key, value]) =>
      supabase.from("site_settings").update({ value }).eq("key", key)
    );
    await Promise.all(updates);

    // Re-fetch to get the latest values
    const { data: s } = await supabase.from("site_settings").select("*").order("key");
    setSettings(s ?? []);
    setEdited({});
    setSaving(false);
    toast({ title: "Saved", description: "Settings updated. Changes will appear on the site within 60 seconds." });
  };

  const handleToggleSection = async (id: string, is_visible: boolean) => {
    await supabase.from("homepage_sections").update({ is_visible }).eq("id", id);
    setSections(sections.map(s => s.id === id ? { ...s, is_visible } : s));
    toast({ title: "Updated", description: `Section ${is_visible ? "shown" : "hidden"}.` });
  };

  const grouped = settings.reduce<Record<string, Setting[]>>((acc, s) => {
    acc[s.group_name] = acc[s.group_name] || [];
    acc[s.group_name].push(s);
    return acc;
  }, {});

  if (loading) return (
    <div className="space-y-6">
      <h1 className="font-headline text-3xl font-bold">Settings</h1>
      <div className="space-y-4">{[...Array(3)].map((_, i) => <Card key={i} className="bg-card border-border animate-pulse"><CardContent className="p-6 h-32" /></Card>)}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage site-wide configuration</p>
        </div>
        {Object.keys(edited).length > 0 && (
          <Button onClick={handleSaveSettings} disabled={saving} className="bg-primary hover:bg-primary/90">
            <Save className="h-4 w-4 mr-2" />{saving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      {Object.entries(grouped).map(([group, items]) => (
        <Card key={group} className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-headline text-lg">{groupLabels[group] || group}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.filter(s => !hiddenFromInputs.includes(s.key)).map((setting) =>
              imageSettings.includes(setting.key) ? (
                <div key={setting.key} className="space-y-1">
                  <Label className="text-sm">{settingLabels[setting.key] || setting.key}</Label>
                  <ImageUpload
                    folder="branding"
                    currentUrl={edited[setting.key] ?? setting.value}
                    onUpload={(url) => setEdited({ ...edited, [setting.key]: url })}
                  />
                </div>
              ) : textareaSettings.includes(setting.key) ? (
                <div key={setting.key} className="space-y-1">
                  <Label className="text-sm">{settingLabels[setting.key] || setting.key}</Label>
                  <textarea
                    value={edited[setting.key] ?? setting.value}
                    onChange={(e) => setEdited({ ...edited, [setting.key]: e.target.value })}
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    rows={4}
                  />
                </div>
              ) : (
                <div key={setting.key} className="space-y-1">
                  <Label className="text-sm">{settingLabels[setting.key] || setting.key}</Label>
                  <Input
                    value={edited[setting.key] ?? setting.value}
                    onChange={(e) => setEdited({ ...edited, [setting.key]: e.target.value })}
                    className="bg-background"
                  />
                </div>
              )
            )}
          </CardContent>
        </Card>
      ))}

      {/* Map Picker */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Office Location</CardTitle>
          <p className="text-sm text-muted-foreground">Search for your address and click on the map to set a pin</p>
        </CardHeader>
        <CardContent>
          <MapPicker
            lat={parseFloat(edited.office_latitude ?? settings.find(s => s.key === 'office_latitude')?.value ?? '14.5995') || 14.5995}
            lng={parseFloat(edited.office_longitude ?? settings.find(s => s.key === 'office_longitude')?.value ?? '120.9842') || 120.9842}
            onChange={(lat, lng) => setEdited({ ...edited, office_latitude: lat.toString(), office_longitude: lng.toString() })}
          />
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Homepage Sections</CardTitle>
          <p className="text-sm text-muted-foreground">Toggle sections on or off on the homepage</p>
        </CardHeader>
        <CardContent className="space-y-2">
          {sections.map((section) => (
            <div key={section.id} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary/50">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{section.label}</span>
                <span className="text-xs text-muted-foreground">({section.section_key})</span>
              </div>
              <Switch
                checked={section.is_visible}
                onCheckedChange={(checked) => handleToggleSection(section.id, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
