// src/routes/_protected/PatientDashboard.tsx
import React, { useState, useMemo } from "react";
import { Link, useSearch, createFileRoute } from "@tanstack/react-router";
import {
  CalendarCheck, FileText, Heart,
  Video, Clock, ChevronRight, Activity,
  Pill, Stethoscope, TrendingUp, Star,  ShoppingBag, Package,
  Plus, Check,
  Dna, ShieldCheck, Thermometer, Zap

} from "lucide-react";

import { 
  useDoctors, useMedicalRecords, usePackages, 
  useAppointments, useCart, useFavorites, 
  useRemoveFromCart, useAddToCart, useUserOrders 
} from "@/queries/useQueries";
import { useAuthStore } from "../../stores/useAuthStore";
import {
  GlassCard, StatCard, DoctorCard, Badge,
  Avatar, Skeleton, SkeletonCard,
} from "../../components/ui/Primitives";
import { cn, formatCurrency } from "../../lib/utils";

export interface MedicalRecord {
  id: string | number;
  user_id: string;
  title: string;
  type: 'lab' | 'prescription' | 'diagnosis' | 'imaging' | 'surgery';
  record_date: string;
  body: string;
  tags: string[];
  views: number;
  likes: number;
}
import type { Appointment } from "./appointments";

// ─── Record type colours ──────────────────────────────────────────────────────
const RECORD_COLORS: Record<string, string> = {
  lab:          "#0ea5e9", // Sky 500
  prescription: "#8b5cf6", // Violet 500
  diagnosis:    "#f59e0b", // Amber 500
  imaging:      "#10b981", // Emerald 500
  surgery:      "#ef4444", // Red 500
};
const RECORD_ICONS: Record<string, React.ElementType> = {
  lab:          Activity,
  prescription: Pill,
  diagnosis:    Stethoscope,
  imaging:      TrendingUp,
  surgery:      Heart,
};

export const Route = createFileRoute('/_protected/patient-dashboard')({
  component: PatientDashboard,
})

