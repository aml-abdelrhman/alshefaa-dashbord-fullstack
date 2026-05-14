// // src/queries/useQueries.ts
// // ─────────────────────────────────────────────────────────────────────────────
// //  THE ONLY file in the app that contains useQuery / useMutation hooks.

// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { authApi, api as myAxios } from './axiosInstance'
// export { authApi }

// // Zustand stores
// import { useAuthStore } from '../stores/useAuthStore'
// import { useMedicalStore } from '../stores/useMedicalStore'

// // Types
// import type {
//   AuthUser,
//   LoginPayload,
//   RegisterPayload,
//   RawUser,
//   Doctor,
//   Patient,
//   MedicalPackage,
//   UserListResponse,
//   ProductListResponse,
//   PostListResponse,
//   PaginationParams,
//   PaginatedResult,
//   MedicalRecord,
//   Appointment,
// } from '../types'

// // ─────────────────────────────────────────────────────────────────────────────
// //  QUERY KEYS  (centralised — change once, updates everywhere)
// // ─────────────────────────────────────────────────────────────────────────────
// export const QK = {
//   // Auth
//   authMe: ['auth', 'me'] as const,

//   // Doctors
//   doctors: (p: PaginationParams) => ['doctors', p] as const,
//   doctor: (id: number) => ['doctors', id] as const,
//   doctorSearch: (q: string) => ['doctors', 'search', q] as const,

//   // Patients
//   patients: (p: PaginationParams) => ['patients', p] as const,
//   patient: (id: number) => ['patients', id] as const,

//   // Packages / Products
//   packages:      (p: any)               => ["packages", p] as const, // دعم البحث والفلترة في الكاش
//   package: (id: number) => ['packages', id] as const, // باقة واحدة
//   favorites: (userId: number) => ['favorites', userId] as const, // مفضلة المستخدم
//   cart: (userId: number) => ['cart', userId] as const, // سلة المستخدم
//   orders: (userId: number) => ['orders', userId] as const, // الطلبات المشتراة
//   appointments: (userId?: number) => ['appointments', userId] as const, // مواعيد المستخدم
//   notifications: (userId: number) => ['notifications', userId] as const,

//   // Medical Records
//   record: (id: number) => ['records', id] as const,
//   records: (p?: PaginationParams) => (p ? (["records", p] as const) : (["records"] as const)),
//   userRecords:   (userId: number)       => ["records", "user", userId] as const,
  
//   // Admin stats (derived)
//   adminStats: ['admin', 'stats'] as const,

//   // Analytics
//   analytics: ['analytics'] as const,
// } as const

// // ─────────────────────────────────────────────────────────────────────────────
// //  ① AUTH HOOKS
// // ─────────────────────────────────────────────────────────────────────────────

