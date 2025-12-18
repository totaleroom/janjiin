import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

interface User {
    id: string;
    email: string;
    role: "admin" | "business" | "customer";
    businessId?: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "janji_in_token";
const USER_KEY = "janji_in_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [, setLocation] = useLocation();

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setToken(storedToken);
                setUser(parsedUser);

                // Validate token with server
                validateSession(storedToken);
            } catch (error) {
                // Invalid stored data, clear it
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
            }
        }

        setIsLoading(false);
    }, []);

    const validateSession = async (authToken: string) => {
        try {
            const response = await fetch("/api/auth/me", {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            if (!response.ok) {
                // Token is invalid, clear auth state
                logout();
                return;
            }

            const data = await response.json();
            setUser(data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        } catch (error) {
            console.error("Session validation failed:", error);
        }
    };

    const login = useCallback(async (email: string, password: string) => {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message };
            }

            setToken(data.token);
            setUser(data.user);
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));

            return { success: true };
        } catch (error: any) {
            return { success: false, error: "Gagal menghubungi server" };
        }
    }, []);

    const register = useCallback(async (email: string, password: string, confirmPassword: string) => {
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password, confirmPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                return { success: false, error: data.message };
            }

            setToken(data.token);
            setUser(data.user);
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));

            return { success: true };
        } catch (error: any) {
            return { success: false, error: "Gagal menghubungi server" };
        }
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setLocation("/");
    }, [setLocation]);

    const updateUser = useCallback((userData: Partial<User>) => {
        setUser((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...userData };
            localStorage.setItem(USER_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const value: AuthContextType = {
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Hook for making authenticated API requests
export function useAuthFetch() {
    const { token, logout } = useAuth();

    const authFetch = useCallback(
        async (url: string, options: RequestInit = {}) => {
            const headers: HeadersInit = {
                "Content-Type": "application/json",
                ...options.headers,
            };

            if (token) {
                (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
            }

            const response = await fetch(url, {
                ...options,
                headers,
            });

            // If unauthorized, logout
            if (response.status === 401) {
                logout();
                throw new Error("Session expired");
            }

            return response;
        },
        [token, logout]
    );

    return authFetch;
}

// Route guard component
export function ProtectedRoute({
    children,
    requiredRole
}: {
    children: React.ReactNode;
    requiredRole?: "admin" | "business" | "customer"
}) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            setLocation("/login");
        }

        if (!isLoading && isAuthenticated && requiredRole && user?.role !== requiredRole) {
            // Redirect to appropriate page based on role
            if (user?.role === "admin") {
                setLocation("/admin");
            } else if (user?.role === "business" && user?.businessId) {
                setLocation(`/dashboard/${user.businessId}`);
            } else if (user?.role === "business") {
                setLocation("/onboarding");
            } else {
                setLocation("/");
            }
        }
    }, [isAuthenticated, isLoading, user, requiredRole, setLocation]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (requiredRole && user?.role !== requiredRole) {
        return null;
    }

    return <>{children}</>;
}
