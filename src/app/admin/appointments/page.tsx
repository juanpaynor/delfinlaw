"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Trash2, Eye, CheckCircle, XCircle, Clock, CalendarDays,
  ChevronLeft, ChevronRight, Download, Link2, ExternalLink, RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, startOfWeek, endOfWeek, isSameDay, isSameMonth,
} from "date-fns";

// ── ICS helpers (client-side) ─────────────────────────────────────────────
const FIRM_ADDRESS = "2nd Floor, Plantanan Building, Primero De Mayo St., Barangay IX, Roxas City, Capiz, Philippines";

function makeICS(appts: Appointment[]): string {
  const lines = ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Delfin Law Office//EN","CALSCALE:GREGORIAN"];
  for (const a of appts) {
    const [h, m] = a.appointment_time.slice(0, 5).split(":").map(Number);
    const endMin  = h * 60 + m + 60;
    const dtStart = a.appointment_date.replace(/-/g, "") + "T" + String(h).padStart(2,"0") + String(m).padStart(2,"0") + "00";
    const dtEnd   = a.appointment_date.replace(/-/g, "") + "T" + String(Math.floor(endMin/60)).padStart(2,"0") + String(endMin%60).padStart(2,"0") + "00";
    lines.push(
      "BEGIN:VEVENT",
      `UID:${a.id}@delfinlaw.com`,
      `DTSTART:${dtStart}`, `DTEND:${dtEnd}`,
      `SUMMARY:${(a.consultation_type || "Legal Consultation").replace(/[\\,;]/g,"\\$&")} \u2014 ${a.name.replace(/[\\,;]/g,"\\$&")}`,
      `DESCRIPTION:Client: ${a.name}\\nEmail: ${a.email}\\nPhone: ${a.phone || "N/A"}`,
      `LOCATION:${FIRM_ADDRESS.replace(/[\\,;]/g,"\\$&")}`,
      `STATUS:${a.status === "confirmed" ? "CONFIRMED" : "TENTATIVE"}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadICS(appts: Appointment[], filename = "appointments.ics") {
  const blob = new Blob([makeICS(appts)], { type: "text/calendar" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function googleCalLink(a: Appointment): string {
  const [h, m] = a.appointment_time.slice(0, 5).split(":").map(Number);
  const endMin  = h * 60 + m + 60;
  const dtStart = a.appointment_date.replace(/-/g, "") + "T" + String(h).padStart(2,"0") + String(m).padStart(2,"0") + "00";
  const dtEnd   = a.appointment_date.replace(/-/g, "") + "T" + String(Math.floor(endMin/60)).padStart(2,"0") + String(endMin%60).padStart(2,"0") + "00";
  return "https://calendar.google.com/calendar/render?" + new URLSearchParams({
    action: "TEMPLATE",
    text:     `${a.consultation_type || "Legal Consultation"} \u2014 ${a.name}`,
    dates:    `${dtStart}/${dtEnd}`,
    details:  `Client: ${a.name}\nEmail: ${a.email}\nPhone: ${a.phone || "N/A"}\nType: ${a.consultation_type || "General"}`,
    location: FIRM_ADDRESS,
  }).toString();
}

type Appointment = {
  id: string;
  name: string;
  email: string;
  phone: string;
  consultation_type: string;
  appointment_date: string;
  appointment_time: string;
  notes: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  admin_notes: string;
  decline_reason: string;
  created_at: string;
};

type Availability = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  is_active: boolean;
};

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const statusColors: Record<string, string> = {
  pending:   "bg-amber-500/10 text-amber-500",
  confirmed: "bg-green-500/10 text-green-500",
  cancelled: "bg-red-500/10 text-red-500",
  completed: "bg-muted text-muted-foreground",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "confirmed") return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (status === "cancelled") return <XCircle className="h-4 w-4 text-red-500" />;
  if (status === "completed") return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
  return <Clock className="h-4 w-4 text-amber-500" />;
};

export default function AppointmentsAdmin() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [declineReason, setDeclineReason] = useState("");
  const [showDeclineInput, setShowDeclineInput] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());
  const [calDayStr, setCalDayStr] = useState<string | null>(null);
  const [syncOpen, setSyncOpen] = useState(false);
  const [calFeedToken, setCalFeedToken] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // ── Fetch ─────────────────────────────────────────────────────────
  const fetchAppointments = async () => {
    const { data } = await supabase
      .from("appointments").select("*")
      .order("appointment_date").order("appointment_time");
    setAppointments(data ?? []);
    setLoading(false);
  };

  const fetchAvailability = async () => {
    const { data } = await supabase.from("appointment_availability").select("*").order("day_of_week");
    setAvailability(data ?? []);
  };

  useEffect(() => { fetchAppointments(); }, []);
  useEffect(() => { fetchAvailability(); }, []);
  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "calendar_feed_token").single()
      .then(({ data }) => { if (data?.value) setCalFeedToken(data.value); });
  }, []);

  // ── Calendar grid ─────────────────────────────────────────────────
  const calDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(calMonth));
    const end   = endOfWeek(endOfMonth(calMonth));
    return eachDayOfInterval({ start, end });
  }, [calMonth]);

  const apptsByDate = useMemo(() => {
    const map: Record<string, Appointment[]> = {};
    for (const a of appointments) {
      map[a.appointment_date] = map[a.appointment_date] ?? [];
      map[a.appointment_date].push(a);
    }
    return map;
  }, [appointments]);

  const dayAppts = calDayStr ? (apptsByDate[calDayStr] ?? []) : [];

  // ── Feed URLs ─────────────────────────────────────────────────────
  const feedUrl       = calFeedToken ? `https://tytczhfmwvydmylboixq.supabase.co/functions/v1/calendar-feed?token=${calFeedToken}` : "";
  const webcalUrl     = feedUrl.replace("https://", "webcal://");
  const gCalSubUrl    = feedUrl ? `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedUrl)}` : "";

  const copyFeedUrl = () => {
    navigator.clipboard.writeText(webcalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Status change ─────────────────────────────────────────────────
  const handleStatusChange = async (id: string, status: string, reason?: string) => {
    const updates: Record<string, string> = { status, updated_at: new Date().toISOString() };
    if (status === "cancelled" && reason) updates.decline_reason = reason;
    await supabase.from("appointments").update(updates).eq("id", id);
    setAppointments(prev => prev.map(a =>
      a.id === id ? { ...a, status: status as Appointment["status"], decline_reason: reason ?? a.decline_reason } : a
    ));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as Appointment["status"] } : null);
    setShowDeclineInput(false);
    setDeclineReason("");
    toast({
      title: status === "confirmed"
        ? "✅ Appointment confirmed — email sent to client"
        : status === "cancelled"
        ? "❌ Appointment declined — client has been notified"
        : "Status updated",
    });
  };

  const handleAdminNotes = async (id: string, notes: string) => {
    await supabase.from("appointments").update({ admin_notes: notes, updated_at: new Date().toISOString() }).eq("id", id);
    toast({ title: "Notes saved" });
  };

  const handleDelete = async (id: string) => {
    await supabase.from("appointments").delete().eq("id", id);
    setAppointments(prev => prev.filter(a => a.id !== id));
    setDialogOpen(false);
    toast({ title: "Appointment deleted" });
  };

  // ── Availability save ─────────────────────────────────────────────
  const handleAvailabilitySave = async (avail: Availability) => {
    await supabase.from("appointment_availability")
      .update({
        start_time: avail.start_time,
        end_time: avail.end_time,
        slot_duration: avail.slot_duration,
        is_active: avail.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", avail.id);
    toast({ title: `${DAY_NAMES[avail.day_of_week]} availability saved` });
  };

  const updateAvailLocal = (id: string, field: keyof Availability, value: string | number | boolean) => {
    setAvailability(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-7 w-7 text-primary" />
          <h1 className="font-headline text-3xl font-bold">Appointments</h1>
        </div>
        <Button variant="outline" size="sm" onClick={() => setSyncOpen(true)}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Sync Calendars
        </Button>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        {/* ── BOOKINGS TAB ── */}
        <TabsContent value="bookings" className="space-y-4 mt-4">
          {/* Filter */}
          <div className="flex items-center gap-3">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              {appointments.filter(a => filter === "all" || a.status === filter).length} result{appointments.filter(a => filter === "all" || a.status === filter).length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : appointments.filter(a => filter === "all" || a.status === filter).length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No appointments found.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {appointments.filter(a => filter === "all" || a.status === filter).map(appt => (
                <Card key={appt.id} className="hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => { setSelected(appt); setDialogOpen(true); }}>
                  <CardContent className="py-4 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={appt.status} />
                      <Badge className={statusColors[appt.status]}>{appt.status}</Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{appt.name}</p>
                      <p className="text-sm text-muted-foreground">{appt.email} {appt.phone && `· ${appt.phone}`}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{format(new Date(appt.appointment_date + "T00:00:00"), "MMM d, yyyy")}</p>
                      <p className="text-muted-foreground">{appt.appointment_time.slice(0, 5)} · {appt.consultation_type || "General"}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); setSelected(appt); setDialogOpen(true); }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── CALENDAR TAB ── */}
        <TabsContent value="calendar" className="space-y-4 mt-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => setCalMonth(m => subMonths(m, 1))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h2 className="font-headline text-xl font-semibold">
              {format(calMonth, "MMMM yyyy")}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setCalMonth(m => addMonths(m, 1))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 text-center">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 border-l border-t border-border rounded-lg overflow-hidden">
            {calDays.map((day, i) => {
              const key    = format(day, "yyyy-MM-dd");
              const dayAps = apptsByDate[key] ?? [];
              const isThisMonth = isSameMonth(day, calMonth);
              const isSelected  = calDayStr === key;
              const isToday     = isSameDay(day, new Date());

              return (
                <div
                  key={i}
                  onClick={() => setCalDayStr(isSelected ? null : key)}
                  className={[
                    "border-r border-b border-border min-h-[80px] p-1.5 cursor-pointer transition-colors",
                    !isThisMonth ? "bg-muted/30 opacity-40" : "hover:bg-secondary/40",
                    isSelected ? "bg-primary/10 ring-2 ring-inset ring-primary" : "",
                  ].join(" ")}
                >
                  <div className={[
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1",
                    isToday ? "bg-primary text-primary-foreground" : "text-foreground",
                  ].join(" ")}>
                    {format(day, "d")}
                  </div>
                  {/* Status dots */}
                  <div className="flex flex-wrap gap-0.5">
                    {dayAps.slice(0, 6).map(a => (
                      <span
                        key={a.id}
                        title={`${a.name} ${a.appointment_time.slice(0,5)} (${a.status})`}
                        className={[
                          "w-2 h-2 rounded-full",
                          a.status === "confirmed"  ? "bg-green-500" :
                          a.status === "pending"    ? "bg-amber-500" :
                          a.status === "cancelled"  ? "bg-red-400"   : "bg-muted-foreground",
                        ].join(" ")}
                      />
                    ))}
                    {dayAps.length > 6 && (
                      <span className="text-[9px] text-muted-foreground">+{dayAps.length - 6}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {[
              { color: "bg-amber-500", label: "Pending" },
              { color: "bg-green-500", label: "Confirmed" },
              { color: "bg-red-400",   label: "Cancelled" },
              { color: "bg-muted-foreground", label: "Completed" },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                {l.label}
              </span>
            ))}
          </div>

          {/* Selected day panel */}
          {calDayStr && (
            <Card className="border-primary/30">
              <CardContent className="pt-4 pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    {format(new Date(calDayStr + "T00:00:00"), "EEEE, MMMM d, yyyy")}
                    <span className="text-muted-foreground font-normal ml-2">
                      {dayAppts.length} appointment{dayAppts.length !== 1 ? "s" : ""}
                    </span>
                  </h3>
                  {dayAppts.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={() => downloadICS(dayAppts, `appointments-${calDayStr}.ics`)}>
                      <Download className="h-3.5 w-3.5 mr-1" />Export Day
                    </Button>
                  )}
                </div>
                {dayAppts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">No appointments on this day.</p>
                ) : (
                  <div className="space-y-2">
                    {dayAppts.map(appt => (
                      <div
                        key={appt.id}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-secondary/40 cursor-pointer transition-colors"
                        onClick={() => { setSelected(appt); setDialogOpen(true); }}
                      >
                        <Badge className={`${statusColors[appt.status]} text-xs shrink-0`}>{appt.status}</Badge>
                        <span className="text-sm font-medium min-w-[60px]">{appt.appointment_time.slice(0,5)}</span>
                        <span className="text-sm font-semibold">{appt.name}</span>
                        <span className="text-sm text-muted-foreground hidden sm:block">{appt.consultation_type || "General"}</span>
                        <Eye className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── AVAILABILITY TAB ── */}
        <TabsContent value="availability" className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAY_NAMES.map((day, idx) => {
              const avail = availability.find(a => a.day_of_week === idx);
              if (!avail) return (
                <Card key={idx}>
                  <CardContent className="py-4">
                    <p className="font-semibold">{day}</p>
                    <p className="text-sm text-muted-foreground mt-1">Not configured</p>
                  </CardContent>
                </Card>
              );
              return (
                <Card key={idx} className={!avail.is_active ? "opacity-60" : ""}>
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{day}</p>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={avail.is_active}
                          onChange={e => updateAvailLocal(avail.id, "is_active", e.target.checked)}
                          className="accent-primary"
                        />
                        Active
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Start</Label>
                        <Input type="time" value={avail.start_time}
                          onChange={e => updateAvailLocal(avail.id, "start_time", e.target.value)}
                          className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">End</Label>
                        <Input type="time" value={avail.end_time}
                          onChange={e => updateAvailLocal(avail.id, "end_time", e.target.value)}
                          className="h-8 text-sm" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Slot duration (min)</Label>
                      <Select value={String(avail.slot_duration)}
                        onValueChange={v => updateAvailLocal(avail.id, "slot_duration", parseInt(v))}>
                        <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="60">60 min</SelectItem>
                          <SelectItem value="90">90 min</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button size="sm" className="w-full" onClick={() => handleAvailabilitySave(avail)}>
                      Save
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* ── APPOINTMENT DETAIL DIALOG ── */}
      {selected && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg bg-card">
            <DialogHeader>
              <DialogTitle className="font-headline text-xl">Appointment Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Name</p><p className="font-medium">{selected.name}</p></div>
                <div><p className="text-muted-foreground text-xs">Email</p><p className="font-medium">{selected.email}</p></div>
                <div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium">{selected.phone || "—"}</p></div>
                <div><p className="text-muted-foreground text-xs">Type</p><p className="font-medium">{selected.consultation_type || "General"}</p></div>
                <div><p className="text-muted-foreground text-xs">Date</p><p className="font-medium">{format(new Date(selected.appointment_date + "T00:00:00"), "MMMM d, yyyy")}</p></div>
                <div><p className="text-muted-foreground text-xs">Time</p><p className="font-medium">{selected.appointment_time.slice(0, 5)}</p></div>
              </div>
              {selected.notes && (
                <div className="text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Client Notes</p>
                  <p className="bg-muted rounded-lg p-3">{selected.notes}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-sm">Status</Label>
                <Select value={selected.status} onValueChange={v => {
                  if (v === "cancelled") { setShowDeclineInput(true); }
                  else { setShowDeclineInput(false); setDeclineReason(""); handleStatusChange(selected.id, v); }
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Decline reason — shown when cancelling */}
              {showDeclineInput && (
                <div className="space-y-2 border border-destructive/30 rounded-lg p-3 bg-destructive/5">
                  <Label className="text-sm text-destructive font-semibold">Reason for declining *</Label>
                  <Textarea
                    value={declineReason}
                    onChange={e => setDeclineReason(e.target.value)}
                    placeholder="e.g. Schedule conflict, attorney unavailable on this date..."
                    className="h-20"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" disabled={!declineReason.trim()}
                      onClick={() => handleStatusChange(selected.id, "cancelled", declineReason)}>
                      Confirm Decline &amp; Notify Client
                    </Button>
                    <Button size="sm" variant="ghost"
                      onClick={() => { setShowDeclineInput(false); setDeclineReason(""); }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Quick action buttons for pending */}
              {selected.status === "pending" && !showDeclineInput && (
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleStatusChange(selected.id, "confirmed")}>
                    ✅ Confirm &amp; Send Email
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                    onClick={() => setShowDeclineInput(true)}>
                    ❌ Decline
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-sm">Admin Notes</Label>
                <Textarea
                  defaultValue={selected.admin_notes}
                  placeholder="Internal notes..."
                  className="h-20"
                  onBlur={e => handleAdminNotes(selected.id, e.target.value)}
                />
              </div>
              <div className="flex justify-between pt-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-1" />Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Appointment?</AlertDialogTitle>
                      <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(selected.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => downloadICS([selected], `appointment-${selected.id.slice(0,8)}.ics`)}>
                    <Download className="h-3.5 w-3.5 mr-1" />ICS
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={googleCalLink(selected)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />Google Cal
                    </a>
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" size="sm">Close</Button>
                  </DialogClose>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── SYNC DIALOG ── */}
      <Dialog open={syncOpen} onOpenChange={setSyncOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Sync with Calendar Apps
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Live subscribe feed */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm">Live Subscription Feed</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Subscribe once — your calendar app will auto-update whenever appointments change.
                </p>
              </div>

              {/* Copy URL */}
              <div className="flex gap-2">
                <code className="flex-1 text-xs bg-muted px-3 py-2 rounded-md truncate font-mono border border-border">
                  {webcalUrl || "Loading…"}
                </code>
                <Button size="sm" variant="outline" onClick={copyFeedUrl} disabled={!webcalUrl}>
                  <Link2 className="h-3.5 w-3.5 mr-1.5" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>

              {/* Open in apps */}
              <div className="grid grid-cols-1 gap-2">
                {/* Apple Calendar */}
                <Button variant="outline" size="sm" className="justify-start" asChild>
                  <a href={webcalUrl} onClick={() => setSyncOpen(false)}>
                    <span className="mr-2">🍎</span>
                    Open in Apple Calendar
                    <ExternalLink className="h-3 w-3 ml-auto opacity-40" />
                  </a>
                </Button>
                {/* Google Calendar */}
                <Button variant="outline" size="sm" className="justify-start" asChild>
                  <a href={gCalSubUrl} target="_blank" rel="noopener noreferrer">
                    <span className="mr-2">📅</span>
                    Add to Google Calendar
                    <ExternalLink className="h-3 w-3 ml-auto opacity-40" />
                  </a>
                </Button>
                {/* Outlook */}
                <Button variant="outline" size="sm" className="justify-start" onClick={copyFeedUrl}>
                  <span className="mr-2">📧</span>
                  <span>
                    Outlook: <span className="text-muted-foreground">Subscriptions → From web → paste URL</span>
                  </span>
                </Button>
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Export */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm">One-Time Export</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Download current appointments as an .ics file.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm"
                  onClick={() => { downloadICS(appointments.filter(a => a.status !== "cancelled"), "all-appointments.ics"); setSyncOpen(false); }}>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  All Active
                </Button>
                <Button variant="outline" size="sm"
                  onClick={() => { downloadICS(appointments.filter(a => a.status === "confirmed"), "confirmed-appointments.ics"); setSyncOpen(false); }}>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Confirmed Only
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
