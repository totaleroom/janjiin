import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import {
  hashPassword,
  comparePassword,
  generateToken,
  isAuthenticated,
  isAdmin,
  isBusiness,
  validateBusinessOwnership
} from "./auth";
import {
  businessRegistrationSchema,
  serviceFormSchema,
  staffFormSchema,
  bookingFormSchema,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  operatingHoursUpdateSchema,
  bulkOperatingHoursSchema,
  rescheduleRequestSchema,
  suggestSlotSchema,
  sendMessageSchema,
  DAYS_OF_WEEK,
  TIER_LIMITS,
  type SubscriptionTier
} from "@shared/schema";
import { z } from "zod";
import { randomUUID } from "crypto";
import { createSubscriptionPayment, handlePaymentWebhook, generateInvoice, SUBSCRIPTION_PRICES } from "./payment";
import { notifyBusiness } from "./websocket";
import {
  sendBookingConfirmation,
  sendRescheduleRequestNotification,
  sendSlotSuggestionNotification
} from "./notification";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ============= AUTH ROUTES =============

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({
        email: data.email,
        password: hashedPassword,
        role: "business",
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        businessId: user.businessId || undefined,
      });

      res.json({
        user: { id: user.id, email: user.email, role: user.role },
        token
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);

      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      const isValidPassword = await comparePassword(data.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Email atau password salah" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Akun Anda telah dinonaktifkan" });
      }

      // Get business if exists
      const business = await storage.getBusinessByOwnerEmail(data.email);

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        businessId: business?.id || user.businessId || undefined,
      });

      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          businessId: business?.id || user.businessId
        },
        token
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Forgot Password
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const data = forgotPasswordSchema.parse(req.body);

      const resetToken = randomUUID();
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + 1); // Token valid for 1 hour

      const success = await storage.setResetToken(data.email, resetToken, expiry);

      // Always return success to prevent email enumeration
      // In production, send email with reset link here
      console.log(`Reset token for ${data.email}: ${resetToken}`);

      res.json({ message: "Jika email terdaftar, link reset password akan dikirim" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Reset Password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const data = resetPasswordSchema.parse(req.body);

      const user = await storage.getUserByResetToken(data.token);
      if (!user) {
        return res.status(400).json({ message: "Token tidak valid atau expired" });
      }

      const hashedPassword = await hashPassword(data.password);
      await storage.updateUser(user.id, { password: hashedPassword });
      await storage.clearResetToken(user.id);

      res.json({ message: "Password berhasil diubah" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Get current user
  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUserById(req.user!.userId);
      if (!user) {
        return res.status(404).json({ message: "User tidak ditemukan" });
      }

      let business = null;
      if (user.businessId) {
        business = await storage.getBusiness(user.businessId);
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          businessId: user.businessId
        },
        business
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= BUSINESS ROUTES =============

  // Create business (onboarding)
  app.post("/api/businesses", isAuthenticated, async (req, res) => {
    try {
      const { business: businessData, operatingHours } = req.body;

      // Validate business data
      const validatedBusiness = businessRegistrationSchema.parse(businessData);

      // Check slug availability
      const slugAvailable = await storage.checkSlugAvailable(validatedBusiness.slug);
      if (!slugAvailable) {
        return res.status(400).json({ message: "Link booking sudah dipakai" });
      }

      // Create business
      const business = await storage.createBusiness({
        name: validatedBusiness.name,
        slug: validatedBusiness.slug,
        category: validatedBusiness.category,
        ownerName: validatedBusiness.ownerName,
        ownerEmail: validatedBusiness.ownerEmail,
        phone: validatedBusiness.phone,
        address: validatedBusiness.address,
        description: validatedBusiness.description,
      });

      // Link user to business
      await storage.updateUserBusinessId(req.user!.userId, business.id);

      // Create operating hours
      for (const day of DAYS_OF_WEEK) {
        const isClosed = !operatingHours.workDays.includes(day);
        await storage.createOperatingHours({
          businessId: business.id,
          dayOfWeek: day,
          openTime: operatingHours.openTime,
          closeTime: operatingHours.closeTime,
          isClosed,
        });
      }

      // Create default staff (owner)
      await storage.createStaff({
        businessId: business.id,
        name: validatedBusiness.ownerName,
        email: validatedBusiness.ownerEmail,
        phone: validatedBusiness.phone,
      });

      // Create services from template
      await storage.createServicesFromTemplate(business.id, validatedBusiness.category);

      // Create free subscription
      await storage.createSubscription({
        businessId: business.id,
        tier: "free",
        startDate: new Date(),
        status: "active",
      });

      res.json({ business });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Check slug availability
  app.get("/api/businesses/check-slug/:slug", async (req, res) => {
    try {
      const available = await storage.checkSlugAvailable(req.params.slug);
      res.json({ available });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update business
  app.patch("/api/businesses/:businessId", isAuthenticated, validateBusinessOwnership, async (req, res) => {
    try {
      const { businessId } = req.params;
      const updates = req.body;

      const business = await storage.updateBusiness(businessId, updates);
      res.json(business);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= OPERATING HOURS ROUTES =============

  // Get operating hours
  app.get("/api/businesses/:businessId/operating-hours", async (req, res) => {
    try {
      const hours = await storage.getOperatingHours(req.params.businessId);
      res.json(hours);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update operating hours (single day)
  app.patch("/api/businesses/:businessId/operating-hours/:day", isAuthenticated, validateBusinessOwnership, async (req, res) => {
    try {
      const { businessId, day } = req.params;
      const data = operatingHoursUpdateSchema.parse({ ...req.body, dayOfWeek: day });

      const updated = await storage.updateOperatingHours(businessId, data.dayOfWeek, {
        openTime: data.openTime,
        closeTime: data.closeTime,
        isClosed: data.isClosed,
      });

      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Bulk update operating hours
  app.patch("/api/businesses/:businessId/operating-hours", isAuthenticated, validateBusinessOwnership, async (req, res) => {
    try {
      const { businessId } = req.params;
      const data = bulkOperatingHoursSchema.parse(req.body);

      let hoursToUpdate = data.hours;

      // If applyToAll is true, use the first entry's times for all days
      if (data.applyToAll && data.hours.length > 0) {
        const firstEntry = data.hours[0];
        hoursToUpdate = DAYS_OF_WEEK.map((day) => ({
          dayOfWeek: day,
          openTime: firstEntry.openTime,
          closeTime: firstEntry.closeTime,
          isClosed: firstEntry.isClosed,
        }));
      }

      const updated = await storage.bulkUpdateOperatingHours(businessId, hoursToUpdate);
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // ============= DASHBOARD ROUTES =============

  // Get dashboard data
  app.get("/api/dashboard/:businessId", isAuthenticated, validateBusinessOwnership, async (req, res) => {
    try {
      const { businessId } = req.params;

      const business = await storage.getBusiness(businessId);
      if (!business) {
        return res.status(404).json({ message: "Bisnis tidak ditemukan" });
      }

      const [services, staff, appointments, stats, operatingHours, subscription, unreadMessages] = await Promise.all([
        storage.getServices(businessId),
        storage.getStaff(businessId),
        storage.getAppointmentsWithDetails(businessId),
        storage.getDashboardStats(businessId),
        storage.getOperatingHours(businessId),
        storage.getSubscription(businessId),
        storage.getUnreadMessageCount(businessId),
      ]);

      // Get tier limits
      const tier = (business.subscriptionTier || "free") as SubscriptionTier;
      const tierLimits = TIER_LIMITS[tier];

      res.json({
        business,
        services,
        staff,
        appointments,
        stats,
        operatingHours,
        subscription,
        unreadMessages,
        tierLimits,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get appointments by date
  app.get("/api/dashboard/:businessId/appointments/:date", isAuthenticated, validateBusinessOwnership, async (req, res) => {
    try {
      const { businessId, date } = req.params;
      const appointments = await storage.getAppointmentsByDate(businessId, new Date(date));
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= SERVICES ROUTES =============

  // Create service
  app.post("/api/businesses/:businessId/services", isAuthenticated, validateBusinessOwnership, async (req, res) => {
    try {
      const { businessId } = req.params;
      const data = serviceFormSchema.parse(req.body);

      // Check tier limits
      const business = await storage.getBusiness(businessId);
      const tier = (business?.subscriptionTier || "free") as SubscriptionTier;
      const limits = TIER_LIMITS[tier];
      const existingServices = await storage.getServices(businessId);

      if (limits.maxServices !== -1 && existingServices.length >= limits.maxServices) {
        return res.status(403).json({
          message: `Paket ${tier} hanya bisa memiliki maksimal ${limits.maxServices} layanan. Upgrade untuk menambah lebih banyak.`
        });
      }

      const service = await storage.createService({
        businessId,
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
      });

      res.json(service);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update service
  app.patch("/api/services/:id", isAuthenticated, async (req, res) => {
    try {
      const data = serviceFormSchema.parse(req.body);
      const service = await storage.updateService(req.params.id, {
        name: data.name,
        description: data.description,
        duration: data.duration,
        price: data.price,
      });
      res.json(service);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Delete service
  app.delete("/api/services/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteService(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= STAFF ROUTES =============

  // Create staff
  app.post("/api/businesses/:businessId/staff", isAuthenticated, validateBusinessOwnership, async (req, res) => {
    try {
      const { businessId } = req.params;
      const data = staffFormSchema.parse(req.body);

      // Check tier limits
      const business = await storage.getBusiness(businessId);
      const tier = (business?.subscriptionTier || "free") as SubscriptionTier;
      const limits = TIER_LIMITS[tier];
      const existingStaff = await storage.getStaff(businessId);

      if (limits.maxStaff !== -1 && existingStaff.length >= limits.maxStaff) {
        return res.status(403).json({
          message: `Paket ${tier} hanya bisa memiliki maksimal ${limits.maxStaff} staff. Upgrade untuk menambah lebih banyak.`
        });
      }

      const staffMember = await storage.createStaff({
        businessId,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
      });

      res.json(staffMember);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Update staff
  app.patch("/api/staff/:id", isAuthenticated, async (req, res) => {
    try {
      const data = staffFormSchema.parse(req.body);
      const staffMember = await storage.updateStaff(req.params.id, {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
      });
      res.json(staffMember);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Toggle staff status
  app.patch("/api/staff/:id/status", isAuthenticated, async (req, res) => {
    try {
      const staffMember = await storage.toggleStaffStatus(req.params.id);
      res.json(staffMember);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete staff
  app.delete("/api/staff/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteStaff(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= APPOINTMENT ROUTES =============

  // Update appointment status
  app.patch("/api/appointments/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      const appointment = await storage.updateAppointmentStatus(req.params.id, status);
      res.json(appointment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single appointment (for reschedule page)
  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment tidak ditemukan" });
      }

      // Get related data
      const service = await storage.getService(appointment.serviceId);
      const staff = await storage.getStaffMember(appointment.staffId);
      const business = await storage.getBusiness(appointment.businessId);

      res.json({
        ...appointment,
        service: service ? { name: service.name, duration: service.duration, price: service.price } : null,
        staff: staff ? { name: staff.name } : null,
        business: business ? { name: business.name, address: business.address } : null,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Request reschedule (customer)
  app.post("/api/appointments/:id/reschedule", async (req, res) => {
    try {
      const data = rescheduleRequestSchema.parse(req.body);
      const appointment = await storage.requestReschedule(req.params.id, data.reason);

      // Notify business
      notifyBusiness(appointment.businessId, {
        type: "reschedule_request",
        appointmentId: appointment.id,
        message: `${appointment.customerName} meminta jadwal ulang: ${data.reason}`,
      });

      res.json(appointment);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Suggest reschedule slot (business)
  app.post("/api/appointments/:id/suggest-slot", isAuthenticated, async (req, res) => {
    try {
      const data = suggestSlotSchema.parse(req.body);
      const appointment = await storage.suggestRescheduleSlot(
        req.params.id,
        new Date(data.suggestedSlot),
        data.message
      );
      res.json(appointment);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Confirm reschedule
  app.post("/api/appointments/:id/confirm-reschedule", async (req, res) => {
    try {
      const { newStartTime, newEndTime } = req.body;
      const appointment = await storage.confirmReschedule(
        req.params.id,
        new Date(newStartTime),
        new Date(newEndTime)
      );
      res.json(appointment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= MESSAGES ROUTES =============

  // Get messages
  app.get("/api/businesses/:businessId/messages", isAuthenticated, validateBusinessOwnership, async (req, res) => {
    try {
      const { businessId } = req.params;
      const { appointmentId } = req.query;
      const messages = await storage.getMessages(businessId, appointmentId as string);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Send message
  app.post("/api/businesses/:businessId/messages", isAuthenticated, async (req, res) => {
    try {
      const { businessId } = req.params;
      const data = sendMessageSchema.parse(req.body);

      const user = await storage.getUserById(req.user!.userId);

      const message = await storage.createMessage({
        businessId,
        appointmentId: data.appointmentId || null,
        senderId: req.user!.userId,
        senderRole: req.user!.role,
        senderName: user?.email || "Unknown",
        content: data.content,
      });

      // Notify via WebSocket
      notifyBusiness(businessId, {
        type: "new_message",
        message,
      });

      res.json(message);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: error.message });
    }
  });

  // Mark messages as read
  app.post("/api/messages/read", isAuthenticated, async (req, res) => {
    try {
      const { messageIds } = req.body;
      await storage.markMessagesAsRead(messageIds);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= SUBSCRIPTION & PAYMENT ROUTES =============

  // Get subscription info
  app.get("/api/businesses/:businessId/subscription", isAuthenticated, validateBusinessOwnership, async (req, res) => {
    try {
      const subscription = await storage.getSubscription(req.params.businessId);
      res.json({
        subscription,
        prices: SUBSCRIPTION_PRICES,
        tiers: TIER_LIMITS,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Upgrade subscription
  app.post("/api/businesses/:businessId/upgrade", isAuthenticated, validateBusinessOwnership, async (req, res) => {
    try {
      const { businessId } = req.params;
      const { tier } = req.body;

      if (!["pro", "business"].includes(tier)) {
        return res.status(400).json({ message: "Tier tidak valid" });
      }

      const business = await storage.getBusiness(businessId);
      if (!business) {
        return res.status(404).json({ message: "Bisnis tidak ditemukan" });
      }

      const result = await createSubscriptionPayment(
        businessId,
        tier as SubscriptionTier,
        business.ownerName,
        business.ownerEmail
      );

      if (result.error) {
        return res.status(400).json({ message: result.error });
      }

      res.json({
        payment: result.payment,
        redirectUrl: result.redirectUrl
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Payment webhook
  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const success = await handlePaymentWebhook(req.body);
      res.json({ success });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Simulate payment (for development)
  app.post("/api/payments/simulate/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      await handlePaymentWebhook({
        order_id: orderId,
        transaction_status: "settlement",
        transaction_id: `sim_txn_${randomUUID()}`,
      });
      res.json({ success: true, message: "Pembayaran berhasil (simulasi)" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get invoice
  app.get("/api/payments/:id/invoice", isAuthenticated, async (req, res) => {
    try {
      const payment = await storage.getPayment(req.params.id);
      if (!payment) {
        return res.status(404).json({ message: "Pembayaran tidak ditemukan" });
      }

      const business = await storage.getBusiness(payment.businessId);
      const subscription = payment.subscriptionId
        ? await storage.getSubscription(payment.businessId)
        : undefined;

      const invoice = generateInvoice(payment, business, subscription);
      res.setHeader("Content-Type", "text/html");
      res.send(invoice);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get payment history
  app.get("/api/businesses/:businessId/payments", isAuthenticated, validateBusinessOwnership, async (req, res) => {
    try {
      const payments = await storage.getPaymentsByBusiness(req.params.businessId);
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= ADMIN ROUTES =============

  // Get all businesses
  app.get("/api/admin/businesses", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const businesses = await storage.getAllBusinesses();
      res.json(businesses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Deactivate business
  app.delete("/api/admin/businesses/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deactivateBusiness(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all users
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password from response
      const safeUsers = users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        businessId: u.businessId,
        isActive: u.isActive,
        createdAt: u.createdAt,
      }));
      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get admin stats
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // ============= PUBLIC BOOKING ROUTES =============

  // Get booking page data
  app.get("/api/booking/:slug", async (req, res) => {
    try {
      const business = await storage.getBusinessBySlug(req.params.slug);
      if (!business) {
        return res.status(404).json({ message: "Bisnis tidak ditemukan" });
      }

      if (!business.isActive) {
        return res.status(404).json({ message: "Bisnis tidak aktif" });
      }

      const [services, staff, operatingHours] = await Promise.all([
        storage.getServices(business.id),
        storage.getStaff(business.id),
        storage.getOperatingHours(business.id),
      ]);

      res.json({ business, services, staff, operatingHours });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get available slots
  app.get("/api/booking/:slug/slots", async (req, res) => {
    try {
      const { date, serviceId, staffId } = req.query;

      const business = await storage.getBusinessBySlug(req.params.slug);
      if (!business) {
        return res.status(404).json({ message: "Bisnis tidak ditemukan" });
      }

      if (!date || !serviceId) {
        return res.status(400).json({ message: "Date and serviceId required" });
      }

      const slots = await storage.getAvailableSlots(
        business.id,
        date as string,
        serviceId as string,
        staffId as string | undefined
      );

      res.json({ slots });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create booking
  app.post("/api/booking/:slug", async (req, res) => {
    try {
      const business = await storage.getBusinessBySlug(req.params.slug);
      if (!business) {
        return res.status(404).json({ message: "Bisnis tidak ditemukan" });
      }

      const { serviceId, staffId, date, time, customerName, customerPhone, notes } = req.body;

      // Get service details
      const service = await storage.getService(serviceId);
      if (!service) {
        return res.status(400).json({ message: "Jasa tidak ditemukan" });
      }

      // Get or assign staff
      let assignedStaffId = staffId;
      if (!assignedStaffId) {
        const staffList = await storage.getStaff(business.id);
        if (staffList.length > 0) {
          assignedStaffId = staffList[0].id;
        } else {
          return res.status(400).json({ message: "Tidak ada staff tersedia" });
        }
      }

      // Calculate start and end time
      const [hours, minutes] = time.split(":").map(Number);
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + service.duration);

      // Create or find customer
      let customer = await storage.getCustomerByPhone(business.id, customerPhone);
      if (!customer) {
        customer = await storage.createCustomer({
          businessId: business.id,
          name: customerName,
          phone: customerPhone,
        });
      }

      // Create appointment
      const appointment = await storage.createAppointment({
        businessId: business.id,
        serviceId,
        staffId: assignedStaffId,
        customerId: customer.id,
        customerName,
        customerPhone,
        startTime,
        endTime,
        notes: notes || null,
        totalPrice: service.price,
      });

      // Notify business
      notifyBusiness(business.id, {
        type: "new_booking",
        appointment,
        message: `Booking baru dari ${customerName}`,
      });

      res.json({ appointment });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
