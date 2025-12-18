# Janji.in - Operational Specifications (Phase 2.4)

## 1. Super Admin ("God Mode")
**Route:** `/admin/super`
**Access:** Restricted to `owner_email` (hardcoded in env initially: `admin@janji.in`).

### Features
1.  **Business List:** Table viewing all registered businesses (Name, Slug, Owner Email, Created At, Subscription Plan).
2.  **Stats Overview:** Total Businesses, Total Bookings (All time/This Month), Total GMV.
3.  **Actions:**
    *   **Freeze/Ban:** Toggle `is_active` on business.
    *   **Impersonate:** Generate a magic link to login as that owner (for support).
    *   **Force Manual Verify:** If Xendit webhook fails, manually mark booking as paid.

---

## 2. Legal & Compliance (Required for Xendit)
*Draft copy for static pages.*

### Terms of Service (ToS) Highlights
*   **Platform Role:** Janji.in is an intermediary. We are not responsible for the service quality provided by the Merchant.
*   **Booking Commitments:** Users agree to attend bookings made. "No-Show" repeated offenses may lead to phone number blacklisting.

### Refund Policy
*   **Deposits (DP):** Generally **non-refundable** if cancelled by the Customer less than 24 hours before the slot.
*   **Merchant Cancellation:** If Merchant cancels, DP is 100% refunded.
*   **Disputes:** All disputes regarding service quality must be resolved directly with the Merchant.

### Privacy Policy
*   **Data Collection:** Name, Phone Number (WA), Email.
*   **Usage:** Strictly for booking notifications and legitimate service reminders. No selling of data.

---

## 3. Seed Data: Business Templates
*JSON structure to pre-fill the "Services" table upon onboarding.*

### **Barbershop** (`template_barbershop`)
```json
[
  { "name": "Gentlemen Cut", "duration": 45, "price": 50000, "description": "Gunting + Keramas + Styling + Pijat Singkat" },
  { "name": "Premium Shaving", "duration": 30, "price": 35000, "description": "Cukur Jenggot/Kumis dengan handuk hangat" },
  { "name": "Hair Colouring Basic", "duration": 60, "price": 100000, "description": "Hitam / Dark Brown Only" }
]
```

### **Salon Wanita** (`template_salon`)
```json
[
  { "name": "Cuci Blow Variasi", "duration": 45, "price": 60000, "description": "Cuci rambut + styling blow" },
  { "name": "Creambath Traditional", "duration": 60, "price": 85000, "description": "Pijat kepala & punggung" },
  { "name": "Manicure / Pedicure", "duration": 60, "price": 75000, "description": "Perawatan kuku tangan/kaki" }
]
```

### **Klinik Gigi** (`template_dental`)
```json
[
  { "name": "Konsultasi Dokter", "duration": 30, "price": 100000, "description": "Pemeriksaan awal" },
  { "name": "Scaling (Pembersihan Karang)", "duration": 60, "price": 350000, "description": "Full rahang atas & bawah" },
  { "name": "Tambal Gigi", "duration": 45, "price": 250000, "description": "Per lubang gigi (Komposit)" }
]
```

### **General / Custom**
*   *Empty list. User adds manually.*

---

## 4. Copy Dictionary (Notifications)

### WhatsApp Templates (WAHA)

**1. Booking Confirmed (Customer)**
> Halo Kak *{name}*! 👋
> Booking kamu di *{business_name}* sudah aman terkunci.
> 🗓 *{date}* jam *{time}*
> ✂️ *{service_name}*
> 👤 Staff: *{staff_name}*
> 
> Sampai ketemu nanti ya! Harap datang 5 menit sebelumnya.
> _- Janji.in Bot_

**2. Reminder H-1 Jam (Customer)**
> Reminder Dikit Bos! ⏰
> 1 jam lagi kamu ada jadwal di *{business_name}*.
> Jangan lupa jalan sekarang biar gak telat. See you!

**3. New Booking Alert (Owner/Staff)**
> 💰 *BOOKING MASUK!*
> Customer: *{name}* ({phone})
> Jasa: {service_name}
> Jam: {time}
> Status: {payment_status}
>
> *Siapin alat tempurnya!*