// /** POST /auth/login → store JWT + user in Zustand */
// export function useLogin() {
//   const { setUser, setLoading, setError } = useAuthStore.getState()
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: async (payload: LoginPayload) => {
//       const { data } = await authApi.post('/login', {
//         email: payload.email,
//         password: payload.password,
//       })

//       console.log("Server Response User Data:", data.user);

//       localStorage.setItem('token', data.accessToken)
//       return {
//         ...data.user, 
//         token: data.accessToken,
//         role: data.user.role ?? "patient", 
//       } as AuthUser;
//     },
//     onMutate: () => setLoading(true),
//     onSuccess: (user) => {
//       queryClient.clear()
//       const medicalStore = useMedicalStore.getState() as any
//       if (typeof medicalStore.clearCart === 'function') {
//         medicalStore.clearCart()
//       }
//       if (typeof medicalStore.resetFavorites === 'function') {
//         medicalStore.resetFavorites()
//       }

//       setUser(user)
//       setLoading(false)
//     },
//     onError: (err: any) => {
//       setError(err.response?.data || 'بيانات الدخول غير صحيحة')
//       setLoading(false)
//     },
//   })
// }

// /** POST /users/add → simulate patient registration */
// export function useRegister() {
//   return useMutation({
//     mutationFn: async (payload: RegisterPayload) => {
//       const { data } = await authApi.post('/register', {
//         ...payload,
//         role: payload.role || "patient", 
//         image: `https://i.pravatar.cc/150?u=${payload.email}`, 
//         settings: {
//           accent: 'green',
//           darkMode: false,
//         },
//         notifications: {
//           email: true,
//           sms: false,
//           push: true,
//           appointments: true,
//           records: true,
//           promotions: false,
//         },
//       })
//       return data
//     },
//     onSuccess: () => {
//       // لا حاجة لتحديث الكاش هنا لأن المستخدم الجديد سيقوم بتسجيل الدخول بعد التسجيل
//         },
//     onError: (err: any) => {
//       console.error('Registration Error Detail:', err)
//     },
//   })
// }

// /** POST /auth/refresh → refresh JWT (simulated) */
// export function useRefreshToken() {
//   const { setToken } = useAuthStore.getState()
//   return useMutation({
//     mutationFn: async (refreshToken: string) => {
//       const { data } = await authApi.post('/auth/refresh', {
//         refreshToken,
//         expiresInMins: 60,
//       })
//       return data.token as string
//     },
//     onSuccess: (token) => setToken(token),
//   })
// }

// /** PATCH /users/:id → Update user profile, settings, or notifications */
// export function useUpdateUser() {
//   const queryClient = useQueryClient()
//   return useMutation({
//     mutationFn: async ({ id, ...data }: { id: number; [key: string]: any }) => {
//       const response = await authApi.patch(`/users/${id}`, data)
//       return response.data
//     },
//     onSuccess: (updatedUser) => {
//       // تحديث الكاش لضمان مزامنة البيانات في كل التطبيق
//       queryClient.invalidateQueries({ queryKey: QK.authMe })
//       queryClient.invalidateQueries({ queryKey: ['user'] })
//       queryClient.setQueryData(['user', updatedUser.id], updatedUser)
//     },
//   })
// }

// /** DELETE /users/:id → Permanently remove user account */
// export function useDeleteUser() {
//   const queryClient = useQueryClient()
//   return useMutation({
//     mutationFn: async (id: number) => {
//       await authApi.delete(`/users/${id}`)
//     },
//     onSuccess: () => {
//       // تنظيف الكاش بعد الحذف
//       queryClient.invalidateQueries({ queryKey: ['user'] })
//     },
//   })
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  ② DOCTOR HOOKS
// // ─────────────────────────────────────────────────────────────────────────────

// /** GET /users?limit=&skip= → paginated doctor list */
// // تم تعديلها لجلب المستخدمين من السيرفر المحلي وتصفيتهم كأطباء
// /** GET /users?role=doctor → جلب قائمة الأطباء فقط من السيرفر */
// export function useDoctors(params: PaginationParams = {}) {
//   const { limit = 20, skip = 0 } = params

//   return useQuery<PaginatedResult<Doctor>>({
//     queryKey: QK.doctors({ limit, skip }),
//     queryFn: async () => {
//       const { data: allUsers } = await authApi.get<RawUser[]>('/users')
      
//       const doctors = allUsers.filter(u => u.role?.trim().toLowerCase() === 'doctor')
//       return {
//         data: doctors.slice(skip, skip + limit) as unknown as Doctor[],
//         total: doctors.length,
//         skip,
//         limit,
//         hasMore: skip + limit < doctors.length,
//       }
//     },
//     staleTime: 0, 
//     gcTime: 0, // مسح الكاش من الذاكرة تماماً فور إغلاق الصفحة أو تغييرها
//     refetchOnMount: 'always', // إجبار المتصفح على طلب البيانات في كل مرة تفتح فيها الصفحة
//     refetchOnWindowFocus: true, 
//   })
// }

// /** GET /users/:id → single doctor */
// export function useDoctor(id: number) {
//   return useQuery<Doctor>({
//     queryKey: QK.doctor(id),
//     queryFn: async () => {
//       const { data } = await authApi.get<RawUser>(`/users/${id}`) // استخدام authApi لجلب المستخدمين
//             return {
//         ...data,
//         fullName: `${data.firstName} ${data.lastName}`,
//         specialization: data.specialty || data.company?.title || "General Practitioner",
//         hospital: data.company?.name || "Alshefaa Hospital",
//         rating: (data as any).rating || 4.5, // قيمة افتراضية لمنع خطأ toFixed
//         experience: (data as any).experience || 5,
//         patientsCount: (data as any).patientsCount || 100,
//         available: (data as any).available ?? true,
//       } as unknown as Doctor
//     },
//     enabled: !!id,
//     staleTime: 10 * 60 * 1000,
//   })
// }

// /** GET /users/search?q= → البحث عن الأطباء بالاسم أو التخصص */
// export function useDoctorSearch(query: string) {
//   return useQuery<Doctor[]>({
//     queryKey: QK.doctorSearch(query),
//     queryFn: async () => {
//       // جلب كافة المستخدمين لضمان العثور على الأطباء حتى لو كانت الرتبة مكتوبة بشكل مختلف
//       const { data: allUsers } = await authApi.get<RawUser[]>('/users')

//       const q = query.toLowerCase()
//       const filteredDoctors = allUsers.filter((user) => {
//         const isDoctor = user.role?.trim().toLowerCase() === 'doctor'
//         const matchesName = (user.firstName + ' ' + user.lastName)
//           .toLowerCase()
//           .includes(q)
//         const matchesSpecialty = user.specialty?.toLowerCase().includes(q)

//         return isDoctor && (matchesName || matchesSpecialty)
//       })

//       return filteredDoctors as unknown as Doctor[]
//     },
//     enabled: query.trim().length >= 2,
//     staleTime: 0,
//     gcTime: 0,
//     refetchOnMount: 'always',
//   })
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  ③ PATIENT HOOKS
// // ─────────────────────────────────────────────────────────────────────────────

// /** GET /users?limit=&skip= → paginated patient list */
// export function usePatients(params: PaginationParams = {}) {
//   const { limit = 22, skip = 0 } = params // تم تعديل limit لتكون متناسقة
//   return useQuery<PaginatedResult<Patient>>({
//     queryKey: QK.patients({ limit, skip }),
//     queryFn: async () => {
//       // جلب كافة المستخدمين وتصفيتهم محلياً لضمان الدقة
//       const { data: allUsers } = await authApi.get<RawUser[]>('/users')
      
//       const patients = allUsers.filter(u => u.role?.toLowerCase() === 'patient')

//       return {
//         data: patients.slice(skip, skip + limit) as unknown as Patient[],
//         total: patients.length,
//         skip,
//         limit,
//         hasMore: skip + limit < patients.length,
//       }
//     },
//     staleTime: 0, // تم تصفير الكاش لضمان تحديث قائمة المرضى
//   })
// }

// /** GET /users/:id → single patient */
// export function usePatient(id: number) {
//   return useQuery<Patient>({
//     queryKey: QK.patient(id),
//     queryFn: async () => {
//       const { data } = await authApi.get<RawUser>(`/users/${id}`) // استخدام authApi لجلب المستخدمين
//       return data as unknown as Patient
//     },
//     enabled: !!id,
//   })
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  ④ PACKAGE HOOKS
// // ─────────────────────────────────────────────────────────────────────────────
// /** GET /packages → جلب الباقات مع دعم الفلترة والبحث (السيرفر الجديد) */
// export function usePackages(params: PaginationParams & { category?: string; search?: string } = {}) {
//   const { limit = 22, skip = 0, category, search } = params

//   return useQuery<PaginatedResult<MedicalPackage>>({
//     queryKey: QK.packages({ limit, skip, category, search }),
//     queryFn: async () => {
//       const paramsArr: string[] = []
      
//       // إضافة باراميترات الصفحات (json-server يستخدم _limit و _start)
//       paramsArr.push(`_limit=${limit}`)
//       paramsArr.push(`_start=${skip}`)

//       if (category && category !== 'All' && category !== '') {
//         // البحث عن التصنيف (مطابقة تامة أو استخدام _like)
//         paramsArr.push(`category=${encodeURIComponent(category)}`)
//       }
      
//       if (search && search.trim() !== '') {
//         paramsArr.push(`q=${encodeURIComponent(search)}`)
//       }

//       const url = `/packages?${paramsArr.join('&')}`
//       const response = await myAxios.get<MedicalPackage[]>(url)
      
//       const packages = Array.isArray(response.data) ? response.data : []
      
//       // جلب العدد الكلي من الهيدر
//       const totalCount = response.headers['x-total-count'] || response.headers['X-Total-Count'];
//       const total = totalCount ? parseInt(totalCount, 10) : packages.length;

//       return {
//         data: packages,
//         total,
//         skip,
//         limit,
//         hasMore: packages.length >= limit,
//       }
//     },
//     staleTime: 30 * 1000, // تقليل وقت الكاش مؤقتاً للتأكد من تحديث البيانات
//   })
// }

// /** GET /packages/:id → جلب باقة واحدة من السيرفر الجديد */
// export function usePackage(id: number) {
//   return useQuery<MedicalPackage>({
//     queryKey: QK.package(id),
//     queryFn: async () => {
//       const { data } = await myAxios.get<MedicalPackage>(`/packages/${id}`)
//       return data // البيانات جاهزة كـ MedicalPackage
//     },
//     enabled: !!id,
//   })
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  ⑤ MEDICAL RECORD HOOKS
// // ─────────────────────────────────────────────────────────────────────────────

// // تم حذف جميع الـ hooks المتعلقة بـ Medical Records لأنها كانت تعتمد على DummyJSON Posts
// /** GET /records?userId=... → جلب سجلات المستخدم الحالي فقط */
// export function useUserRecords(userId: number) {
//   return useQuery<MedicalRecord[]>({
//     queryKey: QK.userRecords(userId),
//     queryFn: async () => {
//       if (!userId) return []
//       // الفلترة بـ userId هنا أساسية عشان الخصوصية
//       const { data } = await authApi.get<MedicalRecord[]>(
//         `/records?userId=${userId}`,
//       )
//       return data
//     },
//     enabled: !!userId, // مش هيشتغل إلا لو فيه يوزر موجود
//     staleTime: 5 * 60 * 1000,
//   })
// }


// export const useCreateRecord = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (newRecord: any) => {
//       // إرسال طلب POST لحفظ السجل الجديد في قاعدة البيانات
//       const response = await authApi.post('/records', newRecord);
//       return response.data;
//     },
//     onSuccess: (data) => {
//       // تحديث الكاش لضمان ظهور السجل الجديد فوراً في صفحة RecordsPage
//       queryClient.invalidateQueries({ queryKey: QK.records() });
      
//       // إذا كان السجل مرتبطاً بمستخدم، نقوم بتحديث سجلات المستخدم أيضاً
//       if (data.userId) {
//         queryClient.invalidateQueries({ queryKey: QK.userRecords(data.userId) });
//       }
//     },
//   });
// };


// /** GET /records → جلب كل السجلات (للأدمن أو البحث العام) */
// export function useRecords(params: PaginationParams = {}) {
//   const { limit = 10, skip = 0 } = params
//   return useQuery<PaginatedResult<MedicalRecord>>({
//     queryKey: QK.records({ limit, skip }),
//     queryFn: async () => {
//       const response = await authApi.get<MedicalRecord[]>(
//         `/records?_limit=${limit}&_start=${skip}`,
//       )
//       const total = parseInt(response.headers['x-total-count'] || '0', 10)
//       return {
//         data: response.data,
//         total: total || response.data.length,
//         skip,
//         limit,
//         hasMore: skip + limit < (total || response.data.length),
//       }
//     },
//   })
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  ⑥ FAVORITES HOOKS
// // ─────────────────────────────────────────────────────────────────────────────

// /** GET /favorites?userId=... → get favorites for current user */
// export function useFavorites() {
//   const userId = useAuthStore.getState().user?.id
//   return useQuery({
//     queryKey: QK.favorites(userId!),
//     queryFn: async () => {
//       if (!userId) return []
//       // إضافة فلترة بـ userId لمنع تداخل البيانات بين المستخدمين)
//       const { data } = await authApi.get(`/favorites?userId=${userId}`)
//       return data
//     },
//     enabled: !!userId,
//   })
// }


// /**
//  * ⑥ CART & CHECKOUT HOOKS
//  * ─────────────────────────────────────────────────────────────────────────────
//  */

// export function useCart() {
//   const userId = useAuthStore.getState().user?.id
//   return useQuery<any[]>({
//     queryKey: QK.cart(userId!),
//     queryFn: async () => {
//       if (!userId) return []
//       const { data } = await authApi.get(`/cart?userId=${userId}`)
//       return data
//     },
//     enabled: !!userId,
//   })
// }

// /** POST /cart → إضافة باقة لسلة المستخدم في الباك إند */
// export function useAddToCart() {
//   const queryClient = useQueryClient();
//   const userId = useAuthStore.getState().user?.id;

//   return useMutation({
//     mutationFn: async (item: any) => {
//       if (!userId) throw new Error("يجب تسجيل الدخول أولاً");
      
//       // استخراج الـ id الخاص بالباكدج لمنع تضاربه مع الـ id التلقائي للسلة في json-server
//       const { id: packageId, ...packageData } = item;

//       const { data } = await authApi.post("/cart", { 
//         ...packageData, 
//         packageId, // حفظ المعرف الأصلي كـ packageId
//         userId, 
//         quantity: 1 
//       });
//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: QK.cart(userId!) });
//     },
//   });
// }

// export function useUpdateCartQuantity() {
//   const queryClient = useQueryClient()
//   const userId = useAuthStore.getState().user?.id

//   return useMutation({
//     mutationFn: async ({
//       cartId,
//       quantity,
//     }: {
//       cartId: number
//       quantity: number
//     }) => {
//       if (quantity <= 0) return authApi.delete(`/cart/${cartId}`)
//       const { data } = await authApi.patch(`/cart/${cartId}`, { quantity })
//       return data
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: QK.cart(userId!) }),
//   })
// }

