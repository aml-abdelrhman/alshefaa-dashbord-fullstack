// stores/useMedicalStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
  specialization: string; // mapped from company.title
  hospital: string;       // mapped from company.name
  rating?: number;
  experience?: number;    // derived / mocked
  available?: boolean;
}

export interface MedicalPackage {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;       // e.g. "Full Body Checkup"
  rating: number;
  stock: number;
  quantity: number;       // cart quantity
}

export interface BookingSlot {
  doctorId: number;
  packageId?: number;
  date: string;
  time: string;
  notes?: string;
}

interface MedicalState {
  // Favorites (saved doctors)
  favoriteDoctors: Doctor[];
  // Cart (medical packages / bookings)
  cart: MedicalPackage[];
  // Pending booking
  pendingBooking: BookingSlot | null;

  // ── Favorites Actions ──
  addFavorite: (doctor: Doctor) => void;
  removeFavorite: (doctorId: number) => void;
  toggleFavorite: (doctor: Doctor) => void;
  isFavorite: (doctorId: number) => boolean;
  clearFavorites: () => void;

  // ── Cart Actions ──
  addToCart: (pkg: MedicalPackage) => void;
  removeFromCart: (pkgId: number) => void;
  updateQuantity: (pkgId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;

  // ── Booking Actions ──
  setPendingBooking: (booking: BookingSlot | null) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMedicalStore = create<MedicalState>()(
  persist(
    (set, get) => ({
      favoriteDoctors: [],
      cart: [],
      pendingBooking: null,

      // ── Favorites ──────────────────────────────────────────────────────────

      addFavorite: (doctor) =>
        set((state) => {
          if (state.favoriteDoctors.some((d) => d.id === doctor.id))
            return state;
          return { favoriteDoctors: [...state.favoriteDoctors, doctor] };
        }),

      removeFavorite: (doctorId) =>
        set((state) => ({
          favoriteDoctors: state.favoriteDoctors.filter(
            (d) => d.id !== doctorId
          ),
        })),

      toggleFavorite: (doctor) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        isFavorite(doctor.id)
          ? removeFavorite(doctor.id)
          : addFavorite(doctor);
      },

      isFavorite: (doctorId) =>
        get().favoriteDoctors.some((d) => d.id === doctorId),

      clearFavorites: () => set({ favoriteDoctors: [] }),

      // ── Cart ───────────────────────────────────────────────────────────────

      addToCart: (pkg) =>
        set((state) => {
          const existing = state.cart.find((p) => p.id === pkg.id);
          if (existing) {
            return {
              cart: state.cart.map((p) =>
                p.id === pkg.id
                  ? { ...p, quantity: p.quantity + 1 }
                  : p
              ),
            };
          }
          return { cart: [...state.cart, { ...pkg, quantity: 1 }] };
        }),

      removeFromCart: (pkgId) =>
        set((state) => ({
          cart: state.cart.filter((p) => p.id !== pkgId),
        })),

      updateQuantity: (pkgId, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((p) => p.id !== pkgId)
              : state.cart.map((p) =>
                  p.id === pkgId ? { ...p, quantity } : p
                ),
        })),

      clearCart: () => set({ cart: [] }),

      cartTotal: () =>
        get().cart.reduce((sum, p) => sum + p.price * p.quantity, 0),

      cartCount: () =>
        get().cart.reduce((sum, p) => sum + p.quantity, 0),

      // ── Booking ────────────────────────────────────────────────────────────

      setPendingBooking: (booking) => set({ pendingBooking: booking }),
    }),
    {
      name: "telehealth-medical",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        favoriteDoctors: state.favoriteDoctors,
        cart: state.cart,
      }),
    }
  )
);

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectFavoriteDoctors = (s: MedicalState) => s.favoriteDoctors;
export const selectCart = (s: MedicalState) => s.cart;
export const selectCartCount = (s: MedicalState) => s.cartCount();
export const selectCartTotal = (s: MedicalState) => s.cartTotal();
export const selectPendingBooking = (s: MedicalState) => s.pendingBooking;