import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthStore } from "@/store/useAuthStore";
import NotFound from "@/pages/not-found";

// Pages
import Login from "@/pages/login";
import Register from "@/pages/register";
import SocialRegister from "@/pages/SocialRegister";
import MapPage from "@/pages/map";
import Community from "@/pages/community";
import Calendar from "@/pages/calendar";
import Profile from "@/pages/profile";
import CreatePost from "@/pages/create-post";
import HomePage from "@/pages/home";
import BaristaDetail from "@/pages/barista-detail";
import BrewCalendar from "@/pages/brew-calendar";
import RecipePage from "@/pages/recipe";

const queryClient = new QueryClient();

// Intercept fetch globally to append JWT token from Zustand/localStorage
const originalFetch = window.fetch;
window.fetch = async (input, init = {}) => {
  let token = null;
  try {
    const storageStr = localStorage.getItem("barista-auth-storage");
    if (storageStr) {
      const parsed = JSON.parse(storageStr);
      token = parsed.state?.token;
    }
  } catch (e) {
    console.error("Failed to parse token", e);
  }

  if (token) {
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return originalFetch(input, init);
};

function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { token } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!token) {
      setLocation("/login");
    }
  }, [token, setLocation]);

  if (!token) return null;
  return <Component />;
}

/** 이미 로그인된 경우 /home으로 리다이렉트 (로그인·회원가입 페이지용) */
function PublicRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { token } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (token) {
      setLocation("/home");
    }
  }, [token, setLocation]);

  if (token) return null;
  return <Component />;
}

function Router() {
  const [location, setLocation] = useLocation();
  const { token } = useAuthStore();

  useEffect(() => {
    if (location === "/") {
      setLocation(token ? "/home" : "/login");
    }
  }, [location, token, setLocation]);

  return (
    <Switch>
      <Route path="/login">
        <PublicRoute component={Login} />
      </Route>
      <Route path="/register">
        <PublicRoute component={Register} />
      </Route>
      <Route path="/register/social">
        <SocialRegister />
      </Route>
      <Route path="/home">
        <ProtectedRoute component={HomePage} />
      </Route>
      {/* /nearby and /map both go to MapPage */}
      <Route path="/nearby">
        <ProtectedRoute component={MapPage} />
      </Route>
      <Route path="/map">
        <ProtectedRoute component={MapPage} />
      </Route>
      <Route path="/community">
        <ProtectedRoute component={Community} />
      </Route>
      <Route path="/calendar">
        <ProtectedRoute component={Calendar} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path="/post/new">
        <ProtectedRoute component={CreatePost} />
      </Route>
      <Route path="/barista/:id">
        <ProtectedRoute component={BaristaDetail} />
      </Route>
      <Route path="/brew-calendar">
        <ProtectedRoute component={BrewCalendar} />
      </Route>
      <Route path="/recipe">
        <ProtectedRoute component={RecipePage} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
