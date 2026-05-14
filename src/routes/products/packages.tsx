// src/routes/products/packages.tsx
import { createFileRoute } from '@tanstack/react-router'
import React, { useState } from 'react'
import { Search, Filter, ShieldCheck, Zap, HeartPulse } from 'lucide-react'
import { usePackages, useCart, useAddToCart } from '@/queries/useQueries'
import { GlassCard, Skeleton, PackageCard } from '../../components/ui/Primitives'
import { cn } from '../../lib/utils'

const CATEGORIES = [
  'All',
  'Full Body Checkup',
  'Cardiology Package',
  'Dermatology Package',
  'Mental Health Package',
  'Pediatric Package',
  'Lab Test Bundle',
]

export const Route = createFileRoute('/products/packages')({
  component: PackagesPage,
})

export function PackagesPage() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [skip, setSkip] = useState(0)
  const LIMIT = 22

  const { data, isLoading } = usePackages({
    limit: LIMIT, // القيمة هنا 22 لضمان جلب الكل
    skip,
    category,
    search,
  })

  const packages = data?.data ?? []

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <HeartPulse size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Comprehensive Care</span>
          </div>
          <h1 className="heading-display text-slate-900 text-3xl font-black">
            Medical Care Plans
          </h1>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            Choose from our specialized health packages designed to provide you with complete medical coverage and peace of mind.
          </p>
        </div>
        
        {/* Quick Search */}
        <div className="relative w-full md:w-80">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setSkip(0)
            }}
            placeholder="Search health plans..."
            className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl border border-slate-100">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => {
              setCategory(c)
              setSkip(0)
            }}
            className={cn(
              "flex-shrink-0 px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300",
              category === c 
                ? "bg-white text-emerald-600 shadow-sm border border-emerald-100" 
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {c}
          </button>
        ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <GlassCard key={i} hover={false}>
              <Skeleton className="w-full h-36 rounded-xl mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-2/3" />
            </GlassCard>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <p className="text-slate-400 text-lg font-medium">No specialized plans match your criteria</p>
          <button
            onClick={() => {
              setCategory('All')
              setSearch('')
            }}
            className="text-emerald-600 text-sm font-bold hover:underline mt-1"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger">
          {packages.map((pkg) => {
             return <PackageCard key={pkg.id} pkg={pkg} />
          })}
        </div>
      )}
    </div>
  )
}
