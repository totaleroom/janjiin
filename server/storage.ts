import { randomUUID } from "crypto";
import {
  type Business,
  type InsertBusiness,
  type Service,
  type InsertService,
  type Staff,
  type InsertStaff,
  type Customer,
  type InsertCustomer,
  type Appointment,
  type InsertAppointment,
  type OperatingHours,
  type InsertOperatingHours,
  type AppointmentWithDetails,
  type DashboardStats,
  type TimeSlot,
  type User,
  type InsertUser,
  type Message,
  type InsertMessage,
  type Subscription,
  type InsertSubscription,
  type Payment,
  type InsertPayment,
  type UserRole,
  type PaymentStatus,
  type AppointmentStatus,
  SERVICE_TEMPLATES,
  type BusinessCategory,
  type DayOfWeek
} from "@shared/schema";

export interface IStorage {
  // Auth / Users
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createUser(data: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User>;
  updateUserBusinessId(userId: string, businessId: string): Promise<void>;
  setResetToken(email: string, token: string, expiry: Date): Promise<boolean>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  clearResetToken(userId: string): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // Businesses
  getBusiness(id: string): Promise<Business | undefined>;
  getBusinessBySlug(slug: string): Promise<Business | undefined>;
  getBusinessByOwnerEmail(email: string): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: string, business: Partial<InsertBusiness>): Promise<Business>;
  checkSlugAvailable(slug: string): Promise<boolean>;
  getAllBusinesses(): Promise<Business[]>;
  deactivateBusiness(id: string): Promise<void>;

  // Operating Hours
  getOperatingHours(businessId: string): Promise<OperatingHours[]>;
  createOperatingHours(hours: InsertOperatingHours): Promise<OperatingHours>;
  updateOperatingHours(businessId: string, dayOfWeek: DayOfWeek, updates: Partial<InsertOperatingHours>): Promise<OperatingHours>;
  bulkUpdateOperatingHours(businessId: string, hours: Array<{ dayOfWeek: DayOfWeek; openTime: string; closeTime: string; isClosed?: boolean }>): Promise<OperatingHours[]>;

