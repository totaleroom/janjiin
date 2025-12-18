import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          
          <h1 className="mb-2 text-2xl font-bold" data-testid="text-404-title">
            Halaman Tidak Ditemukan
          </h1>
          
          <p className="mb-6 text-muted-foreground">
            Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan.
          </p>

          <Link href="/">
            <Button className="gap-2" data-testid="button-go-home">
              <Home className="h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
