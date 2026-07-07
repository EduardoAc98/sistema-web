import React, { useState } from "react";
import { api } from "../api";

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("j.solis");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Debe rellenar todos los campos");
      return;
    }
    
    setLoading(true);
    setErrorMsg("");
    
    try {
      await api.login(username.trim(), password);
      setLoading(false);
      onLoginSuccess();
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || "Usuario o contraseña inválidos o cuenta inactiva.");
    }
  };

  return (
    <div className="absolute inset-0 bg-[#f7fafc] text-[#181c1e] font-sans h-screen flex items-center justify-center relative overflow-hidden select-none">
      {/* Blueprint Grid Technical Pattern Background */}
      <div className="absolute inset-0 blueprint-grid pointer-events-none"></div>
      
      {/* Dynamic Gold Radial Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#ebeef0] via-transparent to-[#ffb800]/5 pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-[440px] px-4">
        {/* Frame corner decorative anchors */}
        <div className="absolute -bottom-8 -left-8 w-24 h-24 border-l-2 border-b-2 border-[#ffb800]/25 m-4 pointer-events-none hidden md:block"></div>
        <div className="absolute -top-8 -right-8 w-24 h-24 border-r-2 border-t-2 border-[#ffb800]/25 m-4 pointer-events-none hidden md:block"></div>

        <div className="bg-white border border-gray-200 p-8 md:p-12 rounded-xl shadow-2xl flex flex-col gap-8 transition-all duration-300 relative overflow-hidden">
          {/* GMP Aesthetic Top Yellow/Black Solid Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#ffb800] flex">
            <div className="w-1/4 h-full bg-[#181c1e]"></div>
            <div className="w-3/4 h-full bg-[#ffb800]"></div>
          </div>

          {/* Logo Section */}
          <div className="flex flex-col items-center gap-4 mt-2">
            <div className="w-48 h-auto flex items-center justify-center">
              <img
                alt="GMP Logo"
                className="w-full h-auto object-contain select-none"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkOt_-LrL3MlcBTk6jAV6_NQ7k3jZevkdsswOxepVstmWAdpg3Fn9Plibmhd_ZpbDGVjxwDqeiUWODXIm3z7oKzxjzxMCZeM5RaI5gI5PEwj22ssSrMTt_xGBJYvevWrG2oZjMW-YLapkJKIUFx92hg2nk1xykAY99Efgd2qWOC4nLsmvQKiQ2qlDLTi9pHhSaUcf7ZLVyyG5gSCosV1qqncgo2sQsjxye-cypNuYo-9X3E4P-lEwpXX39ijrX8gaNNVFPFsfbqR8S"
              />
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl font-black text-[#181c1e] tracking-tight">Acceso al Sistema</h1>
              <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">Gestión BIM y Control de Proyectos</p>
            </div>
          </div>

          {/* Login Form */}
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {errorMsg && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 text-xs text-red-700 font-medium">
                {errorMsg}
              </div>
            )}

            {/* Username Input */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="username">
                Nombre de Usuario
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7c5800] transition-colors">
                  person
                </span>
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej. j.perez"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border hover:border-gray-300 focus:border-[#ffb800] outline-none transition-all text-sm rounded-lg text-[#181c1e] font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="password">
                  Contraseña
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setErrorMsg("Módulo de recuperación temporalmente inactivo. Póngase en contacto con TI.");
                  }}
                  className="text-xs text-[#7c5800] hover:underline transition-all font-semibold"
                >
                  ¿Olvidó su clave?
                </a>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#7c5800] transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border hover:border-gray-300 focus:border-[#ffb800] outline-none transition-all text-sm rounded-lg text-[#181c1e] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex items-center justify-center p-1 rounded-full"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me Box */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-[#7c5800] focus:ring-[#ffb800] border-gray-300"
              />
              <label className="text-xs text-gray-500 font-medium select-none cursor-pointer" htmlFor="remember">
                Recordar sesión en este equipo
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffb800] text-[#6d4c00] font-bold py-4 rounded-lg flex items-center justify-center gap-3 hover:brightness-105 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md shadow-[#ffb800]/13 text-sm uppercase tracking-wider"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                  <span>Ingresando...</span>
                </>
              ) : (
                <>
                  <span>Ingresar</span>
                  <span className="material-symbols-outlined font-bold text-lg">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Info Column */}
          <div className="pt-6 border-t border-gray-100 flex flex-col gap-4 text-center">
            <div className="flex justify-center gap-6 text-gray-500">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-green-600 font-bold">verified_user</span>
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider">SSL SECURE</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-blue-600 font-bold">terminal</span>
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider">v2.4.0-BIM</span>
              </div>
            </div>
            
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-normal">
              INNOVACION TECNOLOGICA QUE TRANSFORMA LA CONSTRUCCIÓN
            </p>
          </div>
        </div>

        {/* System Message Disclaimer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400/80">
          <span className="material-symbols-outlined text-[18px]">info</span>
          <p className="text-xs font-semibold">Compatible con Chrome, Firefox y Edge</p>
        </div>
      </main>
    </div>
  );
}
