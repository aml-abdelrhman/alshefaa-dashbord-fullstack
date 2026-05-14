// src/components/ui/primitives.tsx
import React from "react";
import { TrendingUp, TrendingDown, ShoppingBag, Check, Plus, Stethoscope } from "lucide-react";
import { cn, formatCurrency } from "../../lib/utils";

// ─── GlassCard ────────────────────────────────────────────────────────────────
interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: "violet" | "cyan" | "emerald" | "rose" | "amber" | "none";
  hover?: boolean;
  gradientBorder?: boolean;
}

export function GlassCard({
  children,
  className,
  glow = "none",
  hover = true,
  gradientBorder = false,
  style,
  ...props
}: GlassCardProps) {
  const glowStyles: Record<string, string> = {
    violet:  "0 0 30px rgba(124,58,237,0.15)",
    cyan:    "0 0 30px rgba(0,229,255,0.12)",
    emerald: "0 0 30px rgba(0,255,163,0.12)",
    rose:    "0 0 30px rgba(255,77,139,0.12)",
    amber:   "0 0 30px rgba(255,179,71,0.12)",
    none:    "",
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-5 relative overflow-hidden transition-all duration-300",
        hover && "hover:-translate-y-1 hover:shadow-xl",
        gradientBorder && "border-2 border-emerald-500/20",
        className
      )}
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(0, 0, 0, 0.05)",
        boxShadow: `0 4px 24px rgba(0, 0, 0, 0.04)${glow !== "none" ? ", " + glowStyles[glow] : ""}`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  change?: number | string;
  icon: React.ElementType;
  accentColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  accentColor = "#10b981",
  gradientFrom = "rgba(16, 185, 129, 0.05)",
  gradientTo   = "transparent",
  className,
}: StatCardProps) {
  const isNumber = typeof change === "number";
  const isPositive = isNumber ? (change as number) >= 0 : true;

  return (
    <GlassCard
      className={cn("flex items-start justify-between", className)}
      style={{
        background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        border: `1px solid rgba(16, 185, 129, 0.1)`,
      }}
    >
      {/* Left */}
      <div className="flex-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
        <p
          className="text-2xl font-bold text-slate-800 leading-none"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
        </p>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 mt-2 text-xs font-medium", 
            isNumber ? (isPositive ? "text-emerald-400" : "text-rose-400") : "text-slate-400"
          )}>
            {isNumber && (isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />)}
            <span>{isNumber ? `${isPositive ? "+" : ""}${change}% this month` : change}</span>
          </div>
        )}
      </div>

      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
      >
        <Icon size={20} style={{ color: accentColor }} />
      </div>
    </GlassCard>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn("skeleton", className)} style={style} />;
}

export function SkeletonCard() {
  return (
    <GlassCard hover={false}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </GlassCard>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = "violet" | "cyan" | "emerald" | "rose" | "amber" | "ghost";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const BADGE_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  violet:  { background: "rgba(124, 58, 237, 0.1)",  color: "#7c3aed", border: "1px solid rgba(124, 58, 237, 0.2)" },
  cyan:    { background: "rgba(6, 182, 212, 0.1)",   color: "#0891b2", border: "1px solid rgba(6, 182, 212, 0.2)" },
  emerald: { background: "rgba(16, 185, 129, 0.1)",   color: "#059669", border: "1px solid rgba(16, 185, 129, 0.2)" },
  rose:    { background: "rgba(244, 63, 94, 0.1)",    color: "#e11d48", border: "1px solid rgba(244, 63, 94, 0.2)" },
  amber:   { background: "rgba(245, 158, 11, 0.1)",   color: "#d97706", border: "1px solid rgba(245, 158, 11, 0.2)" },
  ghost:   { background: "rgba(0, 0, 0, 0.05)",       color: "#64748b", border: "1px solid rgba(0, 0, 0, 0.1)" },
};

export function Badge({ children, variant = "violet", className }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", className)}
      style={BADGE_STYLES[variant]}
    >
      {children}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  ring?: boolean;
  online?: boolean;
  className?: string;
}

const SIZES = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-lg", xl: "w-20 h-20 text-2xl" };
const DOT_SIZES = { sm: "w-2 h-2", md: "w-2.5 h-2.5", lg: "w-3 h-3", xl: "w-4 h-4" };

export function Avatar({ src, name, size = "md", ring = false, online, className }: AvatarProps) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      {ring ? (
        <div className="avatar-ring" style={{ display: "inline-flex" }}>
          <AvatarInner src={src} initials={initials} size={size} />
        </div>
      ) : (
        <AvatarInner src={src} initials={initials} size={size} />
      )}
      {online !== undefined && (
        <span
          className={cn("absolute bottom-0 right-0 rounded-full border-2", DOT_SIZES[size])}
          style={{
            background: online ? "var(--neon-emerald)" : "rgba(255,255,255,0.2)",
            borderColor: "var(--bg-void)",
          }}
        />
      )}
    </div>
  );
}