// export function useRemoveFromCart() {
//   const queryClient = useQueryClient()
//   const userId = useAuthStore.getState().user?.id

//   return useMutation({
//     mutationFn: async (cartId: number) => {
//       await authApi.delete(`/cart/${cartId}`)
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: QK.cart(userId!) }),
//   })
// }

// /** GET /orders?userId=... → جلب الطلبات (الباقات المشتراة) للمستخدم الحالي */
// export function useUserOrders(userId: number) {
//   return useQuery<any[]>({
//     queryKey: QK.orders(userId),
//     queryFn: async () => {
//       if (!userId) return []
//       // جلب الطلبات المفلترة حسب معرف المستخدم لضمان الخصوصية
//       const { data } = await authApi.get(`/orders?userId=${userId}`)
//       return data
//     },
//     enabled: !!userId,
//   })
// }

// /**
//  * Checkout Mutation:
//  * في بيئة json-server، مسح السلة يتطلب حذف العناصر واحداً تلو الآخر أو استخدام endpoint مخصص.
//  * سنقوم بمحاكاة العملية بمسح كافة عناصر المستخدم الحالي.
//  */
// export function useCheckout() {
//   const queryClient = useQueryClient()
//   const userId = useAuthStore.getState().user?.id

//   return useMutation({
//     mutationFn: async (cartItems: any[]) => {
//       if (!userId) throw new Error('Not authenticated')

