// src/routes/_protected/SettingsPage.tsx
import React, { useState, useEffect } from "react";
import { createFileRoute } from '@tanstack/react-router'
import {
  Shield, Trash2, Save, Eye, EyeOff, CheckCircle2,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useUpdateUser, useDeleteUser } from "@/queries/useQueries";
import { GlassCard, Avatar, Badge } from "../../components/ui/Primitives";
import { cn } from "../../lib/utils";

export const Route = createFileRoute('/_protected/SettingsPage')({
  component: SettingsPage,
})

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <GlassCard hover={false} className="bg-white/80 border-slate-100 shadow-sm">
      <div className="mb-5">
        <h3 className="text-slate-800 font-semibold" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
        {desc && <p className="text-slate-500 text-xs mt-0.5">{desc}</p>}
      </div>
      {children}
    </GlassCard>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export function SettingsPage() {
  const { user: rawUser, logout, setUser } = useAuthStore();
  const user = rawUser as any;
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Profile form
  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? "",
    lastName:  user?.lastName  ?? "",
    email:     user?.email     ?? "",
    phone:     user?.phone     ?? "",
  });
  const [saved,    setSaved]    = useState(false);

  useEffect(() => {
    if (user) {
      setProfile((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  const updateProfile = (k: keyof typeof profile) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setProfile((p) => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!user?.id) return;
    
    updateUserMutation.mutate({ 
      id: user.id, 
      ...profile,
    }, {
      onSuccess: (updatedUser) => {
        setUser(updatedUser); // تحديث الـ Store المحلي
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  };

  // Password
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [showPass,  setShowPass]  = useState(false);
  const [passSaved, setPassSaved] = useState(false);

  const handleUpdatePassword = () => {
    if (!user?.id) return;
    if (passwords.next !== passwords.confirm) {
      alert("Passwords do not match!");
      return;
    }

    updateUserMutation.mutate({ 
      id: user.id, 
      password: passwords.next 
    }, {
      onSuccess: () => {
        setPassSaved(true);
        setTimeout(() => setPassSaved(false), 2500);
        setPasswords({ current: "", next: "", confirm: "" });
      }
    });
  };

  // Delete account confirm
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="heading-display text-slate-800 text-2xl">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account preferences</p>
      </div>

      {/* ── Profile ── */}
      <Section title="Profile" desc="Update your personal information">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-5 border-b" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
          <Avatar src={user?.image} name={user ? `${user.firstName} ${user.lastName}` : "User"} size="xl" ring />
          <div>
            <p className="text-slate-800 font-semibold">{user?.firstName} {user?.lastName}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={user?.role === "admin" ? "rose" : "emerald"} className="capitalize">{user?.role}</Badge>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-medium">First Name</label>
            <input value={profile.firstName} onChange={updateProfile("firstName")} className="input-glass bg-slate-50 border-slate-200 text-slate-800" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5 font-medium">Last Name</label>
            <input value={profile.lastName} onChange={updateProfile("lastName")} className="input-glass bg-slate-50 border-slate-200 text-slate-800" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1.5 font-medium">Email</label>
            <input type="email" value={profile.email} onChange={updateProfile("email")} className="input-glass bg-slate-50 border-slate-200 text-slate-800" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-500 mb-1.5 font-medium">Phone</label>
            <input type="tel" value={profile.phone} onChange={updateProfile("phone")} placeholder="+1 (555) 000-0000" className="input-glass bg-slate-50 border-slate-200 text-slate-800" />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={updateUserMutation.isPending}
          className={cn("bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl transition-all flex items-center mt-5 gap-2 text-sm", saved && "opacity-80")}
        >
          {saved ? <><CheckCircle2 size={15} /> Saved!</> : <>{updateUserMutation.isPending ? "Saving..." : <><Save size={15} /> Save Changes</>}</>}
        </button>
      </Section>

      {/* ── Security ── */}
      <Section title="Security" desc="Update your password and manage login sessions">
        <div className="space-y-4">
          {[
            { key: "current", label: "Current Password", placeholder: "Enter current password" },
            { key: "next",    label: "New Password",      placeholder: "Enter new password" },
            { key: "confirm", label: "Confirm Password",  placeholder: "Repeat new password" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-slate-500 mb-1.5 font-medium">{label}</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={passwords[key as keyof typeof passwords]}
                  onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="input-glass bg-slate-50 border-slate-200 text-slate-800 pr-10"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleUpdatePassword}
            disabled={updateUserMutation.isPending || !passwords.next}
            className={cn("btn-ghost text-slate-600 border-slate-200 text-sm gap-2", passSaved && "text-emerald-600 border-emerald-200 bg-emerald-50", updateUserMutation.isPending && "opacity-50")}
          >
            {passSaved ? <><CheckCircle2 size={14} /> Password Updated</> : <><Shield size={14} className="text-emerald-500" /> Update Password</>}
          </button>
        </div>
      </Section>

      {/* ── Danger Zone ── */}
      <Section title="Danger Zone" desc="Irreversible account actions">
        <div
          className="p-4 rounded-xl"
          style={{ background: "#fef2f2", border: "1px solid #fee2e2" }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-slate-800 font-medium text-sm">Delete Account</p>
              <p className="text-slate-500 text-xs mt-0.5">
                Permanently remove your account and all associated data.
              </p>
            </div>
            <button
              onClick={() => setDeleteConfirm(true)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: "rgba(255,77,139,0.12)", border: "1px solid rgba(255,77,139,0.3)", color: "var(--neon-rose)" }}
            >
              <Trash2 size={14} className="inline mr-1.5" />
              Delete
            </button>
          </div>
        </div>
      </Section>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDeleteConfirm(false)} />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 animate-scale-in"
            style={{ background: "rgba(14,14,32,0.98)", border: "1px solid rgba(255,77,139,0.25)" }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto"
              style={{ background: "rgba(255,77,139,0.12)", border: "1px solid rgba(255,77,139,0.25)" }}>
              <Trash2 size={22} style={{ color: "var(--neon-rose)" }} />
            </div>
            <p className="text-white font-bold text-center text-lg mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Delete Account?
            </p>
            <p className="text-white/40 text-sm text-center mb-6">
              All your data, appointments, and records will be permanently erased. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(false)} className="btn-ghost flex-1 justify-center text-sm">
                Cancel
              </button>
              <button
                onClick={() => {
                  if (user?.id) {
                    deleteUserMutation.mutate(user.id, {
                      onSuccess: () => { setDeleteConfirm(false); logout(); }
                    });
                  }
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: "rgba(255,77,139,0.15)", border: "1px solid rgba(255,77,139,0.35)", color: "var(--neon-rose)" }}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}