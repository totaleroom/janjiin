import { randomUUID } from "crypto";
import type { InsertPayment, Payment, SubscriptionTier } from "@shared/schema";
import { storage } from "./storage";

// Payment gateway configuration
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-xxx";
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || "SB-Mid-client-xxx";
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

// Subscription pricing (in IDR)
export const SUBSCRIPTION_PRICES: Record<SubscriptionTier, number> = {
    free: 0,
    pro: 99000, // per month
    business: 299000, // per month
};

export interface PaymentRequest {
    orderId: string;
    amount: number;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    itemDetails?: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
    }>;
}

export interface PaymentResponse {
    success: boolean;
    token?: string;
    redirectUrl?: string;
    error?: string;
}

// Simulated payment for development (replace with real Midtrans integration)
export async function createPaymentTransaction(request: PaymentRequest): Promise<PaymentResponse> {
    try {
        // In production, this would call Midtrans API
        // For now, we simulate the payment flow

        if (MIDTRANS_IS_PRODUCTION) {
            // TODO: Implement real Midtrans integration
            // const response = await fetch("https://api.midtrans.com/v2/charge", {
            //   method: "POST",
            //   headers: {
            //     "Authorization": `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
            //     "Content-Type": "application/json",
            //   },
            //   body: JSON.stringify({
            //     transaction_details: {
            //       order_id: request.orderId,
            //       gross_amount: request.amount,
            //     },
            //     customer_details: {
            //       first_name: request.customerName,
            //       email: request.customerEmail,
            //       phone: request.customerPhone,
            //     },
            //   }),
            // });

            return {
                success: false,
                error: "Production payment not yet implemented",
            };
        }

        // Simulation mode
        const token = `sim_${randomUUID()}`;
        const redirectUrl = `/payment/simulate/${request.orderId}?token=${token}`;

        return {
            success: true,
            token,
            redirectUrl,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message,
        };
    }
}

export interface PaymentVerification {
    success: boolean;
    status: "pending" | "paid" | "failed" | "refunded";
    transactionId?: string;
    error?: string;
}

export async function verifyPayment(orderId: string, token?: string): Promise<PaymentVerification> {
    try {
        if (MIDTRANS_IS_PRODUCTION) {
            // TODO: Implement real Midtrans status check
            // const response = await fetch(`https://api.midtrans.com/v2/${orderId}/status`, {
            //   headers: {
            //     "Authorization": `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
            //   },
            // });

            return {
                success: false,
                status: "pending",
                error: "Production verification not yet implemented",
            };
        }

        // Simulation mode - always succeed
        return {
            success: true,
            status: "paid",
            transactionId: `txn_${randomUUID()}`,
        };
    } catch (error: any) {
        return {
            success: false,
            status: "failed",
            error: error.message,
        };
    }
}

// Handle webhook from payment gateway
export async function handlePaymentWebhook(payload: any): Promise<boolean> {
    try {
        const { order_id, transaction_status, transaction_id } = payload;

        // Map Midtrans status to our status
        let status: "pending" | "paid" | "failed" | "refunded";
        switch (transaction_status) {
            case "capture":
            case "settlement":
                status = "paid";
                break;
            case "pending":
                status = "pending";
                break;
            case "deny":
            case "cancel":
            case "expire":
                status = "failed";
                break;
            case "refund":
                status = "refunded";
                break;
            default:
                status = "pending";
        }

        // Update payment in database
        await storage.updatePaymentStatus(order_id, status, transaction_id);

        // If subscription payment, update subscription
        const payment = await storage.getPaymentByOrderId(order_id);
        if (payment?.subscriptionId && status === "paid") {
            await storage.activateSubscription(payment.subscriptionId);
        }

        // If appointment payment, update appointment
        if (payment?.appointmentId && status === "paid") {
            await storage.updateAppointmentPaymentStatus(payment.appointmentId, "paid");
        }

        return true;
    } catch (error) {
        console.error("Webhook processing error:", error);
        return false;
    }
}

// Create subscription upgrade payment
export async function createSubscriptionPayment(
    businessId: string,
    tier: SubscriptionTier,
    customerName: string,
    customerEmail: string
): Promise<{ payment: Payment; redirectUrl?: string; error?: string }> {
    const amount = SUBSCRIPTION_PRICES[tier];

    if (amount === 0) {
        return {
            payment: null as any,
            error: "Free tier does not require payment"
        };
    }

    const orderId = `SUB_${businessId}_${Date.now()}`;

    // Create payment record
    const payment = await storage.createPayment({
        businessId,
        amount,
        status: "pending",
        paymentGateway: "midtrans",
        externalId: orderId,
    });

    // Create pending subscription
    const subscription = await storage.createSubscription({
        businessId,
        tier,
        startDate: new Date(),
        paymentId: payment.id,
        amount,
        status: "pending",
    });

    // Update payment with subscription link
    await storage.linkPaymentToSubscription(payment.id, subscription.id);

    // Create payment transaction
    const paymentResponse = await createPaymentTransaction({
        orderId,
        amount,
        customerName,
        customerEmail,
        itemDetails: [{
            id: `tier_${tier}`,
            name: `Janji.in ${tier.charAt(0).toUpperCase() + tier.slice(1)} - 1 Bulan`,
            price: amount,
            quantity: 1,
        }],
    });

    if (!paymentResponse.success) {
        return { payment, error: paymentResponse.error };
    }

    return { payment, redirectUrl: paymentResponse.redirectUrl };
}

// Generate invoice
export function generateInvoice(payment: Payment, business: any, subscription?: any): string {
    // In production, this would generate a PDF
    // For now, return HTML invoice

    const invoiceDate = new Date().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${payment.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
        .invoice-info { margin-bottom: 30px; }
        .invoice-info h2 { margin: 0; color: #333; }
        .details { margin-bottom: 30px; }
        .table { width: 100%; border-collapse: collapse; }
        .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .table th { background: #f5f5f5; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">Janji.in</div>
      </div>
      
      <div class="invoice-info">
        <h2>INVOICE</h2>
        <p>No: ${payment.id}</p>
        <p>Tanggal: ${invoiceDate}</p>
      </div>
      
      <div class="details">
        <h3>Ditagihkan kepada:</h3>
        <p>${business.name}<br>${business.ownerEmail}</p>
      </div>
      
      <table class="table">
        <thead>
          <tr>
            <th>Deskripsi</th>
            <th>Jumlah</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${subscription ? `Langganan ${subscription.tier} - 1 Bulan` : 'Pembayaran'}</td>
            <td>Rp ${payment.amount.toLocaleString("id-ID")}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="total">
        Total: Rp ${payment.amount.toLocaleString("id-ID")}
      </div>
      
      <div class="footer">
        <p>Terima kasih telah menggunakan Janji.in</p>
        <p>Jika ada pertanyaan, hubungi support@janji.in</p>
      </div>
    </body>
    </html>
  `;
}
