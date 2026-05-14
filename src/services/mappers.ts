// // src/integrations/mappers.ts
// // ─────────────────────────────────────────────────────────────────────────────
// //  Pure functions that transform raw backend shapes → app domain models.
// //  Keeping these here means api.service.ts stays clean of transformation noise.
// // ─────────────────────────────────────────────────────────────────────────────

// import type {
//   RawUser,
//   Doctor, Patient, MedicalPackage,
// } from "../types";

// // ─── Deterministic "random" using id as seed ─────────────────────────────────
// // Using id ensures the same doctor always has the same rating/experience
// // across renders and sessions (no hydration flicker).
// const seededFloat = (id: number, min: number, max: number, decimals = 1) => {
//   const seed = ((id * 9301 + 49297) % 233280) / 233280;
//   return parseFloat((seed * (max - min) + min).toFixed(decimals));
// };
// const seededInt = (id: number, min: number, max: number) =>
//   Math.floor(seededFloat(id, min, max, 0));
// const seededBool = (id: number, truePct = 0.7) =>
//   seededFloat(id, 0, 1) < truePct;

// // ─── Medical category map ─────────────────────────────────────────────────────
// const CATEGORY_MAP: Record<string, string> = {
//   smartphones:       "Full Body Checkup",
//   laptops:           "Cardiology Package",
//   fragrances:        "Dermatology Package",
//   skincare:          "Skin & Wellness",
//   groceries:         "Nutrition Consultation",
//   "home-decoration": "Mental Health Package",
//   furniture:         "Orthopedic Checkup",
//   tops:              "General Consultation",
//   "womens-dresses":  "Gynecology Package",
//   "womens-shoes":    "Pediatric Package",
//   "mens-shirts":     "Men's Health Package",
//   "mens-shoes":      "Physiotherapy Package",
//   "mens-watches":    "Cardio Monitoring",
//   "womens-watches":  "Hormonal Panel",
//   "womens-bags":     "Lab Test Bundle",
//   "womens-jewellery":"Dental Package",
//   sunglasses:        "Ophthalmology Package",
//   automotive:        "Emergency Package",
//   motorcycle:        "Sports Medicine",
//   lighting:          "Radiology Package",
// };

// // ─── Record type map ──────────────────────────────────────────────────────────
// const RECORD_TYPES = ["lab", "prescription", "diagnosis", "imaging", "surgery"] as const;

// // ─── Mock dates (deterministic) ───────────────────────────────────────────────
// const mockDate = (id: number): string => {
//   const base = new Date("2024-01-01").getTime();
//   const ms   = seededInt(id, 0, 365 * 24 * 60 * 60 * 1000);
//   return new Date(base + ms).toISOString().split("T")[0];
// };

// // ─── Mappers ──────────────────────────────────────────────────────────────────

// export const mapRawUserToDoctor = (u: RawUser): Doctor => ({
//   id:             u.id,
//   firstName:      u.firstName,
//   lastName:       u.lastName,
//   fullName:       `Dr. ${u.firstName} ${u.lastName}`,
//   email:          u.email,
//   phone:          u.phone,
//   image:          u.image || `https://i.pravatar.cc/150?u=${u.id}`,
//   specialization: u.specialty || "General Medicine",
//   hospital:       u.hospital || "Al-Shefaa Hospital",
//   department:     u.department || "Outpatient Clinic",
//   rating:         u.rating || 4.5,
//   experience:     u.experience || 5,
//   available:      u.available !== undefined ? u.available : true,
//   patientsCount:  u.patientsCount || 100,
//   city:           u.city || "Cairo",
//   country:        u.country || "Egypt",
// });

// export const mapRawUserToPatient = (u: RawUser): Patient => ({
//   id:           u.id,
//   firstName:    u.firstName,
//   lastName:     u.lastName,
//   fullName:     `${u.firstName} ${u.lastName}`, // افتراض أنهم مرضى
//   email:        u.email,
//   phone:        u.phone,
//   image:        `https://i.pravatar.cc/150?img=${u.id + 20}`, // صورة وهمية
//   age:          seededInt(u.id, 18, 70), // عمر وهمي
//   gender:       seededBool(u.id, 0.5) ? "male" : "female", // جنس وهمي
//   bloodGroup:   ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"][seededInt(u.id, 0, 7)], // فصيلة دم وهمية
//   city:         `City ${seededInt(u.id, 1, 10)}`, // مدينة وهمية
//   registeredAt: mockDate(u.id), // تاريخ تسجيل وهمي
// });

// // تم حذف mapRawProductToPackage لأن الباقات ستكون متوافقة مباشرة مع MedicalPackage
// // export const mapRawProductToPackage = (p: RawProduct): MedicalPackage => ({
// //   id:                 p.id,
// //   title:              p.title,
// //   description:        p.description,
// //   price:              p.price,
// //   discountPercentage: p.discountPercentage ?? 0,
// //   rating:             p.rating,
// //   stock:              p.stock,
// //   thumbnail:          p.thumbnail,
// //   category:           CATEGORY_MAP[p.category] ?? "Medical Package",
// //   originalCategory:   p.category,
// //   quantity:           0,
// // });

// // تم حذف mapRawPostToRecord لأنها كانت تعتمد على DummyJSON Posts