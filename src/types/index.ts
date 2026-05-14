// src/types/index.ts
// ─── Single source of truth for all domain types used across the app ──────────

// ════════════════════════════════════════════════════════════
//  AUTH
// ════════════════════════════════════════════════════════════

export interface AuthUser {
  id: string | number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  token: string;
  refreshToken: string;
  role: "admin" | "patient" | "doctor";
  specialty?: string;
  hospital?: string;
  department?: string;
  phone?: string;
  birthDate?: string;
  age?: number;
  gender?: string;
  notifications?: Notification[];
  
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role?: "admin" | "patient" | "doctor"; // اختياري، الافتراضي سيكون "patient"
}

// ════════════════════════════════════════════════════════════
//  RAW DUMMYJSON SHAPES  (what the API actually returns)
// ════════════════════════════════════════════════════════════
export interface AppointmentPayload {
  doctor_id: string | number;
  user_id: string | number;
  appointment_date: string;
  appointment_time: string;
  doctor_name: string;
  doctor_image: string;
  specialty: string;
  type: "Online Consultation" | "Clinic Visit";
  status: "upcoming" | "completed" | "cancelled";
  notes?: string;
}
export interface RawUser {
  id: number;
  firstName: string;
  lastName: string;
  maidenName?: string;
  age?: number;
  gender?: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  birthDate?: string;
  image: string;
  bloodGroup?: string;
  height?: number;
  weight?: number;
  eyeColor?: string;
full_name ?: string;
avatar_url ?: string;
  company: {
    department?: string;
    name: string;       // → hospital
    title: string;      // → specialization
    address?: {
      address?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      coordinates?: { lat: number; lng: number };

    };
  };
  address?: {
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  role: "admin" | "patient" | "doctor";
  specialty?: string;
}

export interface RawProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage?: number;
  rating: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images?: string[];
}

export interface RawPost {
  id: number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: { likes: number; dislikes: number };
  views?: number;
}

export interface RawComment {
  id: number;
  body: string;
  postId: number;
  likes?: number;
  user: { id: number; username: string; fullName: string };
}

// DummyJSON list wrappers
export interface UserListResponse   { users: RawUser[];     total: number; skip: number; limit: number; }
export interface ProductListResponse{ products: RawProduct[];total: number; skip: number; limit: number; }
export interface PostListResponse   { posts: RawPost[];     total: number; skip: number; limit: number; }
export interface CommentListResponse{ comments: RawComment[];total: number; skip: number; limit: number; }

// ════════════════════════════════════════════════════════════
//  MAPPED DOMAIN MODELS
// ════════════════════════════════════════════════════════════

export interface Doctor {
  id: string | number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  image: string;
  specialization: string;   // ← company.title
  hospital: string;         // ← company.name
  department?: string;      // ← company.department
  rating: number;           // generated 3.5–5.0
  experience: number;       // generated 2–22 yrs
  available: boolean;       // generated ~70% true
  patientsCount: number;    // generated
  city?: string;
  country?: string;
}

export interface Patient {
  id: string | number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  image: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  city?: string;
  registeredAt: string;     // generated ISO date
}

export interface MedicalPackage {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  thumbnail: string;
  category: string;         // mapped to medical service name
  originalCategory: string; // raw DummyJSON category
  quantity: number;         // cart quantity (0 when not in cart)
}

export interface MedicalRecord {
  id: string | number;
  title: string;
  body: string;
  userId: number;
  tags: string[];
  reactions: { likes: number; dislikes: number };
  views: number;
  date: string;             // derived from id as a mock date
  type: "lab" | "prescription" | "diagnosis" | "imaging" | "surgery";
  
}

export interface BookingSlot {
  doctorId: number;
  packageId?: number;
  date: string;
  time: string;
  notes?: string;
}

export interface Appointment {
  id: string | number;
  doctorId: string | number;
  patientId: string | number;
  doctorName: string;
  patientName: string;
  specialization: string;
  specialty: string;
  date: string;
  time: string;
  status: "upcoming" | "completed" | "cancelled" | "pending";
  type: "Clinic Visit" | "Online Consultation"; // مزامنة مع الباكيند
  notes?: string;
  doctorImage: string; // تم جعلها إجبارية لضمان تمرير doctor.image من بيانات الطبيب المختارة
}

// ════════════════════════════════════════════════════════════
//  UI / PAGINATION
// ════════════════════════════════════════════════════════════

export interface PaginationParams {
  limit?: number;
  skip?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  skip: number;
  limit: number;
  hasMore: boolean;
}