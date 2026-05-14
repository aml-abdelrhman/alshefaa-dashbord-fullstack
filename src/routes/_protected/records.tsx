// src/routes/_protected/RecordsPage.tsx
import React, { useState, useMemo } from 'react'
import { useNavigate, createFileRoute } from '@tanstack/react-router'
import {
  Activity,
  Pill,
  Stethoscope,
  FileImage,
  Scissors,
  Search,
  Eye,
  Calendar,
  Tag,
  ChevronDown,
  ChevronUp,
  FileText,
  PlusCircle,
  ClipboardCheck,
  UserPlus,
  ArrowRight,
} from 'lucide-react'
import { useRecords, useMedicalRecords } from '@/queries/useQueries'
import { useAuthStore } from '../../stores/useAuthStore'
import { GlassCard, Badge, Skeleton } from '../../components/ui/Primitives'
import { cn } from '../../lib/utils'

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

// ─── Config ───────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  lab: {
    label: 'Lab Test',
    icon: Activity,
    color: 'var(--neon-cyan)',
    bg: 'rgba(0,229,255,0.1)',
    variant: 'cyan' as const,
  },
  prescription: {
    label: 'Prescription',
    icon: Pill,
    color: 'var(--neon-violet-lt)',
    bg: 'rgba(167,139,250,0.1)',
    variant: 'violet' as const,
  },
  diagnosis: {
    label: 'Diagnosis',
    icon: Stethoscope,
    color: 'var(--neon-amber)',
    bg: 'rgba(255,179,71,0.1)',
    variant: 'amber' as const,
  },
  imaging: {
    label: 'Imaging',
    icon: FileImage,
    color: 'var(--neon-emerald)',
    bg: 'rgba(0,255,163,0.1)',
    variant: 'emerald' as const,
  },
  surgery: {
    label: 'Surgery',
    icon: Scissors,
    color: 'var(--neon-rose)',
    bg: 'rgba(255,77,139,0.1)',
    variant: 'rose' as const,
  },
}

export const Route = createFileRoute('/_protected/records')({
  component: RecordsPage,
})

const FILTERS = [
  'All',
  'lab',
  'prescription',
  'diagnosis',
  'imaging',
  'surgery',
] as const
type FilterKey = (typeof FILTERS)[number]

