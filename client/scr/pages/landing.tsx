import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  MessageCircle, 
  Banknote, 
  CalendarCheck, 
  Clock, 
  Users, 
  Smartphone,
  ChevronRight,
  Check,
  Scissors,
  Sparkles,
  Stethoscope,
  ArrowRight
} from "lucide-react";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Link href="/">
          <span className="text-xl font-bold text-primary tracking-tight cursor-pointer" data-testid="link-logo">
            Janji.in
          </span>
        </Link>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="ghost" data-testid="button-login">
              Masuk
            </Button>
          </Link>
          <Link href="/register">
            <Button data-testid="button-register">
              Daftar Gratis
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6" data-testid="badge-hero">
            Platform Booking #1 untuk UKM Indonesia
          </Badge>
          
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            CAPE BALESIN CHAT{" "}
            <span className="text-primary">"KAK CEK SLOT KOSONG?"</span>
          </h1>
          
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            Ubah "Tanya-tanya" jadi{" "}
            <span className="font-semibold text-foreground">"Ting-Ting"</span>{" "}
            (Duit Masuk).{" "}
            <br className="hidden sm:block" />
            Website booking instan untuk Jasa Kamu.
          </p>
          
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2 text-base" data-testid="button-cta-hero">
                COBA GRATIS SEKARANG
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/demo/asgar99">
              <Button variant="outline" size="lg" className="gap-2 text-base" data-testid="button-demo">
                Lihat Demo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <p className="mt-4 text-sm text-muted-foreground">
            Tanpa kartu kredit. Setup 5 menit.
          </p>
        </div>
      </div>
      
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/2 right-0 h-[400px] w-[400px] rounded-full bg-highlight/5 blur-3xl" />
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: MessageCircle,
      title: "Notifikasi WhatsApp",
      description: "Booking masuk? Customer & Owner langsung dapat notif WA otomatis. Reminder H-1 juga!",
    },
    {
      icon: Banknote,
      title: "Anti No-Show (DP QRIS)",
      description: "Terima DP via QRIS (DANA/GoPay/OVO). Customer ghosting? Minimal DP sudah aman.",
    },
    {
      icon: CalendarCheck,
      title: "Anti Bentrok Jadwal",
      description: "Sistem cek slot realtime. Gak ada lagi double booking yang bikin pusing.",
    },
    {
      icon: Clock,
      title: "Booking 24/7",
      description: "Customer bisa booking kapan aja, tanpa nunggu bales chat. Malam-malam pun oke.",
    },
    {
      icon: Users,
      title: "Multi Staff",
      description: "Atur jadwal banyak staff sekaligus. Masing-masing punya kalender sendiri.",
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Dashboard bisa diakses dari HP. Cek jadwal sambil ngopi santai.",
    },
  ];

  return (
    <section className="py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Kenapa Harus Janji.in?
          </h2>
          <p className="text-muted-foreground">
            Fitur yang bikin hidup owner jasa jadi lebih gampang
          </p>
        </div>
        
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden" data-testid={`card-feature-${index}`}>
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function BusinessTypesSection() {
  const businesses = [
    { icon: Scissors, name: "Barbershop", slug: "barbershop" },
    { icon: Sparkles, name: "Salon Kecantikan", slug: "salon" },
    { icon: Stethoscope, name: "Klinik Gigi", slug: "dental" },
  ];

  return (
    <section className="bg-muted/30 py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Cocok untuk Berbagai Jasa
          </h2>
          <p className="text-muted-foreground">
            Dari salon, barbershop, klinik, sampai bengkel. Semua bisa!
          </p>
        </div>
        
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {businesses.map((biz, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-2xl bg-card px-6 py-4 shadow-sm"
              data-testid={`card-business-type-${biz.slug}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <biz.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">{biz.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-2xl bg-card px-6 py-4 shadow-sm">
            <span className="text-muted-foreground">+ Spa, Gym, Bengkel, Les, Studio Foto, dll.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: "GRATIS",
      subtitle: "Starter",
      price: "Rp 0",
      period: "selamanya",
      description: "Cocok untuk usaha baru atau solo",
      features: [
        "Max 20 booking/bulan",
        "1 Staff",
        "Booking page publik",
        "Notifikasi WA manual",
      ],
      cta: "Mulai Gratis",
      popular: false,
    },
    {
      name: "MAJU",
      subtitle: "Pro",
      price: "Rp 49.000",
      period: "/bulan",
      description: "Untuk usaha yang mulai ramai",
      features: [
        "Unlimited booking",
        "Hingga 5 Staff",
        "Notifikasi WA Otomatis",
        "Terima DP via QRIS",
        "Google Calendar sync",
        "Priority support",
      ],
      cta: "Pilih Maju",
      popular: true,
    },
    {
      name: "SUKSES",
      subtitle: "Business",
      price: "Rp 149.000",
      period: "/bulan",
      description: "Untuk bisnis yang sudah mapan",
      features: [
        "Semua fitur Maju",
        "Unlimited Staff",
        "Multi cabang (soon)",
        "Custom branding",
        "Export data customer",
        "Dedicated support",
      ],
      cta: "Pilih Sukses",
      popular: false,
    },
  ];

  return (
    <section className="py-20 lg:py-24" id="pricing">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Harga Terjangkau, Fitur Maksimal
          </h2>
          <p className="text-muted-foreground">
            Pilih paket yang sesuai kebutuhan usahamu
          </p>
        </div>
        
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.popular ? "border-primary shadow-lg" : ""}`}
              data-testid={`card-pricing-${plan.name.toLowerCase()}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Paling Populer
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="mb-2">
                  <Badge variant="outline">{plan.subtitle}</Badge>
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href="/register">
                  <Button 
                    className="mt-6 w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    data-testid={`button-pricing-${plan.name.toLowerCase()}`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="bg-primary py-16 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">
            Siap Ubah Cara Booking Usahamu?
          </h2>
          <p className="mb-8 text-primary-foreground/80">
            Join 100+ UKM Indonesia yang sudah pakai Janji.in
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="gap-2" data-testid="button-cta-bottom">
              Daftar Gratis Sekarang
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <span className="text-xl font-bold text-primary">Janji.in</span>
            <p className="mt-1 text-sm text-muted-foreground">
              Website booking instan untuk jasa Indonesia
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#pricing">
              <span className="cursor-pointer hover:text-foreground">Harga</span>
            </Link>
            <Link href="/login">
              <span className="cursor-pointer hover:text-foreground">Masuk</span>
            </Link>
            <a 
              href="https://wa.me/6281234567890" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Kontak
            </a>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Janji.in. Dibuat dengan cinta di Indonesia.</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <BusinessTypesSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
