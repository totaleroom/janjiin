import { describe, it, expect } from "vitest";
import {
  cn,
  formatPrice,
  formatDateIndonesian,
  formatTime,
  formatDuration,
  generateSlug,
  getTodayString,
  getTomorrowString,
  generateTimeSlots,
  formatWhatsAppLink,
  getStatusVariant,
  getStatusLabel,
} from "../client/src/lib/utils";

describe("utils", () => {
  it("cn merges classes correctly", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("formatPrice formats numbers as IDR", () => {
    expect(formatPrice(50000)).toBe("Rp 50.000");
  });

  it("formatDuration formats minutes", () => {
    expect(formatDuration(45)).toBe("45 menit");
    expect(formatDuration(90)).toBe("1 jam 30 menit");
    expect(formatDuration(60)).toBe("1 jam");
  });

  it("generateSlug creates valid slugs", () => {
    expect(generateSlug("Barbershop Asgar 99")).toBe("barbershop-asgar-99");
    expect(generateSlug("Salon Kecantikan")).toBe("salon-kecantikan");
  });

  it("getTodayString returns YYYY-MM-DD format", () => {
    const today = getTodayString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("getTomorrowString returns tomorrow's date", () => {
    const tomorrow = getTomorrowString();
    expect(tomorrow).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("generateTimeSlots creates 30-min intervals", () => {
    const slots = generateTimeSlots("09:00", "10:00");
    expect(slots).toEqual(["09:00", "09:30"]);
  });

  it("formatWhatsAppLink creates valid WhatsApp URL", () => {
    const link = formatWhatsAppLink("08123456789", "Hello");
    expect(link).toContain("wa.me");
    expect(link).toContain("62123456789");
  });

  it("getStatusVariant returns correct badge variant", () => {
    expect(getStatusVariant("confirmed")).toBe("default");
    expect(getStatusVariant("pending")).toBe("secondary");
    expect(getStatusVariant("cancelled")).toBe("destructive");
  });

  it("getStatusLabel returns Indonesian labels", () => {
    expect(getStatusLabel("confirmed")).toBe("Dikonfirmasi");
    expect(getStatusLabel("pending")).toBe("Menunggu");
    expect(getStatusLabel("cancelled")).toBe("Dibatalkan");
  });
});
