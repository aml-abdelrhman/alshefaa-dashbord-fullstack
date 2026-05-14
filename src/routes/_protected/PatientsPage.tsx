// src/routes/_protected/PatientsPage.tsx
import React, { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Search, Users, UserCheck, UserX, Eye,
  Phone, Mail, Droplets, MapPin, Calendar,
  X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { usePatients } from "../../queries/useQueries";
import { GlassCard, Badge, Avatar, Skeleton } from "../../components/ui/Primitives";
import { cn, formatNumber } from "../../lib/utils";
import type { Patient } from "../../types";

// تعريف المسار
export const Route = createFileRoute('/_protected/PatientsPage')({
  component: PatientsPage,
});

// ─── Patient Drawer ───────────────────────────────────────────────────────────
function PatientDrawer({ patient, onClose }: { patient: Patient; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md h-full overflow-y-auto animate-slide-right flex flex-col"
        style={{
          background: "#ffffff",
          borderLeft: "1px solid #e2e8f0",
          backdropFilter: "blur(32px)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5 border-b sticky top-0 z-10 bg-white/80 backdrop-blur-md"
          style={{ borderColor: "#f1f5f9" }}
        >
          <p className="text-slate-900 font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Patient Profile
          </p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Profile header */}
          <div className="flex items-center gap-4">
            <Avatar src={patient.image} name={patient.fullName || "Patient"} size="xl" ring />
            <div>
              <p className="text-slate-900 font-black text-xl" style={{ fontFamily: "var(--font-display)" }}>
                {patient.fullName}
              </p>
              <p className="text-slate-500 text-sm mt-0.5 font-medium">{patient.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {patient.gender && (
                  <Badge variant="ghost" className="capitalize text-[10px] bg-slate-100 text-slate-600">{patient.gender}</Badge>
                )}
                {patient.bloodGroup && (
                  <Badge variant="rose" className="text-[10px]">
                    <Droplets size={9} className="mr-0.5" /> {patient.bloodGroup}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Info grid */}
          <GlassCard hover={false} className="bg-slate-50 border-slate-100">
            <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Personal Information</h4>
            <div className="space-y-3">
              {[
                { icon: Calendar, label: "Age",       value: patient.age ? `${patient.age} years` : "—",  color: "#0f172a" },
                { icon: Phone,    label: "Phone",      value: patient.phone,                               color: "#2563eb" },
                { icon: Mail,     label: "Email",      value: patient.email,                               color: "#059669" },
                { icon: MapPin,   label: "City",       value: patient.city ?? "—",                         color: "#ea580c" },
                { icon: Calendar, label: "Registered", value: patient.registeredAt,                        color: "#6366f1" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}10`, border: `1px solid ${color}20` }}
                  >
                    <Icon size={13} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <p className="text-slate-400 text-xs font-medium">{label}</p>
                    <p className="text-slate-800 text-xs font-bold truncate max-w-[180px]">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Mock health summary */}
          <GlassCard hover={false} className="bg-white border-slate-200">
            <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Clinical Overview</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Visits",       value: "08",    color: "#0f172a" },
                { label: "Rx Issued",    value: "03",    color: "#2563eb" },
                { label: "Lab Results",  value: "05",    color: "#059669" },
                { label: "Last Sync",    value: "2w",    color: "#6366f1" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-3 rounded-xl text-center"
                  style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}
                >
                  <p className="font-black text-xl" style={{ color: s.color, fontFamily: "var(--font-display)" }}>
                    {s.value}
                  </p>
                  <p className="text-slate-400 text-[9px] mt-0.5 font-bold uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function PatientsPage() {
  const LIMIT = 15;
  const [skip,     setSkip]     = useState(0);
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<Patient | null>(null);

  const { data, isLoading } = usePatients({ limit: LIMIT, skip });

  const patients = useMemo(() => {
    let list = data?.data ?? [];
    if (search.trim()) list = list.filter((p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.city ?? "").toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [data, search]);

  const total = data?.total ?? 0;
  const pageCount = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(skip / LIMIT) + 1;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-display text-slate-900 text-2xl font-bold">Patients</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">{formatNumber(total)} total registered patients</p>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",    value: formatNumber(total),                  color: "#0ea5e9",    bg: "#f0f9ff",    icon: Users },
          { label: "Active",   value: formatNumber(Math.floor(total*0.72)), color: "#10b981",    bg: "#f0fdf4",    icon: UserCheck },
          { label: "Inactive", value: formatNumber(Math.floor(total*0.28)), color: "#f43f5e",    bg: "#fff1f2",   icon: UserX },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <GlassCard key={label} hover={false} className="flex items-center gap-3 p-4"
            style={{ background: bg, border: `1px solid ${color}20` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18` }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-slate-900 font-black text-xl" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
              <p className="text-slate-500 text-xs font-bold uppercase">{label}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Filters */}
      <GlassCard hover={false} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or city…"
            className="input-glass pl-10 py-2.5 w-full bg-slate-50 border-slate-200 text-slate-900"
          />
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard hover={false}>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <Users size={36} className="text-white/20" />
            <p className="text-slate-400 font-bold">No patients match your search</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Patient","Email","Phone","City","Age","Blood",""].map((h) => (
                      <th key={h} className="pb-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 pr-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => setSelected(p)}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={p.image} name={p.fullName || "User"} size="sm" />
                          <p className="text-slate-900 text-sm font-bold">{p.fullName}</p>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-600 text-xs font-medium">{p.email}</td>
                      <td className="py-3 pr-4 text-slate-600 text-xs font-medium">{p.phone}</td>
                      <td className="py-3 pr-4 text-slate-500 text-xs">{p.city ?? "—"}</td>
                      <td className="py-3 pr-4 text-slate-600 text-xs font-bold">{p.age ?? "—"}</td>
                      <td className="py-3 pr-4">
                        {p.bloodGroup && (
                          <Badge variant="rose" className="text-[10px]">
                            <Droplets size={8} className="mr-0.5 inline" />{p.bloodGroup}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelected(p); }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-100"
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-5 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <p className="text-slate-400 text-xs font-medium">
                Showing {skip + 1}–{Math.min(skip + LIMIT, total)} of {formatNumber(total)}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSkip(Math.max(0, skip - LIMIT))}
                  disabled={skip === 0}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all disabled:opacity-25 border border-slate-200"
                  style={{ background: "#ffffff" }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-slate-600 text-xs font-bold px-2">{currentPage} / {pageCount}</span>
                <button
                  onClick={() => setSkip(skip + LIMIT)}
                  disabled={skip + LIMIT >= total}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all disabled:opacity-25 border border-slate-200"
                  style={{ background: "#ffffff" }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </GlassCard>

      {/* Patient drawer */}
      {selected && (
        <PatientDrawer patient={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}