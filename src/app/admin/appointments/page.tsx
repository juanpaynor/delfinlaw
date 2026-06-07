"use client";

import { useEffect, useState } from "react";
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
import { Trash2, Eye, CheckCircle, XCircle, Clock, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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
  const { toast } = useToast();

  // ── Fetch appointments ────────────────────────────────────────────
  const fetchAppointments = async () => {
    let query = supabase.from("appointments").select("*").order("appointment_date").order("appointment_time");
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setAppointments(data ?? []);
    setLoading(false);
  };

  const fetchAvailability = async () => {
    const { data } = await supabase.from("appointment_availability").select("*").order("day_of_week");
    setAvailability(data ?? []);
  };

  useEffect(() => { fetchAppointments(); }, [filter]);
  useEffect(() => { fetchAvailability(); }, []);

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
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-7 w-7 text-primary" />
        <h1 className="font-headline text-3xl font-bold">Appointments</h1>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
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
            <span className="text-sm text-muted-foreground">{appointments.length} result{appointments.length !== 1 ? "s" : ""}</span>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : appointments.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">No appointments found.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {appointments.map(appt => (
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
                <DialogClose asChild>
                  <Button variant="outline" size="sm">Close</Button>
                </DialogClose>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
