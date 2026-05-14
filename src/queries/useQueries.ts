// src/queries/useQueries.ts
// ─────────────────────────────────────────────────────────────────────────────
//  THE ONLY file in the app that contains useQuery / useMutation hooks.
// ─────────────────────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api, { authApi, api as myAxios } from '@/services/axiosInstance'
export { authApi }
export { api }


// Zustand stores
import { useAuthStore } from '../stores/useAuthStore'
import { useMedicalStore } from '../stores/useMedicalStore'

// Types
import type {
  AuthUser,
  LoginPayload,
  RegisterPayload,
  RawUser,
  Doctor,
  Patient,
  MedicalPackage,
  PaginationParams,
  PaginatedResult,
  MedicalRecord,
  Appointment,
  AppointmentPayload, // Import the new type
} from '../types'
import image from '@/components/ui/image'
import { supabase } from '@/lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
//  QUERY KEYS (Centralized Cache Management)
// ─────────────────────────────────────────────────────────────────────────────
export const QK = {
  // Auth
  authMe: ['auth', 'me'] as const,

  // Doctors
  doctors: (p: any) => ['doctors', p] as const,
  doctor: (id: string | number) => ['doctors', id] as const,
  doctorSearch: (q: string) => ['doctors', 'search', q] as const,

  // Patients
  patients: (p: PaginationParams) => ['patients', p] as const,
  patient: (id: number) => ['patients', id] as const,

  // Packages & Shopping
  packages: (p: any) => ["packages", p] as const,
  package: (id: number) => ['packages', id] as const,
  favorites: (userId: number) => ['favorites', userId] as const,
  cart: (userId: number) => ['cart', userId] as const,
  orders: (userId: number) => ['orders', userId] as const,
  
  // Records & Appointments
  records: (p?: PaginationParams) => (p ? (["records", p] as const) : (["records"] as const)),
  userRecords: (userId: number) => ["records", "user", userId] as const,
  appointments: (userId?: string | number) => ['appointments', String(userId)] as const, // ضمان أن المعرف دائماً نص
  notifications: (userId: number) => ['notifications', userId] as const,

  // Admin & Analytics
  adminStats: ['admin', 'stats'] as const,
  analytics: ['analytics'] as const,
} as const

