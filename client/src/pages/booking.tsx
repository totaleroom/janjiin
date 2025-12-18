import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ChevronRight,
  MessageCircle,
  Check,
  User,
  Phone
} from "lucide-react";
import { formatPrice, formatDuration, formatDateIndonesian, formatWhatsAppLink, getTodayString, getTomorrowString } from "@/lib/utils";
import type { Business, Service, Staff, TimeSlot } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bookingFormSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type BookingStep = "services" | "datetime" | "form" | "confirmation";

interface BookingState {
  service: Service | null;
  staff: Staff | null;
  date: string;
  time: string;
}

function ServiceCard({ 
  service, 
  onSelect 
}: { 
  service: Service; 
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="w-full text-left"
      data-testid={`card-service-${service.id}`}
    >
      <Card className="transition-all hover:border-primary/50 hover:shadow-md">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <div className="h-6 w-6 rounded-full bg-primary/30" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold">{service.name}</h3>
            {service.description && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {service.description}
              </p>
            )}
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(service.duration)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary">
              {formatPrice(service.price)}
            </span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function StaffSelector({
  staffList,
  selectedStaff,
  onSelect,
}: {
  staffList: Staff[];
  selectedStaff: Staff | null;
  onSelect: (staff: Staff | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
          !selectedStaff
            ? "bg-primary text-primary-foreground"
            : "bg-muted hover:bg-muted/80"
        }`}
        data-testid="button-staff-any"
      >
        Siapa Saja
      </button>
      {staffList.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            selectedStaff?.id === s.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
          data-testid={`button-staff-${s.id}`}
        >
          <Avatar className="h-5 w-5">
            <AvatarImage src={s.avatarUrl || undefined} />
            <AvatarFallback className="text-xs">
              {s.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {s.name}
        </button>
      ))}
    </div>
  );
}

function DateSelector({
  selectedDate,
  onSelect,
}: {
  selectedDate: string;
  onSelect: (date: string) => void;
}) {
  const today = getTodayString();
  const tomorrow = getTomorrowString();
  
  const getDateAfter = (daysAfter: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysAfter);
    return date.toISOString().split("T")[0];
  };

  const dates = [
    { value: today, label: "Hari Ini" },
    { value: tomorrow, label: "Besok" },
    { value: getDateAfter(2), label: formatDateIndonesian(new Date(getDateAfter(2))) },
    { value: getDateAfter(3), label: formatDateIndonesian(new Date(getDateAfter(3))) },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {dates.map((d) => (
        <button
          key={d.value}
          onClick={() => onSelect(d.value)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            selectedDate === d.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
          data-testid={`button-date-${d.value}`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

function TimeSlotGrid({
  slots,
  selectedTime,
  onSelect,
}: {
  slots: TimeSlot[];
  selectedTime: string;
  onSelect: (time: string) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => (
        <button
          key={slot.time}
          onClick={() => slot.available && onSelect(slot.time)}
          disabled={!slot.available}
          className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
            selectedTime === slot.time
              ? "bg-primary text-primary-foreground"
              : slot.available
              ? "bg-muted hover:bg-muted/80"
              : "cursor-not-allowed bg-muted/50 text-muted-foreground line-through"
          }`}
          data-testid={`button-time-${slot.time}`}
        >
          {slot.time}
        </button>
      ))}
    </div>
  );
}