//       // 1. محاكاة إنشاء طلب (Order) في الباكيند إذا رغبتِ
//       console.log("Creating order for items:", cartItems);
//       await authApi.post('/orders', {
//         userId,
//         items: cartItems,
//         date: new Date().toISOString(),
//         total: cartItems.reduce(
//           (acc, item) => acc + item.price * item.quantity,
//           0,
//         ),
//       })

//       // 2. مسح عناصر السلة من السيرفر
//       const deletePromises = cartItems.map((item) =>
//         authApi.delete(`/cart/${item.id}`),
//       )
//       await Promise.all(deletePromises)
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: QK.cart(userId!) })
//       queryClient.invalidateQueries({ queryKey: QK.orders(userId!) })
//     },
//   })
// }

// /**
//  * ⑦ APPOINTMENTS HOOKS
//  * ─────────────────────────────────────────────────────────────────────────────
//  */

// /** GET /appointments → جلب كافة المواعيد في النظام */
// export function useAppointments() {
//   const userId = useAuthStore.getState().user?.id
//   return useQuery({
//     queryKey: QK.appointments(userId),
//     queryFn: async () => {
//       if (!userId) return []
//       // Migration: جلب مواعيد المستخدم الحالي فقط لضمان الخصوصية
//       const { data } = await authApi.get<Appointment[]>(
//         `/appointments?userId=${userId}`,
//       )
//       return data
//     },
//     enabled: !!userId,
//   })
// }

