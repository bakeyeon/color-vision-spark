
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { getStoredPassword } from "@/lib/encryption";

interface Props {
  onLogin: () => void;
}

const AdminLogin: React.FC<Props> = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const storedPassword = getStoredPassword();
      
      if (password === storedPassword) {
        localStorage.setItem("adminLoggedIn", "true");
        onLogin();
        toast({
          title: "Login Successful",
          description: "Welcome to the admin panel.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Invalid Password",
          description: "Please check your password and try again.",
        });
      }
      setLoading(false);
    }, 500);
  };

  return (
    <Card className="max-w-md w-full mx-auto mt-20">
      <CardHeader>
        <CardTitle className="text-center">Admin Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminLogin;
