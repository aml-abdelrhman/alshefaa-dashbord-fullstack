// Add this to your types.ts file
export interface AppointmentPayload {
  doctor_id: string | number;
  user_id: string | number;
  appointment_date: string;
  appointment_time: string;
  doctor_name: string;
  doctor_image: string;
  specialty: string;
  type: "Online Consultation" | "Clinic Visit";
  status: "upcoming" | "completed" | "cancelled" | "pending";
  notes?: string;
}