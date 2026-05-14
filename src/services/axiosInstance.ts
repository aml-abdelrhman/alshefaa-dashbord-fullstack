import axios, {
  type AxiosError,
} from "axios";
import { useAuthStore } from "../stores/useAuthStore";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase Environment Variables!");
}

// إنشاء النسخة الأساسية للتعامل مع الجداول
export const api = axios.create({
  baseURL: `${SUPABASE_URL}/rest/v1`,
  headers: {
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    "Prefer": "return=representation", 
  },
});

// إنشاء نسخة خاصة بالـ Auth (Login/Signup)
export const authApi = axios.create({
  baseURL: `${SUPABASE_URL}/auth/v1`,
  headers: {
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
  },
});

// Interceptor لإضافة التوكن بشكل ديناميكي
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  
  if (token && config.headers) {
    // Bearer token هو المفتاح لتخطي الـ RLS
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * معالجة الأخطاء
 */
const handleResponseError = async (error: AxiosError) => {
  const status = error.response?.status;
  const errorData: any = error.response?.data;

  // 1. فحص هل الجلسة انتهت فعلياً؟
  const isTokenExpired = 
    errorData?.message?.includes("JWT") || 
    errorData?.msg?.includes("expired") ||
    errorData?.error_description?.includes("expired");

  if (status === 401 && isTokenExpired) {
    const { logout } = useAuthStore.getState();
    console.warn("Session expired. Redirecting to login...");
    logout();
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  } 
  
  // 2. معالجة خطأ الـ RLS (الذي يسبب لكِ مشكلة في الحجز)
  // سوبابيز تعيد كود 42501 في الـ Body عند فشل الـ RLS
  const isRLSError = errorData?.code === "42501" || status === 403;

  if (isRLSError) {
    console.error("❌ RLS Permission Denied:", {
      message: errorData?.message,
      hint: errorData?.hint,
      details: "تأكد من سياسات الجداول في سوبابيز (Policy) وأن الـ user_id يرسل بشكل صحيح"
    });
  }

  return Promise.reject(error);
};

api.interceptors.response.use((r) => r, handleResponseError);
authApi.interceptors.response.use((r) => r, handleResponseError);

export default api;