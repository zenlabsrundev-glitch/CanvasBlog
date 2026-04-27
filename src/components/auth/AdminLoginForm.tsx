import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck } from "lucide-react";

export const AdminLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await signIn(email, password);
    
    if (result.success) {
      toast({ title: "Admin Authenticated", description: "Welcome to the control panel." });
      navigate("/admin");
    } else {
      toast({ 
        title: "Auth Failed", 
        description: result.message,
        variant: "destructive"
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="flex items-center gap-2 text-primary mb-2">
        <ShieldCheck className="h-5 w-5" />
        <span className="font-mono text-xs font-bold uppercase tracking-widest">Admin Authorization</span>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-email">Admin Email</Label>
        <Input 
          id="admin-email" 
          type="email" 
          placeholder="admin@devnotes.com"
          required 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="admin-password">Secure Password</Label>
        <Input 
          id="admin-password" 
          type="password" 
          required 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
      </div>
      <Button type="submit" className="w-full keycap-primary" disabled={isSubmitting}>
        {isSubmitting ? "Verifying..." : "Access Dashboard"}
      </Button>
    </form>
  );
};
