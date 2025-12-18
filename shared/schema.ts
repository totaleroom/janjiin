import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, time, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles
export const USER_ROLES = ["admin", "business", "customer"] as const;
export type UserRole = typeof USER_ROLES[number];

// Subscription tiers
export const SUBSCRIPTION_TIERS = ["free", "pro", "business"] as const;
export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[number];

// Payment statuses
export const PAYMENT_STATUSES = ["unpaid", "pending", "paid", "refunded", "failed"] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

// ============= USERS =============
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // bcrypt hashed
  role: text("role").notNull().$type<UserRole>().default("business"),
  businessId: varchar("business_id"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Business categories
export const BUSINESS_CATEGORIES = ["barbershop", "salon", "dental", "spa", "gym", "auto", "tutor", "photo", "laundry", "other"] as const;
export type BusinessCategory = typeof BUSINESS_CATEGORIES[number];

// Appointment statuses
export const APPOINTMENT_STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;
export type AppointmentStatus = typeof APPOINTMENT_STATUSES[number];

// Days of week
export const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];

// ============= BUSINESSES =============
export const businesses = pgTable("businesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  category: text("category").notNull().$type<BusinessCategory>(),
  ownerEmail: text("owner_email").notNull(),
  ownerName: text("owner_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true),
  subscriptionTier: text("subscription_tier").default("free"), // free, pro, business
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
});

export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businesses.$inferSelect;

// ============= OPERATING HOURS =============
export const operatingHours = pgTable("operating_hours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  dayOfWeek: text("day_of_week").notNull().$type<DayOfWeek>(),
  openTime: time("open_time").notNull(),
  closeTime: time("close_time").notNull(),
  isClosed: boolean("is_closed").default(false),
});

export const insertOperatingHoursSchema = createInsertSchema(operatingHours).omit({
  id: true,
});

export type InsertOperatingHours = z.infer<typeof insertOperatingHoursSchema>;
export type OperatingHours = typeof operatingHours.$inferSelect;

// ============= SERVICES =============
export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price").notNull(), // in IDR (smallest unit)
  isActive: boolean("is_active").default(true),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// ============= STAFF =============
export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").default(true),
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
});

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;

// ============= STAFF-SERVICE ASSIGNMENTS =============
export const staffServices = pgTable("staff_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").notNull().references(() => staff.id),
  serviceId: varchar("service_id").notNull().references(() => services.id),
});

export const insertStaffServiceSchema = createInsertSchema(staffServices).omit({
  id: true,
});

export type InsertStaffService = z.infer<typeof insertStaffServiceSchema>;
export type StaffService = typeof staffServices.$inferSelect;