// ─────────────────────────────────────────────────────────────────────────────
//  ① AUTH HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useLogin() {
  const { setUser, setLoading, setError } = useAuthStore.getState()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, password }: LoginPayload) => {
      // 1. تسجيل الدخول في Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (authError) throw authError;

      // 2. جلب بيانات البروفايل (profiles) للحصول على الاسم الأول الحقيقي
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      const isAdmin = authData.user.email === "aml586651@gmail.com";

      return {
        id: authData.user.id,
        email: authData.user.email ?? "",
        role: isAdmin ? "admin" : "patient",
        firstName: profile?.first_name || profile?.firstName || authData.user.user_metadata?.first_name || (isAdmin ? "Aml" : ""),
        lastName: profile?.last_name || profile?.lastName || authData.user.user_metadata?.last_name || "",
        full_name: profile?.full_name || profile?.fullName || authData.user.user_metadata?.full_name || "",
        user_metadata: authData.user.user_metadata
      } as any;
    },
    onMutate: () => setLoading(true),
    onSuccess: (user) => {
      queryClient.clear() // مسح الكاش بالكامل عند دخول مستخدم جديد
      setUser(user)
      setLoading(false)
    },
    onError: (err: any) => {
      setError(err.response?.data || 'بيانات الدخول غير صحيحة')
      setLoading(false)
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await authApi.post('/register', {
        ...payload,
        role: payload.role || "patient",
        image: `https://i.pravatar.cc/150?u=${payload.email}`,
      })
      return data
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string | number; [key: string]: any; password?: string }) => {
      // 1. إذا كان الطلب يحتوي على كلمة مرور، نحدثها في Auth
      if (data.password) {
        const { error: authError } = await supabase.auth.updateUser({
          password: data.password
        });
        if (authError) throw authError;
      }

      // 2. تحويل البيانات من تنسيق الواجهة إلى تنسيق قاعدة البيانات
      const payload: any = {};
      if (data.firstName) payload.first_name = data.firstName;
      if (data.lastName)  payload.last_name  = data.lastName;
      if (data.phone)     payload.phone      = data.phone;
      if (data.firstName || data.lastName) {
        payload.full_name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
      }

      // 3. تحديث جدول البروفايلات
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (profileError) throw profileError;

      // 4. إعادة البيانات بالتنسيق الذي يفهمه التطبيق (CamelCase)
      return {
        ...profile,
        firstName: profile.first_name,
        lastName: profile.last_name,
        fullName: profile.full_name,
      };
    },
    onSuccess: (updatedUser) => {
      // تحديث بيانات المستخدم في الكاش فوراً
      queryClient.setQueryData(['user', updatedUser.id], updatedUser);
      // toast.success("Profile updated successfully");
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/profiles?id=eq.${id}`)
    },
    onSuccess: () => {
      queryClient.clear() // Clear all sensitive data on deletion
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  ② DOCTOR HOOKS
// ─────────────────────────────────────────────────────────────────────────────



export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      // نطلب من سوبابيز جلب البروفايلات اللي الرول بتاعها دكتور
      const { data } = await api.get('/profiles', {
        params: {
          role: 'eq.doctor',
          select: '*'
        }
      });

      if (!data) return [];

      return data.map((doc: any) => ({
        ...doc,
        id: doc.id,
        firstName: doc.first_name || doc.firstName || '',
        lastName: doc.last_name || doc.lastName || '',
        fullName: doc.full_name || (doc.first_name ? `${doc.first_name} ${doc.last_name}` : (doc.firstName ? `${doc.firstName} ${doc.lastName}` : "Unknown Doctor")),
        specialization: doc.specialization || doc.specialty || "Specialist",
        image: doc.image || doc.avatar_url || `https://i.pravatar.cc/150?u=${doc.id}`,
        hospital: doc.hospital || doc.company?.name || "Al-Shefaa Hospital",
        rating: Number(doc.rating || 4.5),
        experience: Number(doc.experience || 5),
        available: doc.available ?? true,
        patientsCount: Number(doc.patientsCount || 100),
      }));
    }
  });
}

// دالة جلب بيانات طبيب واحد بناءً على الـ ID
export function useDoctor(id: string | number) {
  return useQuery({
    queryKey: ['doctor', id], // QK.doctor(id) لو عندك كائن QK
    queryFn: async () => {
      // طلب البيانات من سوبابيز
      const { data } = await api.get(`/profiles`, {
        params: {
          id: `eq.${id}`,
          select: '*'
        }
      });

      const doc = data?.[0];
      
      if (!doc) throw new Error("Doctor not found");

      // معالجة البيانات لضمان عدم حدوث خطأ toFixed ولتوحيد الصور
      return {
        ...doc,
        fullName: doc.full_name || (doc.firstName ? `${doc.firstName} ${doc.lastName}` : "Unknown Doctor"),
        specialization: doc.specialization || doc.specialty || "Specialist",
        image: doc.image || doc.avatar_url || `https://i.pravatar.cc/150?u=${doc.id}`,
        rating: Number(doc.rating || 4.5),
        reviews_count: doc.reviews_count || 0,
        hospital: doc.hospital || doc.company?.name || "Al-Shefaa Hospital",
        experience: Number(doc.experience || 5),
        available: doc.available ?? true,
        patientsCount: Number(doc.patientsCount || 100),
      };
    },
    enabled: !!id, // لا يتم التنفيذ إلا لو الـ id موجود
  });
}

