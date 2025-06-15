
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Props {
  onLogin: () => void;
}

const AdminLogin: React.FC<Props> = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Simple password check - you can change this password
  const ADMIN_PASSWORD = "admin123";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
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
        <div className="mt-4 text-xs text-gray-500 text-center">
          Default password: admin123
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminLogin;
