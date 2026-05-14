import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  Video, Clock, CalendarCheck, Plus, X, Stethoscope, 
  MapPin, Search, Calendar as CalendarIcon,
  Info, AlertCircle
} from "lucide-react";

import { useAppointments, useUpdateAppointment, useDeleteAppointment } from "@/queries/useQueries";
import { Badge, Avatar } from "../../components/ui/Primitives";
import { cn } from "../../lib/utils";

// ─── Types & Interfaces ──────────────────────────────────────────────────────

export interface Appointment {
  id: string;
  created_at?: string;
  user_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: "upcoming" | "completed" | "cancelled" | "pending";
  type: string;
  doctor_name: string | null;
  doctor_image: string | null;
  specialty: string | null;
  notes?: string | null;
}

type AptStatus = Appointment["status"];

const STATUS_CONFIG = {
  upcoming:  { label: "Upcoming",  variant: "cyan" as const,    bg: "bg-cyan-50",    text: "text-cyan-700" },
  completed: { label: "Completed", variant: "emerald" as const, bg: "bg-emerald-50", text: "text-emerald-700" },
  cancelled: { label: "Cancelled", variant: "rose" as const,    bg: "bg-rose-50",    text: "text-rose-700" },
  pending:   { label: "Pending",   variant: "amber" as const,   bg: "bg-amber-50",   text: "text-amber-700" },
};

// ─── Sub-Components ─────────────────────────────────────────────────────────

const StatCard = ({ label, value, colorClass, bgClass, icon: Icon }: any) => (
  <div className={cn("p-5 rounded-3xl border border-slate-100 flex flex-col gap-2 transition-transform hover:scale-[1.02]", bgClass)}>
    <div className="flex justify-between items-start">
      <p className={cn("text-3xl font-black", colorClass)}>{value}</p>
      <Icon size={20} className={cn("opacity-60", colorClass)} />
    </div>
    <p className="text-slate-600 text-xs font-bold uppercase tracking-tight">{label}</p>
  </div>
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-white border-2 border-dashed border-slate-100 rounded-[2rem] animate-in fade-in zoom-in duration-500">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
      <CalendarCheck size={32} className="text-slate-300" />
    </div>
    <p className="text-slate-400 font-medium mb-6">{message}</p>
    <Link to="/doctors" className="bg-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold">
      <Plus size={18} /> Book Your First Appointment
    </Link>
  </div>
);

// ─── Main Page Component ─────────────────────────────────────────────────────