// ─── Component ────────────────────────────────────────────────────────────────
export function PatientDashboard() {
  const user         = useAuthStore((s) => s.user);
  const search       = useSearch({ strict: false }) as any;

  const userId = user?.id ?? 0;
  const metadata = user && 'user_metadata' in user ? (user as any).user_metadata : null;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "Guest Patient";
    const u = user as any;
    
    // 1. استخراج كل القيم المحتملة
    const fName = u.first_name || metadata?.first_name || "";
    const lName = u.last_name || metadata?.last_name || "";
    const full  = u.full_name || metadata?.full_name || "";

    // 2. دمج الاسم الأول والأخير
    let name = (fName || lName) ? `${fName} ${lName}`.trim() : full;

    // 3. المنطق الجديد: إذا كان الاسم يحتوي على كلمة "User" أو "يوزر" 
    // وكان هناك اسم كامل متاح في الـ metadata، نستخدم الـ metadata
    if (name.match(/^(User|يوزر|Patient)$/i) && metadata?.full_name) {
      name = metadata.full_name;
    }

    // 4. التنظيف النهائي
    return (name && !name.match(/^(User|يوزر|Patient)$/i)) ? name : "Valued Guest";
  }, [user, metadata]);

  const userImage = user?.image || metadata?.avatar_url || undefined;

  const { data: doctorsPage, isLoading: docLoading } = useDoctors();
  const { data: recordsData, isLoading: recLoading  } = useMedicalRecords(userId);
  const { data: pkgPage                              } = usePackages({ limit: 3, skip: 0 });
  const { data: appointmentsData, isLoading: aptLoading } = useAppointments();
  
  const { data: cartData } = useCart();
  const { data: favoritesData } = useFavorites(userId);
  const { data: ordersData, isLoading: ordersLoading } = useUserOrders();

  const cart = (cartData as any[]) || [];
  const favDoctors = (favoritesData as any[]) || [];
  const orders = (ordersData as any[]) || [];
  const records = (recordsData as any[]) || [];
  const appointments = (appointmentsData as any[]) || [];
  
  // دالة الحذف من السلة (الباك إند)
  const { mutate: removeCartItem } = useRemoveFromCart();

  const cartTotal = (cart || []).reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  const recentRecords = records?.slice(0, 5) ?? [];
  
  const doctorsList = Array.isArray(doctorsPage) ? doctorsPage : (doctorsPage as any)?.data ?? [];
  const suggestedDocs = doctorsList.slice(0, 4);

  const upcomingAppointments = (appointments || [])
    .filter((a: Appointment) => a?.status === "upcoming")
    .slice(0, 3);

  const [activeTab, setActiveTab] = useState<"suggested" | "favorites">("suggested");

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Conditional View: Medical Packages (Orders) ── */}
      {search.tab === 'packages' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="heading-display text-emerald-600 text-2xl">My Packages</h1>
              <p className="text-slate-500 text-sm">View and manage your active medical subscriptions</p>
            </div>
          <Link to="/patient-dashboard" className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors text-xs font-medium">
              Back to Overview
            </Link>
          </div>

          <GlassCard hover={false} className="bg-white/80 border-slate-100 shadow-sm min-h-[400px]">
            {ordersLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
              </div>
            ) : orders.length === 0 ? (
              <EmptyState icon={Package} title="No packages yet" desc="You haven't purchased any medical packages yet." color="#10b981" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((order: any, idx: number) => (
                  <div key={order.id ? `order-${order.id}` : `order-idx-${idx}`} className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-4 hover:border-emerald-200 transition-all">
                    <div className="flex justify-between items-start">
                      <Badge variant="emerald" className="px-3 py-1">Order #{order.id}</Badge>
                      <span className="text-[10px] text-slate-400 font-medium">{new Date(order.date).toLocaleDateString()}</span>
                    </div>
                    <div className="space-y-2">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl">
                          <img src={item.thumbnail || undefined} className="w-10 h-10 rounded-lg object-cover" alt="" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-500">{item.category} • Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-xs text-slate-500">Total Paid</span>
                      <span className="text-sm font-bold text-emerald-600">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      ) : (
        <>

      {/* ── Welcome banner ── */}
      <div
        className="relative rounded-3xl overflow-hidden p-6 md:p-8"
        style={{
          background: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
          border: "1px solid rgba(16,185,129,0.1)",
        }}
      >
        {/* Medical Decorative Elements */}
        <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
          <Dna size={180} className="text-white" />
        </div>
        <div className="absolute -bottom-10 right-1/4 opacity-5">
          <Activity size={240} className="text-white" />
        </div>
        
        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
          <div className="avatar-ring flex-shrink-0 self-start">
            <div className="relative">
              {userImage && (
                <img src={userImage} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-white/50" />
              )}
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                <ShieldCheck size={14} className="text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-emerald-50/90 text-sm font-bold mb-1 tracking-wide uppercase">{greeting} 👋</p>
            <h2
              className="text-white text-4xl font-black drop-shadow-lg tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {displayName}
            </h2>
            {upcomingAppointments.length > 0 ? (
              <p className="text-emerald-50/90 text-sm mt-1">
                Your next appointment is <span className="font-bold text-white">{upcomingAppointments[0].appointment_date} at {upcomingAppointments[0].appointment_time}</span> with {upcomingAppointments[0].doctor_name || "your doctor"}
              </p>
            ) : (
              <p className="text-emerald-50 text-sm mt-1">
                No upcoming appointments. Stay healthy!
              </p>
            )}
          </div>
          <Link
            to="/appointments"
            className="bg-white text-emerald-600 border-2 border-white hover:border-emerald-400 px-6 py-3 rounded-2xl font-bold transition-all duration-300 self-start md:self-auto flex-shrink-0 flex items-center gap-2 shadow-xl shadow-emerald-900/20 active:scale-95 group"
          >
            <CalendarCheck size={18} className="group-hover:scale-110 transition-transform" />
            Book Appointment
          </Link>
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <StatCard label="Appointments"  value={upcomingAppointments.length} icon={CalendarCheck} accentColor="#10b981" gradientFrom="#ecfdf5" change="Next visit soon" />
        <StatCard label="Medical Files" value={recentRecords.length} icon={FileText}  accentColor="#0ea5e9" gradientFrom="#f0f9ff" change="All records secure" />
        <StatCard label="Saved Doctors" value={favDoctors.length} icon={Heart}        accentColor="#ef4444" gradientFrom="#fef2f2" change={undefined} />
        <Link to="/patient-dashboard" search={{ tab: 'packages' }}>
          <StatCard label="Active Plans"    value={orders.length}      icon={Zap} accentColor="#8b5cf6" gradientFrom="#f5f3ff" change="Package access" />
        </Link>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Left column — doctors + records */}
        <div className="xl:col-span-2 space-y-6">

          {/* ── Vitals Monitor (New Medical Element) ── */}
          <GlassCard className="bg-emerald-900/5 border-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Activity size={80} className="text-emerald-600" />
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                <Thermometer size={20} />
              </div>
              <div>
                <h4 className="text-emerald-900 font-bold text-sm">Health Status: Excellent</h4>
                <p className="text-emerald-600/70 text-[11px] font-medium">Your medical profile is 100% complete and verified.</p>
              </div>
            </div>
          </GlassCard>

          {/* ── Doctors section ── */}
          <GlassCard hover={false} className="bg-white/80 border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-slate-800 font-semibold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                  <Stethoscope size={18} className="text-emerald-600" /> Find a Doctor
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Browse and save specialists</p>
              </div>
              {/* Tab toggle */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-50 border border-slate-100">
                {(["suggested", "favorites"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200",
                      activeTab === tab ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"
                    )}
                  >
                    {tab === "favorites" ? `Saved (${favDoctors.length})` : "Suggested"}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === "suggested" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger">
                {docLoading
                  ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`skel-doc-${i}`} />)
                  : suggestedDocs.map((doc: any, idx: number) => (
                      <DoctorCard key={doc.id ? `doc-${doc.id}` : `doc-idx-${idx}`} doctor={doc} variant="grid" />
                    ))}
              </div>
            ) : favDoctors.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No saved doctors yet"
                desc="Tap the heart on any doctor card to save them here."
                color="var(--neon-rose)"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger">
                {favDoctors.map((rec: any, idx: number) => (
                  // تصحيح: البيانات موجودة بداخل كائن doctors المرتبط
                  <DoctorCard key={rec.id ? `fav-${rec.id}` : `fav-idx-${idx}`} doctor={rec.doctors} variant="grid" />
                ))}
              </div>
            )}

            <Link
              to="/doctors"
              className="flex items-center justify-center gap-2 mt-5 pt-5 border-t text-sm font-medium transition-colors"
              style={{ borderColor: "rgba(0,0,0,0.05)", color: "#10b981" }}
            >
              View all doctors <ChevronRight size={15} />
            </Link>
          </GlassCard>

          {/* ── Medical Records ── */}
          <GlassCard hover={false} className="bg-white/80 border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-slate-800 font-semibold flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
                  <FileText size={18} className="text-sky-600" /> Medical Records
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">Your recent health history</p>
              </div>
              <Link to="/records" className="text-emerald-600 hover:bg-emerald-50 py-1.5 px-3 rounded-lg transition-all text-xs font-medium">View All</Link>
            </div>

            {recLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={`skel-rec-${i}`} className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-xl" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : recentRecords.length === 0 ? (
              <EmptyState icon={FileText} title="No records found" desc="Your medical history will appear here." color="var(--neon-cyan)" />
            ) : (
              <div className="space-y-2">
                {recentRecords.map((rec : any, idx: number) => (
                  <RecordRow key={rec.id ? `rec-${rec.id}` : `rec-idx-${idx}`} record={rec} />
                ))}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right column — appointments + cart */}
        <div className="space-y-6">

          {/* ── Upcoming Appointments ── */}
          <GlassCard hover={false}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-emerald-400 font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                Upcoming
              </h3>
              <Badge variant="cyan">{upcomingAppointments.length}</Badge>
            </div>
            <div className="space-y-3">
              {aptLoading ? (
                Array.from({ length: 2 }).map((_, i) => <Skeleton key={`skel-apt-${i}`} className="h-16 w-full rounded-xl" />)
              ) : upcomingAppointments.length === 0 ? (
                <p className="text-white/20 text-xs text-center py-4">No upcoming appointments</p>
              ) : (
                upcomingAppointments.map((apt: Appointment, idx: number) => (
                  <div
                    key={apt.id ? `apt-${apt.id}` : `apt-idx-${idx}`}
                    className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-white/5"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <Avatar src={apt.doctor_image || undefined} name={apt.doctor_name || "Doctor"} size="sm" online />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-400 text-xs font-semibold truncate">{apt.doctor_name || "Specialist"}</p>
                      <p className="text-white/40 text-[10px]">{apt.specialty || "General Consultation"}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white/70 text-[10px] font-medium">{apt.appointment_date}</p>
                      <p className="text-white/40 text-[10px]">{apt.appointment_time}</p>
                    </div>
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: apt.type === "Online Consultation" ? "rgba(0,229,255,0.12)" : "rgba(167,139,250,0.12)",
                        color: apt.type === "Online Consultation" ? "var(--neon-cyan)" : "var(--neon-violet-lt)",
                      }}
                    >
                      {apt.type === "Online Consultation" ? <Video size={13} /> : <Clock size={13} />}
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link to="/appointments" className="flex items-center justify-center gap-2 mt-4 pt-4 border-t text-xs font-medium" style={{ borderColor: "rgba(0,0,0,0.05)", color: "#10b981" }}>
              Manage appointments <ChevronRight size={13} />
            </Link>
          </GlassCard>

          {/* ── Cart Summary ── */}
          <GlassCard hover={false} className="bg-white/80 border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-col">
                <h3 className="text-slate-800 font-semibold" style={{ fontFamily: "var(--font-display)" }}>Medical Bag</h3>
                <Link to="/patient-dashboard" search={{ tab: 'packages' }} className="text-[10px] text-emerald-600 hover:underline font-bold">VIEW PURCHASED PACKAGES</Link>
              </div>
              {cart.length > 0 && (
                <Badge variant="emerald">{cart.length} items</Badge>
              )}
            </div>

            {cart.length === 0 ? (
              <EmptyState icon={ShoppingBag} title="Bag is empty" desc="Add medical packages to get started." color="#10b981" compact />
            ) : (
              <>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {cart.map((item: any, idx: number) => (
                    <div
                      key={item.id ? `cart-${item.id}` : `cart-idx-${idx}`}
                      className="flex items-center gap-2 p-2 rounded-xl"
                      style={{ background: "#f8fafc" }}
                    >
                      <img src={item.thumbnail || undefined} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-800 text-xs font-medium truncate">{item.title}</p>
                        <p className="text-slate-500 text-[10px]">×{item.quantity}</p>
                      </div>
                      <p className="text-emerald-600 text-xs font-semibold flex-shrink-0">
                        ${(item.price * item.quantity).toFixed(0)}
                      </p>
                      <button
                        onClick={() => removeCartItem(item.id)}
                        className="text-white/20 hover:text-rose-400 transition-colors text-xs flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                  <span className="text-slate-500 text-sm">Total</span>
                  <span className="text-slate-800 font-bold">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                <Link to="/cart" className="bg-emerald-600 hover:bg-emerald-700 text-white w-full mt-3 py-2 rounded-xl transition-all text-sm font-medium flex items-center justify-center">
                  Proceed to Checkout
                </Link>
              </>
            )}
          </GlassCard>

          {/* ── Recommended Packages ── */}
          <GlassCard hover={false} className="bg-white/80 border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-800 font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                Packages
              </h3>
              <Link to="/products/packages" className="text-xs font-medium text-emerald-600">See all</Link>
            </div>
            <div className="space-y-2">
              {pkgPage?.data?.map((pkg: any, idx: number) => (
                <PackageRow key={pkg.id ? `pkg-${pkg.id}` : `pkg-idx-${idx}`} pkg={pkg} />
              ))}
            </div>
          </GlassCard>

        </div>
      </div>
        </>
      )}
    </div>
  );
}

// ─── Record Row ───────────────────────────────────────────────────────────────
function RecordRow({ record }: { record: MedicalRecord }) {
  const Icon  = RECORD_ICONS[record.type]  ?? Activity;
  const color = RECORD_COLORS[record.type] ?? "var(--neon-cyan)";
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
      style={{ border: "1px solid #f1f5f9" }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}
      >
        <Icon size={15} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-800 text-xs font-semibold truncate">{record.title}</p>
        <p className="text-slate-500 text-[10px] mt-0.5">{record.record_date}</p>
      </div>
      <Badge variant={
        record.type === "lab" ? "emerald" :
        record.type === "prescription" ? "violet" :
        record.type === "imaging" ? "emerald" :
        record.type === "surgery" ? "rose" : "amber"
      } className="capitalize flex-shrink-0 text-[10px]">
        {record.type}
      </Badge>
    </div>
  );
}

