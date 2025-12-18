import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Calendar,
  CalendarDays,
  Clock,
  Plus,
  Settings,
  Users,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  ExternalLink,
  Phone,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { formatPrice, formatDuration, formatDateIndonesian, formatTime, getStatusVariant, getStatusLabel } from "@/lib/utils";
import type { Business, Service, Staff, Appointment, AppointmentWithDetails, DashboardStats } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceFormSchema, staffFormSchema, type ServiceForm, type StaffForm } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type DashboardTab = "overview" | "calendar" | "services" | "staff" | "settings";

function StatCard({ 
  title, 
  value, 
  icon: Icon,
  description,
  variant = "default" 
}: { 
  title: string; 
  value: string | number;
  icon: typeof TrendingUp;
  description?: string;
  variant?: "default" | "success" | "warning" | "danger";
}) {
  const colorClasses = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600 dark:text-green-400",
    warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClasses[variant]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AppointmentCard({ 
  appointment,
  onStatusChange 
}: { 
  appointment: AppointmentWithDetails;
  onStatusChange: (id: string, status: string) => void;
}) {
  const startTime = new Date(appointment.startTime);
  
  return (
    <Card className="overflow-hidden" data-testid={`card-appointment-${appointment.id}`}>
      <div className={`h-1 ${
        appointment.status === "confirmed" ? "bg-green-500" :
        appointment.status === "pending" ? "bg-yellow-500" :
        appointment.status === "cancelled" ? "bg-red-500" :
        "bg-blue-500"
      }`} />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{formatTime(startTime)}</span>
              <Badge variant={getStatusVariant(appointment.status)} className="text-xs">
                {getStatusLabel(appointment.status)}
              </Badge>
            </div>
            <p className="mt-1 font-medium">{appointment.customerName}</p>
            <p className="text-sm text-muted-foreground">
              {appointment.service.name} - {appointment.staff.name}
            </p>
            {appointment.customerPhone && (
              <a 
                href={`tel:${appointment.customerPhone}`}
                className="mt-1 flex items-center gap-1 text-sm text-primary"
              >
                <Phone className="h-3 w-3" />
                {appointment.customerPhone}
              </a>
            )}
          </div>
          <div className="text-right">
            <p className="font-semibold text-primary">
              {formatPrice(appointment.totalPrice)}
            </p>
          </div>
        </div>
        
        {appointment.status === "pending" && (
          <div className="mt-3 flex gap-2">
            <Button 
              size="sm" 
              onClick={() => onStatusChange(appointment.id, "confirmed")}
              className="flex-1 gap-1"
              data-testid={`button-confirm-${appointment.id}`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Konfirmasi
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onStatusChange(appointment.id, "cancelled")}
              data-testid={`button-cancel-${appointment.id}`}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {appointment.status === "confirmed" && (
          <div className="mt-3">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onStatusChange(appointment.id, "completed")}
              className="w-full gap-1"
              data-testid={`button-complete-${appointment.id}`}
            >
              <CheckCircle2 className="h-4 w-4" />
              Selesai
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OverviewTab({ 
  businessId,
  stats,
  appointments,
  onStatusChange
}: { 
  businessId: string;
  stats: DashboardStats;
  appointments: AppointmentWithDetails[];
  onStatusChange: (id: string, status: string) => void;
}) {
  const todayAppointments = appointments.filter((a) => {
    const date = new Date(a.startTime);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Booking Hari Ini"
          value={stats.todayBookings}
          icon={CalendarDays}
        />
        <StatCard
          title="Menunggu Konfirmasi"
          value={stats.pendingBookings}
          icon={AlertCircle}
          variant="warning"
        />
        <StatCard
          title="Selesai Hari Ini"
          value={stats.completedToday}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Est. Revenue"
          value={formatPrice(stats.estimatedRevenue)}
          icon={TrendingUp}
        />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Jadwal Hari Ini</h3>
        {todayAppointments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {todayAppointments.map((apt) => (
              <AppointmentCard 
                key={apt.id} 
                appointment={apt}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <CalendarDays className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Belum ada booking hari ini. Santai dulu bos!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function CalendarTab({ 
  appointments,
  onStatusChange
}: { 
  appointments: AppointmentWithDetails[];
  onStatusChange: (id: string, status: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const filteredAppointments = appointments.filter((a) => {
    const date = new Date(a.startTime);
    return date.toDateString() === selectedDate.toDateString();
  }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const goToPrevDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={goToToday} data-testid="button-today">
          Hari Ini
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToPrevDay} data-testid="button-prev-day">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="min-w-[140px] text-center font-medium">
            {formatDateIndonesian(selectedDate)}
          </span>
          <Button variant="ghost" size="icon" onClick={goToNextDay} data-testid="button-next-day">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        <div className="w-20" />
      </div>

      {filteredAppointments.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAppointments.map((apt) => (
            <AppointmentCard 
              key={apt.id} 
              appointment={apt}
              onStatusChange={onStatusChange}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Tidak ada jadwal untuk tanggal ini
          </p>
        </Card>
      )}
    </div>
  );
}

function ServicesTab({ 
  businessId,
  services,
  refetch
}: { 
  businessId: string;
  services: Service[];
  refetch: () => void;
}) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      duration: 30,
      price: 50000,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ServiceForm) => {
      const res = await apiRequest("POST", `/api/businesses/${businessId}/services`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Jasa baru ditambahkan" });
      setDialogOpen(false);
      form.reset();
      refetch();
    },
    onError: (error: Error) => {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ServiceForm }) => {
      const res = await apiRequest("PATCH", `/api/services/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Jasa diperbarui" });
      setDialogOpen(false);
      setEditingService(null);
      form.reset();
      refetch();
    },
    onError: (error: Error) => {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/services/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Jasa dihapus" });
      refetch();
    },
    onError: (error: Error) => {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    },
  });

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      description: service.description || "",
      duration: service.duration,
      price: service.price,
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingService(null);
    form.reset({
      name: "",
      description: "",
      duration: 30,
      price: 50000,
    });
    setDialogOpen(true);
  };

  const handleSubmit = form.handleSubmit((data) => {
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data });
    } else {
      createMutation.mutate(data);
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Daftar Jasa</h3>
        <Button onClick={openNewDialog} className="gap-2" data-testid="button-add-service">
          <Plus className="h-4 w-4" />
          Tambah Jasa
        </Button>
      </div>

      {services.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card 
              key={service.id} 
              className="cursor-pointer transition-all hover:border-primary/50"
              onClick={() => openEditDialog(service)}
              data-testid={`card-service-${service.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-semibold">{service.name}</h4>
                    {service.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <Badge variant={service.isActive ? "default" : "secondary"}>
                    {service.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDuration(service.duration)}
                  </span>
                  <span className="font-semibold text-primary">
                    {formatPrice(service.price)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Scissors className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Belum ada jasa. Tambahkan jasa pertamamu!
          </p>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Edit Jasa" : "Tambah Jasa Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingService 
                ? "Perbarui informasi jasa" 
                : "Tambahkan jasa baru untuk ditawarkan ke customer"
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Jasa</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Potong Rambut" {...field} data-testid="input-service-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Deskripsi singkat tentang jasa ini" {...field} data-testid="input-service-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durasi (menit)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-service-duration"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga (Rp)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-service-price"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                {editingService && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      deleteMutation.mutate(editingService.id);
                      setDialogOpen(false);
                    }}
                    data-testid="button-delete-service"
                  >
                    Hapus
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-service"
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? "Menyimpan..." 
                    : "Simpan"
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StaffTab({ 
  businessId,
  staffList,
  refetch
}: { 
  businessId: string;
  staffList: Staff[];
  refetch: () => void;
}) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  const form = useForm<StaffForm>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: StaffForm) => {
      const res = await apiRequest("POST", `/api/businesses/${businessId}/staff`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Staff baru ditambahkan" });
      setDialogOpen(false);
      form.reset();
      refetch();
    },
    onError: (error: Error) => {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: StaffForm }) => {
      const res = await apiRequest("PATCH", `/api/staff/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Staff diperbarui" });
      setDialogOpen(false);
      setEditingStaff(null);
      form.reset();
      refetch();
    },
    onError: (error: Error) => {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/staff/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Staff dihapus" });
      refetch();
    },
    onError: (error: Error) => {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    },
  });

  const openEditDialog = (staff: Staff) => {
    setEditingStaff(staff);
    form.reset({
      name: staff.name,
      email: staff.email || "",
      phone: staff.phone || "",
    });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingStaff(null);
    form.reset({
      name: "",
      email: "",
      phone: "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = form.handleSubmit((data) => {
    if (editingStaff) {
      updateMutation.mutate({ id: editingStaff.id, data });
    } else {
      createMutation.mutate(data);
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Daftar Staff</h3>
        <Button onClick={openNewDialog} className="gap-2" data-testid="button-add-staff">
          <Plus className="h-4 w-4" />
          Tambah Staff
        </Button>
      </div>

      {staffList.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staffList.map((staff) => (
            <Card 
              key={staff.id} 
              className="cursor-pointer transition-all hover:border-primary/50"
              onClick={() => openEditDialog(staff)}
              data-testid={`card-staff-${staff.id}`}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={staff.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {staff.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold">{staff.name}</h4>
                  {staff.phone && (
                    <p className="text-sm text-muted-foreground">{staff.phone}</p>
                  )}
                </div>
                <Badge variant={staff.isActive ? "default" : "secondary"}>
                  {staff.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">
            Belum ada staff. Tambahkan staff pertamamu!
          </p>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStaff ? "Edit Staff" : "Tambah Staff Baru"}
            </DialogTitle>
            <DialogDescription>
              {editingStaff 
                ? "Perbarui informasi staff" 
                : "Tambahkan staff baru untuk melayani customer"
              }
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Staff</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Budi" {...field} data-testid="input-staff-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. HP (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="08123456789" {...field} data-testid="input-staff-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Opsional)</FormLabel>
                    <FormControl>
                      <Input placeholder="budi@gmail.com" {...field} data-testid="input-staff-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2 sm:gap-0">
                {editingStaff && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => {
                      deleteMutation.mutate(editingStaff.id);
                      setDialogOpen(false);
                    }}
                    data-testid="button-delete-staff"
                  >
                    Hapus
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-staff"
                >
                  {createMutation.isPending || updateMutation.isPending 
                    ? "Menyimpan..." 
                    : "Simpan"
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsTab({ business }: { business: Business }) {
  const bookingUrl = `${window.location.origin}/book/${business.slug}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Link Booking</CardTitle>
          <CardDescription>
            Bagikan link ini ke customer untuk booking online
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              value={bookingUrl} 
              readOnly 
              className="font-mono text-sm"
              data-testid="input-booking-url"
            />
            <Button 
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(bookingUrl);
              }}
              data-testid="button-copy-url"
            >
              Salin
            </Button>
            <a href={bookingUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profil Bisnis</CardTitle>
          <CardDescription>
            Informasi dasar tentang usahamu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nama Usaha</p>
                <p className="font-medium">{business.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Kategori</p>
                <p className="font-medium capitalize">{business.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Pemilik</p>
                <p className="font-medium">{business.ownerName}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{business.ownerEmail}</p>
              </div>
              {business.phone && (
                <div>
                  <p className="text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{business.phone}</p>
                </div>
              )}
              {business.address && (
                <div className="col-span-2">
                  <p className="text-muted-foreground">Alamat</p>
                  <p className="font-medium">{business.address}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-8 w-32" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function Sidebar({ 
  business,
  activeTab,
  onTabChange 
}: { 
  business: Business;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}) {
  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Home },
    { id: "calendar" as const, label: "Kalender", icon: Calendar },
    { id: "services" as const, label: "Jasa", icon: Scissors },
    { id: "staff" as const, label: "Staff", icon: Users },
    { id: "settings" as const, label: "Pengaturan", icon: Settings },
  ];

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-4">
        <Link href="/">
          <span className="text-xl font-bold text-primary">Janji.in</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={business.logoUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {business.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{business.name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {business.category}
              </p>
            </div>
          </div>
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              data-testid={`nav-${tab.id}`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {business.ownerEmail}
          </span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}

function MobileNav({ 
  activeTab,
  onTabChange 
}: { 
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}) {
  const tabs = [
    { id: "overview" as const, label: "Home", icon: Home },
    { id: "calendar" as const, label: "Kalender", icon: Calendar },
    { id: "services" as const, label: "Jasa", icon: Scissors },
    { id: "staff" as const, label: "Staff", icon: Users },
    { id: "settings" as const, label: "Akun", icon: Settings },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card lg:hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
              activeTab === tab.id
                ? "text-primary"
                : "text-muted-foreground"
            }`}
            data-testid={`mobile-nav-${tab.id}`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export default function DashboardPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  const { data, isLoading, error, refetch } = useQuery<{
    business: Business;
    services: Service[];
    staff: Staff[];
    appointments: AppointmentWithDetails[];
    stats: DashboardStats;
  }>({
    queryKey: ["/api/dashboard", businessId],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/appointments/${id}/status`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Berhasil", description: "Status diperbarui" });
      refetch();
    },
    onError: (error: Error) => {
      toast({ title: "Gagal", description: error.message, variant: "destructive" });
    },
  });

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold">Gagal Memuat</h2>
          <p className="mb-4 text-muted-foreground">
            Terjadi kesalahan saat memuat data
          </p>
          <Button onClick={() => refetch()} data-testid="button-retry">
            Coba Lagi
          </Button>
        </Card>
      </div>
    );
  }

  const { business, services, staff, appointments, stats } = data;

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <Sidebar 
          business={business} 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
      </div>

      <div className="flex-1 pb-20 lg:pb-0">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md lg:px-6">
          <div className="flex items-center gap-4 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Sidebar 
                  business={business} 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab}
                />
              </SheetContent>
            </Sheet>
            <span className="font-bold text-primary">Janji.in</span>
          </div>

          <h1 className="hidden text-xl font-semibold lg:block">
            {activeTab === "overview" && "Dashboard"}
            {activeTab === "calendar" && "Kalender"}
            {activeTab === "services" && "Kelola Jasa"}
            {activeTab === "staff" && "Kelola Staff"}
            {activeTab === "settings" && "Pengaturan"}
          </h1>

          <div className="flex items-center gap-2">
            <Link href={`/book/${business.slug}`}>
              <Button variant="outline" size="sm" className="gap-2" data-testid="button-preview">
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Lihat Booking Page</span>
              </Button>
            </Link>
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {activeTab === "overview" && (
            <OverviewTab 
              businessId={businessId}
              stats={stats}
              appointments={appointments}
              onStatusChange={handleStatusChange}
            />
          )}
          {activeTab === "calendar" && (
            <CalendarTab 
              appointments={appointments}
              onStatusChange={handleStatusChange}
            />
          )}
          {activeTab === "services" && (
            <ServicesTab 
              businessId={businessId}
              services={services}
              refetch={refetch}
            />
          )}
          {activeTab === "staff" && (
            <StaffTab 
              businessId={businessId}
              staffList={staff}
              refetch={refetch}
            />
          )}
          {activeTab === "settings" && (
            <SettingsTab business={business} />
          )}
        </main>
      </div>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