// /** GET /notifications?userId=... → جلب تنبيهات المستخدم */
// export function useNotifications() {
//   const userId = useAuthStore.getState().user?.id;
//   return useQuery({
//     queryKey: QK.notifications(userId!),
//     queryFn: async () => {
//       if (!userId) return [];
//       const { data } = await authApi.get(`/notifications?userId=${userId}`);
//       return data;
//     },
//     enabled: !!userId,
//   });
// }

// /** PATCH /notifications/:id → تحديث حالة التنبيه (مقروء) */
// export function useMarkNotificationRead() {
//   const queryClient = useQueryClient();
//   const userId = useAuthStore.getState().user?.id;
//   return useMutation({
//     mutationFn: async (id: number) => {
//       await authApi.patch(`/notifications/${id}`, { read: true });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: QK.notifications(userId!) });
//     },
//   });
// }

// /** GET /reviews?doctorId=... → جلب تقييمات دكتور معين */
// export function useDoctorReviews(doctorId: number) {
//   return useQuery({
//     queryKey: ['reviews', 'doctor', doctorId],
//     queryFn: async () => {
//       const { data } = await authApi.get(`/reviews?doctorId=${doctorId}`)
//       return data
//     },
//     enabled: !!doctorId,
//   })
// }

// /** PATCH /appointments/:id → تحديث حالة الموعد (إلغاء مثلاً) */
// export function useUpdateAppointment() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: async ({ id, status }: { id: number; status: string }) => {
//       const { data } = await authApi.patch(`/appointments/${id}`, { status })
//       return data
//     },
//     onSuccess: () => {
//       const userId = useAuthStore.getState().user?.id
//       queryClient.invalidateQueries({ queryKey: QK.appointments(userId) })
//     },
//   })
// }

