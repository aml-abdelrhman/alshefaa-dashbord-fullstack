// src/layouts/RootLayout.tsx
import React, { useState, useEffect } from "react";
import { Outlet, useRouterState } from "@tanstack/react-router";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar }  from "../components/layout/Topbar";
import { cn }      from "../lib/utils";

// Routes that should render with NO sidebar/topbar (auth pages)
const AUTH_ROUTES = ["/login", "/register"];

export function RootLayout() {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const routerState = useRouterState();
  const path = routerState.location.pathname;
  const isAuth = AUTH_ROUTES.includes(path);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [path]);

  // Responsive: collapse sidebar on small screens
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches);
    setCollapsed(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (isAuth) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <MeshBackground />
        <Outlet />
      </div>
    );
  }

  const sidebarW = collapsed ? 72 : 260;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-void)" }}>
      <MeshBackground />

      {/* ── Sidebar ── */}
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Topbar ── */}
      <Topbar sidebarCollapsed={collapsed} onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />

      {/* ── Main content ── */}
      <main
        className="transition-all duration-300 min-h-screen"
        style={{
          paddingLeft: sidebarW,
          paddingTop: "var(--topbar-h)",
        }}
      >
        <div className="p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// ─── Ambient mesh background decoration ──────────────────────────────────────
function MeshBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Gradient mesh */}
      <div className="absolute inset-0" style={{ background: "var(--grad-mesh)" }} />

      {/* Orb 1 — violet */}
      <div
        className="orb w-[600px] h-[600px] animate-orb-pulse"
        style={{
          top: "-200px",
          left: "-150px",
          background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
          animationDelay: "0s",
        }}
      />

      {/* Orb 2 — cyan */}
      <div
        className="orb w-[500px] h-[500px] animate-orb-pulse"
        style={{
          bottom: "-100px",
          right: "-100px",
          background: "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
          animationDelay: "3s",
        }}
      />

      {/* Orb 3 — emerald */}
      <div
        className="orb w-[400px] h-[400px] animate-orb-pulse"
        style={{
          top: "50%",
          left: "40%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(0,255,163,0.05) 0%, transparent 70%)",
          animationDelay: "6s",
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}