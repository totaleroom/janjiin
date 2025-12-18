import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { 
  Scissors, 
  Sparkles, 
  Stethoscope, 
  Flower2,
  Dumbbell,
  Wrench,
  GraduationCap,
  Camera,
  Shirt,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  Check,
  Clock
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { generateSlug } from "@/lib/utils";
import { BUSINESS_CATEGORIES, CATEGORY_LABELS, SERVICE_TEMPLATES, type BusinessCategory } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_ICONS: Record<BusinessCategory, typeof Scissors> = {
  barbershop: Scissors,
  salon: Sparkles,
  dental: Stethoscope,
  spa: Flower2,
  gym: Dumbbell,
  auto: Wrench,
  tutor: GraduationCap,
  photo: Camera,
  laundry: Shirt,
  other: MoreHorizontal,
};

// Step 1: Business Profile Schema
const step1Schema = z.object({
  name: z.string().min(2, "Nama usaha minimal 2 karakter"),
  slug: z.string().min(3, "Slug minimal 3 karakter").regex(/^[a-z0-9-]+$/, "Hanya huruf kecil, angka, dan strip"),
  ownerName: z.string().min(2, "Nama pemilik minimal 2 karakter"),
  ownerEmail: z.string().email("Email tidak valid"),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Step 2: Category Schema
const step2Schema = z.object({
  category: z.enum(BUSINESS_CATEGORIES),
});

// Step 3: Operating Hours Schema
const step3Schema = z.object({
  openTime: z.string().min(1, "Pilih jam buka"),
  closeTime: z.string().min(1, "Pilih jam tutup"),
  workDays: z.array(z.string()).min(1, "Pilih minimal 1 hari kerja"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

const DAYS = [
  { value: "monday", label: "Sen" },
  { value: "tuesday", label: "Sel" },
  { value: "wednesday", label: "Rab" },
  { value: "thursday", label: "Kam" },
  { value: "friday", label: "Jum" },
  { value: "saturday", label: "Sab" },
  { value: "sunday", label: "Min" },
];

function Step1Form({ 
  data, 
  onNext 
}: { 
  data: Partial<Step1Data>; 
  onNext: (data: Step1Data) => void;
}) {
  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: data.name || "",
      slug: data.slug || "",
      ownerName: data.ownerName || "",
      ownerEmail: data.ownerEmail || "",
      phone: data.phone || "",
      address: data.address || "",
    },
  });

  const watchName = form.watch("name");

  useEffect(() => {
    if (watchName && !form.getValues("slug")) {
      form.setValue("slug", generateSlug(watchName));
    }
  }, [watchName, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Halo, Bos!</h2>
          <p className="mt-2 text-muted-foreground">
            Ceritain dikit tentang usahamu
          </p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Usaha</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Contoh: Barbershop Asgar 99" 
                  {...field} 
                  data-testid="input-business-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Link Booking</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">janji.in/</span>
                  <Input 
                    placeholder="asgar99" 
                    {...field}
                    onChange={(e) => field.onChange(generateSlug(e.target.value))}
                    data-testid="input-slug"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Link ini akan jadi alamat booking page kamu
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="ownerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pemilik</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Asgar" 
                    {...field} 
                    data-testid="input-owner-name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ownerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="asgar@gmail.com" 
                    {...field} 
                    data-testid="input-owner-email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>No. WhatsApp (Opsional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="08123456789" 
                  {...field} 
                  data-testid="input-phone"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat (Opsional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Jl. Raya No. 123, Jakarta Selatan" 
                  {...field} 
                  data-testid="input-address"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full gap-2" data-testid="button-next-step1">
          Lanjut: Pilih Kategori
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
}

function Step2Form({ 
  data, 
  onNext, 
  onBack 
}: { 
  data: Partial<Step2Data>; 
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<BusinessCategory | null>(data.category || null);

  const handleSubmit = () => {
    if (selected) {
      onNext({ category: selected });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Jenis Usaha</h2>
        <p className="mt-2 text-muted-foreground">
          Pilih kategori yang paling cocok. Nanti masih bisa disesuaikan kok.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {BUSINESS_CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const isSelected = selected === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelected(cat)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                isSelected 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
              data-testid={`button-category-${cat}`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className={`text-sm font-medium ${isSelected ? "text-primary" : ""}`}>
                {CATEGORY_LABELS[cat]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2" data-testid="button-back-step2">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={!selected}
          className="flex-1 gap-2"
          data-testid="button-next-step2"
        >
          Lanjut: Atur Jam Buka
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Step3Form({ 
  data, 
  onSubmit, 
  onBack,
  isLoading
}: { 
  data: Partial<Step3Data>; 
  onSubmit: (data: Step3Data) => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      openTime: data.openTime || "09:00",
      closeTime: data.closeTime || "21:00",
      workDays: data.workDays || ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    },
  });

  const workDays = form.watch("workDays");

  const toggleDay = (day: string) => {
    const current = form.getValues("workDays");
    if (current.includes(day)) {
      form.setValue("workDays", current.filter((d) => d !== day));
    } else {
      form.setValue("workDays", [...current, day]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Jam Operasional</h2>
          <p className="mt-2 text-muted-foreground">
            Atur jam buka & hari kerja usahamu
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="openTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Jam Buka
                </FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    {...field} 
                    data-testid="input-open-time"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="closeTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Jam Tutup
                </FormLabel>
                <FormControl>
                  <Input 
                    type="time" 
                    {...field} 
                    data-testid="input-close-time"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="workDays"
          render={() => (
            <FormItem>
              <FormLabel>Hari Kerja</FormLabel>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => {
                  const isSelected = workDays.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      data-testid={`button-day-${day.value}`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              Tenang, kamu bisa atur jam per hari secara detail nanti di dashboard. 
              Ini cuma setting awal biar cepet jadi.
            </p>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button 
            type="button"
            variant="outline" 
            onClick={onBack} 
            className="gap-2"
            disabled={isLoading}
            data-testid="button-back-step3"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <Button 
            type="submit" 
            className="flex-1 gap-2"
            disabled={isLoading}
            data-testid="button-submit-onboarding"
          >
            {isLoading ? (
              "Menyimpan..."
            ) : (
              <>
                <Check className="h-4 w-4" />
                Selesai & Buka Dashboard
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function OnboardingPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<{
    step1: Partial<Step1Data>;
    step2: Partial<Step2Data>;
    step3: Partial<Step3Data>;
  }>({
    step1: {},
    step2: {},
    step3: {},
  });

  const createBusinessMutation = useMutation({
    mutationFn: async (data: {
      business: Step1Data & Step2Data;
      operatingHours: Step3Data;
    }) => {
      const res = await apiRequest("POST", "/api/businesses", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Selamat!",
        description: "Usahamu sudah terdaftar. Selamat datang di Janji.in!",
      });
      navigate(`/dashboard/${data.business.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Gagal menyimpan",
        description: error.message || "Terjadi kesalahan. Coba lagi.",
        variant: "destructive",
      });
    },
  });

  const handleStep1 = (data: Step1Data) => {
    setFormData((prev) => ({ ...prev, step1: data }));
    setStep(2);
  };

  const handleStep2 = (data: Step2Data) => {
    setFormData((prev) => ({ ...prev, step2: data }));
    setStep(3);
  };

  const handleStep3 = (data: Step3Data) => {
    setFormData((prev) => ({ ...prev, step3: data }));
    
    createBusinessMutation.mutate({
      business: {
        ...formData.step1 as Step1Data,
        ...formData.step2 as Step2Data,
      },
      operatingHours: data,
    });
  };

  const progress = (step / 3) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">Janji.in</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Step {step} dari 3
            </span>
            <ThemeToggle />
          </div>
        </div>

        <Progress value={progress} className="mb-8" data-testid="progress-onboarding" />

        <div className="mx-auto max-w-lg">
          <Card>
            <CardContent className="pt-6">
              {step === 1 && (
                <Step1Form data={formData.step1} onNext={handleStep1} />
              )}
              {step === 2 && (
                <Step2Form 
                  data={formData.step2} 
                  onNext={handleStep2} 
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <Step3Form 
                  data={formData.step3} 
                  onSubmit={handleStep3} 
                  onBack={() => setStep(2)}
                  isLoading={createBusinessMutation.isPending}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
