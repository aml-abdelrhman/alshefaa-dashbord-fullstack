// src/routes/_protected/FavoritesPage.tsx
import React, { useState } from "react";
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Heart, Star, Video, Calendar, Trash2,
  Search, Stethoscope, Users, Eye,
} from "lucide-react";
import { useFavorites, QK, api } from '@/queries/useQueries';
import { useAuthStore } from "../../stores/useAuthStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GlassCard, Badge, Avatar, SkeletonCard } from "../../components/ui/Primitives";
import { cn, formatNumber } from "../../lib/utils";

export const Route = createFileRoute('/_protected/favorites')({
  component: FavoritesPage,
})

export function FavoritesPage() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // 1. جلب البيانات من الباك إند
  const { data: favoriteDoctors = [], isLoading } = useFavorites(user?.id ?? 0);

  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<any>(null);

  // 2. دالة الحذف من الباك إند
  const deleteMutation = useMutation({
    mutationFn: async (favId: string | number) => {
      // حذف السجل من جدول favorites بناءً على الـ id الخاص بالسجل
      await api.delete(`/favorites?id=eq.${favId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.favorites(user?.id ?? 0) });
      setConfirmId(null);
    },
  });

  const filtered = favoriteDoctors.filter((rec: any) => {
    const doc = rec?.profiles || rec?.doctors || rec?.doctor || rec;
    if (!doc) return false;

    const fullName = (doc.fullName || doc.full_name || "").toLowerCase();
    const specialization = (doc.specialization || doc.specialty || "").toLowerCase();
    const query = search.toLowerCase();

    return search.trim() === "" || fullName.includes(query) || specialization.includes(query);
  });

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-display text-green-600 text-3xl font-bold">Saved Doctors</h1>
          <p className="text-green-500/70 text-sm mt-1">
            You have {favoriteDoctors.length} specialist{favoriteDoctors.length !== 1 ? "s" : ""} in your list
          </p>
        </div>
        <Link to="/doctors" className="btn-ghost bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-xl text-sm flex items-center gap-2 w-fit">
          <Search size={16} /> Browse More Doctors
        </Link>
      </div>

      {/* Empty state & Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : favoriteDoctors.length === 0 ? (
        <GlassCard hover={false} className="flex flex-col items-center py-24 gap-6 text-center">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center bg-rose-50 border border-rose-100 shadow-inner">
            <Heart size={48} className="text-rose-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-slate-800 font-bold text-xl">Your list is empty</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
              You haven't saved any doctors yet. Start exploring our world-class specialists.
            </p>
          </div>
          <Link to="/doctors" className="btn-primary bg-slate-900 text-white px-8 py-3 rounded-2xl flex items-center gap-2 hover:scale-105 transition-transform">
            <Stethoscope size={18} /> Find Specialists
          </Link>
        </GlassCard>
      ) : (
        <>
          {/* Search Bar */}
          <div className="relative max-w-md group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-green-500 transition-colors" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or specialty..."
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/5 focus:border-green-500/30 transition-all shadow-sm"
            />
          </div>

          {/* Grid of Doctors */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">No doctors found matching "<span className="font-semibold">{search}</span>"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger">
              {filtered.map((rec: any) => {
                // استخراج بيانات الطبيب من الـ Join بشكل صحيح
                const doc = rec.profiles || rec.doctors || rec.doctor || rec;
                const doctorId = doc?.id || rec.doctor_id;

                if (!doc || (!doc.fullName && !doc.full_name)) return null;

                return (
                  <div key={rec.id?.toString()} className="relative group h-full">
                    {/* الرابط الشامل للكارد */}
                    <Link
                      to="/DoctorDetail/$doctorId"
                      params={{ doctorId: doctorId?.toString() }}
                      className="absolute inset-0 z-10 rounded-3xl cursor-pointer"
                    />

                    <GlassCard 
                      className="flex flex-col h-full p-5 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 border border-transparent group-hover:border-green-100" 
                      glow="rose"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-5 relative z-20">
                        <Avatar
                          src={doc.image || doc.avatar_url || `https://i.pravatar.cc/150?u=${doctorId}`}
                          name={doc.fullName || doc.full_name}
                          size="xl"
                          ring={true}
                          online={doc.available}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmId(rec.id);
                          }}
                          className="w-9 h-9 rounded-full flex items-center justify-center text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                          title="Remove from favorites"
                        >
                          <Heart size={16} fill="currentColor" />
                        </button>
                      </div>

                      {/* Doctor Info */}
                      <div className="flex-1 relative z-0">
                        <h4 className="text-slate-800 font-bold text-lg leading-tight group-hover:text-green-600 transition-colors">
                          {doc.fullName || doc.full_name}
                        </h4>
                        <p className="text-green-600 font-semibold text-xs uppercase tracking-wider mt-1">
                          {doc.specialization || doc.specialty || "General Specialist"}
                        </p>
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-3">
                          <Stethoscope size={14} className="text-slate-300" />
                          <span className="truncate">{doc.hospital || "Main Medical Center"}</span>
                        </div>
                      </div>

                      {/* Stats Section */}
                      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-50 relative z-20">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-1 rounded-lg font-bold text-xs">
                            <Star size={12} fill="currentColor" />
                            {doc.rating ? doc.rating.toFixed(1) : "5.0"}
                          </div>
                          <div className="flex items-center gap-1 text-slate-400 text-[11px] ml-1">
                            <Users size={12} />
                            {formatNumber(doc.patientsCount || 120)}+
                          </div>
                        </div>
                        <Badge variant={doc.available ? "emerald" : "ghost"} className="text-[10px] px-2.5 py-0.5 rounded-full">
                          {doc.available ? "Available" : "Busy"}
                        </Badge>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-5 space-y-2 relative z-20">
                        <Link
                          to="/DoctorDetail/$doctorId"
                          params={{ doctorId: doctorId?.toString() }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full bg-slate-900 hover:bg-green-600 text-white py-3 rounded-2xl text-xs font-bold transition-all flex justify-center items-center gap-2 shadow-lg shadow-slate-900/10"
                        >
                          <Eye size={14} /> View Full Profile
                        </Link>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white hover:bg-cyan-50 text-cyan-600 border border-cyan-100 py-2.5 rounded-xl text-[11px] font-bold transition-all flex justify-center items-center gap-1.5"
                          >
                            <Video size={14} /> Consult
                          </button>
                          <Link
                            to="/DoctorDetail/$doctorId"
                            params={{ doctorId: doctorId?.toString() }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-green-50 hover:bg-green-100 text-green-700 py-2.5 rounded-xl text-[11px] font-bold transition-all flex justify-center items-center gap-1.5 border border-green-100"
                          >
                            <Calendar size={14} /> Book
                          </Link>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                )})}
            </div>
          )}
        </>
      )}

      {/* Modern Confirmation Modal */}
      {confirmId !== null && (() => {
        const rec = favoriteDoctors.find((r : any) => r.id === confirmId);
        const doc = rec?.profiles || rec?.doctors || rec?.doctor || rec;

        if (!doc) return null;
        const fullName = doc.fullName || doc.full_name || "this specialist";
        const image = doc.image || doc.avatar_url || `https://i.pravatar.cc/150?u=${doc.id}`;

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-fade-in" onClick={() => setConfirmId(null)} />
            <div
              className="relative w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl animate-scale-in border border-slate-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl overflow-hidden mb-4 shadow-lg ring-4 ring-rose-50">
                  <img src={image} alt="" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Remove from Saved?</h3>
                <p className="text-slate-500 text-sm mt-2">
                  Are you sure you want to remove <span className="font-semibold text-slate-700">Dr. {fullName}</span> from your favorites?
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button 
                  onClick={() => setConfirmId(null)} 
                  className="flex-1 py-3.5 rounded-2xl bg-slate-50 text-slate-600 font-bold text-sm hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(confirmId)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-3.5 rounded-2xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Removing..." : <><Trash2 size={16} /> Yes, Remove</>}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}