// /** DELETE /appointments/:id → حذف موعد نهائياً */
// export function useDeleteAppointment() {
//   const queryClient = useQueryClient()
//   return useMutation({
//     mutationFn: async (id: number) => {
//       await authApi.delete(`/appointments/${id}`)
//     },
//     onSuccess: () => {
//       const userId = useAuthStore.getState().user?.id
//       queryClient.invalidateQueries({ queryKey: QK.appointments(userId) })
//     },
//   })
// }

// /** POST /appointments → إنشاء موعد جديد */
// export function useCreateAppointment() {
//   const queryClient = useQueryClient()

//   return useMutation({
//     mutationFn: async (aptData: Partial<Appointment> & { doctorImage?: string }) => {
//       const userId = useAuthStore.getState().user?.id
//       if (!userId) throw new Error('يجب تسجيل الدخول أولاً') 
      
//       // نضمن أن كائن الموعد يحتوي على نسخة من بيانات الطبيب (الاسم، التخصص، والصورة) لضمان اتساق العرض
//       const { data } = await authApi.post('/appointments', {
//         ...aptData,
//         userId,
//         status: 'upcoming',
//       })
//       return data
//     },
//     onSuccess: (data) => {
//       // تحديث قائمة المواعيد فوراً بعد الحجز الناجح
//       queryClient.invalidateQueries({ queryKey: QK.appointments(data.userId) })
//     },
//   })
// }

// /** POST /favorites → add/remove package from favorites */
// export function useToggleFavorite() {
//   const queryClient = useQueryClient()
//   const userId = useAuthStore.getState().user?.id
//   const { data: favorites = [] } = useFavorites();

//   return useMutation({
//     mutationFn: async (doctor: any) => {
//       if (!userId) throw new Error('يجب تسجيل الدخول أولاً');

//       // تحديد معرف الطبيب الحقيقي سواء كان الكائن طبيباً أو سجل مفضلة
//       const targetDoctorId = doctor.doctorId || doctor.id;

//       // البحث في المفضلة باستخدام معرف الطبيب مع ضمان تطابق الأنواع (Number)
//       const existing = favorites.find(
//         (f: any) => Number(f.doctorId) === Number(targetDoctorId)
//       );

//       if (existing) {
//         // إذا كان موجوداً، نستخدم المعرف الخاص بسجل المفضلة للحذف
//         await authApi.delete(`/favorites/${existing.id}`);
//         return { type: 'removed' };
//       } else {
//         // إذا لم يكن موجوداً، نقوم بإضافته مع التأكد من إسناد doctorId بشكل صحيح
//         const { id, ...doctorData } = doctor;
//         const { data } = await authApi.post('/favorites', {
//           ...doctorData,
//           doctorId: targetDoctorId,
//           userId
//         });
//         return { type: 'added', data };
//       }
//     },
//     onSuccess: () =>
//       queryClient.invalidateQueries({ queryKey: QK.favorites(userId!) }),
//   })
// }

// // ─────────────────────────────────────────────────────────────────────────────
// //  ⑥ ADMIN STATS HOOK  (derived from real counts)
// // ─────────────────────────────────────────────────────────────────────────────

// export interface AdminStats {
//   totalPatients: number
//   totalDoctors: number
//   totalPackages: number
//   totalRevenue: number
//   activeAppointments: number
//   satisfactionRate: number
//   // حقول جديدة لدعم الرسوم البيانية
//   revenueTrend: {
//     month: string
//     revenue: number
//     patients: number
//     appointments: number
//   }[]
//   specialtyData: { name: string; value: number; color: string }[]
//   appointmentData: { day: string; video: number; inPerson: number }[]
// }

