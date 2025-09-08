import { useState } from "react";
import { ADMIN_CONFIG } from "../constants/adminConstants";

interface AuthForm {
  username: string;
  password: string;
}

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [authForm, setAuthForm] = useState<AuthForm>({
    username: "",
    password: "",
  });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    // Simulate a small delay for better UX
    await new Promise((resolve) =>
      setTimeout(resolve, ADMIN_CONFIG.AUTH_DELAY)
    );

    if (
      authForm.username === ADMIN_CONFIG.USERNAME &&
      authForm.password === ADMIN_CONFIG.PASSWORD
    ) {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      setAuthError("");
    } else {
      setAuthError("نام کاربری یا رمز عبور اشتباه است");
    }

    setAuthLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setShowAuthModal(true);
    setAuthForm({ username: "", password: "" });
    setAuthError("");
  };

  const updateAuthForm = (updates: Partial<AuthForm>) => {
    setAuthForm((prev) => ({ ...prev, ...updates }));
  };

  return {
    isAuthenticated,
    showAuthModal,
    authForm,
    authError,
    authLoading,
    handleAuth,
    handleLogout,
    updateAuthForm,
  };
};
