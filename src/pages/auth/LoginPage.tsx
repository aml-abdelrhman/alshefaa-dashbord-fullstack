import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeartPulse, Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { useAuthStore } from "../../stores/useAuthStore";
import { cn } from "../../lib/utils";
import { useLogin } from "@/queries/useQueries";
import { toast } from "sonner";

// 1. تعريف الـ Schema للتحقق من البيانات
const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }).min(1, { message: "Email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

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

export function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };
  const [showPass, setShowPass] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const loginMutation = useLogin();
  const isPending = loginMutation.isPending;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // تأثير التحميل الجمالي عند فتح الصفحة
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // 2. دالة تسجيل الدخول (الربط مع سوبابيز + منطق أدمن الطوارئ)
  const onSubmit = async (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: (user) => {
        toast.success("Logged in successfully");
        const destination = user.role === 'admin' ? "/AdminDashboard" : "/patient-dashboard";
        navigate({ to: destination as any, replace: true });
      },
      onError: (error: any) => {
        toast.error(error.message || "Invalid email or password");
      }
    });
  };

  if (isPageLoading) return <LoginSkeleton />;

  return (
    <div className="relative w-full max-w-[450px] mx-auto px-4 py-10 animate-in fade-in zoom-in duration-500">
      <div
        className="rounded-[2.5rem] p-10 relative overflow-hidden bg-white/80 backdrop-blur-3xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)]"
      >
        {/* الخط الجمالي العلوي */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />

        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-5 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-200/50">
            <HeartPulse size={32} className="text-white" />
          </div>
          <h1 className="text-slate-900 text-4xl font-black tracking-tight mb-2">Welcome Back</h1>
          <p className="text-slate-400 text-sm font-medium">Log in to Al-Shefaa Medical Platform</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700 ml-1.5">Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="example@mail.com" 
                        {...field} 
                        className={cn(
                          "h-14 pl-12 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 text-base",
                          form.formState.errors.email && "border-red-300 focus:ring-red-50"
                        )}
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-slate-700 ml-1.5">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPass ? "text" : "password"} 
                        placeholder="••••••••" 
                        {...field} 
                        className={cn(
                          "h-14 pl-12 pr-12 rounded-2xl bg-slate-50/50 border-slate-200/60 focus:bg-white focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 text-base",
                          form.formState.errors.password && "border-red-300 focus:ring-red-50"
                        )}
                      />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                      >
                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-14 mt-4 rounded-2xl font-bold text-base text-white bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Verifying...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        {/* Footer */}
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/80 px-4 text-slate-400 font-medium tracking-widest border border-slate-50 rounded-full">Or with</span></div>
        </div>

        <p className="text-center text-base text-slate-500 font-medium">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline decoration-2 underline-offset-4 transition-all">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

// مكون الـ Skeleton Loading
function LoginSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto px-4 py-10">
      <div className="rounded-3xl p-8 border border-slate-100 bg-white/60 animate-pulse shadow-sm h-[500px]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-slate-200 rounded-2xl mb-4" />
          <div className="h-6 w-32 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-48 bg-slate-100 rounded" />
        </div>
        <div className="space-y-6">
          <div className="h-12 w-full bg-slate-100 rounded-xl" />
          <div className="h-12 w-full bg-slate-100 rounded-xl" />
          <div className="h-12 w-full bg-slate-200 rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}