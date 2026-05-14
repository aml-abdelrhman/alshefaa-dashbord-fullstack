import React, { useMemo } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { 
  Users, 
  DollarSign, 
  CalendarCheck, 
  Star, 
  ChevronRight, 
  Stethoscope, 
  TrendingUp,
  Activity
} from "lucide-react";
import Chart from "react-apexcharts";
// تم استبدال api.service بـ useQueries الجديد الخاص بسوبابيز
import { useDoctors, useAdminStats } from "../../queries/useQueries"; 
import { GlassCard, StatCard, DoctorCard } from "../../components/ui/Primitives";
import { useAuthStore } from "../../stores/useAuthStore";
import { cn, formatCurrency, formatNumber } from "../../lib/utils";
import type { Doctor } from "../../types";

export const Route = createFileRoute('/_protected/AdminDashboard')({
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (user?.role !== 'admin') {
      throw redirect({ to: '/' });
    }
  },
  component: AdminDashboard,
});

export function AdminDashboard() {
  // 1. جلب البيانات باستخدام الـ Hooks الجديدة
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: doctorsPage, isLoading: doctorsLoading } = useDoctors();

  // 2. معالجة بيانات الرسم البياني (Memoized)
  const { chartSeries, chartCategories } = useMemo(() => {
    // استخدام revenueTrend القادم من الإحصائيات المجمعة
    const monthlyData = stats?.revenueTrend || []; 
    return {
      chartSeries: [{
        name: "Revenue",
        data: monthlyData.map((d: any) => d.revenue)
      }],
      chartCategories: monthlyData.map((d: any) => d.month)
    };
  }, [stats]);

  if (statsLoading || doctorsLoading) {
    return <AdminDashboardSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="heading-display text-slate-800 text-2xl font-bold">Admin Management</h1>
          <p className="text-slate-500 text-sm mt-1">Platform performance and medical staff overview</p>
        </div>
        <Link
          to="/AnalyticsPage"
          className="bg-slate-800 text-white px-5 py-2.5 rounded-2xl font-semibold flex items-center gap-2 hover:bg-slate-900 transition-all shadow-lg"
        >
          <TrendingUp size={16} />
          View Detailed Analytics
        </Link>
      </div>

      {/* Statistics Cards - البيانات تأتي الآن من جدول الإحصائيات في سوبابيز */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard 
          label="Total Revenue" 
          value={formatCurrency(stats?.totalRevenue ?? 0)} 
          icon={DollarSign} 
          accentColor="#0f172a" 
          gradientFrom="#f8fafc"
          change="+12.5% vs last month"
        />
        <StatCard 
          label="Total Patients" 
          value={formatNumber(stats?.totalPatients ?? 0)} 
          icon={Users} 
          accentColor="#2563eb" 
          gradientFrom="#eff6ff"
          change="New registrations up"
        />
        <StatCard 
          label="Satisfaction" 
          value={`${stats?.satisfactionRate ?? 0}%`} 
          icon={Star} 
          accentColor="#059669" 
          gradientFrom="#ecfdf5"
          change="Stable performance"
        />
        <StatCard 
          label="Active Appts." 
          value={formatNumber(stats?.activeAppointments ?? 0)} 
          icon={CalendarCheck} 
          accentColor="#6366f1" 
          gradientFrom="#f5f3ff"
          change="High demand"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Overview Chart */}
        <div className="xl:col-span-3">
          <GlassCard hover={false} className="bg-white border-slate-200 shadow-sm">
            <h3 className="text-slate-800 font-bold mb-6 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Financial Performance Overview
            </h3>
            <Chart
              type="area"
              height={300}
              series={chartSeries}
              options={chartOptions(chartCategories)}
            />
          </GlassCard>
        </div>

        {/* Medical Staff Summary */}
        <div className="xl:col-span-2">
          <GlassCard hover={false} className="bg-white/80 border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-slate-800 font-bold flex items-center gap-2">
                  <Stethoscope size={20} className="text-emerald-600" />
                  Medical Specialists
                </h3>
                <p className="text-slate-500 text-xs mt-1">Recently active doctors on the platform</p>
              </div>
              <Link to="/doctors" className="text-emerald-600 hover:bg-emerald-50 py-1.5 px-3 rounded-lg transition-all text-xs font-semibold flex items-center gap-1">
                View All Staff <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* أخذ أول 4 أطباء فقط للعرض في الداشبورد */}
              {doctorsPage?.slice(0, 4).map((doc: Doctor) => (
                <DoctorCard key={doc.id} doctor={doc} variant="grid" />
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          <GlassCard hover={false} className="bg-white/80 border-slate-100 shadow-sm">
            <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2">
              <Activity size={18} className="text-cyan-600" />
              Quick Actions
            </h3>
            <div className="space-y-1">
              {['Review Patient List', 'Audit Medical Records', 'System Configuration'].map((action, idx) => (
                <button key={idx} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-all group">
                  <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-600">{action}</span>
                  <ChevronRight size={16} className="text-slate-400" />
                </button>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="bg-emerald-900/5 border-emerald-100 relative overflow-hidden">
            <h4 className="text-emerald-900 font-bold text-sm mb-1">System Health</h4>
            <p className="text-emerald-600/70 text-[11px] font-medium">
              All Supabase services are operational.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

// دالة مساعدة لتنظيف كود الـ Chart Options
const chartOptions = (categories: string[]): any => ({
  chart: { toolbar: { show: false }, zoom: { enabled: false }, fontFamily: 'inherit' },
  dataLabels: { enabled: false },
  stroke: { curve: 'straight', width: 4, colors: ['#1e293b'] },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0, stops: [20, 100] }
  },
  xaxis: { 
    categories,
    labels: { style: { colors: '#64748b', fontWeight: 600 } },
  },
  yaxis: { 
    labels: { 
      style: { colors: '#64748b', fontWeight: 600 },
      formatter: (v: number) => formatNumber(v) 
    } 
  },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  colors: ['#1e293b']
});

function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse p-4">
      <div className="h-20 bg-slate-100 rounded-3xl mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-slate-100 rounded-3xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-slate-100 rounded-3xl" />
        <div className="h-96 bg-slate-100 rounded-3xl" />
      </div>
    </div>
  );
}