export function useDoctorSearch(query: string) {
  return useQuery<Doctor[]>({
    queryKey: QK.doctorSearch(query),
    queryFn: async () => {
      const q = query.toLowerCase()

      const { data } = await api.get<any[]>('/profiles', {
        params: {
          role: 'eq.doctor', // تصفية الأطباء مباشرة من الـ API
          select: '*'
        }
      });

      if (!data) return [];

      const filteredAndMappedDoctors = data.filter((doc: any) => {
        // البحث في الحقول المتوقعة من جدول profiles (snake_case) ومن الـ DummyJSON (camelCase)
        const firstName = (doc.first_name || doc.firstName || '').toLowerCase();
        const lastName = (doc.last_name || doc.lastName || '').toLowerCase();
        const fullName = (doc.full_name || `${firstName} ${lastName}`).toLowerCase();
        const specialty = (doc.specialty || doc.specialization || '').toLowerCase();

        return (
          firstName.includes(q) ||
          lastName.includes(q) ||
          fullName.includes(q) ||
          specialty.includes(q)
        );
      }).map((doc: any) => ({
        ...doc,
        id: doc.id,
        firstName: doc.first_name || doc.firstName || '',
        lastName: doc.last_name || doc.lastName || '',
        fullName: doc.full_name || (doc.first_name ? `${doc.first_name} ${doc.last_name}` : (doc.firstName ? `${doc.firstName} ${doc.lastName}` : "Unknown Doctor")),
        specialization: doc.specialty || doc.specialization || "Specialist",
        image: doc.image || doc.avatar_url || `https://i.pravatar.cc/150?u=${doc.id}`,
        hospital: doc.hospital || doc.company?.name || "Al-Shefaa Hospital",
        rating: Number(doc.rating || 4.5),
        experience: Number(doc.experience || 5),
        available: doc.available ?? true,
        patientsCount: Number(doc.patientsCount || 100),
      }));

      return filteredAndMappedDoctors as Doctor[];
    },
    enabled: query.trim().length >= 2,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  ③ PATIENT HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function usePatients(params: PaginationParams = {}) {
  const { limit = 20, skip = 0 } = params
  return useQuery<PaginatedResult<Patient>>({
    queryKey: QK.patients({ limit, skip }),
    queryFn: async () => {
      const { data: patients } = await api.get<RawUser[]>('/profiles', { params: { role: 'eq.patient' } })
      return {
        data: patients.slice(skip, skip + limit) as unknown as Patient[],
        total: patients.length,
        skip, limit,
        hasMore: skip + limit < patients.length,
      }
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  ④ MEDICAL PACKAGE HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function usePackages(params: PaginationParams & { category?: string; search?: string } = {}) {
  const { limit = 20, skip = 0, category, search } = params
  return useQuery<PaginatedResult<MedicalPackage>>({
    queryKey: QK.packages({ limit, skip, category, search }),
    queryFn: async () => {
      const queryParams: any = {
        limit,
        offset: skip,
      };

      if (category && category !== 'All') {
        queryParams.category = `eq.${category}`;
      }
      
      if (search) {
        // Supabase uses ilike for case-insensitive search
        queryParams.title = `ilike.*${search}*`;
      }

      const response = await api.get<MedicalPackage[]>('/packages', { 
        params: queryParams,
        headers: { 'Prefer': 'count=exact' } 
      });
      
      // PostgREST returns total count in content-range header
      const contentRange = response.headers['content-range'];
      const total = contentRange ? parseInt(contentRange.split('/')[1], 10) : response.data.length;
      
      return {
        data: response.data,
        total,
        skip, limit,
        hasMore: response.data.length >= limit,
      }
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
//  ⑤ CART & ORDERS HOOKS
// ─────────────────────────────────────────────────────────────────────────────

export function useCart() {
  const userId = useAuthStore(state => state.user?.id)
  return useQuery({
    queryKey: QK.cart(userId!),
    queryFn: async () => {
      // تغيير userId إلى user_id ليناسب اصطلاحات SQL في سوبابيز
      const { data } = await api.get(`/cart`, { params: { user_id: `eq.${userId}` } })
      return data
    },
    enabled: !!userId,
  })
}

export function useAddToCart() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (item: any) => {
      const userId = useAuthStore.getState().user?.id
      const packageId = item.id;

      // التأكد من أن القيم موجودة وليست NaN أو 0 لضمان سلامة البيانات قبل إرسال الطلب (POST)
      if (!userId || String(userId) === "0" || String(userId) === "NaN" || 
          !packageId || String(packageId) === "0" || String(packageId) === "NaN") {
        console.error("❌ بيانات السلة ناقصة أو غير صحيحة لمنع خطأ 400:", { userId, packageId });
        throw new Error("Invalid User or Package ID: Values are missing or NaN");
      }

      try {
        const payload = { 
          package_id: String(packageId), 
          user_id: String(userId), 
          title: item.title,
          price: item.price,
          description: item.description,
          image: item.image,
          thumbnail: item.thumbnail, // خلي الـ thumbnail ياخد رابط الصورة
          // image: item.image || item.thumbnail,
          // thumbnail: item.thumbnail || item.image,
          category: item.category,
          quantity: 1 
        };
        console.log("🚀 Attempting to add item to cart with payload:", payload);
        
        const { data } = await api.post("/cart", payload);
        return data;
      } catch (error: any) {
        // طباعة تفاصيل الخطأ القادمة من Supabase (PostgREST)
        console.error("❌ Supabase Add to Cart Error Details:", error.response?.data || error.message);
        throw error;
      }
    },
    onSuccess: () => {
      const userId = useAuthStore.getState().user?.id;
      if (userId) queryClient.invalidateQueries({ queryKey: QK.cart(userId) });
    },
  })
}

export function useUpdateCartQuantity() {
  const queryClient = useQueryClient()
  const userId = useAuthStore.getState().user?.id
  return useMutation({
    mutationFn: async ({ cartId, quantity }: { cartId: number | string; quantity: number }) => {
      const { data } = await api.patch(`/cart?id=eq.${cartId}`, { quantity })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.cart(userId!) }),
  })
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient()
  const userId = useAuthStore.getState().user?.id
  return useMutation({
    mutationFn: async (cartId: number | string) => {
      await api.delete(`/cart?id=eq.${cartId}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.cart(userId!) }),
  })
}

export function useCheckout() {
  const queryClient = useQueryClient()
  const userId = useAuthStore.getState().user?.id
  return useMutation({
    mutationFn: async (cartItems: any[]) => {
      await api.post('/orders', { user_id: userId, items: cartItems, date: new Date().toISOString() })
      await Promise.all(cartItems.map(item => api.delete(`/cart?id=eq.${item.id}`)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.cart(userId!) })
      queryClient.invalidateQueries({ queryKey: QK.orders(userId!) })
    },
  })
}

export function useUserOrders() {
  const userId = useAuthStore(state => state.user?.id)
  return useQuery({
    queryKey: QK.orders(userId!),
    queryFn: async () => {
      const { data } = await api.get(`/orders`, { params: { user_id: `eq.${userId}` } })
      return data
    },
    enabled: !!userId,
  })
}


export function useOrders() {
  const userId = useAuthStore(state => state.user?.id);

  return useQuery({
    // الـ queryKey لازم يتغير لما الـ userId يتغير
    queryKey: userId ? QK.orders(userId) : ['orders', 'guest'],
    
    queryFn: async () => {
      // التأكد من وجود userId قبل الطلب
      if (!userId) return [];

      // الطريقة الصحيحة للفلترة في Supabase عبر REST API هي إضافة الفلتر كـ Query Parameter
      // نستخدم `${userId}` مباشرة لضمان إرسال القيمة بشكل سليم
      const { data } = await api.get('/orders', {
        params: {
          user_id: `eq.${userId}`,
          select: '*', // لضمان جلب كل الحقول
          order: 'created_at.desc' // ترتيب الأوردرات من الأحدث للأقدم
        }
      });
      
      return data;
    },
    // الـ Query مش هيشتغل طول ما مفيش userId
    enabled: !!userId,
    // تحسين: منع إعادة الطلب بكثرة لو الداتا ثابتة
    staleTime: 1000 * 60 * 5, 
  });
}

export function useFavorites(userId: string | number) {
  return useQuery({
    queryKey: QK.favorites(userId as any),
    queryFn: async () => {
      try {
        // 1. نطلب من سوبابيز جلب المفضلة مع بيانات البروفايل المرتبط بالدكتور
        const { data } = await api.get(`/favorites`, { 
          params: { 
            user_id: `eq.${userId}`,
            // هنا نحدد العلاقة مع جدول البروفايل لسحب الصورة والاسم
            select: '*,doctor:doctor_id(*)'  
          } 
        });

        // 2. توحيد منطق البيانات (Mapping) ليتطابق مع دالة useDoctor
        return data.map((rec: any) => {
          const doc = rec.doctor; // كائن الدكتور القادم من الربط

          if (!doc) return rec;

          return {
            ...rec,
            // ننشئ كائن doctors يحتوي على الصورة والاسم بنفس منطق البروفايل
            doctors: {
              ...doc,
              fullName: doc.full_name || (doc.firstName ? `${doc.firstName} ${doc.lastName}` : "Unknown Doctor"),
              specialization: doc.specialization || doc.specialty || "Specialist",
              // السطر الأهم: نتحقق من وجود صورة حقيقية أولاً، وإذا لم توجد نستخدم الرابط العشوائي المرتبط بـ id الطبيب
              image: doc.image || doc.avatar_url || `https://i.pravatar.cc/150?u=${doc.id}`
            }
          };
        });
      } catch (error: any) {
        console.error("❌ Favorites Fetch Error:", error.response?.data || error.message);
        throw error;
      }
    },
    enabled: !!userId && userId !== 0,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, doctorId, isFavorite }: { userId: string | number; doctorId: string | number; isFavorite: boolean }) => {
      // التحقق من صحة المعرفات (دعم UUIDs كـ strings)
      const isInvalid = (val: any) => 
        !val || 
        val === "0" || 
        String(val) === "NaN" || 
        String(val) === "null" || 
        String(val) === "undefined";

      if (isInvalid(userId) || isInvalid(doctorId)) {
        console.error("❌ التحقق فشل: doctorId أو userId غير صالح:", { userId, doctorId });
        throw new Error("Invalid User or Doctor ID: Values are missing or NaN");
        console.warn("⚠️ تم تجاهل العملية: معرف المستخدم أو الطبيب غير متوفر حالياً.");
        return; // نرجع بدلاً من رمي خطأ يسبب تسجيل خروج
      }

      try {
        if (isFavorite) {
          // الحذف باستخدام الفلاتر الصحيحة user_id و doctor_id
          return await api.delete(`/favorites?user_id=eq.${userId}&doctor_id=eq.${doctorId}`);
        } else {
          const response = await api.post("/favorites", { 
            user_id: userId, 
            doctor_id: doctorId 
          });
          return response.data;
        }
      } catch (error: any) {
        // طباعة تفاصيل الخطأ القادمة من Supabase (PostgREST)
        console.error("❌ Supabase API Error Details:", error.response?.data || error.message);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QK.favorites(variables.userId as any) });
    },
  });
}

