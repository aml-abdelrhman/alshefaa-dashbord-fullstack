// src/components/layout/Topbar.tsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Bell,
  ShoppingBag,
  Heart,
  ChevronDown,
  LogOut,
  User,
  Settings,
  X,
  Menu,
} from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import {
  useDoctorSearch,
  useNotifications,
  useMarkNotificationRead,
  useCart,
  useFavorites
} from "@/queries/useQueries";
import { cn } from "@/lib/utils";

// ─── Breadcrumb map ───────────────────────────────────────────────────────────
const ROUTE_LABELS: Record<string, string> = {
  "/":                    "Home",
  "/dashboard/patient":   "Patient Dashboard",
  "/dashboard/admin":     "Admin Dashboard",
  "/patient-dashboard":   "Patient Dashboard",
  "/AdminDashboard":      "Admin Dashboard",
  "/doctors":             "Doctors",
  "/packages":            "Medical Packages",
  "/cart":                "Medical Bag",
  "/favorites":           "Saved Doctors",
  "/records":             "Medical Records",
  "/appointments":        "Appointments",
  "/analytics":           "Analytics",
  "/patients":            "Patients",
  "/settings":            "Settings",
};

// ─── Component ────────────────────────────────────────────────────────────────
interface TopbarProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

export function Topbar({ sidebarCollapsed, onMobileMenuToggle }: TopbarProps) {
  const { user, logout } = useAuthStore();

  const u = user as any;
  const metadata = u?.user_metadata;
  const fName = u?.first_name || metadata?.first_name || u?.firstName || "";
  const lName = u?.last_name || metadata?.last_name || u?.lastName || "";

  // Safety check: ensure data is an array before accessing .length
  const { data: cartData, isLoading: isLoadingCart } = useCart();
  const { data: favoriteData, isLoading: isLoadingFavorites } = useFavorites( user?.id ?? 0);
  const cartItems = Array.isArray(cartData) ? cartData : [];
  const favoriteItems = Array.isArray(favoriteData) ? favoriteData : [];
  const cartCount = cartItems.length;
  const favCount = favoriteItems.length;

  const navigate = useNavigate();
  const routerState  = useRouterState();
  const currentPath  = routerState.location.pathname;
  const pageLabel    = ROUTE_LABELS[currentPath] ?? "MediCare";

  // ── Search state ──
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isFetching } = useDoctorSearch(searchQuery);

  // ── Notification panel ──
  const [notifOpen, setNotifOpen]  = useState(false);
  const { data: notificationsData } = useNotifications();
  const markRead = useMarkNotificationRead();
  
  // Ensure notifications is an array before filtering to avoid the reported crash
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;
  const notifRef = useRef<HTMLDivElement>(null);

  // ── User menu ──
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const sidebarW = sidebarCollapsed ? 72 : 260;

  // دالة لتنفيذ البحث الشامل عند الضغط على Enter
  const handleSearchSubmit = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate({ to: "/doctors", search: { search: searchQuery } as any });
      setSearchOpen(false);
    }
  };

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center gap-4 px-5 transition-all duration-300"
      style={{
        left: sidebarW,
        height: "var(--topbar-h)",
        background: "white",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
      }}
    >
     
      {/* Page title / breadcrumb */}
      <div className={cn("flex-1 min-w-0 transition-all duration-300", searchOpen && "hidden sm:block")}>
        <h1
          className="text-gray-800 font-semibold text-sm md:text-base truncate"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {pageLabel}
        </h1>
        <p className="text-[11px] text-gray-500 hidden md:block">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* ── Search ── */}
      <div ref={searchRef} className="relative">
        {searchOpen ? (
          <div className="flex items-center gap-2 animate-scale-in">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchSubmit}
                placeholder="Search doctors, packages…"
                className="pl-9 pr-4 py-2 w-[160px] xs:w-[200px] sm:w-64 md:w-72 text-sm bg-gray-100 text-gray-800 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
              />
              {isFetching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-emerald-500/40 border-t-emerald-500 rounded-full animate-spin" />
              )}
            </div>
            <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }} className="text-gray-400 hover:text-gray-800">
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all duration-200 hover:bg-gray-100"
          >
            <Search size={18} />
          </button>
        )}

        {/* Search results dropdown */}
        {searchOpen && searchQuery.length >= 2 && (
          <div
            className="absolute top-full right-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-80 rounded-2xl overflow-hidden z-50 animate-slide-down"
            style={{
              background: "#0f172a", // Slate 900
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div className="p-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Doctors</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {isFetching ? (
                <p className="p-4 text-gray-400 text-sm text-center animate-pulse">Searching...</p>
              ) : searchResults?.length ? (
                searchResults.map((doc: any) => (
                  <Link
                    key={doc.id}
                      to="/DoctorDetail/$doctorId"
                    params={{ doctorId: doc.id.toString() } as any} // Correct param key and value
                    onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <img src={doc.image} alt={doc.fullName} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <p className="text-white text-sm font-bold">{doc.fullName.startsWith('Dr.') ? doc.fullName : `Dr. ${doc.fullName}`}</p>
                      <p className="text-emerald-400 text-[11px] font-medium">{doc.specialization}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="p-4 text-gray-400 text-sm text-center">No results found</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Cart ── */}
      <Link
        to="/cart"
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all duration-200 hover:bg-gray-100"
      >
        <ShoppingBag size={18} />
        {cartCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "#10b981" }} // Emerald 500
          >
            {cartCount}
          </span>
        )}
      </Link>

      {/* ── Favorites ── */}
      <Link
        to="/favorites"
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all duration-200 hover:bg-gray-100"
      >
        <Heart size={18} />
        {favCount > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
            style={{ background: "#10b981" }} // Emerald 500
          >
            {favCount}
          </span>
        )}
      </Link>

      {/* ── Notifications ── */}
      <div ref={notifRef} className="relative">
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all duration-200 hover:bg-gray-100"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse-neon"
              style={{ background: "#10b981" }} // Emerald 500
            />
          )}
        </button>

        {notifOpen && (
          <div
            className="absolute top-full right-0 mt-2 w-80 rounded-2xl overflow-hidden z-50 animate-slide-down"
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <p className="text-white font-semibold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                Notifications
              </p>
              {unreadCount > 0 && (
                <span className="tag">{unreadCount} new</span>
              )}
            </div>
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {notifications.map((n: any) => (
                <div
                  key={n.id}
                  onClick={() => !n.read && markRead.mutate(n.id)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors",
                    !n.read && "bg-white/[0.02]"
                  )}
                >
                  <span
                    className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: !n.read ? "var(--neon-rose)" : "rgba(255,255,255,0.1)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", !n.read ? "text-white" : "text-white/60")}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-white/25 mt-1">Notification</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <button className="w-full text-center text-xs font-medium transition-colors" style={{ color: "#34d399" }}>
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── User menu ── */}
      <div ref={userMenuRef} className="relative">
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm hover:bg-slate-800 transition-all duration-200"
        >
          {user?.image ? (
            <div className="avatar-ring">
              <img src={user.image} alt="" className="w-7 h-7 rounded-full object-cover" />
            </div>
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs bg-emerald-500"
            >
              {fName?.[0] || 'U'}
            </div>
          )}
          <div className="hidden md:block text-left">
            <p className="text-white text-xs font-semibold leading-tight">
              {fName} {lName}
            </p>
            <p className="text-[10px] capitalize text-emerald-400 font-bold opacity-90">
              {user?.role ?? "patient"}
            </p>
          </div>
          <ChevronDown
            size={14}
            className={cn(
              "text-white/50 transition-transform duration-200",
              userMenuOpen && "rotate-180"
            )}
          />
        </button>

        {userMenuOpen && (
          <div
            className="absolute top-full right-0 mt-2 w-52 rounded-2xl overflow-hidden z-50 animate-slide-down"
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Profile header */}
            <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <p className="text-white text-sm font-semibold">{fName} {lName}</p>
              <p className="text-white/40 text-xs truncate">{user?.email}</p>
            </div>

            {/* Menu items */}
            <div className="p-1.5">
              <Link to={"/patient-dashboard" as any} onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-150">
                <User size={15} className="text-emerald-400" />
                My Profile
              </Link>
              <Link to={"SettingsPage" as any} onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-150">
                <Settings size={15} className="text-emerald-400" />
                Settings
              </Link>
              <div className="h-px my-1" style={{ background: "rgba(255,255,255,0.05)" }} />
              <button
                onClick={() => { logout(); setUserMenuOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-150"
              >
                <LogOut size={15} className="text-rose-400" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}