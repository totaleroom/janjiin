import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, User, Phone, MapPin, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AppointmentDetails {
    id: string;
    customerName: string;
    customerPhone: string;
    startTime: string;
    endTime: string;
    status: string;
    rescheduleRequestedAt: string | null;
    rescheduleReason: string | null;
    suggestedSlot: string | null;
    suggestedSlotMessage: string | null;
    service: { name: string; duration: number; price: number };
    staff: { name: string };
    business: { name: string; address: string };
}

export default function ReschedulePage() {
    const { appointmentId } = useParams();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const [reason, setReason] = useState("");

    // Fetch appointment details
    const { data: appointment, isLoading, error, refetch } = useQuery({
        queryKey: ["appointment", appointmentId],
        queryFn: async () => {
            const res = await fetch(`/api/appointments/${appointmentId}`);
            if (!res.ok) throw new Error("Appointment tidak ditemukan");
            return res.json() as Promise<AppointmentDetails>;
        },
    });

    // Request reschedule mutation
    const requestRescheduleMutation = useMutation({
        mutationFn: async (data: { reason: string }) => {
            const res = await apiRequest("POST", `/api/appointments/${appointmentId}/reschedule`, data);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Permintaan Terkirim",
                description: "Bisnis akan menghubungi Anda dengan jadwal alternatif",
            });
            refetch();
        },
        onError: (error: Error) => {
            toast({
                title: "Gagal",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Confirm suggested slot mutation
    const confirmSlotMutation = useMutation({
        mutationFn: async () => {
            if (!appointment?.suggestedSlot) throw new Error("No suggested slot");

            const newStart = new Date(appointment.suggestedSlot);
            const newEnd = new Date(newStart);
            newEnd.setMinutes(newEnd.getMinutes() + appointment.service.duration);

            const res = await apiRequest("POST", `/api/appointments/${appointmentId}/confirm-reschedule`, {
                newStartTime: newStart.toISOString(),
                newEndTime: newEnd.toISOString(),
            });
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Jadwal Dikonfirmasi",
                description: "Jadwal baru Anda telah dikonfirmasi!",
            });
            refetch();
        },
        onError: (error: Error) => {
            toast({
                title: "Gagal",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleSubmitRequest = () => {
        if (!reason.trim()) {
            toast({
                title: "Alasan diperlukan",
                description: "Mohon masukkan alasan reschedule",
                variant: "destructive",
            });
            return;
        }
        requestRescheduleMutation.mutate({ reason });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
                <div className="mx-auto max-w-lg space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-60 w-full" />
                </div>
            </div>
        );
    }

    if (error || !appointment) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
                <div className="mx-auto max-w-lg">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Appointment tidak ditemukan. Pastikan link Anda benar.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    const startTime = new Date(appointment.startTime);
    const hasRescheduleRequest = !!appointment.rescheduleRequestedAt;
    const hasSuggestedSlot = !!appointment.suggestedSlot;

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4">
            <div className="mx-auto max-w-lg space-y-4">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-primary">Reschedule Booking</h1>
                    <p className="text-muted-foreground">Ajukan perubahan jadwal booking Anda</p>
                </div>

                {/* Booking Details Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Detail Booking</CardTitle>
                        <CardDescription>{appointment.business.name}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">
                                    {format(startTime, "EEEE, d MMMM yyyy", { locale: id })}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {format(startTime, "HH:mm")} - {format(new Date(appointment.endTime), "HH:mm")} WIB
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{appointment.customerName}</p>
                                <p className="text-sm text-muted-foreground">{appointment.customerPhone}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="font-medium">{appointment.service.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {appointment.service.duration} menit • Staff: {appointment.staff.name}
                                </p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Badge variant={
                                appointment.status === "pending" ? "outline" :
                                    appointment.status === "confirmed" ? "default" :
                                        "secondary"
                            }>
                                {appointment.status === "pending" ? "Menunggu Konfirmasi" :
                                    appointment.status === "confirmed" ? "Dikonfirmasi" :
                                        appointment.status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Suggested Slot Card */}
                {hasSuggestedSlot && (
                    <Card className="border-green-500/50 bg-green-50/30 dark:bg-green-900/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Jadwal Alternatif Tersedia
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground line-through">
                                        {format(startTime, "d MMM, HH:mm", { locale: id })}
                                    </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                <div className="text-center font-medium text-green-700 dark:text-green-400">
                                    {format(new Date(appointment.suggestedSlot!), "EEEE, d MMMM yyyy", { locale: id })}
                                    <br />
                                    {format(new Date(appointment.suggestedSlot!), "HH:mm")} WIB
                                </div>
                            </div>

                            {appointment.suggestedSlotMessage && (
                                <p className="text-sm italic text-muted-foreground">
                                    "{appointment.suggestedSlotMessage}"
                                </p>
                            )}

                            <Button
                                className="w-full"
                                onClick={() => confirmSlotMutation.mutate()}
                                disabled={confirmSlotMutation.isPending}
                            >
                                {confirmSlotMutation.isPending ? "Mengkonfirmasi..." : "Konfirmasi Jadwal Baru"}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Reschedule Request Form */}
                {!hasRescheduleRequest && !hasSuggestedSlot && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Ajukan Reschedule</CardTitle>
                            <CardDescription>
                                Beritahu kami alasan Anda tidak bisa hadir
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="reason">Alasan Reschedule</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Contoh: Ada keperluan mendadak, ingin ganti ke hari Sabtu..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <Button
                                className="w-full"
                                onClick={handleSubmitRequest}
                                disabled={requestRescheduleMutation.isPending}
                            >
                                {requestRescheduleMutation.isPending ? "Mengirim..." : "Kirim Permintaan"}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Waiting for response */}
                {hasRescheduleRequest && !hasSuggestedSlot && (
                    <Card className="border-yellow-500/50 bg-yellow-50/30 dark:bg-yellow-900/10">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="animate-pulse">
                                <Clock className="h-8 w-8 text-yellow-600" />
                            </div>
                            <div>
                                <p className="font-medium">Menunggu Respon</p>
                                <p className="text-sm text-muted-foreground">
                                    Bisnis akan segera menghubungi Anda dengan jadwal alternatif
                                </p>
                                {appointment.rescheduleReason && (
                                    <p className="mt-2 text-sm italic">
                                        Alasan Anda: "{appointment.rescheduleReason}"
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Back link */}
                <div className="text-center">
                    <Button variant="ghost" onClick={() => setLocation("/")}>
                        Kembali ke Beranda
                    </Button>
                </div>
            </div>
        </div>
    );
}