// ─── Record Detail Expand ─────────────────────────────────────────────────────
function RecordCard({ record }: { record: MedicalRecord }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = TYPE_CONFIG[record.type]
  const Icon = cfg.icon

  return (
    <GlassCard
      hover={false}
      className="cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-4">
        {/* Type icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
        >
          <Icon size={18} style={{ color: cfg.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-slate-800 font-semibold text-sm leading-tight">
                {record.title}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <Badge variant={cfg.variant} className="text-[10px]">
                  {cfg.label}
                </Badge>
                <span className="flex items-center gap-1 text-slate-400 text-[10px]">
                  <Calendar size={9} /> {record.record_date}
                </span>
                {record.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-slate-400 text-[10px]"
                  >
                    <Tag size={9} /> {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div
              className="flex items-center gap-2 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all"
              >
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded body */}
      {expanded && (
        <div
          className="mt-4 pt-4 border-t animate-slide-down"
          style={{ borderColor: '#f1f5f9' }}
        >
          <p className="text-slate-600 text-sm leading-relaxed">{record.body}</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {record.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-[10px] font-medium"
                style={{
                  background: `${cfg.color}10`,
                  color: cfg.color,
                  border: `1px solid ${cfg.color}20`,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div
            className="flex items-center gap-4 mt-4 pt-3 border-t"
            style={{ borderColor: '#f1f5f9' }}
          >
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              <Eye size={11} /> {record.views} views
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
              👍 {record.likes}
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function RecordsPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  // Try user-specific records first, fall back to general
  const { data: userRecs, isLoading: userLoading } = useMedicalRecords(
    user?.id ?? 0,
  )
  const { data: allRecs, isLoading: allLoading } = useRecords({
    limit: 30,
    skip: 0,
  })

  // إذا كان المستخدم أدمن، ننتظر تحميل كل السجلات، وإذا كان مريضاً ننتظر سجلاته هو فقط
  const isAdmin = user?.role === 'admin'
  const isLoading = isAdmin ? allLoading : (user?.id ? userLoading : allLoading)

  const rawRecords = useMemo(() => {
    // بما أن الـ Hooks في useQueries تعيد المصفوفة مباشرة من Axios
    const source = isAdmin ? allRecs : (user?.id ? userRecs : allRecs)
    return Array.isArray(source) ? source : []
  }, [user?.id, user?.role, userRecs, allRecs, isAdmin])

  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState<FilterKey>('All')

  let records = rawRecords
  if (activeType !== 'All')
    records = records.filter((r: MedicalRecord) => r.type === activeType)
  if (search.trim())
    records = records.filter(
      (r: MedicalRecord) =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
    )

  // Counts per type for filter badges
  const counts = FILTERS.reduce(
    (acc, f) => {
      acc[f] =
        f === 'All'
          ? rawRecords.length
          : rawRecords.filter((r: MedicalRecord) => r.type === f).length
      return acc
    },
    {} as Record<FilterKey, number>,
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-display text-green-600 text-2xl">
            Medical Records
          </h1>
          <p className="text-green-500 text-sm mt-1">
            Your complete health history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate({ to: '/new-record' })}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <PlusCircle size={16} /> Add Record
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(
          ['lab', 'prescription', 'diagnosis', 'imaging', 'surgery'] as const
        ).map((type) => {
          const cfg = TYPE_CONFIG[type]
          const Icon = cfg.icon
          return (
            <GlassCard
              key={type}
              hover={false}
              className="flex items-center gap-3 p-3 cursor-pointer"
              onClick={() => navigate({ to: '/new-record', search: { type } })}
              style={{
                background:
                  activeType === type ? cfg.bg : '#fff',
                border: `1px solid ${activeType === type ? cfg.color + '40' : '#e2e8f0'}`,
              }}
            >
              <Icon size={16} style={{ color: cfg.color }} />
              <div>
                <p className="text-green-600 text-sm font-bold">
                  {counts[type]}
                </p>
                <p className="text-gray-500 text-xs text-[10px]">{cfg.label}</p>
              </div>
            </GlassCard>
          )
        })}
      </div>

      {/* Search + filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records or tags…"
            className="input-glass pl-10 py-2.5 w-full text-slate-900 border-slate-200"
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveType(f)}
              className={cn(
                'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all duration-200',
              )}
              style={{
                background: activeType === f ? '#10b981' : '#f9fafb',
                color: activeType === f ? '#fff' : '#6b7280',
                border: `1px solid ${activeType === f ? 'transparent' : '#e5e7eb'}`,
                boxShadow:
                  activeType === f
                    ? '0 4px 12px rgba(16, 185, 129, 0.15)'
                    : 'none',
              }}
            >
              {f === 'All'
                ? `All (${counts.All})`
                : `${TYPE_CONFIG[f].label} (${counts[f]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Records list */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <GlassCard key={i} hover={false}>
              <div className="flex items-center gap-4">
                <div className="skeleton w-11 h-11 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-2/3" />
                  <div className="skeleton h-3 w-1/3" />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : rawRecords.length === 0 ? (
        <GlassCard hover={false} className="flex flex-col items-center py-12 px-6 text-center border-dashed border-2 border-slate-200 bg-white">
          <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20">
            <PlusCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome to Your Health Journey</h2>
          <p className="text-slate-500 max-w-md mb-10 text-sm">
            It looks like you haven't added any medical history yet. Follow these steps to get started.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-10">
            {[
              {
                icon: UserPlus,
                title: 'Complete Profile',
                desc: 'Add your blood type, allergies, and chronic conditions.',
                color: 'var(--neon-cyan)',
              },
              {
                icon: ClipboardCheck,
                title: 'Upload First Record',
                desc: 'Upload photos of your past prescriptions or lab results.',
                color: 'var(--neon-amber)',
              },
              {
                icon: Activity,
                title: 'Track Vitals',
                desc: 'Start logging your daily health metrics for better insights.',
                color: 'var(--neon-emerald)',
              },
            ].map((step, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                <step.icon size={24} style={{ color: step.color }} className="mb-3" />
                <h3 className="text-slate-800 font-semibold text-sm mb-2">{step.title}</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => navigate({ to: '/new-record' })}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
            >
              Add New Record <PlusCircle size={18} />
            </button>
            <button className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold border border-slate-200 transition-all flex items-center gap-2">
              Learn More <ArrowRight size={18} />
            </button>
          </div>
        </GlassCard>
      ) : records.length === 0 ? (
        <GlassCard
          hover={false}
          className="flex flex-col items-center py-16 gap-4"
        >
          <FileText size={40} className="text-slate-200" />
          <p className="text-slate-400">No records match your filters</p>
          <button
            onClick={() => {
              setSearch('')
              setActiveType('All')
            }}
            className="btn-ghost text-sm"
          >
            Clear Filters
          </button>
        </GlassCard>
      ) : (
        <div className="space-y-3 stagger">
          {records.map((rec: MedicalRecord) => (
            <RecordCard key={rec.id} record={rec} />
          ))}
        </div>
      )}
    </div>
  )
}
