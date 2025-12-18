import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import OnboardingPage from "@/pages/onboarding";
import DashboardPage from "@/pages/dashboard";
import BookingPage from "@/pages/booking";
import AdminPage from "@/pages/admin";
import ReschedulePage from "@/pages/reschedule";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/dashboard/:businessId" component={DashboardPage} />
      <Route path="/book/:slug" component={BookingPage} />
      <Route path="/demo/:slug" component={BookingPage} />
      <Route path="/reschedule/:appointmentId" component={ReschedulePage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="janji-ui-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