export function AppointmentsPage() {
  const { data, isLoading } = useAppointments();
  const updateMutation = useUpdateAppointment();
  const deleteMutation = useDeleteAppointment();

  const appointments = useMemo(() => {
    // التأكد من استخراج المصفوفة بشكل صحيح سواء كانت مباشرة أو مغلفة
    if (!data) return [];
    const rawData = Array.isArray(data) ? data : (data as any).data;
    return Array.isArray(rawData) ? (rawData as Appointment[]) : [];
  }, [data]);

  const [activeTab, setActiveTab] = useState<"all" | AptStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesTab = activeTab === "all" || apt.status === activeTab;
      const docName = apt.doctor_name || "";
      const specialty = apt.specialty || "";
      
      const matchesSearch = 
        docName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        specialty.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [appointments, activeTab, searchQuery]);

  const stats = useMemo(() => ({
    all: appointments.length,
    upcoming: appointments.filter((a) => a.status === "upcoming").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  }), [appointments]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 animate-fade-in p-4 md:p-0">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-slate-900 text-3xl font-black">My Appointments</h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <CalendarIcon size={16} className="text-emerald-500" />
            You have {stats.upcoming} upcoming consultations
          </p>
        </div>
        <Link to="/doctors" className="bg-white text-emerald-600 border-2 border-emerald-500 px-8 py-4 rounded-2xl shadow-lg shadow-emerald-500/10 flex items-center gap-2 font-bold hover:bg-emerald-600 hover:text-white transition-all duration-300 text-center justify-center active:scale-95 group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> Book New Appointment
        </Link>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.all} colorClass="text-slate-700" bgClass="bg-white" icon={Info} />
        <StatCard label="Upcoming" value={stats.upcoming} colorClass="text-cyan-600" bgClass="bg-cyan-50/50" icon={Clock} />
        <StatCard label="Completed" value={stats.completed} colorClass="text-emerald-600" bgClass="bg-emerald-50/50" icon={Info} />
        <StatCard label="Cancelled" value={stats.cancelled} colorClass="text-rose-600" bgClass="bg-rose-50/50" icon={AlertCircle} />
      </div>

      <div className="bg-slate-100/50 p-2 rounded-[1.5rem] border border-slate-200/60 flex flex-col lg:flex-row items-center gap-4">
        <div className="flex items-center gap-1 overflow-x-auto w-full lg:w-auto no-scrollbar pb-2 lg:pb-0">
          {(["all", "upcoming", "completed", "cancelled", "pending"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeTab === tab 
                  ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200" 
                  : "text-slate-500 hover:bg-white/50 hover:text-slate-700"
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by doctor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 w-full bg-slate-50 rounded-3xl animate-pulse border border-slate-100" />)}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <EmptyState message={searchQuery ? "No matches for your search" : "No appointments found"} />
        ) : (
          filteredAppointments.map((apt) => {
            const config = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
            const isOnline = apt.type.toLowerCase().includes("online");

            return (
              <div
                key={apt.id}
                className={cn(
                  "group bg-white border border-slate-100 rounded-[2rem] p-5 transition-all hover:shadow-xl flex flex-col md:flex-row items-center gap-6",
                  apt.status === "cancelled" && "opacity-75 grayscale-[0.2]"
                )}
              >
                <div className="relative">
                  <Avatar 
                    src={apt.doctor_image || ""} 
                    name={apt.doctor_name || "Doctor"} 
                    size="xl" 
                    className="rounded-2xl shadow-md border-2 border-white" 
                  />
                  <div className={cn("absolute -bottom-2 -right-2 p-1.5 rounded-lg text-white shadow-sm border border-white", isOnline ? "bg-emerald-500" : "bg-blue-500")}>
                    {isOnline ? <Video size={14} /> : <MapPin size={14} />}
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                    <h3 className="text-lg font-black text-slate-800">{apt.doctor_name || "Specialist"}</h3>
                    <Badge variant={config.variant} className="w-fit mx-auto md:mx-0 uppercase text-[10px] tracking-widest">{config.label}</Badge>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm font-medium text-slate-500">
                    <span className="flex items-center gap-1.5"><Stethoscope size={16} className="text-emerald-500" /> {apt.specialty || "General"}</span>
                    <span className="flex items-center gap-1.5"><Clock size={16} className="text-slate-400" /> {apt.appointment_time}</span>
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-4 flex gap-6 border border-slate-100 min-w-[200px] justify-center">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Date</p>
                    <p className="text-slate-700 font-bold text-sm">{apt.appointment_date}</p>
                  </div>
                  <div className="w-px bg-slate-200 h-8 self-center" />
                  <div className="text-center">
                    <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Method</p>
                    <p className="text-slate-700 font-bold text-sm">{isOnline ? "Video" : "Clinic"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-center">
                  {apt.status === "upcoming" && (
                    <>
                      {isOnline ? (
                        <button className="flex-1 md:flex-none bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-100 flex items-center gap-2 justify-center">
                          <Video size={18} /> Join
                        </button>
                      ) : (
                        <button className="flex-1 md:flex-none bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-900 transition-colors shadow-lg shadow-slate-100 justify-center">
                          Directions
                        </button>
                      )}
                      <button 
                        onClick={() => setCancelId(apt.id)}
                        className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                      >
                        <X size={20} />
                      </button>
                    </>
                  )}
                  {apt.status === "completed" && (
                    <button className="w-full md:w-auto text-emerald-600 font-bold text-sm px-4 py-2 hover:bg-emerald-50 rounded-xl transition-all">
                      View Prescription
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {cancelId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Cancel Appointment?</h3>
            <p className="text-slate-500 mb-8 font-medium leading-relaxed">
              Are you sure you want to cancel this appointment? It will be moved to your history as cancelled.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setCancelId(null)} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all">
                No, Keep it
              </button>
              <button 
                onClick={() => updateMutation.mutate({ id: cancelId!, status: "cancelled" }, {
                  onSuccess: () => setCancelId(null)
                })}
                disabled={updateMutation.isPending}
                className="py-4 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 disabled:opacity-50"
              >
                {updateMutation.isPending ? "..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Route Definition ────────────────────────────────────────────────────────
export const Route = createFileRoute('/_protected/appointments')({
  component: AppointmentsPage,
});