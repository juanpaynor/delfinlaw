"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle, Loader2, CalendarDays, Clock } from "lucide-react";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { cn } from "@/lib/utils";

type Availability = {
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_active: boolean;
};

interface BookingModalProps {
  children: React.ReactNode;
  practiceAreas?: { id: string; name: string }[];
}

function generateSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = [];
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let cur = sh * 60 + sm;
  const endMin = eh * 60 + em;
  while (cur + duration <= endMin) {
    const h = Math.floor(cur / 60);
    const m = cur % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    cur += duration;
  }
  return slots;
}

export function BookingModal({ children, practiceAreas = [] }: BookingModalProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", consultation_type: "", notes: "",
  });

  useEffect(() => {
    if (!open) return;
    supabase.from("appointment_availability").select("*").eq("is_active", true)
      .then(({ data }) => setAvailability(data ?? []));
  }, [open]);

  useEffect(() => {
    if (!selectedDate) return;
    setSelectedTime("");
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    supabase.from("appointments")
      .select("appointment_time")
      .eq("appointment_date", dateStr)
      .not("status", "eq", "cancelled")
      .then(({ data }) => setBookedSlots((data ?? []).map((r: { appointment_time: string }) => r.appointment_time.slice(0, 5))));
  }, [selectedDate]);

  const isDayAvailable = (date: Date) => {
    if (isBefore(date, startOfToday())) return false;
    const dow = date.getDay();
    return availability.some(a => a.day_of_week === dow && a.is_active);
  };

  const availableSlots = (() => {
    if (!selectedDate) return [];
    const dow = selectedDate.getDay();
    const avail = availability.find(a => a.day_of_week === dow);
    if (!avail) return [];
    return generateSlots(avail.start_time, avail.end_time, avail.slot_duration)
      .filter(s => !bookedSlots.includes(s));
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !form.name || !form.email) return;
    setSubmitting(true);
    const { error } = await supabase.from("appointments").insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      consultation_type: form.consultation_type,
      appointment_date: format(selectedDate, "yyyy-MM-dd"),
      appointment_time: selectedTime,
      notes: form.notes,
    });
    setSubmitting(false);
    if (error) { alert("Something went wrong. Please try again."); return; }
    setSubmitted(true);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setSubmitted(false);
        setSelectedDate(undefined);
        setSelectedTime("");
        setForm({ name: "", email: "", phone: "", consultation_type: "", notes: "" });
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-primary mx-auto" />
            <h3 className="font-headline text-2xl font-bold">Appointment Requested!</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              We&apos;ve received your booking request. Our team will confirm your appointment within 24 hours.
            </p>
            <Button onClick={() => handleClose(false)} variant="outline" className="mt-4">Close</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-headline text-2xl flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-accent" />
                Book an Appointment
              </DialogTitle>
              <p className="text-muted-foreground text-sm mt-1">
                Select a date and time for your consultation.
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              {/* Step 1: Pick date */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Select Date *</Label>
                <div className="flex justify-center border border-border rounded-xl overflow-hidden">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => !isDayAvailable(date)}
                    fromDate={startOfToday()}
                    toDate={addDays(startOfToday(), 60)}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Step 2: Pick time */}
              {selectedDate && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Available Times — {format(selectedDate, "MMMM d, yyyy")} *
                  </Label>
                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground bg-muted rounded-lg p-3 text-center">
                      No available slots for this day. Please choose another date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {availableSlots.map(slot => {
                        const [h, m] = slot.split(":").map(Number);
                        const label = `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={cn(
                              "text-xs py-2 px-1 rounded-lg border transition-colors",
                              selectedTime === slot
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border hover:border-primary/50 hover:bg-primary/5"
                            )}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Details */}
              {selectedDate && selectedTime && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <p className="text-sm font-semibold">Your Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Name *</Label>
                      <Input required value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name" className="bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Email *</Label>
                      <Input required type="email" value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="you@email.com" className="bg-background" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm">Phone</Label>
                      <Input value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="(123) 456-7890" className="bg-background" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Consultation Type</Label>
                      <Select value={form.consultation_type}
                        onValueChange={v => setForm({ ...form, consultation_type: v })}>
                        <SelectTrigger className="bg-background"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {practiceAreas.length > 0
                            ? practiceAreas.map(pa => <SelectItem key={pa.id} value={pa.name}>{pa.name}</SelectItem>)
                            : ["Corporate", "Litigation", "Real Estate", "Criminal Defense", "General Inquiry"]
                                .map(pa => <SelectItem key={pa} value={pa}>{pa}</SelectItem>)
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Notes</Label>
                    <Textarea value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      placeholder="Briefly describe your concern (optional)..."
                      className="bg-background" rows={3} />
                  </div>
                </div>
              )}

              {selectedDate && selectedTime && (
                <Button type="submit" disabled={submitting}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-5">
                  {submitting
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Booking...</>
                    : `Confirm — ${format(selectedDate, "MMM d")} at ${(() => {
                        const [h, m] = selectedTime.split(":").map(Number);
                        return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
                      })()}`
                  }
                </Button>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Booking requests are subject to confirmation. We&apos;ll contact you to confirm within 24 hours.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
