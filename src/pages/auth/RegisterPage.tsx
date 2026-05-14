import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeartPulse, Eye, EyeOff, Loader2, User, Mail, Lock, Phone, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase"; // تأكدي من استيراد الـ client اللي عملناه

// 1. تعريف Zod Schema
const registerSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

// استيراد مكونات Shadcn UI
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegisterPage() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false); // سنقوم بإدارتها يدوياً هنا للـ Supabase

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // 3. دالة الإرسال الحقيقية باستخدام Supabase
 const onSubmit = async (values: RegisterFormValues) => {
    setIsPending(true);
    
    const { data, error } = await supabase.auth.signUp({
      email: values.email.trim(),
      password: values.password,
      options: {
        data: {
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone,
          role: "patient", // ضيفي السطر ده عشان يسهل عليكي بعدين
          full_name: `${values.firstName} ${values.lastName}`
        }
      }
    });

    if (error) {
      toast.error(error.message);
      setIsPending(false);
    } else {
      setIsSuccess(true);
      toast.success("Account created! Please verify your email.");
      setTimeout(() => navigate({ to: "/login" }), 3000);
      setIsPending(false);
    }
  };
  
  if (isPageLoading) return <RegisterSkeleton />;

  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-10 animate-scale-in">
      <div
        className="rounded-3xl p-8 relative overflow-hidden border border-emerald-500/20 shadow-2xl"
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px) saturate(160%)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" />

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-emerald-500 shadow-[0_8px_20px_rgba(16,185,129,0.3)]">
            <HeartPulse size={26} className="text-white" />
          </div>
          <h1 className="text-slate-900 text-2xl font-extrabold">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Join our medical community today</p>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center gap-4 py-12 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Registration Complete!</h2>
            <p className="text-slate-500 text-center">Please check your email to verify your account before logging in.</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold ml-1">First Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="Aml" {...field} className="h-11 pl-10 bg-white/50 border-emerald-100 focus:border-emerald-400 focus:ring-emerald-50 rounded-xl" />
                          <User className="absolute left-3 top-3 size-5 text-emerald-400/60" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold ml-1">Last Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input placeholder="Abdelrhman" {...field} className="h-11 pl-10 bg-white/50 border-emerald-100 focus:border-emerald-400 focus:ring-emerald-50 rounded-xl" />
                          <User className="absolute left-3 top-3 size-5 text-emerald-400/60" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type="email" placeholder="aml@example.com" {...field} className="h-11 pl-10 bg-white/50 border-emerald-100 focus:border-emerald-400 focus:ring-emerald-50 rounded-xl" />
                        <Mail className="absolute left-3 top-3 size-5 text-emerald-400/60" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="0123456789" {...field} className="h-11 pl-10 bg-white/50 border-emerald-100 focus:border-emerald-400 focus:ring-emerald-50 rounded-xl" />
                        <Phone className="absolute left-3 top-3 size-5 text-emerald-400/60" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPass ? "text" : "password"} placeholder="••••••••" {...field} className="h-11 pl-10 pr-11 bg-white/50 border-emerald-100 focus:border-emerald-400 focus:ring-emerald-50 rounded-xl" />
                        <Lock className="absolute left-3 top-3 size-5 text-emerald-400/60" />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-slate-400">
                          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all mt-4"
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="animate-spin size-5" />
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>
        )}

        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-600 font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// مكون الـ Skeleton كما هو
function RegisterSkeleton() {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-[650px] bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="size-14 bg-slate-200 rounded-2xl" />
          <div className="h-6 w-32 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-slate-100 rounded-xl" />
          <div className="h-16 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="h-16 bg-slate-100 rounded-xl" />
        <div className="h-12 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}