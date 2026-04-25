import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { UserCircle } from "lucide-react";

export const UserLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      signIn(email);
      toast({ title: "Reader Login Success", description: "You can now like and comment." });
      setLoading(false);
      navigate("/");
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        <UserCircle className="h-5 w-5" />
        <span className="font-mono text-xs font-bold uppercase tracking-widest">Reader Access</span>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="user-email">Email</Label>
        <Input 
          id="user-email" 
          type="email" 
          placeholder="reader@devnotes.com"
          required 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="user-password">Password</Label>
        <Input 
          id="user-password" 
          type="password" 
          required 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
      </div>
      <Button type="submit" variant="outline" className="w-full shadow-card" disabled={loading}>
        {loading ? "Authenticating..." : "Sign In to Read"}
      </Button>
    </form>
  );
};
