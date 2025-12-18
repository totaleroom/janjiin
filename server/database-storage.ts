/**
 * Database Storage Implementation with Drizzle ORM
 * 
 * This file provides the actual PostgreSQL database implementation
 * using Drizzle ORM. Replace the MemStorage export in storage.ts
 * when ready for production.
 */

import { eq, and, gte, lte, desc, sql, or } from "drizzle-orm";
import { db } from "./db";
import {
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
    type User,
    type InsertUser,
    type Business,
    type InsertBusiness,
    type OperatingHours,
    type InsertOperatingHours,
    type Service,
    type InsertService,
    type Staff,
    type InsertStaff,
    type Customer,
    type InsertCustomer,
    type Appointment,
    type InsertAppointment,
    type Message,
    type InsertMessage,
    type Subscription,
    type InsertSubscription,
    type Payment,
    type InsertPayment,
    type AppointmentWithDetails,
    type DashboardStats,
    type TimeSlot,
    type BusinessCategory,
    type DayOfWeek,
    type AppointmentStatus,
    type PaymentStatus,
    SERVICE_TEMPLATES,
    DAYS_OF_WEEK,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {

    // ============= USERS =============
    async getUserByEmail(email: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return user;
    }

    async getUserById(id: string): Promise<User | undefined> {
        const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return user;
    }

    async createUser(data: InsertUser): Promise<User> {
        const [user] = await db.insert(users).values(data).returning();
        return user;
    }

    async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
        const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
        return user;
    }

    async updateUserBusinessId(userId: string, businessId: string): Promise<void> {
        await db.update(users).set({ businessId }).where(eq(users.id, userId));
    }

    async setResetToken(email: string, token: string, expiry: Date): Promise<boolean> {
        const result = await db.update(users)
            .set({ resetToken: token, resetTokenExpiry: expiry })
            .where(eq(users.email, email));
        return true;
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
        return db.select().from(users);
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

    async createBusiness(data: InsertBusiness): Promise<Business> {
        const [business] = await db.insert(businesses).values(data).returning();
        return business;
    }

    async updateBusiness(id: string, data: Partial<InsertBusiness>): Promise<Business> {
        const [business] = await db.update(businesses).set(data).where(eq(businesses.id, id)).returning();
        return business;
    }

    async checkSlugAvailable(slug: string): Promise<boolean> {
        const [existing] = await db.select({ id: businesses.id }).from(businesses).where(eq(businesses.slug, slug)).limit(1);
        return !existing;
    }

    async getAllBusinesses(): Promise<Business[]> {
        return db.select().from(businesses);
    }

    async deactivateBusiness(id: string): Promise<void> {
        await db.update(businesses).set({ isActive: false }).where(eq(businesses.id, id));
    }

    // ============= OPERATING HOURS =============
    async getOperatingHours(businessId: string): Promise<OperatingHours[]> {
        return db.select().from(operatingHours).where(eq(operatingHours.businessId, businessId));
    }

    async createOperatingHours(data: InsertOperatingHours): Promise<OperatingHours> {
        const [hours] = await db.insert(operatingHours).values(data).returning();
        return hours;
    }

    async updateOperatingHours(businessId: string, dayOfWeek: DayOfWeek, updates: Partial<InsertOperatingHours>): Promise<OperatingHours> {
        const [hours] = await db.update(operatingHours)
            .set(updates)
            .where(and(
                eq(operatingHours.businessId, businessId),
                eq(operatingHours.dayOfWeek, dayOfWeek)
            ))
            .returning();
        return hours;
    }

    async bulkUpdateOperatingHours(
        businessId: string,
        hoursData: Array<{ dayOfWeek: DayOfWeek; openTime: string; closeTime: string; isClosed?: boolean }>
    ): Promise<OperatingHours[]> {
        const results: OperatingHours[] = [];

        for (const hour of hoursData) {
            const [existing] = await db.select().from(operatingHours)
                .where(and(
                    eq(operatingHours.businessId, businessId),
                    eq(operatingHours.dayOfWeek, hour.dayOfWeek)
                ))
                .limit(1);

            if (existing) {
                const [updated] = await db.update(operatingHours)
                    .set({
                        openTime: hour.openTime,
                        closeTime: hour.closeTime,
                        isClosed: hour.isClosed ?? false,
                    })
                    .where(eq(operatingHours.id, existing.id))
                    .returning();
                results.push(updated);
            } else {
                const [created] = await db.insert(operatingHours)
                    .values({
                        businessId,
                        dayOfWeek: hour.dayOfWeek,
                        openTime: hour.openTime,
                        closeTime: hour.closeTime,
                        isClosed: hour.isClosed ?? false,
                    })
                    .returning();
                results.push(created);
            }
        }

        return results;
    }

    // ============= SERVICES =============
    async getServices(businessId: string): Promise<Service[]> {
        return db.select().from(services).where(eq(services.businessId, businessId));
    }

    async getService(id: string): Promise<Service | undefined> {
        const [service] = await db.select().from(services).where(eq(services.id, id)).limit(1);
        return service;
    }

    async createService(data: InsertService): Promise<Service> {
        const [service] = await db.insert(services).values(data).returning();
        return service;
    }

    async updateService(id: string, data: Partial<InsertService>): Promise<Service> {
        const [service] = await db.update(services).set(data).where(eq(services.id, id)).returning();
        return service;
    }

    async deleteService(id: string): Promise<void> {
        await db.delete(services).where(eq(services.id, id));
    }

    async createServicesFromTemplate(businessId: string, category: BusinessCategory): Promise<Service[]> {
        const templates = SERVICE_TEMPLATES[category] || [];
        const results: Service[] = [];

        for (const template of templates) {
            const [service] = await db.insert(services)
                .values({
                    businessId,
                    name: template.name,
                    description: template.description,
                    duration: template.duration,
                    price: template.price,
                })
                .returning();
            results.push(service);
        }

        return results;
    }

    // ============= STAFF =============
    async getStaff(businessId: string): Promise<Staff[]> {
        return db.select().from(staff).where(eq(staff.businessId, businessId));
    }

    async getStaffMember(id: string): Promise<Staff | undefined> {
        const [member] = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
        return member;
    }

    async createStaff(data: InsertStaff): Promise<Staff> {
        const [member] = await db.insert(staff).values(data).returning();
        return member;
    }

    async updateStaff(id: string, data: Partial<InsertStaff>): Promise<Staff> {
        const [member] = await db.update(staff).set(data).where(eq(staff.id, id)).returning();
        return member;
    }

    async deleteStaff(id: string): Promise<void> {
        await db.delete(staff).where(eq(staff.id, id));
    }

    async toggleStaffStatus(id: string): Promise<Staff> {
        const [current] = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
        if (!current) throw new Error("Staff not found");

        const [updated] = await db.update(staff)
            .set({ isActive: !current.isActive })
            .where(eq(staff.id, id))
            .returning();
        return updated;
    }

    // ============= APPOINTMENTS =============
    async getAppointments(businessId: string): Promise<Appointment[]> {
        return db.select().from(appointments).where(eq(appointments.businessId, businessId));
    }

    async getAppointmentsWithDetails(businessId: string): Promise<AppointmentWithDetails[]> {
        const appts = await db.select().from(appointments).where(eq(appointments.businessId, businessId));

        const results: AppointmentWithDetails[] = [];
        for (const apt of appts) {
            const [service] = await db.select().from(services).where(eq(services.id, apt.serviceId)).limit(1);
            const [staffMember] = await db.select().from(staff).where(eq(staff.id, apt.staffId)).limit(1);

            if (service && staffMember) {
                results.push({
                    ...apt,
                    service,
                    staff: staffMember,
                });
            }
        }

        return results;
    }

    async getAppointment(id: string): Promise<Appointment | undefined> {
        const [apt] = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
        return apt;
    }

    async createAppointment(data: InsertAppointment): Promise<Appointment> {
        const [apt] = await db.insert(appointments).values(data).returning();
        return apt;
    }

    async updateAppointmentStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
        const [apt] = await db.update(appointments).set({ status }).where(eq(appointments.id, id)).returning();
        return apt;
    }

    async updateAppointmentPaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Appointment> {
        const [apt] = await db.update(appointments).set({ paymentStatus }).where(eq(appointments.id, id)).returning();
        return apt;
    }

    async requestReschedule(id: string, reason: string): Promise<Appointment> {
        const [apt] = await db.update(appointments)
            .set({
                rescheduleRequestedAt: new Date(),
                rescheduleReason: reason,
            })
            .where(eq(appointments.id, id))
            .returning();
        return apt;
    }

    async suggestRescheduleSlot(id: string, suggestedSlot: Date, message?: string): Promise<Appointment> {
        const [apt] = await db.update(appointments)
            .set({
                suggestedSlot,
                suggestedSlotMessage: message || null,
            })
            .where(eq(appointments.id, id))
            .returning();
        return apt;
    }

    async confirmReschedule(id: string, newStartTime: Date, newEndTime: Date): Promise<Appointment> {
        const [apt] = await db.update(appointments)
            .set({
                startTime: newStartTime,
                endTime: newEndTime,
                rescheduleRequestedAt: null,
                rescheduleReason: null,
                suggestedSlot: null,
                suggestedSlotMessage: null,
                status: "confirmed" as AppointmentStatus,
            })
            .where(eq(appointments.id, id))
            .returning();
        return apt;
    }

    async getAppointmentsByDate(businessId: string, date: Date): Promise<AppointmentWithDetails[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const appts = await db.select().from(appointments)
            .where(and(
                eq(appointments.businessId, businessId),
                gte(appointments.startTime, startOfDay),
                lte(appointments.startTime, endOfDay)
            ));

        const results: AppointmentWithDetails[] = [];
        for (const apt of appts) {
            const [service] = await db.select().from(services).where(eq(services.id, apt.serviceId)).limit(1);
            const [staffMember] = await db.select().from(staff).where(eq(staff.id, apt.staffId)).limit(1);

            if (service && staffMember) {
                results.push({
                    ...apt,
                    service,
                    staff: staffMember,
                });
            }
        }

        return results;
    }

    // ============= CUSTOMERS =============
    async getCustomer(id: string): Promise<Customer | undefined> {
        const [customer] = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
        return customer;
    }

    async getCustomerByPhone(businessId: string, phone: string): Promise<Customer | undefined> {
        const [customer] = await db.select().from(customers)
            .where(and(
                eq(customers.businessId, businessId),
                eq(customers.phone, phone)
            ))
            .limit(1);
        return customer;
    }

    async createCustomer(data: InsertCustomer): Promise<Customer> {
        const [customer] = await db.insert(customers).values(data).returning();
        return customer;
    }

    async getCustomersByBusiness(businessId: string): Promise<Customer[]> {
        return db.select().from(customers).where(eq(customers.businessId, businessId));
    }

    // ============= MESSAGES =============
    async getMessages(businessId: string, appointmentId?: string): Promise<Message[]> {
        if (appointmentId) {
            return db.select().from(messages)
                .where(and(
                    eq(messages.businessId, businessId),
                    eq(messages.appointmentId, appointmentId)
                ))
                .orderBy(messages.createdAt);
        }
        return db.select().from(messages)
            .where(eq(messages.businessId, businessId))
            .orderBy(messages.createdAt);
    }

    async createMessage(data: InsertMessage): Promise<Message> {
        const [message] = await db.insert(messages).values(data).returning();
        return message;
    }

    async markMessagesAsRead(messageIds: string[]): Promise<void> {
        for (const id of messageIds) {
            await db.update(messages).set({ isRead: true }).where(eq(messages.id, id));
        }
    }

    async getUnreadMessageCount(businessId: string): Promise<number> {
        const result = await db.select({ count: sql<number>`count(*)` })
            .from(messages)
            .where(and(
                eq(messages.businessId, businessId),
                eq(messages.isRead, false)
            ));
        return result[0]?.count || 0;
    }

    // ============= SUBSCRIPTIONS =============
    async getSubscription(businessId: string): Promise<Subscription | undefined> {
        const [sub] = await db.select().from(subscriptions)
            .where(and(
                eq(subscriptions.businessId, businessId),
                eq(subscriptions.status, "active")
            ))
            .orderBy(desc(subscriptions.createdAt))
            .limit(1);
        return sub;
    }

    async createSubscription(data: InsertSubscription): Promise<Subscription> {
        const [sub] = await db.insert(subscriptions).values(data).returning();
        return sub;
    }

    async activateSubscription(id: string): Promise<Subscription> {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        const [sub] = await db.update(subscriptions)
            .set({
                status: "active",
                startDate: new Date(),
                endDate,
            })
            .where(eq(subscriptions.id, id))
            .returning();

        // Also update business tier
        const subscription = await this.getSubscription(sub.businessId);
        if (subscription) {
            await db.update(businesses)
                .set({ subscriptionTier: subscription.tier })
                .where(eq(businesses.id, subscription.businessId));
        }

        return sub;
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

    async createPayment(data: InsertPayment): Promise<Payment> {
        const [payment] = await db.insert(payments).values(data).returning();
        return payment;
    }

    async updatePaymentStatus(orderId: string, status: PaymentStatus, transactionId?: string): Promise<Payment> {
        const updateData: any = { status };
        if (transactionId) {
            updateData.transactionId = transactionId;
        }

        const [payment] = await db.update(payments)
            .set(updateData)
            .where(eq(payments.externalId, orderId))
            .returning();
        return payment;
    }

    async linkPaymentToSubscription(paymentId: string, subscriptionId: string): Promise<void> {
        await db.update(payments).set({ subscriptionId }).where(eq(payments.id, paymentId));
    }

    async getPaymentsByBusiness(businessId: string): Promise<Payment[]> {
        return db.select().from(payments).where(eq(payments.businessId, businessId)).orderBy(desc(payments.createdAt));
    }

    // ============= DASHBOARD =============
    async getDashboardStats(businessId: string): Promise<DashboardStats> {
        const allAppts = await this.getAppointments(businessId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppts = allAppts.filter((a) => {
            const startTime = new Date(a.startTime);
            return startTime >= today && startTime < tomorrow;
        });

        return {
            todayBookings: todayAppts.length,
            pendingBookings: allAppts.filter((a) => a.status === "pending").length,
            completedToday: todayAppts.filter((a) => a.status === "completed").length,
            estimatedRevenue: todayAppts.reduce((sum, a) => sum + a.totalPrice, 0),
        };
    }

    // ============= AVAILABILITY =============
    async getAvailableSlots(businessId: string, date: string, serviceId: string, staffId?: string): Promise<TimeSlot[]> {
        // Get service duration
        const service = await this.getService(serviceId);
        if (!service) return [];

        // Get operating hours for the day
        const dateObj = new Date(date);
        const dayIndex = dateObj.getDay();
        const dayNames: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const dayOfWeek = dayNames[dayIndex];

        const hours = await this.getOperatingHours(businessId);
        const dayHours = hours.find((h) => h.dayOfWeek === dayOfWeek);

        if (!dayHours || dayHours.isClosed) return [];

        // Get existing appointments
        const appts = await this.getAppointmentsByDate(businessId, dateObj);
        const staffAppts = staffId ? appts.filter((a) => a.staffId === staffId) : appts;

        // Generate slots
        const slots: TimeSlot[] = [];
        const [openHour, openMin] = dayHours.openTime.split(":").map(Number);
        const [closeHour, closeMin] = dayHours.closeTime.split(":").map(Number);

        const slotStart = new Date(date);
        slotStart.setHours(openHour, openMin, 0, 0);

        const businessClose = new Date(date);
        businessClose.setHours(closeHour, closeMin, 0, 0);

        while (slotStart.getTime() + service.duration * 60000 <= businessClose.getTime()) {
            const slotEnd = new Date(slotStart.getTime() + service.duration * 60000);

            const isConflict = staffAppts.some((apt) => {
                const aptStart = new Date(apt.startTime);
                const aptEnd = new Date(apt.endTime);
                return slotStart < aptEnd && slotEnd > aptStart;
            });

            slots.push({
                startTime: slotStart.toISOString(),
                endTime: slotEnd.toISOString(),
                available: !isConflict,
            });

            slotStart.setMinutes(slotStart.getMinutes() + 30);
        }

        return slots;
    }

    // ============= ADMIN =============
    async getAdminStats(): Promise<{ totalBusinesses: number; totalUsers: number; totalAppointments: number; totalRevenue: number }> {
        const [businessCount] = await db.select({ count: sql<number>`count(*)` }).from(businesses);
        const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
        const [aptCount] = await db.select({ count: sql<number>`count(*)` }).from(appointments);
        const [revenueResult] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
            .from(payments)
            .where(eq(payments.status, "paid"));

        return {
            totalBusinesses: businessCount?.count || 0,
            totalUsers: userCount?.count || 0,
            totalAppointments: aptCount?.count || 0,
            totalRevenue: revenueResult?.total || 0,
        };
    }
}