// ============= CUSTOMERS =============
export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  name: text("name").notNull(),
  phone: text("phone").notNull(), // WhatsApp number
  email: text("email"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;

// ============= APPOINTMENTS =============
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  serviceId: varchar("service_id").notNull().references(() => services.id),
  staffId: varchar("staff_id").notNull().references(() => staff.id),
  customerId: varchar("customer_id").references(() => customers.id),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: text("status").notNull().$type<AppointmentStatus>().default("pending"),
  notes: text("notes"),
  totalPrice: integer("total_price").notNull(),
  depositPaid: integer("deposit_paid").default(0),
  paymentStatus: text("payment_status").default("unpaid").$type<PaymentStatus>(),
  // Reschedule fields
  rescheduleRequestedAt: timestamp("reschedule_requested_at"),
  rescheduleReason: text("reschedule_reason"),
  suggestedSlot: timestamp("suggested_slot"),
  suggestedSlotMessage: text("suggested_slot_message"),
  // Payment integration
  paymentIntentId: text("payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// ============= VALIDATION SCHEMAS =============

// Business registration form
export const businessRegistrationSchema = z.object({
  name: z.string().min(2, "Nama usaha minimal 2 karakter"),
  slug: z.string().min(3, "Slug minimal 3 karakter").regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  category: z.enum(BUSINESS_CATEGORIES),
  ownerName: z.string().min(2, "Nama pemilik minimal 2 karakter"),
  ownerEmail: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

export type BusinessRegistration = z.infer<typeof businessRegistrationSchema>;

// Service form
export const serviceFormSchema = z.object({
  name: z.string().min(2, "Nama jasa minimal 2 karakter"),
  description: z.string().optional(),
  duration: z.number().min(15, "Durasi minimal 15 menit").max(480, "Durasi maksimal 8 jam"),
  price: z.number().min(0, "Harga tidak boleh negatif"),
});

export type ServiceForm = z.infer<typeof serviceFormSchema>;

// Staff form
export const staffFormSchema = z.object({
  name: z.string().min(2, "Nama staff minimal 2 karakter"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional(),
});

export type StaffForm = z.infer<typeof staffFormSchema>;

// Booking form (customer facing)
export const bookingFormSchema = z.object({
  serviceId: z.string().min(1, "Pilih jasa"),
  staffId: z.string().min(1, "Pilih staff"),
  date: z.string().min(1, "Pilih tanggal"),
  time: z.string().min(1, "Pilih waktu"),
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  customerPhone: z.string().min(10, "Nomor WhatsApp tidak valid").regex(/^[0-9+]+$/, "Nomor tidak valid"),
  notes: z.string().optional(),
});

export type BookingForm = z.infer<typeof bookingFormSchema>;

// ============= HELPER TYPES =============

// For calendar/dashboard views
export type AppointmentWithDetails = Appointment & {
  service: Service;
  staff: Staff;
};

// Time slot for booking
export type TimeSlot = {
  time: string; // HH:mm format
  available: boolean;
};

// Business with related data
export type BusinessWithDetails = Business & {
  services: Service[];
  staff: Staff[];
  operatingHours: OperatingHours[];
};

// Stats for dashboard
export type DashboardStats = {
  todayBookings: number;
  pendingBookings: number;
  estimatedRevenue: number;
  completedToday: number;
};

// Service templates by category
export const SERVICE_TEMPLATES: Record<BusinessCategory, Array<{ name: string; duration: number; price: number; description: string }>> = {
  barbershop: [
    { name: "Gentlemen Cut", duration: 45, price: 50000, description: "Gunting + Keramas + Styling + Pijat Singkat" },
    { name: "Premium Shaving", duration: 30, price: 35000, description: "Cukur Jenggot/Kumis dengan handuk hangat" },
    { name: "Hair Colouring Basic", duration: 60, price: 100000, description: "Hitam / Dark Brown Only" },
  ],
  salon: [
    { name: "Cuci Blow Variasi", duration: 45, price: 60000, description: "Cuci rambut + styling blow" },
    { name: "Creambath Traditional", duration: 60, price: 85000, description: "Pijat kepala & punggung" },
    { name: "Manicure / Pedicure", duration: 60, price: 75000, description: "Perawatan kuku tangan/kaki" },
  ],
  dental: [
    { name: "Konsultasi Dokter", duration: 30, price: 100000, description: "Pemeriksaan awal" },
    { name: "Scaling", duration: 60, price: 350000, description: "Pembersihan karang gigi" },
    { name: "Tambal Gigi", duration: 45, price: 250000, description: "Per lubang gigi (Komposit)" },
  ],
  spa: [
    { name: "Full Body Massage", duration: 90, price: 200000, description: "Pijat seluruh badan" },
    { name: "Facial Treatment", duration: 60, price: 150000, description: "Perawatan wajah lengkap" },
    { name: "Body Scrub", duration: 45, price: 100000, description: "Lulur badan" },
  ],
  gym: [
    { name: "Personal Training", duration: 60, price: 150000, description: "Sesi latihan dengan trainer" },
    { name: "Group Class", duration: 45, price: 50000, description: "Kelas fitness grup" },
    { name: "Assessment", duration: 30, price: 75000, description: "Evaluasi kebugaran" },
  ],
  auto: [
    { name: "Servis Rutin", duration: 60, price: 150000, description: "Ganti oli + cek mesin" },
    { name: "Tune Up", duration: 120, price: 250000, description: "Servis lengkap mesin" },
    { name: "Cuci Motor/Mobil", duration: 30, price: 35000, description: "Cuci exterior + interior" },
  ],
  tutor: [
    { name: "Private Lesson", duration: 90, price: 100000, description: "Belajar privat 1-on-1" },
    { name: "Group Lesson", duration: 90, price: 75000, description: "Belajar kelompok max 3 orang" },
    { name: "Consultation", duration: 30, price: 50000, description: "Konsultasi materi" },
  ],
  photo: [
    { name: "Studio Portrait", duration: 60, price: 250000, description: "Foto portrait studio" },
    { name: "Product Photo", duration: 45, price: 150000, description: "Foto produk per item" },
    { name: "Event Coverage", duration: 180, price: 1500000, description: "Dokumentasi acara 3 jam" },
  ],
  laundry: [
    { name: "Regular Wash", duration: 1440, price: 7000, description: "Cuci per kg, 1-2 hari" },
    { name: "Express Wash", duration: 360, price: 15000, description: "Cuci per kg, 6 jam" },
    { name: "Dry Clean", duration: 2880, price: 25000, description: "Dry cleaning per item" },
  ],
  other: [],
};

// Category labels in Indonesian
export const CATEGORY_LABELS: Record<BusinessCategory, string> = {
  barbershop: "Barbershop",
  salon: "Salon Kecantikan",
  dental: "Klinik Gigi",
  spa: "Spa & Wellness",
  gym: "Gym & Fitness",
  auto: "Bengkel & Servis",
  tutor: "Les & Kursus",
  photo: "Studio Foto",
  laundry: "Laundry Premium",
  other: "Lainnya",
};

// Category icons (Lucide icon names)
export const CATEGORY_ICONS: Record<BusinessCategory, string> = {
  barbershop: "Scissors",
  salon: "Sparkles",
  dental: "Stethoscope",
  spa: "Flower2",
  gym: "Dumbbell",
  auto: "Wrench",
  tutor: "GraduationCap",
  photo: "Camera",
  laundry: "Shirt",
  other: "MoreHorizontal",
};

// ============= MESSAGES (Chat) =============
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  senderId: varchar("sender_id").notNull(),
  senderRole: text("sender_role").notNull().$type<"admin" | "business" | "customer">(),
  senderName: text("sender_name").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// ============= SUBSCRIPTIONS =============
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  tier: text("tier").notNull().$type<SubscriptionTier>(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  paymentId: text("payment_id"),
  amount: integer("amount"),
  status: text("status").default("active"), // active, cancelled, expired
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// ============= PAYMENTS =============
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull().references(() => businesses.id),
  appointmentId: varchar("appointment_id").references(() => appointments.id),
  subscriptionId: varchar("subscription_id").references(() => subscriptions.id),
  amount: integer("amount").notNull(),
  currency: text("currency").default("IDR"),
  status: text("status").notNull().$type<PaymentStatus>().default("pending"),
  paymentMethod: text("payment_method"),
  paymentGateway: text("payment_gateway").default("midtrans"),
  externalId: text("external_id"), // Gateway transaction ID
  paidAt: timestamp("paid_at"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// ============= ENHANCED VALIDATION SCHEMAS =============

// Phone validation (Indonesia format)
export const phoneSchema = z.string()
  .regex(/^(\+62|62|0)[0-9]{9,12}$/, "Format nomor telepon tidak valid. Gunakan format: +628xxx, 628xxx, atau 08xxx");

// Password validation (with strength requirements)
export const passwordSchema = z.string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Z]/, "Password harus mengandung huruf besar")
  .regex(/[a-z]/, "Password harus mengandung huruf kecil")
  .regex(/[0-9]/, "Password harus mengandung angka");

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token tidak valid"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

// Operating hours update schema
export const operatingHoursUpdateSchema = z.object({
  dayOfWeek: z.enum(DAYS_OF_WEEK),
  openTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu tidak valid (HH:mm)"),
  closeTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format waktu tidak valid (HH:mm)"),
  isClosed: z.boolean().optional(),
}).refine((data) => {
  if (data.isClosed) return true;
  return data.closeTime > data.openTime;
}, {
  message: "Jam tutup harus lebih besar dari jam buka",
  path: ["closeTime"],
});

export const bulkOperatingHoursSchema = z.object({
  hours: z.array(operatingHoursUpdateSchema),
  applyToAll: z.boolean().optional(),
});

// Reschedule schema
export const rescheduleRequestSchema = z.object({
  reason: z.string().min(5, "Alasan minimal 5 karakter"),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
});

export const suggestSlotSchema = z.object({
  suggestedSlot: z.string(), // ISO datetime
  message: z.string().optional(),
});

// Message schema
export const sendMessageSchema = z.object({
  content: z.string().min(1, "Pesan tidak boleh kosong").max(1000, "Pesan maksimal 1000 karakter"),
  appointmentId: z.string().optional(),
});

// Subscription tier limits
export const TIER_LIMITS: Record<SubscriptionTier, { maxStaff: number; maxServices: number; features: string[] }> = {
  free: {
    maxStaff: 2,
    maxServices: 5,
    features: ["basic_booking", "calendar_view"],
  },
  pro: {
    maxStaff: 10,
    maxServices: 20,
    features: ["basic_booking", "calendar_view", "reschedule", "notifications", "analytics"],
  },
  business: {
    maxStaff: -1, // unlimited
    maxServices: -1, // unlimited
    features: ["basic_booking", "calendar_view", "reschedule", "notifications", "analytics", "chat", "payment", "custom_branding"],
  },
};

export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type OperatingHoursUpdate = z.infer<typeof operatingHoursUpdateSchema>;
export type BulkOperatingHours = z.infer<typeof bulkOperatingHoursSchema>;
export type RescheduleRequest = z.infer<typeof rescheduleRequestSchema>;
export type SuggestSlot = z.infer<typeof suggestSlotSchema>;
export type SendMessage = z.infer<typeof sendMessageSchema>;
