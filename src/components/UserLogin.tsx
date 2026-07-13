import React, { useState, useEffect } from "react";
import { LogIn, ShieldCheck, Mail, Lock, UserCheck, UserPlus, AlertCircle, X, Eye, EyeOff } from "lucide-react";

interface UserLoginProps {
  onLogin: (email: string, fullName: string) => void;
  savedSession?: { email: string; fullName: string } | null;
}

interface LocalUser {
  email: string;
  password?: string;
  fullName: string;
  role: string;
}

export default function UserLogin({ onLogin, savedSession }: UserLoginProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Data Scientist");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize registered users database in localStorage if it doesn't exist
  useEffect(() => {
    const savedUsers = localStorage.getItem("quantum_ds_registered_users");
    if (!savedUsers) {
      const defaultUsers: LocalUser[] = [
        {
          email: "admin@quantum.ds",
          password: "password",
          fullName: "Quantum Administrator",
          role: "Workspace Admin"
        },
        {
          email: "guest@quantum.ds",
          password: "password",
          fullName: "Guest Data Scientist",
          role: "Data Scientist"
        }
      ];
      localStorage.setItem("quantum_ds_registered_users", JSON.stringify(defaultUsers));
    }
  }, []);

  const triggerError = (message: string) => {
    setError(message);
    setShowErrorPopup(true);
  };

  const getRegisteredUsers = (): LocalUser[] => {
    try {
      const saved = localStorage.getItem("quantum_ds_registered_users");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const saveRegisteredUsers = (users: LocalUser[]) => {
    localStorage.setItem("quantum_ds_registered_users", JSON.stringify(users));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowErrorPopup(false);

    const trimmedEmail = email.toLowerCase().trim();

    // Validations
    if (!trimmedEmail) {
      triggerError("Email Address is required. Please provide a valid email to continue.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      triggerError("Invalid email format. Please specify a valid email address (e.g. developer@quantum.ds).");
      return;
    }

    if (mode === "register" && !fullName.trim()) {
      triggerError("Developer Name is required. Please specify your full name to set up your profile.");
      return;
    }

    if (!password) {
      triggerError("Security Token (Password) is required. Please specify a secure password.");
      return;
    }
    if (password.length < 6) {
      triggerError("Security Token is too short. Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    // Simulate slight loading delay for premium authenticating experience
    setTimeout(() => {
      const users = getRegisteredUsers();

      if (mode === "login") {
        const foundUser = users.find(u => u.email === trimmedEmail);
        if (!foundUser) {
          setLoading(false);
          triggerError("Profile Not Found: The specified email is not registered on this device. Please switch to the 'Register' tab to create a profile.");
          return;
        }

        if (foundUser.password !== password) {
          setLoading(false);
          triggerError("Access Denied: Incorrect Security Token (Password). Please verify and try again.");
          return;
        }

        // Login successful
        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          onLogin(foundUser.email, foundUser.fullName);
        }, 800);

      } else {
        // Registration Mode
        if (!termsAccepted) {
          setLoading(false);
          triggerError("Terms Agreement Required: You must accept the data handling policies to proceed.");
          return;
        }

        const userExists = users.some(u => u.email === trimmedEmail);
        if (userExists) {
          setLoading(false);
          triggerError("Profile Already Exists: This email is already registered on this device. Please sign in instead.");
          return;
        }

        // Register new user
        const newUser: LocalUser = {
          email: trimmedEmail,
          password: password,
          fullName: fullName.trim(),
          role: role
        };

        users.push(newUser);
        saveRegisteredUsers(users);

        setLoading(false);
        setSuccess(true);
        setTimeout(() => {
          onLogin(newUser.email, newUser.fullName);
        }, 800);
      }
    }, 600);
  };

  return (
    <div 
      className="bg-[#0b0f19]/90 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl w-full max-w-md mx-auto flex flex-col gap-6"
      id="secured-login-panel"
    >
      {/* Custom Error Popup Modal */}
      {showErrorPopup && error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in" id="custom-error-modal">
          <div 
            className="bg-[#0f172a] border border-rose-500/40 max-w-md w-full rounded-2xl p-6 shadow-2xl shadow-rose-950/20 flex flex-col items-center gap-4 relative animate-scale-in"
            id="custom-error-modal-card"
          >
            {/* Close button */}
            <button 
              onClick={() => setShowErrorPopup(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition cursor-pointer"
              title="Close alert"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Error Icon badge */}
            <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div className="w-full text-center">
              <h3 className="font-display font-bold text-white text-base tracking-tight">
                Authentication Alert
              </h3>
              <p className="text-slate-300 text-xs mt-3 leading-relaxed whitespace-pre-line text-left bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/60 max-h-60 overflow-y-auto select-all">
                {error}
              </p>
            </div>

            <button
              onClick={() => setShowErrorPopup(false)}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-sans text-xs font-semibold py-2 rounded-xl transition cursor-pointer mt-2"
              id="custom-error-modal-dismiss-btn"
            >
              Acknowledge & Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
        </div>
        <h2 className="font-display font-bold text-white text-xl tracking-tight">
          {mode === "login" ? "Access Quantum DS Lab" : "Create Developer Profile"}
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          {mode === "login" 
            ? "Authenticate your developer profile to unlock the predictive workflow pipeline" 
            : "Register your workspace profile credentials to deploy advanced machine learning pipelines"}
        </p>
      </div>

      {/* Tabs to switch between Login and Register */}
      <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-900 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
            setShowErrorPopup(false);
          }}
          className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === "login" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
            setShowErrorPopup(false);
          }}
          className={`py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
            mode === "register" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Register</span>
        </button>
      </div>

      {success ? (
        <div className="bg-emerald-950/20 border border-emerald-900/50 p-6 rounded-xl text-center flex flex-col items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 animate-bounce">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-emerald-300 block text-xs">
              {mode === "login" ? "Profile Verified Successfully!" : "Developer Profile Created!"}
            </span>
            <span className="text-slate-400 text-[10px] mt-0.5 block">Loading dataset workspace...</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/35 text-rose-300 rounded-xl text-xs font-semibold flex items-start justify-between gap-2 animate-fade-in" id="login-error-banner">
              <div className="flex items-start gap-2">
                <span className="shrink-0 text-rose-400 font-bold mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
              <button 
                type="button" 
                onClick={() => setError(null)}
                className="text-slate-500 hover:text-slate-300 transition cursor-pointer shrink-0 mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {mode === "register" && (
            <div>
              <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <UserCheck className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500 placeholder-slate-600 transition"
                  placeholder="Developer Name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Mail className="w-3.5 h-3.5" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500 placeholder-slate-600 transition"
                placeholder="developer@quantum.ds"
              />
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">
                Developer Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2.5 px-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="Data Scientist">Data Scientist</option>
                <option value="ML Engineer">Machine Learning Engineer</option>
                <option value="Lead Analyst">Lead Data Analyst</option>
                <option value="Workspace Admin">Workspace Administrator</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase mb-1.5">
              Security Token (Password)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Lock className="w-3.5 h-3.5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl py-2.5 pl-9 pr-10 text-xs text-slate-200 font-sans focus:outline-none focus:border-indigo-500 placeholder-slate-600 transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
                id="toggle-password-visibility-btn"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 mt-1">
            <input
              type="checkbox"
              id="remember-me"
              checked={mode === "login" ? true : termsAccepted}
              onChange={(e) => mode === "register" && setTermsAccepted(e.target.checked)}
              className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 bg-slate-950 cursor-pointer mt-0.5"
            />
            <label htmlFor="remember-me" className="text-slate-400 text-[10px] select-none cursor-pointer font-sans leading-tight">
              {mode === "login" 
                ? "Remember developer profile on this device" 
                : "I agree to terms of use and data handling policies"}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || (mode === "register" && !termsAccepted)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans text-xs font-semibold py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
            id="login-submit-btn"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {mode === "login" ? <LogIn className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>{mode === "login" ? "Initialize Secured Session" : "Create & Start Session"}</span>
              </>
            )}
          </button>
          
          <div className="text-center mt-3">
            <span className="text-[10px] text-slate-500 font-mono">
              {mode === "login" ? "Default Demo Profile: guest@quantum.ds / password" : "All credentials are saved locally & securely on your device."}
            </span>
          </div>
        </form>
      )}
    </div>
  );
}