export function useDoctorReviews(doctorId: string | number) {
  return useQuery({
    queryKey: ["reviews", doctorId],
    queryFn: async () => {
      const { data } = await api.get(`/reviews`, { params: { doctor_id: `eq.${doctorId}` } });
      return data;
    },
    enabled: !!doctorId,
  });
}
// ─────────────────────────────────────────────────────────────────────────────
//  ⑥ APPOINTMENTS & RECORDS
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch records for a specific user */
export function useMedicalRecords(userId?: string | number) {
  const hasId = userId !== undefined && userId !== null;
  return useQuery({
    queryKey: hasId ? [...QK.records(), userId] : QK.records(),
    queryFn: async () => {
      const url = hasId ? `/medical_records?user_id=eq.${userId}` : "/medical_records";
      const { data } = await api.get(url);
      return data;
    },
  });
}

/** Fetch all records with pagination support */
export function useRecords({ limit, skip }: { limit: number; skip: number }) {
  return useQuery({
    queryKey: [...QK.records(), { limit, skip }],
    queryFn: async () => {
      const { data } = await api.get(`/medical_records?limit=${limit}&offset=${skip}`);
      return data;
    },
  });
}

export function useCreateRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newRecord: any) => {
      const { data } = await api.post("/medical_records", newRecord);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.records() });
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (aptData: AppointmentPayload) => {
      console.log("🚀 Attempting Supabase Direct Insert:", aptData);
      
      // استخدام عميل سوبابيز مباشرة بدلاً من axios لتجنب مشاكل الـ 401
      const { data, error } = await supabase
        .from('appointments')
        .insert([aptData])
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase SDK Error:", error);
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QK.appointments(String(data.user_id)) });
    },
  })
}


