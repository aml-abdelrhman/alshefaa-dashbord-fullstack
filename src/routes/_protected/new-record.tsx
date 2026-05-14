import React, { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCreateRecord } from "@/queries/useQueries";
import { useAuthStore } from "../../stores/useAuthStore";
import { GlassCard, Badge } from "../../components/ui/Primitives";
import { 
  Activity, Pill, Stethoscope, FileImage, 
  Scissors, ArrowLeft, Save, PlusCircle 
} from "lucide-react";
import { cn } from "../../lib/utils";

export const Route = createFileRoute("/_protected/new-record")({
  component: NewRecordPage,
});

const RECORD_TYPES = [
  { id: "lab", label: "Lab Test", icon: Activity, color: "#0ea5e9" },
  { id: "prescription", label: "Prescription", icon: Pill, color: "#8b5cf6" },
  { id: "diagnosis", label: "Diagnosis", icon: Stethoscope, color: "#f59e0b" },
  { id: "imaging", label: "Imaging", icon: FileImage, color: "#10b981" },
  { id: "surgery", label: "Surgery", icon: Scissors, color: "#ef4444" },
] as const;

function NewRecordPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const createRecord = useCreateRecord();

  const [formData, setFormData] = useState({
    title: "",
    body: "",
    type: "diagnosis" as typeof RECORD_TYPES[number]["id"],
    tags: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    createRecord.mutate({
      user_id: user.id,
      title: formData.title,
      body: formData.body,
      type: formData.type,
      tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      record_date: new Date().toISOString().split('T')[0],
      views: 0,
      likes: 0
    }, {
      onSuccess: () => {
        navigate({ to: "/records" });
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in py-6">
      <div className="flex items-center gap-4">
        <Link to="/records" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Medical Record</h1>
          <p className="text-sm text-slate-500">Document a new health event or result</p>
        </div>
      </div>

      <GlassCard hover={false} className="bg-white border-slate-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Record Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {RECORD_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t.id })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all",
                    formData.type === t.id 
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                      : "bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200"
                  )}
                >
                  <t.icon size={18} />
                  <span className="text-[10px] font-bold">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Title</label>
              <input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Annual Blood Work, MRI Result..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Detailed Summary</label>
              <textarea
                required
                rows={5}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Describe the findings, prescriptions, or diagnosis details..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Tags (comma separated)</label>
              <input
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g. routine, cholesterol, urgent"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={createRecord.isPending}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-600/20"
          >
            {createRecord.isPending ? "Saving..." : <><Save size={18} /> Save Medical Record</>}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}