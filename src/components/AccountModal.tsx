import React, { useState, useEffect } from "react";
import { api, getSavedUser, saveUser } from "../api";
import { User } from "../types";
import { toast } from "./Toast";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const [user, setUser] = useState<any>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [role, setRole] = useState<any>("Colaborador");
  const [avatarInitials, setAvatarInitials] = useState("");
  const [avatarBg, setAvatarBg] = useState("");

  // Password reset states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = getSavedUser();
    if (saved) {
      setUser(saved);
      setName(saved.name || "");
      setEmail(saved.email || "");
      setPhone((saved as any).phone || "+51 987 654 321");
      setDiscipline(saved.discipline || "");
      setRole(saved.role || "Colaborador");
      setAvatarInitials(saved.avatarInitials || "JS");
      setAvatarBg(saved.avatarBg || "bg-amber-500");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      
      // Update DB
      const updated = await api.updateUser(user.id, {
        name,
        email,
        discipline,
        role
      });

      // Include local phone/other metadata
      const fullUpdated: any = {
        ...updated,
        phone,
        avatarInitials: avatarInitials,
        avatarBg: avatarBg
      };

      // If they input a new password, let's hit update password fields
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          toast.warning("La nueva contraseña y la confirmación no coinciden.");
          setSaving(false);
          return;
        }
        fullUpdated.password = newPassword;
        // update users list in DB (under the hood by writing server endpoint)
        await api.updateUser(user.id, { password: newPassword } as any);
      }

      // Save user back to localStorage
      saveUser(fullUpdated);
      
      // Dispatch standard update event to trigger refresh in app header
      window.dispatchEvent(new CustomEvent("gmp_profile_updated"));

      toast.success("Perfil de usuario actualizado exitosamente.");
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      console.error("Error saving user details", err);
      toast.error("Hubo un error al intentar persistir los datos de su cuenta.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePasswordOnly = async () => {
    if (!newPassword) {
      toast.warning("Por favor escriba la nueva contraseña.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.warning("Las contraseñas no coinciden.");
      return;
    }

    try {
      setSaving(true);
      await api.updateUser(user.id, { password: newPassword } as any);
      toast.success("Contraseña restablecida y guardada de forma segura.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo guardar la contraseña.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#181c1e]/70 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Banner with dark palette */}
        <div className="bg-[#181c1e] text-white px-6 py-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ffb800] text-2xl font-bold">person</span>
            <div>
              <h3 className="font-bold text-base leading-none">Mi Cuenta Personal</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Configuración del Perfil de Usuario</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-[#ffb800] p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable form view */}
        <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto flex-1 space-y-6">
          
          <div className="flex items-center gap-5 bg-gray-50 p-4 rounded-xl border border-gray-150">
            {/* Visual avatar maker */}
            <div className={`w-16 h-16 rounded-full ${avatarBg} text-white flex items-center justify-center font-black text-2xl shadow-sm border-2 border-[#ffb800] select-none`}>
              {avatarInitials || "US"}
            </div>
            
            <div className="flex-1 space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estilo del Avatar</p>
              
              <div className="flex gap-2">
                {/* BG Selector */}
                <input 
                  type="text" 
                  value={avatarInitials} 
                  maxLength={2}
                  onChange={(e) => setAvatarInitials(e.target.value.toUpperCase())}
                  className="w-12 text-center text-xs font-bold bg-white border border-gray-200 rounded p-1"
                  title="Iniciales"
                />
                
                {["bg-amber-500", "bg-blue-600", "bg-emerald-500", "bg-indigo-600", "bg-rose-500"].map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setAvatarBg(bg)}
                    className={`w-6 h-6 rounded-full ${bg} border ${avatarBg === bg ? "ring-2 ring-[#181c1e] scale-110" : "opacity-80"} cursor-pointer`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fullname input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Nombre Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#ffb800] rounded-lg p-2.5 text-xs font-semibold outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Email input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#ffb800] rounded-lg p-2.5 text-xs font-semibold outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Cellular input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Número de Celular</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#ffb800] rounded-lg p-2.5 text-xs font-semibold outline-none transition-all"
              />
            </div>

            {/* Discipline (Cargo) input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Cargo / Disciplina</label>
              <input
                type="text"
                required
                value={discipline}
                onChange={(e) => setDiscipline(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#ffb800] rounded-lg p-2.5 text-xs font-semibold outline-none transition-all"
              />
            </div>

            {/* Role select (Readonly or admin configurable) */}
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Rol del Usuario (Sistema)</label>
              <input
                type="text"
                disabled
                value={role}
                className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2.5 text-xs font-bold text-gray-500 cursor-not-allowed select-none"
              />
              <p className="text-[9px] text-gray-400 leading-none mt-1">El nivel de privilegios solo puede ser editado por un Administrador de sistemas.</p>
            </div>
          </div>

          {/* Password Reset Section */}
          <div className="border-t border-gray-150 pt-5 space-y-4">
            <div className="flex items-center gap-2 text-gray-800">
              <span className="material-symbols-outlined text-lg select-none">lock</span>
              <h4 className="font-bold text-xs uppercase tracking-wider">Cambiar Contraseña</h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Nueva Contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Dejar vacío para mantener actual"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#ffb800] rounded-lg p-2.5 text-xs font-semibold outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Repetir Nueva Contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme la nueva contraseña"
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#ffb800] rounded-lg p-2.5 text-xs font-semibold outline-none transition-all"
                />
              </div>
            </div>

            {newPassword && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleSavePasswordOnly}
                  className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer"
                >
                  Confirmar Contraseña Solamente
                </button>
              </div>
            )}
          </div>

        </form>

        {/* Footer containing Save / Exit buttons */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-250 text-gray-600 rounded-lg font-bold text-xs hover:bg-gray-100 transition-colors cursor-pointer bg-white"
          >
            Cerrar
          </button>
          
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-5 py-2 bg-[#ffb800] text-[#6d4c00] font-black rounded-lg text-xs hover:brightness-105 transition-all cursor-pointer border-none disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

      </div>
    </div>
  );
}