function AvatarInner({ src, initials, size }: { src?: string; initials: string; size: AvatarProps["size"] }) {
  return src ? (
    <img
      src={src}
      alt={initials}
      className={cn("rounded-full object-cover", SIZES[size!])}
    />
  ) : (
    <div
      className={cn("rounded-full flex items-center justify-center text-white font-bold bg-emerald-600", SIZES[size!])}
      style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)" }}
    >
      {initials}
    </div>
  );
}
// ─── DoctorCard ───────────────────────────────────────────────────────────────
import { Heart, Star, Video, Calendar, ShieldCheck, Award, MapPin } from "lucide-react";
import { useFavorites, useToggleFavorite, useCart, useAddToCart } from "@/queries/useQueries";
import { useAuthStore } from "../../stores/useAuthStore";
import { Link } from "@tanstack/react-router";

interface DoctorCardProps {
  doctor: any;
  variant?: "grid" | "list";
}

export function DoctorCard({ doctor, variant = "grid" }: DoctorCardProps) {
  const { user } = useAuthStore();
  const { data: favorites = [] } = useFavorites(user?.id ?? 0);
  const toggleFavMutation = useToggleFavorite();

  const currentDoctorId = doctor.id || doctor.user_id || doctor.doctor_id;
  const fav = favorites.some((f: any) => (f.doctor_id || f.doctorId) === currentDoctorId);

  // --- تجهيز البيانات للعرض لضمان عدم وجود فراغات ---
  const displayName = doctor.fullName || (doctor.firstName ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Specialist");
  const displayImage = doctor.image || doctor.avatar_url;

  if (variant === "list") {
    return (
      <GlassCard className="flex items-center gap-4" hover>
        {/* استخدمنا displayImage و displayName هنا */}
        <Avatar src={displayImage} name={displayName} size="lg" ring online={doctor.available} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            <p className="text-slate-900 font-bold text-base flex items-center gap-1.5">
              {displayName}
              <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
            </p>
            <p className="text-emerald-600 font-semibold text-xs uppercase tracking-wider">{doctor.specialization}</p>
            <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
              <MapPin size={12} /> {doctor.hospital}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
            <Badge variant={doctor.available ? "emerald" : "ghost"}>
              {doctor.available ? "Available" : "Busy"}
            </Badge>
          <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-1 rounded-lg">
            <Star size={12} fill="currentColor" />
            {Number(doctor.rating || 0).toFixed(1)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavMutation.mutate({
                userId: user?.id ?? 0,
                doctorId: currentDoctorId,
                isFavorite: fav
              });
            }}
            disabled={toggleFavMutation.isPending}
            className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border shadow-sm", fav ? "text-rose-500 bg-rose-50 border-rose-100" : "text-slate-400 bg-white border-slate-100 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100")}
          >
            <Heart size={20} fill={fav ? "currentColor" : "none"} className={toggleFavMutation.isPending ? "animate-pulse" : ""} />
          </button>
          <Link
            to="/DoctorDetail/$doctorId" 
            params={{ doctorId: currentDoctorId.toString() }}
            className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 py-2 px-4 rounded-xl text-xs font-bold transition-all"
          >
            View
          </Link>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="flex flex-col border-slate-100 bg-white p-0 overflow-hidden" hover>
      {/* Top */}
      <div className="relative h-24 bg-gradient-to-r from-emerald-50 to-sky-50">
        <div className="absolute -bottom-10 left-5">
          {/* استخدمنا displayImage و displayName هنا */}
          <Avatar src={displayImage} name={displayName} size="lg" ring online={doctor.available} className="border-4 border-white shadow-md" />
        </div>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavMutation.mutate({
                userId: user?.id ?? 0,
                doctorId: currentDoctorId,
                isFavorite: fav
              });
            }}
            disabled={toggleFavMutation.isPending}
            className={cn("w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all border shadow-sm", fav ? "text-rose-500 bg-white/90 border-rose-100" : "text-slate-400 bg-white/80 border-white hover:text-rose-500")}
          >
            <Heart size={16} fill={fav ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 px-5 pb-5 flex-1 flex flex-col">
        <div className="mb-4">
          <p className="text-slate-900 font-bold text-base flex items-center gap-1.5">
            {displayName}
            <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
          </p>
          <p className="text-emerald-600 font-semibold text-xs mt-0.5 uppercase tracking-wide">{doctor.specialization}</p>
          <p className="text-slate-400 text-[11px] mt-1 flex items-center gap-1">
            <MapPin size={10} /> {doctor.hospital}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-50 mb-4">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-medium uppercase">Rating</p>
            <div className="flex items-center justify-center gap-0.5 text-amber-500 font-bold text-xs mt-0.5">
              <Star size={10} fill="currentColor" /> {Number(doctor.rating || 0).toFixed(1)}
            </div>
          </div>
          <div className="text-center border-x border-slate-50">
            <p className="text-[10px] text-slate-400 font-medium uppercase">Experience</p>
            <p className="text-slate-700 font-bold text-xs mt-0.5">{doctor.experience || 0} yrs</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 font-medium uppercase">Status</p>
            <p className={cn("font-bold text-[10px] mt-0.5", doctor.available ? "text-emerald-500" : "text-slate-400")}>
              {doctor.available ? "Active" : "Away"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto">
          <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-200 transition-all">
            <Video size={14} /> Video Consultation
          </button>
          <Link
            to="/DoctorDetail/$doctorId" 
            params={{ doctorId: currentDoctorId.toString() }}
            className="w-full bg-white hover:bg-emerald-600 text-emerald-600 hover:text-white border-2 border-emerald-500 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-emerald-200 active:scale-95 group"
          >
            <Calendar size={14} className="group-hover:scale-110 transition-transform" /> Book Appointment
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}
// ─── PackageCard ──────────────────────────────────────────────────────────────
export function PackageCard({ pkg }: { pkg: any }) {
  const { data: cart = [] } = useCart();
  const { mutate: addToCart, isPending } = useAddToCart();
  
  const inCart = cart.some((c: any) => c.packageId === pkg.id || c.title === pkg.title);

  return (
    <GlassCard className="flex flex-col p-0 overflow-hidden border-slate-100 bg-white group h-full shadow-sm hover:border-emerald-200" hover>
      {/* Header Image/Pattern */}
      <div className="relative h-40 overflow-hidden">
        <img src={pkg.thumbnail} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge variant="emerald" className="shadow-sm backdrop-blur-md bg-white/90 border-none text-[10px] uppercase tracking-wider">{pkg.category}</Badge>
          {pkg.discountPercentage > 0 && (
             <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg w-fit shadow-lg animate-pulse">
               {pkg.discountPercentage.toFixed(0)}% OFF
             </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-white">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span className="text-[10px] font-bold text-slate-700">{pkg.rating?.toFixed(1) || "4.8"}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <h3 className="font-bold text-slate-900 text-sm mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {pkg.title}
          </h3>
          <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
            {pkg.description || "Comprehensive medical care plan tailored for your health needs."}
          </p>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Investment</span>
            <div className="flex items-baseline gap-1.5">
               <span className="text-emerald-600 font-black text-lg">
                 {formatCurrency(pkg.price * (1 - (pkg.discountPercentage || 0) / 100))}
               </span>
               {pkg.discountPercentage > 0 && (
                 <span className="text-slate-300 text-[10px] line-through font-medium">{formatCurrency(pkg.price)}</span>
               )}
            </div>
          </div>
          <button
            onClick={() => addToCart(pkg)}
            disabled={inCart || isPending}
            className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
              inCart ? "bg-slate-100 text-slate-400" : "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:scale-110 active:scale-95"
            )}
          >
            {inCart ? <Check size={18} /> : isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={18} />}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}