function BookingDrawer({
  open,
  onOpenChange,
  service,
  staffList,
  booking,
  onBookingChange,
  onConfirm,
  slotsLoading,
  slots,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  staffList: Staff[];
  booking: BookingState;
  onBookingChange: (booking: Partial<BookingState>) => void;
  onConfirm: () => void;
  slotsLoading: boolean;
  slots: TimeSlot[];
}) {
  if (!service) return null;

  const canConfirm = booking.date && booking.time;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Pilih Waktu & Staff</DrawerTitle>
            <DrawerDescription>
              {service.name} - {formatPrice(service.price)}
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-6 px-4 pb-4">
            <div>
              <Label className="mb-2 block text-sm font-medium">Staff</Label>
              <StaffSelector
                staffList={staffList}
                selectedStaff={booking.staff}
                onSelect={(staff) => onBookingChange({ staff })}
              />
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">Tanggal</Label>
              <DateSelector
                selectedDate={booking.date}
                onSelect={(date) => onBookingChange({ date, time: "" })}
              />
            </div>

            {booking.date && (
              <div>
                <Label className="mb-2 block text-sm font-medium">Jam Kosong</Label>
                {slotsLoading ? (
                  <div className="grid grid-cols-4 gap-2">
                    {[...Array(8)].map((_, i) => (
                      <Skeleton key={i} className="h-10 rounded-lg" />
                    ))}
                  </div>
                ) : slots.length > 0 ? (
                  <TimeSlotGrid
                    slots={slots}
                    selectedTime={booking.time}
                    onSelect={(time) => onBookingChange({ time })}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada slot tersedia untuk tanggal ini
                  </p>
                )}
              </div>
            )}
          </div>

          <DrawerFooter>
            <Button 
              onClick={onConfirm} 
              disabled={!canConfirm}
              className="w-full"
              data-testid="button-confirm-time"
            >
              Lanjut Isi Data
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function CustomerFormStep({
  service,
  staff,
  date,
  time,
  onBack,
  onSubmit,
  isLoading,
}: {
  service: Service;
  staff: Staff | null;
  date: string;
  time: string;
  onBack: () => void;
  onSubmit: (data: { name: string; phone: string; notes: string }) => void;
  isLoading: boolean;
}) {
  const form = useForm({
    resolver: zodResolver(bookingFormSchema.pick({ customerName: true, customerPhone: true, notes: true })),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      notes: "",
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({
      name: data.customerName,
      phone: data.customerPhone,
      notes: data.notes || "",
    });
  });

  const dateObj = new Date(date);

  return (
    <div className="space-y-6">
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jasa</span>
              <span className="font-medium">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Staff</span>
              <span className="font-medium">{staff?.name || "Siapa saja"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Waktu</span>
              <span className="font-medium">
                {formatDateIndonesian(dateObj)} @ {time}
              </span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold text-primary">
                  {formatPrice(service.price)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nama Lengkap
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ahmad Dani" 
                    {...field} 
                    data-testid="input-customer-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  No. WhatsApp
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="08123456789" 
                    {...field} 
                    data-testid="input-customer-phone"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catatan (Opsional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Mau potong model apa, dll..." 
                    {...field} 
                    data-testid="input-notes"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <p className="text-sm text-muted-foreground">
            Bayar di tempat / Transfer DP via WA nanti.
          </p>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              disabled={isLoading}
              data-testid="button-back-form"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
            <Button 
              type="submit" 
              className="flex-1 gap-2"
              disabled={isLoading}
              data-testid="button-submit-booking"
            >
              <MessageCircle className="h-4 w-4" />
              {isLoading ? "Memproses..." : "BOOKING SEKARANG"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function ConfirmationStep({
  businessName,
  businessPhone,
  service,
  staff,
  date,
  time,
  customerName,
}: {
  businessName: string;
  businessPhone: string;
  service: Service;
  staff: Staff | null;
  date: string;
  time: string;
  customerName: string;
}) {
  const dateObj = new Date(date);
  
  const waMessage = `Halo, saya ${customerName}.
Saya sudah booking ${service.name} untuk ${formatDateIndonesian(dateObj)} jam ${time}.
${staff ? `Staff: ${staff.name}` : ""}
Terima kasih!`;

  const waLink = formatWhatsAppLink(businessPhone, waMessage);

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Check className="h-10 w-10 text-primary" />
      </div>

      <div>
        <h2 className="text-2xl font-bold">Booking Berhasil!</h2>
        <p className="mt-2 text-muted-foreground">
          Tinggal konfirmasi via WhatsApp ke {businessName}
        </p>
      </div>

      <Card className="text-left">
        <CardContent className="p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jasa</span>
              <span className="font-medium">{service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Staff</span>
              <span className="font-medium">{staff?.name || "Siapa saja"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Waktu</span>
              <span className="font-medium">
                {formatDateIndonesian(dateObj)} @ {time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-bold text-primary">
                {formatPrice(service.price)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <a href={waLink} target="_blank" rel="noopener noreferrer">
        <Button size="lg" className="w-full gap-2" data-testid="button-whatsapp">
          <MessageCircle className="h-5 w-5" />
          Kirim WhatsApp ke Owner
        </Button>
      </a>

      <p className="text-sm text-muted-foreground">
        Owner akan konfirmasi booking kamu via WhatsApp
      </p>
    </div>
  );
}

function BusinessHeader({ business }: { business: Business }) {
  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={business.logoUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
              {business.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold">{business.name}</h1>
            {business.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                "{business.description}"
              </p>
            )}
            {business.address && (
              <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {business.address}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 border-b bg-card p-6">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="container mx-auto space-y-4 px-4">
        <Skeleton className="h-8 w-32" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 text-4xl">😕</div>
      <h2 className="mb-2 text-lg font-semibold">Gagal Memuat</h2>
      <p className="mb-4 text-muted-foreground">{message}</p>
      <Button onClick={onRetry} data-testid="button-retry">
        Coba Lagi
      </Button>
    </div>
  );
}

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  
  const [step, setStep] = useState<BookingStep>("services");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [booking, setBooking] = useState<BookingState>({
    service: null,
    staff: null,
    date: getTodayString(),
    time: "",
  });
  const [customerData, setCustomerData] = useState<{ name: string; phone: string; notes: string } | null>(null);

  // Fetch business data
  const { data: businessData, isLoading, error, refetch } = useQuery<{
    business: Business;
    services: Service[];
    staff: Staff[];
  }>({
    queryKey: ["/api/booking", slug],
  });

  // Fetch available slots
  const { data: slotsData, isLoading: slotsLoading } = useQuery<{ slots: TimeSlot[] }>({
    queryKey: ["/api/booking", slug, "slots", booking.date, booking.service?.id, booking.staff?.id],
    queryFn: async () => {
      const params = new URLSearchParams({
        date: booking.date,
        serviceId: booking.service!.id,
      });
      if (booking.staff?.id) {
        params.append("staffId", booking.staff.id);
      }
      const res = await fetch(`/api/booking/${slug}/slots?${params}`);
      if (!res.ok) throw new Error("Failed to fetch slots");
      return res.json();
    },
    enabled: !!booking.date && !!booking.service,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: {
      serviceId: string;
      staffId: string | null;
      date: string;
      time: string;
      customerName: string;
      customerPhone: string;
      notes: string;
    }) => {
      const res = await apiRequest("POST", `/api/booking/${slug}`, data);
      return res.json();
    },
    onSuccess: () => {
      setStep("confirmation");
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal Booking",
        description: error.message || "Terjadi kesalahan. Coba lagi.",
        variant: "destructive",
      });
    },
  });

  const handleServiceSelect = (service: Service) => {
    setBooking((prev) => ({ ...prev, service, time: "" }));
    setDrawerOpen(true);
  };

  const handleDrawerConfirm = () => {
    setDrawerOpen(false);
    setStep("form");
  };

  const handleFormSubmit = (data: { name: string; phone: string; notes: string }) => {
    setCustomerData(data);
    
    if (!booking.service) return;
    
    createBookingMutation.mutate({
      serviceId: booking.service.id,
      staffId: booking.staff?.id || null,
      date: booking.date,
      time: booking.time,
      customerName: data.name,
      customerPhone: data.phone,
      notes: data.notes,
    });
  };

  const handleBack = () => {
    if (step === "form") {
      setStep("services");
      setDrawerOpen(true);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !businessData) {
    return (
      <ErrorState 
        message="Bisnis tidak ditemukan atau terjadi kesalahan"
        onRetry={() => refetch()}
      />
    );
  }

  const { business, services, staff } = businessData;
  const slots = slotsData?.slots || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center gap-4 px-4">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="font-semibold">{business.name}</span>
        </div>
      </header>

      {step === "confirmation" && customerData ? (
        <div className="container mx-auto max-w-lg px-4 py-8">
          <ConfirmationStep
            businessName={business.name}
            businessPhone={business.phone || ""}
            service={booking.service!}
            staff={booking.staff}
            date={booking.date}
            time={booking.time}
            customerName={customerData.name}
          />
        </div>
      ) : (
        <>
          <BusinessHeader business={business} />

          <main className="container mx-auto px-4 py-6">
            {step === "services" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Pilih Servis</h2>
                {services.length > 0 ? (
                  services.map((service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onSelect={() => handleServiceSelect(service)}
                    />
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Belum ada layanan tersedia
                    </p>
                  </Card>
                )}
              </div>
            )}

            {step === "form" && booking.service && (
              <div className="mx-auto max-w-lg">
                <CustomerFormStep
                  service={booking.service}
                  staff={booking.staff}
                  date={booking.date}
                  time={booking.time}
                  onBack={handleBack}
                  onSubmit={handleFormSubmit}
                  isLoading={createBookingMutation.isPending}
                />
              </div>
            )}
          </main>

          <BookingDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            service={booking.service}
            staffList={staff}
            booking={booking}
            onBookingChange={(changes) => setBooking((prev) => ({ ...prev, ...changes }))}
            onConfirm={handleDrawerConfirm}
            slotsLoading={slotsLoading}
            slots={slots}
          />
        </>
      )}
    </div>
  );
}
