// src/routes/_protected/DoctorDetail.$doctorId.tsx

import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useAuthStore } from "../../stores/useAuthStore";

export const Route = createFileRoute('/_protected/DoctorDetail/$doctorId')({
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      throw redirect({ to: '/login' });
    }
  },
  component: DoctorDetail,
})

import React, { useState } from "react";
import {
  Star, Heart, Video, Calendar, MapPin, Phone, Mail,
  Award, Clock, Users, ChevronLeft, X, CheckCircle2, AlertCircle,
  Stethoscope, Activity, Shield, Info
} from "lucide-react";
import { useDoctor, useDoctorReviews, useCreateAppointment, useFavorites, useToggleFavorite } from "@/queries/useQueries";
import { GlassCard, Badge, Avatar, Skeleton } from "../../components/ui/Primitives";
import { cn, formatNumber } from "@/lib/utils";

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "02:00 PM", "02:30 PM", "03:00 PM",
  "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM",
];

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: 'error' | 'success'; onClose: () => void }) {
  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl animate-scale-in border backdrop-blur-md",
      type === 'error' ? "bg-rose-50/90 border-rose-200 text-rose-600" : "bg-emerald-50/90 border-emerald-200 text-emerald-600"
    )}>
      {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
      <p className="text-sm font-bold">{message}</p>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity p-1"><X size={14} /></button>
    </div>
  );
}

// ─── Booking Modal ────────────────────────────────────────────────────────────
interface BookingModalProps {
  doctor: any;
  onClose: () => void;
  onConfirm: (slot: { date: string; time: string; type: string; notes: string }) => void;
  user: any; // Add user prop
  onError: (msg: string) => void;
}

