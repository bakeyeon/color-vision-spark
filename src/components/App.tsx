import React, { useState, useEffect } from "react";
import ExperimentPage from "./components/ExperimentPanel";
import AdminLogin from "./components/AdminLogin";
import AdminPanel from "./components/AdminPanel";
import { Button } from "@/components/ui/button";

type AppMode = "experiment" | "admin-login" | "admin-panel";

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>("experiment");
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  // Check if admin is already logged in on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    setAdminLoggedIn(isLoggedIn);
    if (isLoggedIn && mode === "admin-login") {
      setMode("admin-panel");
    }
  }, [mode]);

  const handleAdminLogin = () => {
    setAdminLoggedIn(true);
    setMode("admin-panel");
  };

  const handleAdminLogout = () => {
    setAdminLoggedIn(false);
    localStorage.removeItem("adminLoggedIn");
    setMode("experiment");
  };

  const switchToAdminMode = () => {
    if (adminLoggedIn) {
      setMode("admin-panel");
    } else {
      setMode("admin-login");
    }
  };

  const switchToExperimentMode = () => {
    setMode("experiment");
  };

  // Render based on current mode
  if (mode === "admin-login") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center p-4">
            <h1 className="text-xl font-bold">Color Perception Experiment</h1>
            <Button variant="outline" onClick={switchToExperimentMode}>
              Back to Experiment
            </Button>
          </div>
          <AdminLogin onLogin={handleAdminLogin} />
        </div>
      </div>
    );
  }

  if (mode === "admin-panel") {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminPanel onLogout={handleAdminLogout} />
      </div>
    );
  }

  // Default experiment mode
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto">
        {/* Header with admin button */}
        <div className="flex justify-between items-center p-4">
          <h1 className="text-xl font-bold">Color Perception Experiment</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={switchToAdminMode}
            className="text-xs"
          >
            Admin Panel
          </Button>
        </div>
        
        {/* Main experiment content */}
        <ExperimentPage />
      </div>
    </div>
  );
};

export default App;
