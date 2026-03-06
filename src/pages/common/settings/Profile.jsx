import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import profileService from "../../../services/profileService";
import { getUserData } from "../../../services/userService";

const Profile = ({ onBack }) => {
  const { user, logout } = useAuth();
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState({
    name: "",
    phone: "",
    email: "",
    role: "",
    photoURL: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Carregar dados do usuário
  useEffect(() => {
    if (!user) return;

    const loadUser = async () => {
      try {
        const data = await getUserData(user);
        setUserData(data);
        setFormData(prev => ({
          ...prev,
          name: data.name,
          phone: data.phone,
          email: data.email,
        }));
      } catch (error) {
        setMessage({ type: "error", text: error.message || "Erro ao carregar dados" });
      }
    };

    loadUser();
  }, [user]);

  // Atualização de campos
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  // Upload de imagem
  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const url = await profileService.uploadProfileImage(user, file);
      setUserData(prev => ({ ...prev, photoURL: url }));
      setMessage({ type: "success", text: "Foto de perfil atualizada!" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Salvar perfil
  const handleSave = async () => {
    try {
      setLoading(true);
      const updates = await profileService.updateProfile(user, formData);
      setUserData(prev => ({ ...prev, ...updates }));
      setFormData(prev => ({ ...prev, currentPassword: "", newPassword: "" }));

      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Detectar mudanças
  const hasChanges =
    formData.name !== userData.name ||
    formData.phone !== userData.phone ||
    formData.email !== userData.email ||
    formData.newPassword.trim() !== "";

  return (
    <div className="p-4 text-white">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 px-2">
        <button
          onClick={onBack}
          className="text-white hover:bg-white/10 p-2 rounded-full w-10 h-10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold">Editar Perfil</h2>
      </div>

      {/* Card */}
      <div className="bg-white/10 rounded-2xl p-6">
        {/* Foto de Perfil */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img
              src={userData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || "Utilizador")}&background=random`}
              alt="Avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-white/20"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="absolute bottom-0 right-0 bg-green-600 hover:bg-green-700 disabled:opacity-50 w-10 h-10 rounded-full flex items-center justify-center"
            >
              <Camera className="w-5 h-5 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              className="hidden"
            />
          </div>
        </div>

        {/* Mensagem */}
        {message.text && (
          <div className={`mb-4 p-3 rounded-xl text-center ${
            message.type === "success" ? "bg-green-600/20 text-green-300" : "bg-red-600/20 text-red-300"
          }`}>
            {message.text}
          </div>
        )}

        {/* Formulário */}
        <div className="space-y-6">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm mb-1">Nome</label>
            <input
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Telefone */}
          <div>
            <label htmlFor="phone" className="block text-sm mb-1">Telefone</label>
            <input
              id="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-green-500"
            />
          </div>

          {/* E-mail */}
          <div>
            <label htmlFor="email" className="block text-sm mb-1">E-mail</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-green-500"
            />
            <p className="text-green-400 text-xs mt-1">
              Para alterar o e-mail, insira sua senha atual
            </p>
          </div>

          {/* Nova Senha */}
          <div>
            <label htmlFor="newPassword" className="block text-sm mb-1">Nova Senha</label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Deixe em branco para não alterar"
                className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-green-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Senha Atual */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm mb-1">Senha Atual</label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Digite sua senha atual"
                className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white focus:outline-none focus:border-green-500 pr-12"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60"
              >
                {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-green-400 text-xs mt-1">
              Necessário para alterar e-mail ou senha
            </p>
          </div>

          {/* Cargo */}
          <div>
            <label htmlFor="role" className="block text-sm mb-1">Cargo</label>
            <input
              id="role"
              value={userData.role}
              disabled
              className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white/60"
            />
          </div>

          {/* Botões */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleSave}
              disabled={loading || !hasChanges}
              className="w-full bg-[#E18003] hover:bg-[#d97003] disabled:opacity-50 disabled:cursor-not-allowed h-14 rounded-2xl text-lg font-semibold"
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
            <button
              onClick={onBack}
              className="w-full bg-[#335048] hover:bg-[#2d4540] h-14 rounded-2xl text-lg font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
