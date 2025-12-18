/**
 * Notification Service - Stub implementation
 * Replace with real email/SMS providers in production
 * 
 * Suggested providers:
 * - Email: SendGrid, Mailgun, AWS SES
 * - SMS: Twilio, Vonage, Watzap (for WhatsApp)
 */

export interface NotificationPayload {
    to: string;
    subject?: string;
    message: string;
    type: "email" | "sms" | "whatsapp";
}

export interface NotificationResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

// Environment variables for production
const EMAIL_API_KEY = process.env.EMAIL_API_KEY;
const SMS_API_KEY = process.env.SMS_API_KEY;

/**
 * Send notification (stub - logs to console)
 */
export async function sendNotification(payload: NotificationPayload): Promise<NotificationResult> {
    // In production, implement actual sending logic
    console.log(`[NOTIFICATION] ${payload.type.toUpperCase()} to ${payload.to}`);
    console.log(`  Subject: ${payload.subject || "(none)"}`);
    console.log(`  Message: ${payload.message}`);

    // Simulate success
    return {
        success: true,
        messageId: `stub_${Date.now()}`,
    };
}

/**
 * Send booking confirmation notification
 */
export async function sendBookingConfirmation(params: {
    customerPhone: string;
    customerName: string;
    businessName: string;
    serviceName: string;
    dateTime: Date;
    staffName: string;
}): Promise<NotificationResult> {
    const formattedDate = params.dateTime.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const formattedTime = params.dateTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const message = `Halo ${params.customerName}! 🎉

Booking Anda di ${params.businessName} telah dikonfirmasi:

📋 Layanan: ${params.serviceName}
📅 Tanggal: ${formattedDate}
⏰ Waktu: ${formattedTime} WIB
👤 Staff: ${params.staffName}

Terima kasih telah menggunakan Janji.in!`;

    return sendNotification({
        to: params.customerPhone,
        type: "whatsapp",
        message,
    });
}

/**
 * Send reschedule request notification to business
 */
export async function sendRescheduleRequestNotification(params: {
    businessEmail: string;
    businessPhone: string;
    customerName: string;
    reason: string;
    originalDateTime: Date;
}): Promise<NotificationResult> {
    const formattedDate = params.originalDateTime.toLocaleDateString("id-ID");
    const formattedTime = params.originalDateTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const message = `Permintaan Reschedule!

Customer: ${params.customerName}
Jadwal awal: ${formattedDate} ${formattedTime}
Alasan: ${params.reason}

Silakan buka dashboard untuk menyarankan jadwal baru.`;

    // Send both email and SMS
    await sendNotification({
        to: params.businessEmail,
        type: "email",
        subject: `Permintaan Reschedule dari ${params.customerName}`,
        message,
    });

    return sendNotification({
        to: params.businessPhone,
        type: "whatsapp",
        message,
    });
}

/**
 * Send new slot suggestion to customer
 */
export async function sendSlotSuggestionNotification(params: {
    customerPhone: string;
    customerName: string;
    businessName: string;
    suggestedDateTime: Date;
    message?: string;
    confirmUrl: string;
}): Promise<NotificationResult> {
    const formattedDate = params.suggestedDateTime.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const formattedTime = params.suggestedDateTime.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const notifMessage = `Halo ${params.customerName}!

${params.businessName} menyarankan jadwal baru:

📅 ${formattedDate}
⏰ ${formattedTime} WIB

${params.message ? `Pesan: ${params.message}` : ""}

Konfirmasi jadwal baru: ${params.confirmUrl}`;

    return sendNotification({
        to: params.customerPhone,
        type: "whatsapp",
        message: notifMessage,
    });
}

/**
 * Send payment success notification
 */
export async function sendPaymentSuccessNotification(params: {
    businessEmail: string;
    businessName: string;
    tier: string;
    amount: number;
    expiryDate: Date;
}): Promise<NotificationResult> {
    const formattedAmount = `Rp ${params.amount.toLocaleString("id-ID")}`;
    const formattedExpiry = params.expiryDate.toLocaleDateString("id-ID");

    const message = `Pembayaran Berhasil! 🎉

Bisnis: ${params.businessName}
Paket: ${params.tier.toUpperCase()}
Nominal: ${formattedAmount}
Berlaku hingga: ${formattedExpiry}

Terima kasih telah upgrade ke ${params.tier}! Nikmati semua fitur premium Janji.in.`;

    return sendNotification({
        to: params.businessEmail,
        type: "email",
        subject: `Pembayaran ${params.tier} Berhasil - Janji.in`,
        message,
    });
}

/**
 * Send daily reminder to business (scheduled job)
 */
export async function sendDailyReminder(params: {
    businessEmail: string;
    businessName: string;
    todayBookingsCount: number;
    pendingCount: number;
}): Promise<NotificationResult> {
    const message = `Selamat pagi, ${params.businessName}! ☀️

Ringkasan hari ini:
📅 Total booking: ${params.todayBookingsCount}
⏳ Menunggu konfirmasi: ${params.pendingCount}

Buka dashboard untuk detailnya.`;

    return sendNotification({
        to: params.businessEmail,
        type: "email",
        subject: `Ringkasan Hari Ini - ${params.todayBookingsCount} Booking`,
        message,
    });
}
