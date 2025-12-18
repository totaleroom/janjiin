import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { id } from "date-fns/locale";
import { format, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentWithDetails } from "@shared/schema";
import "react-day-picker/dist/style.css";

interface AppointmentCalendarProps {
    appointments: AppointmentWithDetails[];
    onDateSelect?: (date: Date) => void;
    onAppointmentClick?: (appointment: AppointmentWithDetails) => void;
    selectedDate?: Date;
}

export function AppointmentCalendar({
    appointments,
    onDateSelect,
    onAppointmentClick,
    selectedDate: externalSelectedDate
}: AppointmentCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(externalSelectedDate || new Date());

    // Get dates that have appointments
    const appointmentDates = appointments.reduce((acc, apt) => {
        const date = new Date(apt.startTime);
        const dateKey = format(date, "yyyy-MM-dd");

        if (!acc[dateKey]) {
            acc[dateKey] = { count: 0, hasConfirmed: false, hasPending: false };
        }

        acc[dateKey].count++;
        if (apt.status === "confirmed") acc[dateKey].hasConfirmed = true;
        if (apt.status === "pending") acc[dateKey].hasPending = true;

        return acc;
    }, {} as Record<string, { count: number; hasConfirmed: boolean; hasPending: boolean }>);

    // Filter appointments for selected date
    const selectedDateAppointments = appointments
        .filter((apt) => isSameDay(new Date(apt.startTime), selectedDate))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date);
            onDateSelect?.(date);
        }
    };

    // Custom day modifiers
    const modifiers = {
        hasAppointment: (date: Date) => {
            const dateKey = format(date, "yyyy-MM-dd");
            return !!appointmentDates[dateKey];
        },
        hasPending: (date: Date) => {
            const dateKey = format(date, "yyyy-MM-dd");
            return appointmentDates[dateKey]?.hasPending || false;
        },
    };

    const modifiersStyles = {
        hasAppointment: {
            fontWeight: "bold",
        },
    };

    return (
        <div className="grid gap-4 md:grid-cols-[320px,1fr]">
            {/* Calendar */}
            <Card>
                <CardContent className="p-3">
                    <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        locale={id}
                        modifiers={modifiers}
                        modifiersStyles={modifiersStyles}
                        showOutsideDays
                        className="mx-auto"
                        classNames={{
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground",
                            day: cn(
                                "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full",
                                "hover:bg-accent hover:text-accent-foreground"
                            ),
                        }}
                        components={{
                            DayContent: ({ date }) => {
                                const dateKey = format(date, "yyyy-MM-dd");
                                const info = appointmentDates[dateKey];

                                return (
                                    <div className="relative flex items-center justify-center w-full h-full">
                                        {date.getDate()}
                                        {info && (
                                            <span
                                                className={cn(
                                                    "absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full",
                                                    info.hasPending ? "bg-yellow-500" : "bg-green-500"
                                                )}
                                            />
                                        )}
                                    </div>
                                );
                            },
                        }}
                    />

                    {/* Legend */}
                    <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground border-t pt-3">
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Terkonfirmasi
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                            Pending
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Appointments list for selected date */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">
                        {format(selectedDate, "EEEE, d MMMM yyyy", { locale: id })}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedDateAppointments.length > 0 ? (
                        <div className="space-y-3">
                            {selectedDateAppointments.map((apt) => (
                                <div
                                    key={apt.id}
                                    className={cn(
                                        "p-3 rounded-lg border cursor-pointer transition-colors",
                                        "hover:bg-accent/50",
                                        apt.status === "pending" && "border-yellow-500/50 bg-yellow-50/50 dark:bg-yellow-900/10",
                                        apt.status === "confirmed" && "border-green-500/50 bg-green-50/50 dark:bg-green-900/10",
                                        apt.status === "cancelled" && "border-red-500/50 bg-red-50/50 dark:bg-red-900/10 opacity-60"
                                    )}
                                    onClick={() => onAppointmentClick?.(apt)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">
                                                    {format(new Date(apt.startTime), "HH:mm")} - {format(new Date(apt.endTime), "HH:mm")}
                                                </span>
                                                <Badge variant={
                                                    apt.status === "pending" ? "outline" :
                                                        apt.status === "confirmed" ? "default" :
                                                            apt.status === "cancelled" ? "destructive" :
                                                                "secondary"
                                                }>
                                                    {apt.status === "pending" ? "Pending" :
                                                        apt.status === "confirmed" ? "Dikonfirmasi" :
                                                            apt.status === "cancelled" ? "Dibatalkan" :
                                                                "Selesai"}
                                                </Badge>
                                            </div>
                                            <p className="mt-1 font-medium">{apt.customerName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {apt.service.name} • {apt.staff.name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-primary">
                                                Rp {apt.totalPrice.toLocaleString("id-ID")}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{apt.customerPhone}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>Tidak ada jadwal untuk tanggal ini</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