// export function useAdminStats() {
//   return useQuery<AdminStats>({
//     queryKey: QK.adminStats,
//     queryFn: async () => {
//       // Migration: جلب البيانات الحقيقية من كافة الجداول
//       const [usersRes, packagesRes, appointmentsRes] = await Promise.all([
//         authApi.get<RawUser[]>('/users'),
//         authApi.get<MedicalPackage[]>('/packages'),
//         authApi.get<Appointment[]>('/appointments'),
//       ])

//       const allUsers = usersRes.data
//       const allPackages = packagesRes.data
//       const allAppointments = appointmentsRes.data

//       const totalDoctors = allUsers.filter((u) => u.role?.toLowerCase() === 'doctor').length
//       const totalPatients = allUsers.filter((u) => u.role?.toLowerCase() === 'patient').length
//       const totalPackages = packagesRes.data.length

//       // حساب الإيرادات (افتراضياً: مجموع أسعار الباقات المرتبطة بالمواعيد المكتملة أو قيمة ثابتة لكل موعد)
//       const totalRevenue = allAppointments.length * 150

//       // 1. حساب توزيع التخصصات (Specialty Data)
//       const specialtyMap: Record<string, number> = {}
//       allUsers
//         .filter((u) => u.role === 'doctor')
//         .forEach((doc) => {
//           const spec = doc.specialty || 'General'
//           specialtyMap[spec] = (specialtyMap[spec] || 0) + 1
//         })

//       const COLORS = [
//         '#10b981', // Emerald 500
//         '#059669', // Emerald 600
//         '#34d399', // Emerald 400
//         '#047857', // Emerald 700
//         '#065f46', // Emerald 800
//         '#6ee7b7', // Emerald 300
//       ]
//       const specialtyData = Object.entries(specialtyMap).map(
//         ([name, count], index) => ({
//           name,
//           value: Math.round((count / totalDoctors) * 100),
//           color: COLORS[index % COLORS.length],
//         }),
//       )

//       // 2. حساب تدفق المواعيد الأسبوعي (Weekly Flow)
//       const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
//       const appointmentData = days.map((day) => {
//         // في بيئة حقيقية سنقوم بمقارنة التواريخ، هنا سنقوم بمحاكاة التوزيع بناءً على بيانات db.json
//         const dayApts = allAppointments.filter(() => Math.random() > 0.5) // محاكاة توزيع
//         return {
//           day,
//           video:
//             allAppointments.filter((a) => a.type === 'Online Consultation')
//               .length / 7,
//           inPerson:
//             allAppointments.filter((a) => a.type === 'Clinic Visit').length / 7,
//         }
//       })

//       // 3. حساب تريند الإيرادات الشهري (Monthly Trend)
//       const MONTHS = [
//         'Jan',
//         'Feb',
//         'Mar',
//         'Apr',
//         'May',
//         'Jun',
//         'Jul',
//         'Aug',
//         'Sep',
//         'Oct',
//         'Nov',
//         'Dec',
//       ]
//       const revenueTrend = MONTHS.map((m, i) => {
//         const multiplier = i <= new Date().getMonth() ? 1 : 0 // عرض البيانات حتى الشهر الحالي فقط
//         return {
//           month: m,
//           revenue: (totalRevenue / 12) * (1 + Math.random() * 0.5) * multiplier,
//           patients:
//             (totalPatients / 12) * (1 + Math.random() * 0.3) * multiplier,
//           appointments:
//             (allAppointments.length / 12) *
//             (1 + Math.random() * 0.4) *
//             multiplier,
//         }
//       })

//       return {
//         totalPatients: totalPatients,
//         totalDoctors: totalDoctors,
//         totalPackages: totalPackages,
//         totalRevenue: totalRevenue,
//         activeAppointments: allAppointments.filter(
//           (a) => a.status === 'upcoming',
//         ).length,
//         satisfactionRate: 97.4,
//         revenueTrend,
//         specialtyData,
//         appointmentData,
//       }
//     },
//     staleTime: 10 * 60 * 1000,
//   })
// }

// export const useAnalytics = () => {
//   return useQuery({
//     queryKey: QK.analytics,
//     queryFn: async () => {
//       const response = await authApi.get('/analytics')
//       return response.data
//     },
//   })
// }