// ─── Package Row ──────────────────────────────────────────────────────────────
function PackageRow({ pkg }: { pkg: any }) {
  const { data: cartData } = useCart();
  const user = useAuthStore((s) => s.user);
  const cart = Array.isArray(cartData) ? cartData : (cartData as any)?.data ?? [];
  const { mutate: addToCart, isPending } = useAddToCart();
  
  // التحقق مما إذا كان المنتج في السلة (باستخدام العنوان أو المعرف)
  const inCart = cart.some((c: any) => c.title === pkg.title);

  return (
    <div
      className="group flex items-center gap-3 p-2.5 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-md hover:shadow-emerald-500/5 border border-transparent hover:border-emerald-100"
      style={{ background: "#f8fafc" }}
    >
      <div className="relative">
        <img src={pkg.thumbnail || undefined} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-slate-100" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-slate-900 text-[11px] font-bold truncate group-hover:text-emerald-600 transition-colors">{pkg.category}</p>
        <p className="font-black text-xs text-emerald-600 mt-0.5">
          {formatCurrency(pkg.price)}
        </p>
      </div>
      <button
        onClick={() => addToCart(pkg)}
        disabled={inCart || isPending}
        className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold transition-all duration-300",
          (inCart || isPending)
            ? "opacity-40 cursor-not-allowed"
            : "bg-white border border-emerald-100 text-emerald-600 shadow-sm hover:bg-emerald-600 hover:text-white"
        )}
      >
        {inCart ? <Check size={14} /> : <Plus size={14} />}
      </button>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({
  icon: Icon, title, desc, color, compact = false,
}: {
  icon: React.ElementType; title: string; desc: string; color: string; compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", compact ? "py-4 gap-2" : "py-8 gap-3")}>
      <div
        className={cn("rounded-2xl flex items-center justify-center", compact ? "w-10 h-10" : "w-14 h-14")}
        style={{ background: `${color}15`, border: `1px solid ${color}25` }}
      >
        <Icon size={compact ? 18 : 24} style={{ color }} />
      </div>
      <p className={cn("text-slate-800 font-semibold", compact ? "text-sm" : "")}>{title}</p>
      <p className="text-slate-500 text-xs max-w-[200px]">{desc}</p>
    </div>
  );
}