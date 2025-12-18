import { useState, useEffect } from "react";
import { useAuth, useAuthFetch, ProtectedRoute } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Building2,
    Users,
    Calendar,
    CreditCard,
    TrendingUp,
    Power,
    Eye
} from "lucide-react";

interface AdminStats {
    totalBusinesses: number;
    totalUsers: number;
    totalAppointments: number;
    totalRevenue: number;
}

interface Business {
    id: string;
    name: string;
    slug: string;
    category: string;
    ownerEmail: string;
    isActive: boolean;
    subscriptionTier: string;
    createdAt: string;
}

interface User {
    id: string;
    email: string;
    role: string;
    businessId: string | null;
    isActive: boolean;
    createdAt: string;
}

export default function AdminDashboard() {
    return (
        <ProtectedRoute requiredRole="admin">
            <AdminDashboardContent />
        </ProtectedRoute>
    );
}

function AdminDashboardContent() {
    const authFetch = useAuthFetch();
    const { logout } = useAuth();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, businessesRes, usersRes] = await Promise.all([
                authFetch("/api/admin/stats"),
                authFetch("/api/admin/businesses"),
                authFetch("/api/admin/users"),
            ]);

            if (statsRes.ok) {
                setStats(await statsRes.json());
            }
            if (businessesRes.ok) {
                setBusinesses(await businessesRes.json());
            }
            if (usersRes.ok) {
                setUsers(await usersRes.json());
            }
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const deactivateBusiness = async (id: string) => {
        try {
            const response = await authFetch(`/api/admin/businesses/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                setBusinesses((prev) =>
                    prev.map((b) => (b.id === id ? { ...b, isActive: false } : b))
                );
            }
        } catch (error) {
            console.error("Failed to deactivate business:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Janji.in Admin</h1>
                        <p className="text-sm text-gray-500">Super Admin Dashboard</p>
                    </div>
                    <Button variant="outline" onClick={logout}>
                        Logout
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Total Bisnis
                            </CardTitle>
                            <Building2 className="w-4 h-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalBusinesses || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Total Users
                            </CardTitle>
                            <Users className="w-4 h-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Total Appointments
                            </CardTitle>
                            <Calendar className="w-4 h-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalAppointments || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">
                                Total Revenue
                            </CardTitle>
                            <CreditCard className="w-4 h-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                Rp {(stats?.totalRevenue || 0).toLocaleString("id-ID")}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="businesses" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="businesses">Bisnis</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                    </TabsList>

                    <TabsContent value="businesses">
                        <Card>
                            <CardHeader>
                                <CardTitle>Daftar Bisnis</CardTitle>
                                <CardDescription>
                                    Kelola semua bisnis yang terdaftar di platform
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Slug</TableHead>
                                            <TableHead>Kategori</TableHead>
                                            <TableHead>Owner</TableHead>
                                            <TableHead>Tier</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {businesses.map((business) => (
                                            <TableRow key={business.id}>
                                                <TableCell className="font-medium">{business.name}</TableCell>
                                                <TableCell>{business.slug}</TableCell>
                                                <TableCell className="capitalize">{business.category}</TableCell>
                                                <TableCell>{business.ownerEmail}</TableCell>
                                                <TableCell>
                                                    <Badge variant={business.subscriptionTier === "free" ? "secondary" : "default"}>
                                                        {business.subscriptionTier}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={business.isActive ? "default" : "destructive"}>
                                                        {business.isActive ? "Aktif" : "Nonaktif"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="icon" asChild>
                                                            <a href={`/book/${business.slug}`} target="_blank">
                                                                <Eye className="w-4 h-4" />
                                                            </a>
                                                        </Button>
                                                        {business.isActive && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="ghost" size="icon">
                                                                        <Power className="w-4 h-4 text-red-500" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Nonaktifkan Bisnis?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Bisnis "{business.name}" akan dinonaktifkan dan tidak bisa menerima booking baru.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => deactivateBusiness(business.id)}>
                                                                            Nonaktifkan
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="users">
                        <Card>
                            <CardHeader>
                                <CardTitle>Daftar Users</CardTitle>
                                <CardDescription>
                                    Semua pengguna yang terdaftar di platform
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Business ID</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Terdaftar</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                                        {user.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{user.businessId || "-"}</TableCell>
                                                <TableCell>
                                                    <Badge variant={user.isActive ? "default" : "destructive"}>
                                                        {user.isActive ? "Aktif" : "Nonaktif"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