function BookingModal({ doctor, onClose, onConfirm, user, onError }: BookingModalProps) {
  const [date,  setDate]  = useState("");
  const [time,  setTime]  = useState("");
  const [type,  setType]  = useState<"video" | "in-person">("video");
  const [notes, setNotes] = useState("");
  const [done,  setDone]  = useState(false);
  
  const createAppointment = useCreateAppointment();

  // التأكد من وجود البيانات الأساسية قبل السماح بالتأكيد
  const doctorId = doctor?.id || doctor?.doctor_id;
  const userId = user?.id;
  const canSubmit = !!(date && time && userId && doctorId);

  const handleConfirm = () => {
    if (!canSubmit || !userId || !doctorId) return;
    
    createAppointment.mutate(
      {
        doctor_id: doctorId,
        user_id: userId,
        appointment_date: date,
        appointment_time: time,
        doctor_name: doctor.fullName,
        doctor_image: doctor.image,
        specialty: doctor.specialization,
        type: type === "video" ? "Online Consultation" : "Clinic Visit",
        status: "upcoming",
        notes, // Keep notes if it's part of the appointment data
      }, {
        onSuccess: () => {
        setDone(true);
        setTimeout(() => { 
          onConfirm({ date, time, type, notes }); 
          onClose(); 
        }, 1200); // تقليل وقت الانتظار قليلاً لتجربة أسرع
      },
      onError: (error: any) => {
        console.error("❌ Appointment Booking Failed:", error);
        console.error("❌ Server Error Response:", error.response?.data);
        const msg = error.response?.data?.message || error.message || "Failed to book appointment.";
        onError(msg);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden animate-scale-in"
        style={{
          background: "rgba(255,255,255,0.98)",
          border: "1px solid rgba(0,0,0,0.08)",
          backdropFilter: "blur(32px)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
        }}
      >
        {/* Gradient top edge */}
        <div className="h-px w-full" style={{ background: "var(--grad-primary)" }} />

        <div className="p-6">
          {done ? (
            <div className="flex flex-col items-center py-8 gap-4 animate-scale-in">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(0,255,163,0.12)", border: "2px solid rgba(0,255,163,0.3)" }}>
                <CheckCircle2 size={32} style={{ color: "var(--neon-emerald)" }} />
              </div>
              <p className="text-slate-900 font-semibold text-lg">Appointment Booked!</p>
              <p className="text-slate-500 text-sm text-center">
                {time} on {date} with {doctor.fullName}
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-slate-900 font-bold text-lg" style={{ fontFamily: "var(--font-display)" }}>Book Appointment</h3>
                  <p className="text-slate-500 text-sm mt-0.5">{doctor.fullName}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Type toggle */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Consultation Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["video", "in-person"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={cn("flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all")}
                        style={{
                          background: type === t ? (t === "video" ? "rgba(0,229,255,0.1)" : "rgba(124,58,237,0.1)") : "rgba(0,0,0,0.02)",
                          border: `1px solid ${type === t ? (t === "video" ? "rgba(0,229,255,0.3)" : "rgba(124,58,237,0.3)") : "rgba(0,0,0,0.05)"}`,
                          color: type === t ? (t === "video" ? "#0891b2" : "#7c3aed") : "#64748b",
                        }}
                      >
                        {t === "video" ? <Video size={14} /> : <Clock size={14} />}
                        {t === "video" ? "Video Call" : "In Person"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Select Date</label>
                  <input
                    type="date"
                    value={date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-glass w-full border-slate-200 bg-slate-50 text-slate-900"
                    style={{ colorScheme: "light" }}
                  />
                </div>

                {/* Time slots */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Available Slots</label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setTime(slot)}
                        className={cn("py-2 rounded-xl text-[11px] font-medium transition-all")}
                        style={{
                          background: time === slot ? "rgba(124,58,237,0.1)" : "rgba(0,0,0,0.02)",
                          border: `1px solid ${time === slot ? "rgba(124,58,237,0.3)" : "rgba(0,0,0,0.05)"}`,
                          color: time === slot ? "#7c3aed" : "#64748b",
                        }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wider">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your symptoms or reason for visit…"
                    rows={3}
                    className="input-glass w-full resize-none border-slate-200 bg-slate-50 text-slate-900"
                  />
                </div>

                <button
                  onClick={handleConfirm}
                  disabled={!canSubmit || createAppointment.isPending}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-xl mt-2",
                    !canSubmit || createAppointment.isPending 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-100" 
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20 active:scale-95"
                  )}
                >
                  {createAppointment.isPending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  {createAppointment.isPending ? "Booking..." : "Confirm Appointment"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DoctorDetail() {
  // 2. اسحبي الـ Params من الـ Route مباشرة
  const { doctorId } = Route.useParams(); 
  const id = doctorId; // شيلنا الـ Number() لأن الـ ID هو UUID (نص)

  // Generate a numeric hash from the string ID to use for deterministic mock data
  const idHash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const user = useAuthStore((s) => s.user);

  const { data: doctor, isLoading } = useDoctor(id);
  const { data: reviews = [], isLoading: reviewsLoading } = useDoctorReviews(id);
  
  // جلب المفضلة من الباك إند
  const { data: favorites = [] } = useFavorites(user?.id ?? "");
  const toggleFavMutation = useToggleFavorite();
  
  // التحقق من المفضلة باستخدام UUID (دعم doctor_id أو doctorId)
  const fav = favorites.some((f: any) => (f.doctor_id || f.doctorId) === id);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [booked,      setBooked]      = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'success') => {
    setToast({ message, type });
    // إخفاء التوست تلقائياً بعد 4 ثوانٍ
    setTimeout(() => setToast(null), 4000);
  };

  const handleBookingConfirm = (slot: { date: string; time: string; type: string; notes: string }) => {
    // تم إزالة setPendingBooking لأن الحجز يتم الآن عبر الباك إند مباشرة في BookingModal
    setBooked(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard hover={false} className="lg:col-span-1">
            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
            <Skeleton className="h-5 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </GlassCard>
          <div className="lg:col-span-2 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassCard key={i} hover={false}>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <p className="text-white/40 text-lg">Doctor not found</p>
      <Link to="/doctors" className="btn-ghost">Back to Doctors</Link>
    </div>
  );

  // دالة التعامل مع المفضلة مع التوست
  const handleToggleFavorite = () => {
    toggleFavMutation.mutate({
      userId: user?.id ?? "",
      doctorId: doctor.id,
      isFavorite: fav,
    }, {
      onSuccess: () => {
        showToast(fav ? "Removed from favorites" : "Added to favorites");
      },
      onError: (err: any) => {
        const errorMsg = err.response?.data?.message || err.message || "Session error or permission denied";
        showToast(`Favorite failed: ${errorMsg}`, "error");
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification Area */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <Link to="/doctors" className="text-slate-400 hover:text-slate-900 flex items-center gap-1.5 transition-colors">
          <ChevronLeft size={15} /> Doctors
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-green-500">{doctor.fullName}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left — Profile Card ── */}
        <div className="space-y-4">
          <GlassCard hover={false} className="text-center bg-white border-slate-100 shadow-sm">
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              <div className="avatar-ring">
                <img src={doctor.image} alt={doctor.fullName} className="w-24 h-24 rounded-full object-cover" />
              </div>
              <span
                className={cn(
                  "absolute bottom-1 right-1 w-4 h-4 rounded-full border-2",
                )}
                style={{
                  background: doctor.available ? "var(--neon-emerald)" : "rgba(255,255,255,0.2)",
                  borderColor: "var(--bg-void)",
                }}
              />
            </div>

            <h2 className="text-slate-900 font-bold text-xl" style={{ fontFamily: "var(--font-display)" }}>
              {doctor.fullName}
            </h2>
            <p className="text-slate-500 text-sm mt-1">{doctor.specialization}</p>
            <p className="text-slate-400 text-xs mt-0.5">{doctor.hospital}</p>

            {doctor.city && (
              <div className="flex items-center justify-center gap-1.5 mt-2 text-slate-400 text-xs">
                <MapPin size={12} />
                {doctor.city}{doctor.country ? `, ${doctor.country}` : ""}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-5 border-t border-slate-50">
              {[
                { label: "Patients", value: formatNumber(doctor.patientsCount), color: "var(--neon-cyan)" },
                { label: "Rating",   value: doctor.rating.toFixed(1),           color: "var(--neon-amber)" },
                { label: "Exp.",     value: `${doctor.experience}yr`,            color: "var(--neon-violet-lt)" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-bold text-base" style={{ color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</p>
                  <p className="text-slate-400 text-[10px] mt-0.5 font-bold uppercase">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="space-y-2 mt-5">
              <button
                onClick={() => setBookingOpen(true)}
                className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 border-2 border-emerald-500 bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-lg shadow-emerald-500/5 active:scale-[0.98] group"
              >
                <Calendar size={18} className="group-hover:rotate-12 transition-transform" />
                {booked ? "Reschedule My Visit" : "Book Appointment Now"}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button className="btn-neon-cyan py-2.5 text-xs gap-1.5 justify-center">
                  <Video size={13} /> Video Call
                </button>
                <button
                  onClick={handleToggleFavorite}
                  disabled={toggleFavMutation.isPending}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200",
                    fav ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
                  )}
                  style={{
                    background: fav ? "rgba(255,77,139,0.08)" : "rgba(0,0,0,0.03)",
                    border: `1px solid ${fav ? "rgba(255,77,139,0.2)" : "rgba(0,0,0,0.05)"}`,
                  }}
                >
                  <Heart size={13} fill={fav ? "currentColor" : "none"} />
                  {fav ? "Saved" : "Save"}
                </button>
              </div>
            </div>

            {booked && (
              <div
                className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs animate-slide-up"
                style={{ background: "rgba(0,255,163,0.08)", border: "1px solid rgba(0,255,163,0.2)", color: "var(--neon-emerald)" }}
              >
                <CheckCircle2 size={14} />
                Appointment booked!
              </div>
            )}
          </GlassCard>

          {/* Contact info */}
          <GlassCard hover={false} className="bg-white border-slate-100 shadow-sm">
            <h4 className="text-slate-900 font-bold text-sm mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Contact Info
            </h4>
            <div className="space-y-3">
              {[
                { icon: Phone, label: doctor.phone,     color: "var(--neon-cyan)" },
                { icon: Mail,  label: doctor.email,     color: "var(--neon-violet-lt)" },
                { icon: MapPin,label: doctor.hospital,  color: "var(--neon-emerald)" },
              ].map(({ icon: Icon, label, color }, index) => (
                <div key={`contact-${index}`} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                  <p className="text-slate-600 text-xs font-medium truncate">{label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* ── Right — Details + Reviews ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* About */}
          <GlassCard hover={false} className="bg-white border-slate-100 shadow-sm">
            <h3 className="text-slate-900 font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
              About
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {doctor.fullName} is a highly experienced {doctor.specialization} specialist at {doctor.hospital}
              {doctor.department ? `, ${doctor.department} department` : ""}. With over {doctor.experience} years
              of clinical experience and a patient satisfaction rate of {doctor.rating.toFixed(1)}/5.0, they have
              treated more than {formatNumber(doctor.patientsCount)} patients across various conditions.
              They are known for their thorough diagnostic approach and compassionate care.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              {[
                { icon: Award,      label: "Board Certified",     color: "var(--neon-cyan)" },
                { icon: Shield,     label: "Licensed Specialist",  color: "var(--neon-violet-lt)" },
                { icon: Activity,   label: "Expert Diagnostician", color: "var(--neon-emerald)" },
                { icon: Stethoscope,label: "24/7 Consultation",    color: "var(--neon-amber)" },
              ].map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl text-center"
                  style={{ background: `${color}08`, border: `1px solid ${color}18` }}
                >
                  <Icon size={18} style={{ color }} />
                  <p className="text-slate-500 text-[10px] font-bold uppercase leading-tight mt-1">{label}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Availability */}
          <GlassCard hover={false} className="bg-white border-slate-100 shadow-sm">
            <h3 className="text-slate-900 font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Weekly Availability
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => {
                const avail = [true, true, false, true, true, false, false][(idHash + i) % 7];
                return (
                  <div
                    key={day}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl"
                    style={{
                      background: avail ? "rgba(0,255,163,0.08)" : "rgba(0,0,0,0.02)",
                      border: `1px solid ${avail ? "rgba(0,255,163,0.2)" : "rgba(0,0,0,0.05)"}`,
                    }}
                  >
                    <p className="text-[10px] font-bold" style={{ color: avail ? "#059669" : "#94a3b8" }}>{day}</p>
                    <div className={cn("w-2 h-2 rounded-full")} style={{ background: avail ? "var(--neon-emerald)" : "#e2e8f0" }} />
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Reviews */}
          <GlassCard hover={false} className="bg-white border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-slate-900 font-bold" style={{ fontFamily: "var(--font-display)" }}>
                Patient Reviews
              </h3>
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" style={{ color: i < Math.floor(doctor.rating) ? "#fbbf24" : "#e2e8f0" }} />
                  ))}
                </div>
                <span className="text-slate-900 font-bold text-sm">{doctor.rating.toFixed(1)}</span>
                <span className="text-white/30 text-xs">({reviews.length} reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              {reviewsLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : reviews.length === 0 ? (
                <p className="text-slate-400 text-center py-4 text-xs">No reviews yet for this doctor.</p>
              ) : (
                reviews.map((r: any, idx: number) => (
                  <div
                    key={r.id ? `rev-${r.id}` : `rev-idx-${idx}`}
                    className="p-4 rounded-xl"
                    style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.04)" }} // ضمان فرادة المفتاح حتى لو كان الـ id ن
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "var(--grad-primary)" }}>
                          U
                        </div>
                        <span className="text-slate-800 text-sm font-bold">User #{r.userId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={11} fill="currentColor" style={{ color: i < r.rating ? "#fbbf24" : "#e2e8f0" }} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs leading-relaxed font-medium">{r.comment}</p>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Booking modal */}
      {bookingOpen && (
        <BookingModal
          doctor={doctor}
          onClose={() => setBookingOpen(false)}
          user={user} // Pass the user object
          onConfirm={handleBookingConfirm}
          onError={(msg) => showToast(msg, "error")}
        />
      )}
    </div>
  );
}