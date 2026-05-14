// src/components/layout/Sidebar.tsx
import React, { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Calendar,
  HeartPulse,
  ShoppingBag,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Shield,
  Pill,
  Activity,
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { useCart, useFavorites } from "@/queries/useQueries";
import { cn } from "@/lib/utils";

// ─── Nav Item Type ────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  icon: React.ElementType;
  to: string;
  badge?: number | string;
  accentColor?: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    to: "/patient-dashboard",
    accentColor: "#10b981", // Emerald 500
  },
  {
    label: "Admin Panel",
    icon: Shield,
    to: "/AdminDashboard",
    accentColor: "#059669", // Emerald 600
    adminOnly: true,
  },
  {
    label: "Doctors",
    icon: Stethoscope,
    to: "/doctors",
    accentColor: "#34d399", // Emerald 400
  },
{
  label: "Packages", // خلي أول حرف كبير عشان الشكل الجمالي
  icon: Pill,
  to: "/products/packages", // المسار الكامل للمجلد والملف
  accentColor: "#047857",
},
  {
    label: "Appointments",
    icon: Calendar,
    to: "/appointments",
    accentColor: "#065f46", // Emerald 800
  },
  {
    label: "My Records",
    icon: FileText,
    to: "/records",
    accentColor: "#10b981", // Emerald 500
  },
  {
    label: "Favorites",
    icon: HeartPulse,
    to: "/favorites",
    accentColor: "#059669", // Emerald 600
  },
  {
    label: "Patients",
    icon: Users,
    to: "/PatientsPage",
    accentColor: "#34d399", // Emerald 400
    adminOnly: true,
  },
  {
    label: "Analytics",
    icon: Activity,
    to: "/AnalyticsPage",
    accentColor: "#047857", // Emerald 700
    adminOnly: true,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
interface SidebarProps {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const { data: cartItems = [] } = useCart();
  const { data: favItems = [] } = useFavorites( user?.id ?? 0);

  const u = user as any;
  const metadata = u?.user_metadata;
  const fName = u?.first_name || metadata?.first_name || u?.firstName || "";
  const lName = u?.last_name || metadata?.last_name || u?.lastName || "";

  const cartCount = cartItems.length;
  const favCount = favItems.length;

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAdmin = user?.role === "admin";

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out",
        "border-r shadow-sm",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
      style={{ background: "#ffffff", borderColor: "#f1f5f9" }}
    >
      {/* ── Logo ── */}
      <div
        className={cn(
          "relative flex items-center h-16 px-4 border-b",
          collapsed ? "justify-center" : "gap-3"
        )}
        style={{ borderColor: "#f1f5f9" }}
      >
        <div
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-transform hover:rotate-12"
          style={{ background: "#10b981" }}
        >
          <HeartPulse size={18} className="text-white" />
        </div>

        {!collapsed && (
          <div className="animate-fade-in">
            <p className="text-slate-800 font-bold text-base leading-tight">
              MediCare
            </p>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider opacity-80">
              Health Platform
            </p>
          </div>
        )}

        <button
          onClick={() => onCollapse(!collapsed)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center border shadow-sm transition-all duration-200 hover:scale-110 bg-white"
          style={{ borderColor: "#e2e8f0", color: "#64748b" }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* ── Nav Items ── */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {!collapsed && (
          <p className="px-3 pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Menu
          </p>
        )}

        {visibleNav.map((item) => {
          // إذا لم يكن هناك مستخدم، التوجه للوجن، وإلا التوجه للداشبورد الصحيح
          const dashboardPath = !user 
            ? "/login" 
            : (isAdmin ? "/AdminDashboard" : "/patient-dashboard");
            
          const targetPath = item.label === "Overview" ? dashboardPath : item.to;
          const isActive = currentPath === targetPath || (targetPath !== "/" && currentPath.startsWith(targetPath + "/"));
          const Icon = item.icon;
          const badge = item.to === "/favorites" ? favCount : item.badge;

          return (
            <Link
              key={item.to}
              to={targetPath as any}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600"
              )}
            >
              <Icon
                size={18}
                className={cn(
                  "relative z-10 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                  isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-emerald-500"
                )}
              />

              {!collapsed && <span className="relative z-10 flex-1 truncate">{item.label}</span>}
              
              {!collapsed && badge ? (
                <span className="relative z-10 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1 shadow-sm"
                  style={{ background: item.accentColor }}>
                  {badge}
                </span>
              ) : null}

              {collapsed && (
                <span className="absolute left-full ml-4 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}

        {/* Medical Bag link */}
        <Link
          to="/cart"
          className={cn(
            "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mt-2",
            collapsed ? "justify-center" : "",
            currentPath === "/cart" 
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100/50" 
              : "text-slate-500 hover:bg-slate-50 hover:text-emerald-600"
          )}
        >
          <ShoppingBag size={18} className={cn(
            "flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
            currentPath === "/cart" ? "text-emerald-600" : "text-slate-400"
          )} />
          {!collapsed && <span className="flex-1">Medical Bag</span>}
          {!collapsed && cartCount > 0 && (
            <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1 shadow-sm bg-emerald-500">
              {cartCount}
            </span>
          )}
          {collapsed && (
            <span className="absolute left-full ml-4 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50">
              Medical Bag
            </span>
          )}
        </Link>
      </nav>

      {/* ── User Card ── */}
      <div className="border-t p-4 space-y-2" style={{ borderColor: "#f1f5f9" }}>
        <Link
          to={"/SettingsPage" as any}
          className="group flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-all duration-200"
        >
          <Settings size={18} className="flex-shrink-0 group-hover:rotate-45 transition-transform duration-500" />
          {!collapsed && <span>Settings</span>}
        </Link>

        <div className={cn(
          "flex items-center gap-3 p-2 rounded-2xl transition-all duration-200",
          collapsed ? "justify-center" : "bg-slate-900 border border-slate-800 shadow-xl"
        )}>
          {user?.image ? (
            <img src={user.image} alt="" className="w-8 h-8 rounded-full object-cover border border-emerald-200 shadow-sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
              {fName?.[0] || 'U'}
            </div>
          )}

          {!collapsed && user && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-bold truncate">
                {fName} {lName}
              </p>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-tight">
                {user.role}
              </p>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={logout}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-all duration-200"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}