  // Services
  getServices(businessId: string): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: string): Promise<void>;
  createServicesFromTemplate(businessId: string, category: BusinessCategory): Promise<Service[]>;

  // Staff
  getStaff(businessId: string): Promise<Staff[]>;
  getStaffMember(id: string): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: string, staff: Partial<InsertStaff>): Promise<Staff>;
  deleteStaff(id: string): Promise<void>;
  toggleStaffStatus(id: string): Promise<Staff>;

  // Appointments
  getAppointments(businessId: string): Promise<Appointment[]>;
  getAppointmentsWithDetails(businessId: string): Promise<AppointmentWithDetails[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
  updateAppointmentPaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Appointment>;
  requestReschedule(id: string, reason: string): Promise<Appointment>;
  suggestRescheduleSlot(id: string, suggestedSlot: Date, message?: string): Promise<Appointment>;
  confirmReschedule(id: string, newStartTime: Date, newEndTime: Date): Promise<Appointment>;
  getAppointmentsByDate(businessId: string, date: Date): Promise<AppointmentWithDetails[]>;

  // Customers
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(businessId: string, phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomersByBusiness(businessId: string): Promise<Customer[]>;

  // Messages
  getMessages(businessId: string, appointmentId?: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(messageIds: string[]): Promise<void>;
  getUnreadMessageCount(businessId: string): Promise<number>;

  // Subscriptions
  getSubscription(businessId: string): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  activateSubscription(id: string): Promise<Subscription>;
  cancelSubscription(id: string): Promise<void>;

  // Payments
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentByOrderId(orderId: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(orderId: string, status: PaymentStatus, transactionId?: string): Promise<Payment>;
  linkPaymentToSubscription(paymentId: string, subscriptionId: string): Promise<void>;
  getPaymentsByBusiness(businessId: string): Promise<Payment[]>;

  // Dashboard
  getDashboardStats(businessId: string): Promise<DashboardStats>;

  // Availability
  getAvailableSlots(businessId: string, date: string, serviceId: string, staffId?: string): Promise<TimeSlot[]>;

  // Admin
  getAdminStats(): Promise<{ totalBusinesses: number; totalUsers: number; totalAppointments: number; totalRevenue: number }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private businesses: Map<string, Business>;
  private operatingHours: Map<string, OperatingHours>;
  private services: Map<string, Service>;
  private staff: Map<string, Staff>;
  private customers: Map<string, Customer>;
  private appointments: Map<string, Appointment>;
  private messages: Map<string, Message>;
  private subscriptions: Map<string, Subscription>;
  private payments: Map<string, Payment>;

  constructor() {
    this.users = new Map();
    this.businesses = new Map();
    this.operatingHours = new Map();
    this.services = new Map();
    this.staff = new Map();
    this.customers = new Map();
    this.appointments = new Map();
    this.messages = new Map();
    this.subscriptions = new Map();
    this.payments = new Map();

    this.seedDemoData();
  }

  private seedDemoData() {
    // Create demo business
    const demoBusinessId = "demo-business-1";
    const demoBusiness: Business = {
      id: demoBusinessId,
      name: "Barbershop Asgar 99",
      slug: "asgar99",
      description: "Ganteng Maksimal dalam 30 menit",
      category: "barbershop",
      ownerEmail: "demo@janji.in",
      ownerName: "Asgar",
      phone: "08123456789",
      address: "Jl. Raya No. 123, Jakarta Selatan",
      logoUrl: null,
      isActive: true,
      subscriptionTier: "pro",
      createdAt: new Date(),
    };
    this.businesses.set(demoBusinessId, demoBusiness);

    // Create demo user with proper User type
    // Password: "demo123" hashed with bcrypt
    const demoUser: User = {
      id: "demo-user",
      email: "demo@janji.in",
      password: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", // "demo123"
      role: "business",
      businessId: demoBusinessId,
      resetToken: null,
      resetTokenExpiry: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set("demo-user", demoUser);

    // Create admin user
    // Password: "admin123" hashed with bcrypt
    const adminUser: User = {
      id: "admin-user",
      email: "admin@janji.in",
      password: "$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", // "admin123"
      role: "admin",
      businessId: null,
      resetToken: null,
      resetTokenExpiry: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set("admin-user", adminUser);

    // Create demo staff
    const staff1: Staff = {
      id: "staff-1",
      businessId: demoBusinessId,
      name: "Budi",
      email: "budi@barbershop.com",
      phone: "08111111111",
      avatarUrl: null,
      isActive: true,
    };
    const staff2: Staff = {
      id: "staff-2",
      businessId: demoBusinessId,
      name: "Anto",
      email: "anto@barbershop.com",
      phone: "08222222222",
      avatarUrl: null,
      isActive: true,
    };
    this.staff.set(staff1.id, staff1);
    this.staff.set(staff2.id, staff2);

    // Create demo services
    const services = SERVICE_TEMPLATES.barbershop.map((template, index) => ({
      id: `service-${index + 1}`,
      businessId: demoBusinessId,
      name: template.name,
      description: template.description,
      duration: template.duration,
      price: template.price,
      isActive: true,
    }));
    services.forEach((s) => this.services.set(s.id, s));

    // Create operating hours
    const days: DayOfWeek[] = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    days.forEach((day, index) => {
      const oh: OperatingHours = {
        id: `oh-${index}`,
        businessId: demoBusinessId,
        dayOfWeek: day,
        openTime: "09:00",
        closeTime: "21:00",
        isClosed: false,
      };
      this.operatingHours.set(oh.id, oh);
    });

    // Add Sunday as closed
    const sundayOh: OperatingHours = {
      id: "oh-6",
      businessId: demoBusinessId,
      dayOfWeek: "sunday",
      openTime: "09:00",
      closeTime: "21:00",
      isClosed: true,
    };
    this.operatingHours.set(sundayOh.id, sundayOh);

    // Create sample appointments
    const now = new Date();
    const appointments: Appointment[] = [
      {
        id: "apt-1",
        businessId: demoBusinessId,
        serviceId: "service-1",
        staffId: "staff-1",
        customerId: null,
        customerName: "Pak Eko",
        customerPhone: "08333333333",
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 45),
        status: "confirmed",
        notes: null,
        totalPrice: 50000,
        depositPaid: 0,
        paymentStatus: "unpaid",
        rescheduleRequestedAt: null,
        rescheduleReason: null,
        suggestedSlot: null,
        suggestedSlotMessage: null,
        paymentIntentId: null,
        createdAt: new Date(),
      },
      {
        id: "apt-2",
        businessId: demoBusinessId,
        serviceId: "service-2",
        staffId: "staff-2",
        customerId: null,
        customerName: "Mas Tono",
        customerPhone: "08444444444",
        startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0),
        endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 30),
        status: "pending",
        notes: null,
        totalPrice: 35000,
        depositPaid: 0,
        paymentStatus: "unpaid",
        rescheduleRequestedAt: null,
        rescheduleReason: null,
        suggestedSlot: null,
        suggestedSlotMessage: null,
        paymentIntentId: null,
        createdAt: new Date(),
      },
    ];
    appointments.forEach((a) => this.appointments.set(a.id, a));
  }

  // ============= AUTH / USERS =============
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(data: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      email: data.email,
      password: data.password,
      role: data.role || "business",
      businessId: data.businessId || null,
      resetToken: null,
      resetTokenExpiry: null,
      isActive: true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async updateUserBusinessId(userId: string, businessId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.businessId = businessId;
      this.users.set(userId, user);
    }
  }

  async setResetToken(email: string, token: string, expiry: Date): Promise<boolean> {
    const user = await this.getUserByEmail(email);
    if (!user) return false;
    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    this.users.set(user.id, user);
    return true;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (u) => u.resetToken === token && u.resetTokenExpiry && u.resetTokenExpiry > new Date()
    );
  }

  async clearResetToken(userId: string): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.resetToken = null;
      user.resetTokenExpiry = null;
      this.users.set(userId, user);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // ============= BUSINESSES =============
  async getBusiness(id: string): Promise<Business | undefined> {
    return this.businesses.get(id);
  }

  async getBusinessBySlug(slug: string): Promise<Business | undefined> {
    return Array.from(this.businesses.values()).find((b) => b.slug === slug);
  }

  async getBusinessByOwnerEmail(email: string): Promise<Business | undefined> {
    return Array.from(this.businesses.values()).find((b) => b.ownerEmail === email);
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const id = randomUUID();
    const newBusiness: Business = {
      id,
      name: business.name,
      slug: business.slug,
      description: business.description || null,
      category: business.category,
      ownerEmail: business.ownerEmail,
      ownerName: business.ownerName,
      phone: business.phone || null,
      address: business.address || null,
      logoUrl: business.logoUrl || null,
      isActive: business.isActive ?? true,
      subscriptionTier: business.subscriptionTier ?? "free",
      createdAt: new Date(),
    };
    this.businesses.set(id, newBusiness);
    return newBusiness;
  }

  async updateBusiness(id: string, updates: Partial<InsertBusiness>): Promise<Business> {
    const business = this.businesses.get(id);
    if (!business) throw new Error("Business not found");
    const updated = { ...business, ...updates };
    this.businesses.set(id, updated);
    return updated;
  }

  async checkSlugAvailable(slug: string): Promise<boolean> {
    return !Array.from(this.businesses.values()).some((b) => b.slug === slug);
  }

  async getAllBusinesses(): Promise<Business[]> {
    return Array.from(this.businesses.values());
  }

  async deactivateBusiness(id: string): Promise<void> {
    const business = this.businesses.get(id);
    if (business) {
      business.isActive = false;
      this.businesses.set(id, business);
    }
  }

  // ============= OPERATING HOURS =============
  async getOperatingHours(businessId: string): Promise<OperatingHours[]> {
    return Array.from(this.operatingHours.values()).filter((oh) => oh.businessId === businessId);
  }

  async createOperatingHours(hours: InsertOperatingHours): Promise<OperatingHours> {
    const id = randomUUID();
    const oh: OperatingHours = {
      id,
      businessId: hours.businessId,
      dayOfWeek: hours.dayOfWeek,
      openTime: hours.openTime,
      closeTime: hours.closeTime,
      isClosed: hours.isClosed ?? false,
    };
    this.operatingHours.set(id, oh);
    return oh;
  }

  async updateOperatingHours(businessId: string, dayOfWeek: DayOfWeek, updates: Partial<InsertOperatingHours>): Promise<OperatingHours> {
    const existing = Array.from(this.operatingHours.values()).find(
      (oh) => oh.businessId === businessId && oh.dayOfWeek === dayOfWeek
    );
    if (!existing) throw new Error("Operating hours not found");
    const updated: OperatingHours = { ...existing, ...updates };
    this.operatingHours.set(existing.id, updated);
    return updated;
  }

  async bulkUpdateOperatingHours(
    businessId: string,
    hours: Array<{ dayOfWeek: DayOfWeek; openTime: string; closeTime: string; isClosed?: boolean }>
  ): Promise<OperatingHours[]> {
    const results: OperatingHours[] = [];
    for (const h of hours) {
      const updated = await this.updateOperatingHours(businessId, h.dayOfWeek, {
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
      });
      results.push(updated);
    }
    return results;
  }

  // ============= SERVICES =============
  async getServices(businessId: string): Promise<Service[]> {
    return Array.from(this.services.values()).filter((s) => s.businessId === businessId && s.isActive);
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(service: InsertService): Promise<Service> {
    const id = randomUUID();
    const newService: Service = {
      id,
      businessId: service.businessId,
      name: service.name,
      description: service.description || null,
      duration: service.duration,
      price: service.price,
      isActive: service.isActive ?? true,
    };
    this.services.set(id, newService);
    return newService;
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service> {
    const service = this.services.get(id);
    if (!service) throw new Error("Service not found");
    const updated = { ...service, ...updates };
    this.services.set(id, updated);
    return updated;
  }

  async deleteService(id: string): Promise<void> {
    const service = this.services.get(id);
    if (service) {
      service.isActive = false;
      this.services.set(id, service);
    }
  }

  async createServicesFromTemplate(businessId: string, category: BusinessCategory): Promise<Service[]> {
    const templates = SERVICE_TEMPLATES[category] || [];
    const services: Service[] = [];
    for (const template of templates) {
      const service = await this.createService({
        businessId,
        name: template.name,
        description: template.description,
        duration: template.duration,
        price: template.price,
      });
      services.push(service);
    }
    return services;
  }

  // ============= STAFF =============
  async getStaff(businessId: string): Promise<Staff[]> {
    return Array.from(this.staff.values()).filter((s) => s.businessId === businessId && s.isActive);
  }

  async getStaffMember(id: string): Promise<Staff | undefined> {
    return this.staff.get(id);
  }

  async createStaff(staffData: InsertStaff): Promise<Staff> {
    const id = randomUUID();
    const newStaff: Staff = {
      id,
      businessId: staffData.businessId,
      name: staffData.name,
      email: staffData.email || null,
      phone: staffData.phone || null,
      avatarUrl: staffData.avatarUrl || null,
      isActive: staffData.isActive ?? true,
    };
    this.staff.set(id, newStaff);
    return newStaff;
  }

  async updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff> {
    const staffMember = this.staff.get(id);
    if (!staffMember) throw new Error("Staff not found");
    const updated = { ...staffMember, ...updates };
    this.staff.set(id, updated);
    return updated;
  }

  async deleteStaff(id: string): Promise<void> {
    const staffMember = this.staff.get(id);
    if (staffMember) {
      staffMember.isActive = false;
      this.staff.set(id, staffMember);
    }
  }

  async toggleStaffStatus(id: string): Promise<Staff> {
    const staffMember = this.staff.get(id);
    if (!staffMember) throw new Error("Staff not found");
    staffMember.isActive = !staffMember.isActive;
    this.staff.set(id, staffMember);
    return staffMember;
  }

  // ============= APPOINTMENTS =============
  async getAppointments(businessId: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values())
      .filter((a) => a.businessId === businessId)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  async getAppointmentsWithDetails(businessId: string): Promise<AppointmentWithDetails[]> {
    const appointments = await this.getAppointments(businessId);
    const result: AppointmentWithDetails[] = [];

    for (const apt of appointments) {
      const service = this.services.get(apt.serviceId);
      const staffMember = this.staff.get(apt.staffId);
      if (service && staffMember) {
        result.push({ ...apt, service, staff: staffMember });
      }
    }

    return result;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const newAppointment: Appointment = {
      id,
      businessId: appointment.businessId,
      serviceId: appointment.serviceId,
      staffId: appointment.staffId,
      customerId: appointment.customerId || null,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status ?? "pending",
      notes: appointment.notes || null,
      totalPrice: appointment.totalPrice,
      depositPaid: appointment.depositPaid ?? 0,
      paymentStatus: appointment.paymentStatus ?? "unpaid",
      rescheduleRequestedAt: null,
      rescheduleReason: null,
      suggestedSlot: null,
      suggestedSlotMessage: null,
      paymentIntentId: null,
      createdAt: new Date(),
    };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) throw new Error("Appointment not found");
    appointment.status = status;
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentPaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) throw new Error("Appointment not found");
    appointment.paymentStatus = paymentStatus;
    this.appointments.set(id, appointment);
    return appointment;
  }

  async requestReschedule(id: string, reason: string): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) throw new Error("Appointment not found");
    appointment.rescheduleRequestedAt = new Date();
    appointment.rescheduleReason = reason;
    this.appointments.set(id, appointment);
    return appointment;
  }

  async suggestRescheduleSlot(id: string, suggestedSlot: Date, message?: string): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) throw new Error("Appointment not found");
    appointment.suggestedSlot = suggestedSlot;
    appointment.suggestedSlotMessage = message || null;
    this.appointments.set(id, appointment);
    return appointment;
  }

  async confirmReschedule(id: string, newStartTime: Date, newEndTime: Date): Promise<Appointment> {
    const appointment = this.appointments.get(id);
    if (!appointment) throw new Error("Appointment not found");
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;
    appointment.rescheduleRequestedAt = null;
    appointment.rescheduleReason = null;
    appointment.suggestedSlot = null;
    appointment.suggestedSlotMessage = null;
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getAppointmentsByDate(businessId: string, date: Date): Promise<AppointmentWithDetails[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.getAppointmentsWithDetails(businessId);
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return aptDate >= startOfDay && aptDate <= endOfDay;
    });
  }

  // ============= CUSTOMERS =============
  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async getCustomerByPhone(businessId: string, phone: string): Promise<Customer | undefined> {
    return Array.from(this.customers.values()).find(
      (c) => c.businessId === businessId && c.phone === phone
    );
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const newCustomer: Customer = {
      id,
      businessId: customer.businessId,
      name: customer.name,
      phone: customer.phone,
      email: customer.email || null,
      notes: customer.notes || null,
      createdAt: new Date(),
    };
    this.customers.set(id, newCustomer);
    return newCustomer;
  }

  async getCustomersByBusiness(businessId: string): Promise<Customer[]> {
    return Array.from(this.customers.values()).filter((c) => c.businessId === businessId);
  }

  // ============= MESSAGES =============
  async getMessages(businessId: string, appointmentId?: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.businessId === businessId && (!appointmentId || m.appointmentId === appointmentId))
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const newMessage: Message = {
      id,
      appointmentId: message.appointmentId || null,
      businessId: message.businessId,
      senderId: message.senderId,
      senderRole: message.senderRole,
      senderName: message.senderName,
      content: message.content,
      isRead: false,
      createdAt: new Date(),
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async markMessagesAsRead(messageIds: string[]): Promise<void> {
    for (const id of messageIds) {
      const message = this.messages.get(id);
      if (message) {
        message.isRead = true;
        this.messages.set(id, message);
      }
    }
  }

  async getUnreadMessageCount(businessId: string): Promise<number> {
    return Array.from(this.messages.values()).filter(
      (m) => m.businessId === businessId && !m.isRead
    ).length;
  }

  // ============= SUBSCRIPTIONS =============
  async getSubscription(businessId: string): Promise<Subscription | undefined> {
    return Array.from(this.subscriptions.values())
      .filter((s) => s.businessId === businessId && s.status === "active")
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = randomUUID();
    const newSubscription: Subscription = {
      id,
      businessId: subscription.businessId,
      tier: subscription.tier,
      startDate: subscription.startDate,
      endDate: subscription.endDate || null,
      paymentId: subscription.paymentId || null,
      amount: subscription.amount || null,
      status: subscription.status ?? "pending",
      createdAt: new Date(),
    };
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async activateSubscription(id: string): Promise<Subscription> {
    const subscription = this.subscriptions.get(id);
    if (!subscription) throw new Error("Subscription not found");

    subscription.status = "active";
    subscription.startDate = new Date();
    // Set end date to 30 days from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    subscription.endDate = endDate;

    // Update business tier
    const business = this.businesses.get(subscription.businessId);
    if (business) {
      business.subscriptionTier = subscription.tier;
      this.businesses.set(business.id, business);
    }

    this.subscriptions.set(id, subscription);
    return subscription;
  }

  async cancelSubscription(id: string): Promise<void> {
    const subscription = this.subscriptions.get(id);
    if (subscription) {
      subscription.status = "cancelled";
      this.subscriptions.set(id, subscription);
    }
  }

  // ============= PAYMENTS =============
  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentByOrderId(orderId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find((p) => p.externalId === orderId);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const newPayment: Payment = {
      id,
      businessId: payment.businessId,
      appointmentId: payment.appointmentId || null,
      subscriptionId: payment.subscriptionId || null,
      amount: payment.amount,
      currency: payment.currency ?? "IDR",
      status: payment.status ?? "pending",
      paymentMethod: payment.paymentMethod || null,
      paymentGateway: payment.paymentGateway ?? "midtrans",
      externalId: payment.externalId || null,
      paidAt: null,
      metadata: payment.metadata || null,
      createdAt: new Date(),
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async updatePaymentStatus(orderId: string, status: PaymentStatus, transactionId?: string): Promise<Payment> {
    const payment = await this.getPaymentByOrderId(orderId);
    if (!payment) throw new Error("Payment not found");
    payment.status = status;
    if (status === "paid") {
      payment.paidAt = new Date();
    }
    if (transactionId) {
      payment.externalId = transactionId;
    }
    this.payments.set(payment.id, payment);
    return payment;
  }

  async linkPaymentToSubscription(paymentId: string, subscriptionId: string): Promise<void> {
    const payment = this.payments.get(paymentId);
    if (payment) {
      payment.subscriptionId = subscriptionId;
      this.payments.set(paymentId, payment);
    }
  }

  async getPaymentsByBusiness(businessId: string): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter((p) => p.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  // ============= DASHBOARD =============
  async getDashboardStats(businessId: string): Promise<DashboardStats> {
    const appointments = await this.getAppointments(businessId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = appointments.filter((a) => {
      const aptDate = new Date(a.startTime);
      return aptDate >= today && aptDate < tomorrow;
    });

    return {
      todayBookings: todayAppointments.length,
      pendingBookings: todayAppointments.filter((a) => a.status === "pending").length,
      completedToday: todayAppointments.filter((a) => a.status === "completed").length,
      estimatedRevenue: todayAppointments
        .filter((a) => a.status !== "cancelled")
        .reduce((sum, a) => sum + a.totalPrice, 0),
    };
  }

  // ============= AVAILABILITY =============
  async getAvailableSlots(
    businessId: string,
    date: string,
    serviceId: string,
    staffId?: string
  ): Promise<TimeSlot[]> {
    const service = await this.getService(serviceId);
    if (!service) return [];

    const dateObj = new Date(date);
    const dayIndex = dateObj.getDay();
    const dayNames: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayOfWeek = dayNames[dayIndex];

    const operatingHrs = (await this.getOperatingHours(businessId)).find(
      (oh) => oh.dayOfWeek === dayOfWeek && !oh.isClosed
    );

    if (!operatingHrs) return [];

    const slots: TimeSlot[] = [];
    const [openHour, openMin] = operatingHrs.openTime.split(":").map(Number);
    const [closeHour, closeMin] = operatingHrs.closeTime.split(":").map(Number);

    let currentMinutes = openHour * 60 + openMin;
    const endMinutes = closeHour * 60 + closeMin - service.duration;

    const appointments = await this.getAppointments(businessId);
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const dayAppointments = appointments.filter((a) => {
      const aptDate = new Date(a.startTime);
      return aptDate >= dateStart && aptDate <= dateEnd && a.status !== "cancelled";
    });

    while (currentMinutes <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      const timeString = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

      const slotStart = new Date(date);
      slotStart.setHours(hours, mins, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + service.duration);

      const isBooked = dayAppointments.some((apt) => {
        if (staffId && apt.staffId !== staffId) return false;
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime);
        return (slotStart < aptEnd && slotEnd > aptStart);
      });

      // Skip past times for today
      const now = new Date();
      const isPast = slotStart < now;

      slots.push({
        time: timeString,
        available: !isBooked && !isPast,
      });

      currentMinutes += 30; // 30 min intervals
    }

    return slots;
  }

  // ============= ADMIN =============
  async getAdminStats(): Promise<{ totalBusinesses: number; totalUsers: number; totalAppointments: number; totalRevenue: number }> {
    const totalBusinesses = this.businesses.size;
    const totalUsers = this.users.size;
    const totalAppointments = this.appointments.size;
    const totalRevenue = Array.from(this.payments.values())
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount, 0);

    return { totalBusinesses, totalUsers, totalAppointments, totalRevenue };
  }
}

export const storage = new MemStorage();
