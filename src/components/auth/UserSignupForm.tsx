import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

export const UserSignupForm = ({ onToggleMode }: { onToggleMode: () => void }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const result = await signUp(email, password, name, "user");
    
    if (result.success) {
      toast({ title: "Account Created", description: `Welcome to devnotes, ${name}!` });
      navigate("/");
    } else {
      toast({ 
        title: "Registration Failed", 
        description: result.message,
        variant: "destructive"
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <UserPlus className="h-5 w-5" />
        <span className="font-mono text-xs font-bold uppercase tracking-widest">New Reader Registration</span>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-name">Full Name</Label>
        <Input 
          id="signup-name" 
          type="text" 
          placeholder="John Doe"
          required 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-email">Email</Label>
        <Input 
          id="signup-email" 
          type="email" 
          placeholder="your@email.com"
          required 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-password">Password</Label>
        <Input 
          id="signup-password" 
          type="password" 
          required 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
      </div>
      <Button type="submit" variant="default" className="w-full shadow-card bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
        {isSubmitting ? "Creating Account..." : "Create Reader Account"}
      </Button>
      <div className="text-center mt-4">
        <button 
          type="button" 
          onClick={onToggleMode}
          className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
        >
          Already have an account? Sign in
        </button>
      </div>
    </form>
  );
};
