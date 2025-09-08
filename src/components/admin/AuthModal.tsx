import React, { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  authForm: { username: string; password: string };
  authError: string;
  authLoading: boolean;
  onAuth: (e: React.FormEvent) => void;
  onUpdateForm: (updates: { username?: string; password?: string }) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  authForm,
  authError,
  authLoading,
  onAuth,
  onUpdateForm,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            ورود به پنل مدیریت
          </h1>
        </div>

        <form onSubmit={onAuth} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نام کاربری
            </label>
            <input
              type="text"
              value={authForm.username}
              onChange={(e) => onUpdateForm({ username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="نام کاربری خود را وارد کنید"
              required
              disabled={authLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رمز عبور
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={authForm.password}
                onChange={(e) => onUpdateForm({ password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder="رمز عبور خود را وارد کنید"
                required
                disabled={authLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={authLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{authError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={authLoading || !authForm.username || !authForm.password}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                در حال ورود...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                ورود
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
