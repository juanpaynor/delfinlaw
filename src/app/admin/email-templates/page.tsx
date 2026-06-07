"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Save, Mail, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Template = {
  id: string;
  key: string;
  name: string;
  description: string;
  subject: string;
  body: string;
  variables: string[];
};

const TEMPLATE_ORDER = [
  "inquiry_firm",
  "inquiry_client",
  "appointment_firm",
  "appointment_client_pending",
  "appointment_client_confirmed",
  "appointment_client_cancelled",
];

export default function EmailTemplatesAdmin() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [edited, setEdited] = useState<Record<string, { subject: string; body: string }>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("email_templates").select("*");
    const sorted = (data ?? []).sort(
      (a, b) => TEMPLATE_ORDER.indexOf(a.key) - TEMPLATE_ORDER.indexOf(b.key)
    );
    setTemplates(sorted);
    setLoading(false);
  }

  function patchEdited(key: string, field: "subject" | "body", value: string) {
    setEdited((prev) => ({
      ...prev,
      [key]: {
        subject: prev[key]?.subject ?? templates.find((t) => t.key === key)?.subject ?? "",
        body: prev[key]?.body ?? templates.find((t) => t.key === key)?.body ?? "",
        [field]: value,
      },
    }));
  }

  function getValue(tpl: Template, field: "subject" | "body"): string {
    return edited[tpl.key]?.[field] ?? tpl[field];
  }

  function isDirty(key: string): boolean {
    return !!edited[key];
  }

  async function save(tpl: Template) {
    if (!isDirty(tpl.key)) return;
    setSavingKey(tpl.key);
    const patch = edited[tpl.key];
    const { error } = await supabase
      .from("email_templates")
      .update({ subject: patch.subject, body: patch.body, updated_at: new Date().toISOString() })
      .eq("key", tpl.key);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTemplates((prev) =>
        prev.map((t) =>
          t.key === tpl.key ? { ...t, subject: patch.subject, body: patch.body } : t
        )
      );
      setEdited((prev) => {
        const next = { ...prev };
        delete next[tpl.key];
        return next;
      });
      toast({ title: "Saved", description: `"${tpl.name}" updated.` });
    }
    setSavingKey(null);
  }

  function resetTemplate(tpl: Template) {
    setEdited((prev) => {
      const next = { ...prev };
      delete next[tpl.key];
      return next;
    });
  }

  if (loading)
    return (
      <div className="space-y-6">
        <h1 className="font-headline text-3xl font-bold">Email Templates</h1>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-16 p-6" />
            </Card>
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-bold flex items-center gap-2">
          <Mail className="h-7 w-7 text-primary" />
          Email Templates
        </h1>
        <p className="text-muted-foreground mt-1">
          Customise the emails sent for inquiries and appointments. Use{" "}
          <code className="bg-muted px-1 rounded text-xs">{"{{variable}}"}</code> placeholders
          shown below each template.
        </p>
      </div>

      <Accordion type="multiple" className="space-y-3">
        {templates.map((tpl) => (
          <AccordionItem
            key={tpl.key}
            value={tpl.key}
            className="border border-border rounded-lg bg-card overflow-hidden"
          >
            <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-secondary/30">
              <div className="flex items-center gap-3 text-left">
                <div>
                  <p className="font-medium text-sm">{tpl.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tpl.description}</p>
                </div>
                {isDirty(tpl.key) && (
                  <Badge variant="outline" className="text-amber-600 border-amber-400 ml-2 text-[10px]">
                    Unsaved
                  </Badge>
                )}
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-6 pb-6 space-y-5">
              {/* Variables */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  Available Variables
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {tpl.variables.map((v) => (
                    <code
                      key={v}
                      className="text-[11px] bg-muted px-2 py-0.5 rounded border border-border cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-colors select-all"
                      title="Click to select"
                    >
                      {v}
                    </code>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Subject Line</Label>
                <Input
                  value={getValue(tpl, "subject")}
                  onChange={(e) => patchEdited(tpl.key, "subject", e.target.value)}
                  className="bg-background font-mono text-sm"
                />
              </div>

              {/* Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Email Body (HTML)</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7 px-2"
                    onClick={() =>
                      setPreviewing(previewing === tpl.key ? null : tpl.key)
                    }
                  >
                    {previewing === tpl.key ? "Hide Preview" : "Preview"}
                  </Button>
                </div>
                <textarea
                  value={getValue(tpl, "body")}
                  onChange={(e) => patchEdited(tpl.key, "body", e.target.value)}
                  rows={14}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-y"
                />
              </div>

              {/* Preview pane */}
              {previewing === tpl.key && (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 px-4 py-2 border-b border-border text-xs text-muted-foreground font-medium">
                    HTML Preview
                  </div>
                  <iframe
                    className="w-full h-96 bg-white"
                    srcDoc={`<!DOCTYPE html><html><body style="margin:0;padding:0">${getValue(tpl, "body")}</body></html>`}
                    sandbox="allow-same-origin"
                    title="Email preview"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  onClick={() => save(tpl)}
                  disabled={!isDirty(tpl.key) || savingKey === tpl.key}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {savingKey === tpl.key ? "Saving…" : "Save Template"}
                </Button>
                {isDirty(tpl.key) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => resetTemplate(tpl)}
                    className="text-muted-foreground"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                    Discard
                  </Button>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
