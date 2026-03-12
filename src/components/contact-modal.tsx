"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2 } from "lucide-react";

const practiceAreaOptions = [
  "Family Law",
  "Corporate Law",
  "Real Estate Law",
  "Personal Injury",
  "Criminal Defense",
  "Employment Law",
  "Estate Planning",
  "Other",
];

interface ContactModalProps {
  children: React.ReactNode;
}

export function ContactModal({ children }: ContactModalProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    practice_area: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setSubmitting(true);

    const { error } = await supabase.from("inquiries").insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      subject: form.subject || `Inquiry from ${form.name}`,
      message: form.message,
    });

    setSubmitting(false);

    if (error) {
      alert("Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset after close animation
      setTimeout(() => {
        setSubmitted(false);
        setForm({ name: "", email: "", phone: "", practice_area: "", subject: "", message: "" });
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h3 className="font-headline text-2xl font-bold">Thank You!</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              We&apos;ve received your inquiry and will get back to you within 24 hours.
            </p>
            <Button onClick={() => handleClose(false)} variant="outline" className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl">Get in Touch</DialogTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Fill out the form below and we&apos;ll respond within 24 hours.
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Name *</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Email *</Label>
                  <Input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@email.com"
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm">Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="(123) 456-7890"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">Practice Area</Label>
                  <Select value={form.practice_area} onValueChange={(v) => setForm({ ...form, practice_area: v })}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {practiceAreaOptions.map((pa) => (
                        <SelectItem key={pa} value={pa}>{pa}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Subject</Label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Brief subject"
                  className="bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm">Message *</Label>
                <Textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your legal needs..."
                  className="bg-background"
                  rows={4}
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-5"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                ) : (
                  "Send Inquiry"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By submitting, you agree to our privacy policy. This does not create an attorney-client relationship.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
