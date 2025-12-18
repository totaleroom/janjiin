import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price to Indonesian Rupiah format
export function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString("id-ID")}`;
}

// Format date to Indonesian format (e.g., "Senin, 17 Des")
export function formatDateIndonesian(date: Date): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  return `${dayName}, ${day} ${month}`;
}

// Format time to 24-hour format (e.g., "14:00")
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

// Format duration in minutes to readable format
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} menit`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} jam`;
  }
  return `${hours} jam ${remainingMinutes} menit`;
}

// Generate slug from business name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Get today's date string in YYYY-MM-DD format
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

// Get tomorrow's date string in YYYY-MM-DD format
export function getTomorrowString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

// Generate time slots for a given start/end time and duration
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  
  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  while (currentMinutes < endMinutes) {
    const hours = Math.floor(currentMinutes / 60);
    const mins = currentMinutes % 60;
    slots.push(`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`);
    currentMinutes += intervalMinutes;
  }
  
  return slots;
}

// Format phone number for WhatsApp link
export function formatWhatsAppLink(phone: string, message: string): string {
  // Remove any non-digit characters except +
  let cleanPhone = phone.replace(/[^\d+]/g, "");
  
  // If starts with 0, replace with +62 (Indonesia)
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "+62" + cleanPhone.slice(1);
  }
  
  // If doesn't start with +, assume Indonesia
  if (!cleanPhone.startsWith("+")) {
    cleanPhone = "+62" + cleanPhone;
  }
  
  return `https://wa.me/${cleanPhone.replace("+", "")}?text=${encodeURIComponent(message)}`;
}

// Status badge variant helper
export function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "confirmed":
      return "default";
    case "pending":
      return "secondary";
    case "cancelled":
      return "destructive";
    case "completed":
      return "outline";
    default:
      return "secondary";
  }
}

// Status label in Indonesian
export function getStatusLabel(status: string): string {
  switch (status) {
    case "confirmed":
      return "Dikonfirmasi";
    case "pending":
      return "Menunggu";
    case "cancelled":
      return "Dibatalkan";
    case "completed":
      return "Selesai";
    default:
      return status;
  }
}
