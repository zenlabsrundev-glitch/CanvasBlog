import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { UserLoginForm } from "@/components/auth/UserLoginForm";
import { UserSignupForm } from "@/components/auth/UserSignupForm";

export default function AuthPage() {
  const [sp] = useSearchParams();
  const initialTab = sp.get("role") === "admin" ? "admin" : "user";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [userAuthMode, setUserAuthMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    if (activeTab === "admin") {
      document.title = "Admin Login · devnotes";
    } else {
      document.title = userAuthMode === "login" ? "Reader Login · devnotes" : "Reader Signup · devnotes";
    }
  }, [activeTab, userAuthMode]);

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-hero px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl mb-6 justify-center transition-transform hover:scale-105">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-elegant font-mono">‹/›</span>
          <span className="tracking-tighter">devnotes</span>
        </Link>
        <Card className="shadow-card border-border overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-2xl font-display font-bold">
              {activeTab === "admin" ? "Admin Access" : userAuthMode === "login" ? "Welcome back" : "Join devnotes"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === "admin" 
                ? "Enter your credentials to manage the blog." 
                : userAuthMode === "login" 
                  ? "Select your access portal below to continue." 
                  : "Create an account to like, bookmark and comment."}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1 rounded-sm">
                <TabsTrigger 
                  value="user" 
                  className="rounded-sm font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Reader Portal
                </TabsTrigger>
                <TabsTrigger 
                  value="admin"
                  className="rounded-sm font-mono text-[10px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  Admin Portal
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="user">
                {userAuthMode === "login" ? (
                  <UserLoginForm onToggleMode={() => setUserAuthMode("signup")} />
                ) : (
                  <UserSignupForm onToggleMode={() => setUserAuthMode("login")} />
                )}
              </TabsContent>
              
              <TabsContent value="admin">
                <AdminLoginForm />
              </TabsContent>
            </Tabs>
            
            <div className="mt-8 pt-6 border-t border-dashed border-border">
              <p className="text-xs text-center text-muted-foreground">
                By signing in, you agree to our markdown deployment standards.
              </p>
              <Link to="/" className="block mt-4 text-center text-xs font-mono uppercase tracking-widest text-primary hover:underline">
                ← Return to root
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
