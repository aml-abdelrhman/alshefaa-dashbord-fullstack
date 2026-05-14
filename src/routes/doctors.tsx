// src/routes/DoctorsPage.tsx
import React, { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Search, LayoutGrid, List, X, ShieldCheck, Award, Users } from 'lucide-react'
import {
  useDoctors,
  useFavorites,
} from '@/queries/useQueries'
import { useAuthStore } from '../stores/useAuthStore'
import {
  DoctorCard,
  SkeletonCard,
  GlassCard,
} from '../components/ui/Primitives'
import { cn } from '../lib/utils'

const SPECIALTIES = [
  'All',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Dermatology',
  'Pediatrics',
  'Gynecology',
  'Surgery',
]

export const Route = createFileRoute('/doctors')({
  component: DoctorsPage,
})

export function DoctorsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [searchValue, setSearchValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [available, setAvailable] = useState(false)

  const { user } = useAuthStore()
  
  // جلب المفضلة للتأكد من حالة القلب في الكروت
  const { data: favorites = [] } = useFavorites(user?.id ?? 0)

  // جلب الأطباء بالمنطق الموحد (الصورة والاسم بناءً على الـ ID)
  const { data: doctors = [], isLoading } = useDoctors();

  // فلترة الأطباء بناءً على البحث والتخصص والمتاحين حالياً
  const filteredDoctors = doctors.filter((doc : any) => {
    const matchesSearch = 
      searchValue === '' || 
      doc.fullName.toLowerCase().includes(searchValue.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchValue.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'All' || 
      doc.specialization === selectedCategory;
    
    const matchesAvailable = !available || doc.available === true;

    return matchesSearch && matchesCategory && matchesAvailable;
  });

  const total = filteredDoctors.length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Medical Trust Banner ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        {[
          { icon: ShieldCheck, label: "Verified Specialists", desc: "100% certified professionals", color: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: Award, label: "Quality Care", desc: "Top rated healthcare providers", color: "text-sky-600", bg: "bg-sky-50" },
          { icon: Users, label: "Patient Support", desc: "Dedicated medical assistance", color: "text-violet-600", bg: "bg-violet-50" },
        ].map((item, i) => (
          <div key={i} className={cn("p-4 rounded-2xl flex items-center gap-4 border border-slate-100 shadow-sm", item.bg)}>
            <div className={cn("p-2.5 rounded-xl bg-white shadow-sm", item.color)}>
              <item.icon size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">{item.label}</p>
              <p className="text-[11px] text-slate-500 font-medium">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="heading-display text-slate-900 text-2xl font-bold">
            Find Your Specialist
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isLoading ? 'Searching for doctors...' : `Showing ${total} qualified medical professionals`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('grid')}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              view === 'grid' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100 shadow-sm' : 'text-slate-400 hover:bg-slate-50',
            )}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
              view === 'list' ? 'text-emerald-600 bg-emerald-50 border border-emerald-100 shadow-sm' : 'text-slate-400 hover:bg-slate-50',
            )}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <GlassCard hover={false} className="flex flex-col sm:flex-row gap-4 bg-white/80 border-slate-100 shadow-sm p-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          {searchValue && (
            <button
              onClick={() => setSearchValue('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by doctor's name or specialty..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Available toggle */}
        <button
          onClick={() => setAvailable(!available)}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border',
            available ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          )}
        >
          <span className={cn('w-2 h-2 rounded-full animate-pulse', available ? 'bg-emerald-500' : 'bg-slate-300')} />
          Available Now
        </button>
      </GlassCard>

      {/* Specialty pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {SPECIALTIES.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedCategory(s)}
            className={cn(
              'flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border',
              selectedCategory === s 
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-lg shadow-emerald-600/20' 
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className={cn('grid gap-6', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1')}>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="flex flex-col items-center py-32 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
             <Search size={32} className="text-slate-300" />
          </div>
          <h3 className="text-slate-800 font-bold text-xl">No specialists found</h3>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
          <button
            onClick={() => { setSearchValue(''); setSelectedCategory('All'); setAvailable(false); }}
            className="mt-6 text-emerald-600 font-bold text-sm hover:underline"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className={cn('grid gap-6 stagger', view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1')}>
          {filteredDoctors.map((doc : any) => (
            <DoctorCard 
              key={doc.id} 
              doctor={doc} 
              
              variant={view}
              
              // الآن doc يحتوي على fullName و image الموحدين من الـ Hook
            />
          ))}
        </div>
      )}
    </div>
  )
}