export function useUserRecords(userId: number) {
  return useQuery<MedicalRecord[]>({
    queryKey: QK.userRecords(userId),
    queryFn: async () => {
      const { data } = await api.get(`/medical_records?user_id=eq.${userId}`)
      return data
    },
    enabled: !!userId,
  })
}

export const useAppointments = () => {
  const userId = useAuthStore(state => state.user?.id);
  return useQuery({
    queryKey: QK.appointments(userId!),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return (data as any[]) || [];
    },
    enabled: !!userId,
  });
};

export function useNotifications() {
  const userId = useAuthStore(state => state.user?.id)
  return useQuery({
    queryKey: QK.notifications(userId!),
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { user_id: `eq.${userId}` } });      return data
    },
    enabled: !!userId,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const userId = useAuthStore(state => state.user?.id)
  return useMutation({
    mutationFn: async (id: number | string) => {
      await api.patch(`/notifications?id=eq.${id}`, { read: true })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QK.notifications(userId!) }),
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  const userId = useAuthStore.getState().user?.id

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; status: string }) => {
      console.log("🔄 Attempting to Update Appointment Status:", { id, payload });
      const { data, error } = await supabase
        .from('appointments')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("❌ Supabase Update Error:", error.message, error.details);
        throw error;
      }
      console.log("✅ Appointment Updated Successfully:", data);
      return data;
    },
    onSuccess: () => {
      // نلغي كاش المواعيد بالكامل لضمان تحديث العدادات والقائمة فوراً
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      console.log("🗑️ Attempting to Delete Appointment ID:", id);
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("❌ Supabase Delete Error:", error.message, error.details);
        throw error;
      }
      console.log("✅ Appointment Deleted from Database");
    },
    onSuccess: () => {
      // نلغي كاش المواعيد بالكامل لضمان تحديث القائمة فوراً
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  ⑦ ADMIN STATS HOOK
// ─────────────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: QK.adminStats,
    queryFn: async () => {
      const [users, packages, appointments] = await Promise.all([
        api.get<RawUser[]>('/profiles'),
        api.get<MedicalPackage[]>('/packages'),
        api.get<Appointment[]>('/appointments'),
      ])

      const allUsers = users.data;
      const allPackages = packages.data;
      const allAppointments = appointments.data;

      const totalDoctors = allUsers.filter(u => u.role?.toLowerCase() === 'doctor').length;
      const totalPatients = allUsers.filter(u => u.role?.toLowerCase() === 'patient').length;
      const totalPackages = allPackages.length;
      const totalRevenue = allAppointments.length * 150;

      // حساب بيانات التخصصات للرسم البياني
      const specialtyMap: Record<string, number> = {};
      allUsers.filter(u => u.role?.toLowerCase() === 'doctor').forEach(doc => {
        const spec = doc.specialty || 'General';
        specialtyMap[spec] = (specialtyMap[spec] || 0) + 1;
      });
      const specialtyData = Object.entries(specialtyMap).map(([name, count], i) => ({
        name,
        value: Math.round((count / (totalDoctors || 1)) * 100),
        color: ['#10b981', '#059669', '#34d399', '#047857'][i % 4]
      }));

      // حساب تدفق المواعيد (Weekly Flow)
      const appointmentData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
        day,
        video: allAppointments.filter(a => a.type?.toLowerCase().includes('video')).length / 7,
        inPerson: allAppointments.filter(a => a.type?.toLowerCase().includes('person')).length / 7
      }));

      // حساب تريند الإيرادات (Revenue Trend)
      const revenueTrend = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
        const multiplier = i <= new Date().getMonth() ? 1 : 0;
        return {
          month: m,
          revenue: (totalRevenue / 12) * (1 + Math.random() * 0.5) * multiplier,
          patients: (totalPatients / 12) * (1 + Math.random() * 0.3) * multiplier,
          appointments: (allAppointments.length / 12) * (1 + Math.random() * 0.4) * multiplier
        };
      });

      return {
        totalDoctors,
        totalPatients,
        totalPackages,
        activeAppointments: allAppointments.filter(a => a.status === 'upcoming').length,
        totalRevenue,
        satisfactionRate: 97.4,
        revenueTrend,
        specialtyData,
        appointmentData
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useAnalytics() {
  return useQuery({
    queryKey: QK.analytics,
    queryFn: async () => {
      const { data } = await api.get('/analytics');
      return data;
    },
    // يمكنك إضافة staleTime طويل لأن بيانات التحليلات لا تتغير كل ثانية
    staleTime: 15 * 60 * 1000, 
  });
}