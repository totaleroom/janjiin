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
  type PaymentStatus,
  type AppointmentStatus,
  type UserRole,
  type SubscriptionTier,
  SERVICE_TEMPLATES,
  type BusinessCategory,
  type DayOfWeek,
  users,
  businesses,
  operatingHours,
  services,
  staff,
  customers,
  appointments,
  messages,
  subscriptions,
  payments,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, count, sum, not } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // ============= AUTH / USERS =============
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async createUser(data: InsertUser): Promise<User> {
    const role: UserRole = (data.role as UserRole) || "business";
    const [user] = await db.insert(users).values({
      email: data.email,
      password: data.password,
      role,
      businessId: data.businessId || null,
    }).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const updateData: Record<string, unknown> = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.password !== undefined) updateData.password = data.password;
    if (data.role !== undefined) updateData.role = data.role as UserRole;
    if (data.businessId !== undefined) updateData.businessId = data.businessId;
    if (data.resetToken !== undefined) updateData.resetToken = data.resetToken;
    if (data.resetTokenExpiry !== undefined) updateData.resetTokenExpiry = data.resetTokenExpiry;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  async updateUserBusinessId(userId: string, businessId: string): Promise<void> {
    await db.update(users).set({ businessId }).where(eq(users.id, userId));
  }

  async setResetToken(email: string, token: string, expiry: Date): Promise<boolean> {
    const result = await db.update(users)
      .set({ resetToken: token, resetTokenExpiry: expiry })
      .where(eq(users.email, email))
      .returning();
    return result.length > 0;
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(and(
        eq(users.resetToken, token),
        gte(users.resetTokenExpiry, new Date())
      ))
      .limit(1);
    return user;
  }

  async clearResetToken(userId: string): Promise<void> {
    await db.update(users)
      .set({ resetToken: null, resetTokenExpiry: null })
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // ============= BUSINESSES =============
  async getBusiness(id: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
    return business;
  }

  async getBusinessBySlug(slug: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);
    return business;
  }

  async getBusinessByOwnerEmail(email: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.ownerEmail, email)).limit(1);
    return business;
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const category: BusinessCategory = business.category as BusinessCategory;
    const [newBusiness] = await db.insert(businesses).values({
      name: business.name,
      slug: business.slug,
      description: business.description || null,
      category,
      ownerEmail: business.ownerEmail,
      ownerName: business.ownerName,
      phone: business.phone || null,
      address: business.address || null,
      logoUrl: business.logoUrl || null,
      isActive: business.isActive ?? true,
      subscriptionTier: business.subscriptionTier ?? "free",
    }).returning();
    return newBusiness;
  }

  async updateBusiness(id: string, updates: Partial<InsertBusiness>): Promise<Business> {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.slug !== undefined) updateData.slug = updates.slug;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category as BusinessCategory;
    if (updates.ownerEmail !== undefined) updateData.ownerEmail = updates.ownerEmail;
    if (updates.ownerName !== undefined) updateData.ownerName = updates.ownerName;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.address !== undefined) updateData.address = updates.address;
    if (updates.logoUrl !== undefined) updateData.logoUrl = updates.logoUrl;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
    if (updates.subscriptionTier !== undefined) updateData.subscriptionTier = updates.subscriptionTier;

    const [business] = await db.update(businesses).set(updateData).where(eq(businesses.id, id)).returning();
    if (!business) throw new Error("Business not found");
    return business;
  }

  async checkSlugAvailable(slug: string): Promise<boolean> {
    const [existing] = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);
    return !existing;
  }

  async getAllBusinesses(): Promise<Business[]> {
    return await db.select().from(businesses);
  }

  async deactivateBusiness(id: string): Promise<void> {
    await db.update(businesses).set({ isActive: false }).where(eq(businesses.id, id));
  }

  // ============= OPERATING HOURS =============
  async getOperatingHours(businessId: string): Promise<OperatingHours[]> {
    return await db.select().from(operatingHours).where(eq(operatingHours.businessId, businessId));
  }

  async createOperatingHours(hours: InsertOperatingHours): Promise<OperatingHours> {
    const dayOfWeek: DayOfWeek = hours.dayOfWeek as DayOfWeek;
    const [oh] = await db.insert(operatingHours).values({
      businessId: hours.businessId,
      dayOfWeek,
      openTime: hours.openTime,
      closeTime: hours.closeTime,
      isClosed: hours.isClosed ?? false,
    }).returning();
    return oh;
  }

  async updateOperatingHours(businessId: string, dayOfWeek: DayOfWeek, updates: Partial<InsertOperatingHours>): Promise<OperatingHours> {
    const [existing] = await db.select().from(operatingHours)
      .where(and(
        eq(operatingHours.businessId, businessId),
        eq(operatingHours.dayOfWeek, dayOfWeek)
      ))
      .limit(1);

    if (!existing) {
      return await this.createOperatingHours({
        businessId,
        dayOfWeek,
        openTime: updates.openTime || "09:00",
        closeTime: updates.closeTime || "17:00",
        isClosed: updates.isClosed ?? false,
      });
    }

    const updateData: Record<string, unknown> = {};
    if (updates.openTime !== undefined) updateData.openTime = updates.openTime;
    if (updates.closeTime !== undefined) updateData.closeTime = updates.closeTime;
    if (updates.isClosed !== undefined) updateData.isClosed = updates.isClosed;

    const [updated] = await db.update(operatingHours)
      .set(updateData)
      .where(and(
        eq(operatingHours.businessId, businessId),
        eq(operatingHours.dayOfWeek, dayOfWeek)
      ))
      .returning();
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
    return await db.select().from(services)
      .where(and(eq(services.businessId, businessId), eq(services.isActive, true)));
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values({
      businessId: service.businessId,
      name: service.name,
      description: service.description || null,
      duration: service.duration,
      price: service.price,
      isActive: service.isActive ?? true,
    }).returning();
    return newService;
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service> {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

    const [service] = await db.update(services).set(updateData).where(eq(services.id, id)).returning();
    if (!service) throw new Error("Service not found");
    return service;
  }

  async deleteService(id: string): Promise<void> {
    await db.update(services).set({ isActive: false }).where(eq(services.id, id));
  }

  async createServicesFromTemplate(businessId: string, category: BusinessCategory): Promise<Service[]> {
    const templates = SERVICE_TEMPLATES[category] || [];
    const createdServices: Service[] = [];
    for (const template of templates) {
      const service = await this.createService({
        businessId,
        name: template.name,
        description: template.description,
        duration: template.duration,
        price: template.price,
      });
      createdServices.push(service);
    }
    return createdServices;
  }

  // ============= STAFF =============
  async getStaff(businessId: string): Promise<Staff[]> {
    return await db.select().from(staff)
      .where(and(eq(staff.businessId, businessId), eq(staff.isActive, true)));
  }

  async getStaffMember(id: string): Promise<Staff | undefined> {
    const [member] = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
    return member;
  }

  async createStaff(staffData: InsertStaff): Promise<Staff> {
    const [newStaff] = await db.insert(staff).values({
      businessId: staffData.businessId,
      name: staffData.name,
      email: staffData.email || null,
      phone: staffData.phone || null,
      avatarUrl: staffData.avatarUrl || null,
      isActive: staffData.isActive ?? true,
    }).returning();
    return newStaff;
  }

  async updateStaff(id: string, updates: Partial<InsertStaff>): Promise<Staff> {
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.avatarUrl !== undefined) updateData.avatarUrl = updates.avatarUrl;
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive;

    const [staffMember] = await db.update(staff).set(updateData).where(eq(staff.id, id)).returning();
    if (!staffMember) throw new Error("Staff not found");
    return staffMember;
  }

  async deleteStaff(id: string): Promise<void> {
    await db.update(staff).set({ isActive: false }).where(eq(staff.id, id));
  }

  async toggleStaffStatus(id: string): Promise<Staff> {
    const [existing] = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
    if (!existing) throw new Error("Staff not found");
    const [updated] = await db.update(staff)
      .set({ isActive: !existing.isActive })
      .where(eq(staff.id, id))
      .returning();
    return updated;
  }

  // ============= APPOINTMENTS =============
  async getAppointments(businessId: string): Promise<Appointment[]> {
    return await db.select().from(appointments)
      .where(eq(appointments.businessId, businessId))
      .orderBy(asc(appointments.startTime));
  }

  async getAppointmentsWithDetails(businessId: string): Promise<AppointmentWithDetails[]> {
    const result = await db.select({
      appointment: appointments,
      service: services,
      staffMember: staff,
    })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .innerJoin(staff, eq(appointments.staffId, staff.id))
      .where(eq(appointments.businessId, businessId))
      .orderBy(asc(appointments.startTime));

    return result.map(row => ({
      ...row.appointment,
      service: row.service,
      staff: row.staffMember,
    }));
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    return appointment;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const status: AppointmentStatus = (appointment.status as AppointmentStatus) ?? "pending";
    const paymentStatus: PaymentStatus = (appointment.paymentStatus as PaymentStatus) ?? "unpaid";
    const [newAppointment] = await db.insert(appointments).values({
      businessId: appointment.businessId,
      serviceId: appointment.serviceId,
      staffId: appointment.staffId,
      customerId: appointment.customerId || null,
      customerName: appointment.customerName,
      customerPhone: appointment.customerPhone,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status,
      notes: appointment.notes || null,
      totalPrice: appointment.totalPrice,
      depositPaid: appointment.depositPaid ?? 0,
      paymentStatus,
    }).returning();
    return newAppointment;
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const [appointment] = await db.update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    if (!appointment) throw new Error("Appointment not found");
    return appointment;
  }

  async updateAppointmentPaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Appointment> {
    const [appointment] = await db.update(appointments)
      .set({ paymentStatus })
      .where(eq(appointments.id, id))
      .returning();
    if (!appointment) throw new Error("Appointment not found");
    return appointment;
  }

  async requestReschedule(id: string, reason: string): Promise<Appointment> {
    const [appointment] = await db.update(appointments)
      .set({ rescheduleRequestedAt: new Date(), rescheduleReason: reason })
      .where(eq(appointments.id, id))
      .returning();
    if (!appointment) throw new Error("Appointment not found");
    return appointment;
  }

  async suggestRescheduleSlot(id: string, suggestedSlot: Date, message?: string): Promise<Appointment> {
    const [appointment] = await db.update(appointments)
      .set({ suggestedSlot, suggestedSlotMessage: message || null })
      .where(eq(appointments.id, id))
      .returning();
    if (!appointment) throw new Error("Appointment not found");
    return appointment;
  }

  async confirmReschedule(id: string, newStartTime: Date, newEndTime: Date): Promise<Appointment> {
    const [appointment] = await db.update(appointments)
      .set({
        startTime: newStartTime,
        endTime: newEndTime,
        rescheduleRequestedAt: null,
        rescheduleReason: null,
        suggestedSlot: null,
        suggestedSlotMessage: null,
      })
      .where(eq(appointments.id, id))
      .returning();
    if (!appointment) throw new Error("Appointment not found");
    return appointment;
  }

  async getAppointmentsByDate(businessId: string, date: Date): Promise<AppointmentWithDetails[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await db.select({
      appointment: appointments,
      service: services,
      staffMember: staff,
    })
      .from(appointments)
      .innerJoin(services, eq(appointments.serviceId, services.id))
      .innerJoin(staff, eq(appointments.staffId, staff.id))
      .where(and(
        eq(appointments.businessId, businessId),
        gte(appointments.startTime, startOfDay),
        lte(appointments.startTime, endOfDay)
      ))
      .orderBy(asc(appointments.startTime));

    return result.map(row => ({
      ...row.appointment,
      service: row.service,
      staff: row.staffMember,
    }));
  }

  // ============= CUSTOMERS =============
  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    return customer;
  }

  async getCustomerByPhone(businessId: string, phone: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers)
      .where(and(eq(customers.businessId, businessId), eq(customers.phone, phone)))
      .limit(1);
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values({
      businessId: customer.businessId,
      name: customer.name,
      phone: customer.phone,
      email: customer.email || null,
      notes: customer.notes || null,
    }).returning();
    return newCustomer;
  }

  async getCustomersByBusiness(businessId: string): Promise<Customer[]> {
    return await db.select().from(customers).where(eq(customers.businessId, businessId));
  }

  // ============= MESSAGES =============
  async getMessages(businessId: string, appointmentId?: string): Promise<Message[]> {
    if (appointmentId) {
      return await db.select().from(messages)
        .where(and(eq(messages.businessId, businessId), eq(messages.appointmentId, appointmentId)))
        .orderBy(asc(messages.createdAt));
    }
    return await db.select().from(messages)
      .where(eq(messages.businessId, businessId))
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const senderRole = message.senderRole as "admin" | "business" | "customer";
    const [newMessage] = await db.insert(messages).values({
      appointmentId: message.appointmentId || null,
      businessId: message.businessId,
      senderId: message.senderId,
      senderRole,
      senderName: message.senderName,
      content: message.content,
      isRead: false,
    }).returning();
    return newMessage;
  }

  async markMessagesAsRead(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return;
    for (const id of messageIds) {
      await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
    }
  }

  async getUnreadMessageCount(businessId: string): Promise<number> {
    const result = await db.select({ count: count() }).from(messages)
      .where(and(eq(messages.businessId, businessId), eq(messages.isRead, false)));
    return result[0]?.count ?? 0;
  }

  // ============= SUBSCRIPTIONS =============
  async getSubscription(businessId: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions)
      .where(and(eq(subscriptions.businessId, businessId), eq(subscriptions.status, "active")))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    return subscription;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const tier: SubscriptionTier = subscription.tier as SubscriptionTier;
    const [newSubscription] = await db.insert(subscriptions).values({
      businessId: subscription.businessId,
      tier,
      startDate: subscription.startDate,
      endDate: subscription.endDate || null,
      paymentId: subscription.paymentId || null,
      amount: subscription.amount || null,
      status: subscription.status ?? "pending",
    }).returning();
    return newSubscription;
  }

  async activateSubscription(id: string): Promise<Subscription> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
    if (!subscription) throw new Error("Subscription not found");

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const [updated] = await db.update(subscriptions)
      .set({ status: "active", startDate: new Date(), endDate })
      .where(eq(subscriptions.id, id))
      .returning();

    await db.update(businesses)
      .set({ subscriptionTier: subscription.tier })
      .where(eq(businesses.id, subscription.businessId));

    return updated;
  }

  async cancelSubscription(id: string): Promise<void> {
    await db.update(subscriptions).set({ status: "cancelled" }).where(eq(subscriptions.id, id));
  }

  // ============= PAYMENTS =============
  async getPayment(id: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return payment;
  }

  async getPaymentByOrderId(orderId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.externalId, orderId)).limit(1);
    return payment;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const status: PaymentStatus = (payment.status as PaymentStatus) ?? "pending";
    const [newPayment] = await db.insert(payments).values({
      businessId: payment.businessId,
      appointmentId: payment.appointmentId || null,
      subscriptionId: payment.subscriptionId || null,
      amount: payment.amount,
      currency: payment.currency ?? "IDR",
      status,
      paymentMethod: payment.paymentMethod || null,
      paymentGateway: payment.paymentGateway ?? "midtrans",
      externalId: payment.externalId || null,
      metadata: payment.metadata || null,
    }).returning();
    return newPayment;
  }

  async updatePaymentStatus(orderId: string, status: PaymentStatus, transactionId?: string): Promise<Payment> {
    const updateData: Record<string, unknown> = { status };
    if (status === "paid") {
      updateData.paidAt = new Date();
    }
    if (transactionId) {
      updateData.externalId = transactionId;
    }
    const [payment] = await db.update(payments)
      .set(updateData)
      .where(eq(payments.externalId, orderId))
      .returning();
    if (!payment) throw new Error("Payment not found");
    return payment;
  }

  async linkPaymentToSubscription(paymentId: string, subscriptionId: string): Promise<void> {
    await db.update(payments).set({ subscriptionId }).where(eq(payments.id, paymentId));
  }

  async getPaymentsByBusiness(businessId: string): Promise<Payment[]> {
    return await db.select().from(payments)
      .where(eq(payments.businessId, businessId))
      .orderBy(desc(payments.createdAt));
  }

  // ============= DASHBOARD =============
  async getDashboardStats(businessId: string): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await db.select().from(appointments)
      .where(and(
        eq(appointments.businessId, businessId),
        gte(appointments.startTime, today),
        lte(appointments.startTime, tomorrow)
      ));

    const pendingCount = todayAppointments.filter(a => a.status === "pending").length;
    const completedCount = todayAppointments.filter(a => a.status === "completed").length;
    const estimatedRevenue = todayAppointments
      .filter(a => a.status !== "cancelled")
      .reduce((sum, a) => sum + a.totalPrice, 0);

    return {
      todayBookings: todayAppointments.length,
      pendingBookings: pendingCount,
      completedToday: completedCount,
      estimatedRevenue,
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

    const operatingHrs = await this.getOperatingHours(businessId);
    const todayHours = operatingHrs.find(oh => oh.dayOfWeek === dayOfWeek && !oh.isClosed);

    if (!todayHours) return [];

    const slots: TimeSlot[] = [];
    const openTime = todayHours.openTime as string;
    const closeTime = todayHours.closeTime as string;
    const [openHour, openMin] = openTime.split(":").map(Number);
    const [closeHour, closeMin] = closeTime.split(":").map(Number);

    let currentMinutes = openHour * 60 + openMin;
    const endMinutes = closeHour * 60 + closeMin - service.duration;

    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const dayAppointments = await db.select().from(appointments)
      .where(and(
        eq(appointments.businessId, businessId),
        gte(appointments.startTime, dateStart),
        lte(appointments.startTime, dateEnd),
        not(eq(appointments.status, "cancelled"))
      ));

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
        return slotStart < aptEnd && slotEnd > aptStart;
      });

      const now = new Date();
      const isPast = slotStart < now;

      slots.push({
        time: timeString,
        available: !isBooked && !isPast,
      });

      currentMinutes += 30;
    }

    return slots;
  }

  // ============= ADMIN =============
  async getAdminStats(): Promise<{ totalBusinesses: number; totalUsers: number; totalAppointments: number; totalRevenue: number }> {
    const [businessCount] = await db.select({ count: count() }).from(businesses);
    const [userCount] = await db.select({ count: count() }).from(users);
    const [appointmentCount] = await db.select({ count: count() }).from(appointments);
    const [revenueResult] = await db.select({ total: sum(payments.amount) }).from(payments)
      .where(eq(payments.status, "paid"));

    return {
      totalBusinesses: businessCount?.count ?? 0,
      totalUsers: userCount?.count ?? 0,
      totalAppointments: appointmentCount?.count ?? 0,
      totalRevenue: Number(revenueResult?.total) || 0,
    };
  }
}

// ============= MEM STORAGE (BACKUP FOR DEVELOPMENT) =============
/*
export class MemStorage implements IStorage {
  // ... The original MemStorage implementation is available in git history
  // Can be restored if needed for development/testing purposes
}
*/

export const storage = new DatabaseStorage();
