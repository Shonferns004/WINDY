import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SplashScreen from "../components/Splash";
import { supabase } from "../config/supabase";
import toast from "react-hot-toast";

const Register = () => {
  const [view, setView] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [name, setName] = useState("");
  const navigate = useNavigate();

  if (loading) {
    return <SplashScreen onComplete={() => setLoading(false)} />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);

    const toastId = toast.loading(
      view === "login" ? "Logging in..." : "Creating account...",
    );

    if (view === "login") {
      // LOGIN
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log(data);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Login successful 🎉");
        navigate("/home");
      }
    } else {
      // SIGN UP
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Registration successful 🎉 Check your email");

        setView("login");
      }
    }

    toast.dismiss(toastId);
    setButtonLoading(false);
  };

  // Toggle between login and signup screens
  const toggleView = () => {
    setView(view === "login" ? "signup" : "login");
  };

  return (
    <main className="relative min-h-screen w-full bg-mint flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="orbital-line w-[1200px] h-[1200px] opacity-10 border-sage"></div>
        <div className="orbital-line w-[800px] h-[800px] opacity-20 border-sage"></div>
        <div className="orbital-line w-[400px] h-[400px] opacity-30 border-sage"></div>

        {/* Floating Shapes */}
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-pastel-sphere/40 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[15%] right-[10%] w-96 h-96 rounded-full bg-leaf/10 blur-3xl"></div>
      </div>

      {/* Left Column */}
      <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center px-12 lg:px-24 py-16 lg:py-0">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-xl shadow-leaf/10 flex items-center justify-center transition-transform hover:scale-105 duration-500">
            <span className="material-symbols-outlined text-leaf text-4xl font-light">
              {view === "login" ? "storm" : "storm"}
            </span>
          </div>
          <div>
            <span className="text-xs font-black tracking-[0.5em] uppercase text-leaf/60 block">
              Your personal weather radar.
            </span>
            <h1 className="text-4xl font-black tracking-tight text-moss uppercase leading-none transition-all duration-700">
              Windy
            </h1>
          </div>
        </div>

        <p className="max-w-md text-moss/50 text-lg leading-relaxed font-medium transition-opacity duration-500">
          {view === "login"
            ? "We are connecting to the weather system. Log in to check the weather."
            : "New here? Sign up to enter the windy network and unlock live weather analysis."}
        </p>

        <div className="mt-12 flex gap-8 items-center opacity-40">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-moss">
              Users
            </span>
            <span className="text-xl font-mono text-moss">5k +</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-moss">
              Active Users
            </span>
            <span className="text-xl font-mono text-moss">2k +</span>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center px-12 lg:px-24 py-16 lg:py-0 bg-white/40 backdrop-blur-sm lg:bg-transparent transition-colors duration-500">
        <div className="max-w-md w-full mx-auto lg:ml-0">
          <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-moss/40 mb-12 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-moss/20"></span>
            {view === "login" ? "Welcome Back" : "Registeration"}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div id="clerk-captcha"></div>

            {view === "signup" && (
              <div className="group space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
                <label
                  className="block text-[11px] font-black uppercase tracking-[0.2em] text-moss/60 group-focus-within:text-leaf transition-colors"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <input
                  className="w-full focus:outline-none border-0 border-b-2 border-sage/30 bg-transparent px-0 py-3 text-moss placeholder:text-sage/40 focus:ring-0 focus:border-leaf transition-all duration-500 text-lg font-bold"
                  id="name"
                  type="text"
                  placeholder="Agent Smith"
                  autoComplete="off"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="group space-y-2">
              <label
                className="block text-[11px] font-black uppercase tracking-[0.2em] text-moss/60 group-focus-within:text-leaf transition-colors"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="w-full border-0 border-b-2 border-sage/30 bg-transparent px-0 py-3 text-moss placeholder:text-sage/40 focus:outline-none focus:ring-0 focus:border-leaf transition-all duration-500 text-lg font-bold"
                id="email"
                autoComplete="off"
                type="email"
                placeholder="agent.id@weather.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="group space-y-2">
              <label
                className="block text-[11px] font-black uppercase tracking-[0.2em] text-moss/60 group-focus-within:text-leaf transition-colors"
                htmlFor="password"
              >
                {view === "login" ? "Password" : "Create Password"}
              </label>
              <input
                className="w-full focus:outline-none border-0 border-b-2 border-sage/30 bg-transparent px-0 py-3 text-moss placeholder:text-sage/40 focus:ring-0 focus:border-leaf transition-all duration-500 text-lg font-bold tracking-[0.3em]"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                autoComplete="off"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-3 cursor-pointer group"></label>
              {view === "login" && (
                <button
                  type="button"
                  className="text-[11px] font-black text-moss/30 hover:text-leaf transition-all uppercase tracking-widest border-b border-transparent hover:border-leaf"
                >
                  Forgot Key
                </button>
              )}
            </div>

            <button
              disabled={email.length === 0 || password.length === 0}
              onClick={() => setButtonLoading(true)}
              className="group relative mt-4 w-full h-16 bg-moss hover:bg-leaf text-white transition-all duration-500 overflow-hidden"
              type="submit"
            >
              {buttonLoading ? (
                <>
                  <span className="relative z-10 flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.4em] transition-transform group-hover:scale-105">
                    {view === "login" ? "Logging in...." : "Registering...."}
                    <span className="material-symbols-outlined text-[18px]">
                      {view === "login" ? "arrow_forward" : "person_add"}
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <span className="relative z-10 flex items-center justify-center gap-4 text-sm font-black uppercase tracking-[0.4em] transition-transform group-hover:scale-105">
                    {view === "login" ? "Initialize Login" : "Finalize Recruit"}
                    <span className="material-symbols-outlined text-[18px]">
                      {view === "login" ? "arrow_forward" : "person_add"}
                    </span>
                  </span>
                  <div className="absolute inset-0 bg-leaf-hover translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                </>
              )}
            </button>
          </form>

          <div className="mt-12 flex flex-col items-start gap-4">
            <button
              onClick={toggleView}
              className="text-xs font-black tracking-widest uppercase text-leaf hover:text-leaf-hover transition-colors flex items-center gap-2 group"
            >
              {view === "login"
                ? "Don't have clearance? Sign Up"
                : "Already an agent? Log In"}
              <span className="w-4 h-[1px] bg-leaf transition-all group-hover:w-8"></span>
            </button>
            <div className="opacity-30 flex items-center gap-4 w-full">
              <div className="text-[10px] font-black tracking-[0.3em] uppercase whitespace-nowrap">
                Secure Environment v4.2
              </div>
              <div className="h-[1px] w-full bg-moss/20"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Decorations */}
      <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full border border-leaf/10 pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full border border-leaf/5 pointer-events-none"></div>
    </main>
  );
};

export default Register;
