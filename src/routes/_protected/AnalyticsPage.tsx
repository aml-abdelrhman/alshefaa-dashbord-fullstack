// src/routes/_protected/AnalyticsPage.tsx
import React, { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useAdminStats, useAnalytics } from "../../queries/useQueries";
import type { AdminStats } from "../../services/api.service";
import { GlassCard, Badge, Skeleton } from "../../components/ui/Primitives";
import { cn, formatCurrency, formatNumber } from "../../lib/utils";
import Chart from "react-apexcharts";

// تعريف المسار
export const Route = createFileRoute('/_protected/AnalyticsPage')({
  component: AnalyticsPage,
});

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, change, color }: {
  label: string; value: string; sub?: string; change: number; color: string;
}) {
  const up = change >= 0;
  return (
    <GlassCard hover={false} className="bg-white border-slate-200">
      <p className="text-slate-400 text-[10px] uppercase font-black tracking-wider mb-1.5">{label}</p>
      <p className="text-slate-900 font-bold text-3xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>{value}</p>
      {sub && <p className="text-slate-400 text-xs mt-0.5 font-medium">{sub}</p>}
      <div className={cn("flex items-center gap-1 mt-2 text-xs font-bold", up ? "text-emerald-600" : "text-rose-600")}>
        {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {up ? "+" : ""}{change}% vs last month
      </div>
    </GlassCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function AnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats() as { data: AdminStats | undefined, isLoading: boolean };
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const [period, setPeriod] = useState<"1M" | "3M" | "6M" | "1Y">("1Y");
  const displayData = useMemo(() => {
    const raw = stats?.revenueTrend || [];
    if (period === "1M") return raw.slice(-1);
    if (period === "3M") return raw.slice(-3);
    if (period === "6M") return raw.slice(-6);
    return raw;
  }, [stats, period]);

  if (statsLoading || analyticsLoading) return <AnalyticsSkeleton />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-display text-slate-900 text-2xl font-bold">Analytics</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Platform performance overview</p>
        </div>
        {/* Period selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(0,0,0,0.05)" }}>
          {(["1M","3M","6M","1Y"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all")}
              style={{
                background: period === p ? "rgba(124,58,237,0.15)" : "transparent",
                color: period === p ? "#7c3aed" : "#64748b",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <KpiCard label="Annual Revenue"   value={formatCurrency(stats?.totalRevenue ?? 0)}          change={18.7} color="#0f172a" />
        <KpiCard label="Avg Unit Value"   value={formatCurrency(stats ? stats.totalRevenue / stats.totalPatients : 0)} change={4.2} color="#0f172a" />
        <KpiCard label="Quality Score"    value={`${stats?.satisfactionRate ?? 0}%`}                change={0.3}  color="#0f172a" />
        <KpiCard label="Net Appointments" value={formatNumber(stats?.activeAppointments ?? 0)}       change={8.9}  color="#0f172a" />
      </div>

      {/* Revenue vs Target */}
      <GlassCard hover={false}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-slate-800 font-black text-base" style={{ fontFamily: "var(--font-display)" }}>
              Revenue vs Target
            </h3>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">Monthly financial performance</p>
          </div>
          <Badge variant="emerald">+18.7% YoY</Badge>
        </div>
        
        <div className="min-h-[300px] w-full">
          <Chart
            type="area"
            height={300}
            series={[{
              name: 'Revenue',
              data: displayData.map((d: any) => d.revenue)
            }]}
            options={{
              chart: { toolbar: { show: false }, fontFamily: 'inherit' },
              markers: { size: 0 },
              stroke: {
                curve: 'straight',
                width: 3,
              },
              fill: {
                type: 'gradient',
                gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1, stops: [0, 90, 100] }
              },
              colors: ['#0f172a'],
              dataLabels: { enabled: false },
              xaxis: {
                categories: displayData.map((d: any) => d.month),
                labels: { style: { colors: '#64748b', fontWeight: 600 } },
                axisBorder: { show: false },
                axisTicks: { show: false }
              },
              yaxis: {
                labels: { 
                  style: { colors: '#64748b', fontWeight: 600 },
                  formatter: (v) => `$${v}`
                }
              },
              grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
              tooltip: {
                theme: 'light',
                y: { formatter: (v) => formatCurrency(v) }
              }
            }}
          />
        </div>
      </GlassCard>

      {/* Row: Specialty + Age distribution */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Specialty revenue bar */}
        <GlassCard hover={false}>
          <h3 className="text-slate-800 font-black text-base mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Revenue by Specialty
          </h3>
          <p className="text-slate-400 text-xs mb-5 font-medium">Top departments this year</p>
          <div className="space-y-4 py-2">
            {(stats?.specialtyData || []).map((e: any, i: number) => {
              const width = e.value;
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-slate-700 font-black">{e.name}</span>
                    <span className="text-slate-500">{e.value}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${width}%`, backgroundColor: e.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Age distribution */}
        <GlassCard hover={false}>
          <h3 className="text-slate-800 font-black text-base mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Patient Age Distribution
          </h3>
          <p className="text-slate-400 text-xs mb-5 font-medium">Percentage by age group</p>
          <div className="h-48 flex items-end justify-around gap-2 px-4">
            {(analytics?.ageDistribution || []).map((d: any, i: number) => (
              <div key={i} className="flex flex-col items-center flex-1 max-w-[40px]">
                <div 
                  className="w-full rounded-t-sm opacity-90 hover:opacity-100 transition-all"
                  style={{ 
                    height: `${d.value}%`, 
                    backgroundColor: `hsl(215, 60%, ${80 - (i * 10)}%)`,
                    border: '1px solid rgba(15, 23, 42, 0.1)'
                  }}
                />
                <span className="text-[9px] text-slate-500 mt-2 font-black whitespace-nowrap">{d.range}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Row: Satisfaction line + Radar + Weekly flow */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Satisfaction trend */}
        <GlassCard hover={false} className="xl:col-span-1">
          <h3 className="text-slate-800 font-black text-base mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Satisfaction Score
          </h3>
          <p className="text-slate-400 text-xs mb-4 font-medium">Monthly average %</p>
          <div className="h-32 flex items-center justify-center border border-slate-200 rounded-2xl bg-slate-50">
             <div className="text-center">
               <p className="text-5xl font-black text-slate-900 tracking-tighter">{stats?.satisfactionRate ?? 0}%</p>
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Patient KPI Index</p>
             </div>
          </div>
        </GlassCard>

        {/* Radar */}
        <GlassCard hover={false} className="xl:col-span-1">
          <h3 className="text-slate-800 font-black text-base mb-1">Status Overview</h3>
          <div className="space-y-3 mt-4">
            {['Wait Time', 'Hygiene', 'Staff', 'Facility'].map((item) => (
              <div key={item} className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-bold">{item}</span>
                <div className="flex gap-1">
                   {Array.from({ length: 5 }).map((_, i) => <div key={i} className={cn("w-3 h-2 rounded-sm", i < 4 ? "bg-violet-500" : "bg-slate-200")} />)}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Weekly patient flow */}
        <GlassCard hover={false} className="xl:col-span-1">
          <h3 className="text-slate-800 font-black text-base mb-1">Weekly Flow</h3>
          <p className="text-slate-400 text-xs mb-4 font-medium">Check-in / out / emergency</p>
          <div className="flex items-end justify-between h-32 gap-1 px-2">
            {(stats?.appointmentData || []).map((d: any, i: number) => (
              <div key={i} className="flex flex-col gap-0.5 w-full">
                 <div className="w-full bg-slate-800 rounded-t-sm" style={{ height: `${d.video}%` }} />
                 <div className="w-full bg-blue-500 rounded-t-sm" style={{ height: `${d.inPerson}%` }} />
                 <span className="text-[8px] text-center text-slate-500 mt-2 font-black">{d.day}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-64" /></div>
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
      </div>
      <Skeleton className="h-80 rounded-3xl" />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}
      </div>
    </div>
  );
}