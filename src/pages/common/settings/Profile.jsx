import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, Eye, EyeOff } from "lucide-react";
import { auth, db, storage } from "../../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, updateEmail, reauthenticateWithCredential, EmailAuthProvider, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const Profile = ({ onBack }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
    newPassword: "",
    currentPassword: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Buscar dados adicionais do Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        const data = {
          name: user.displayName || userDoc.data()?.name || "",
          phone: userDoc.data()?.phone || "",
          email: user.email || "",
          role: userDoc.data()?.role || userDoc.data()?.userType || "Usuário",
          photoURL: user.photoURL || "/placeholder.svg",
        };

        setUserData(data);
        setFormData(prev => ({
          ...prev,
          name: data.name,
          phone: data.phone,
          email: data.email,
        }));
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
        setMessage({ type: "error", text: "Erro ao carregar dados" });
      }
    };

    loadUserData();
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleUploadImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Selecione uma imagem válida" });
      return;
    }

    // Validar tamanho (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Imagem muito grande (máx 5MB)" });
      return;
    }

    uploadImage(file);
  };

  const uploadImage = async (file) => {
    try {
      setUploadingImage(true);
      setMessage({ type: "", text: "" });
      const user = auth.currentUser;

      if (!user) {
        setMessage({ type: "error", text: "Usuário não autenticado" });
        return;
      }

      // Criar referência no Storage
      const timestamp = Date.now();
      const storageRef = ref(storage, `profile-pictures/${user.uid}-${timestamp}`);

      // Upload da imagem
      await uploadBytes(storageRef, file);

      // Obter URL de download
      const downloadURL = await getDownloadURL(storageRef);

      // Atualizar perfil do usuário no Firebase Auth
      await updateProfile(user, { photoURL: downloadURL });

      // Atualizar no Firestore
      await updateDoc(doc(db, "users", user.uid), { photoURL: downloadURL });

      // Atualizar estado local
      setUserData(prev => ({
        ...prev,
        photoURL: downloadURL,
      }));

      setMessage({ type: "success", text: "Foto de perfil atualizada com sucesso!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      setMessage({ type: "error", text: "Erro ao fazer upload da imagem" });
    } finally {
      setUploadingImage(false);
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage({ type: "", text: "" });
      const user = auth.currentUser;

      if (!user) {
        setMessage({ type: "error", text: "Usuário não autenticado" });
        return;
      }

      // Atualizar Nome
      if (formData.name !== userData.name) {
        await updateDoc(doc(db, "users", user.uid), { name: formData.name });
      }

      // Atualizar Telefone
      if (formData.phone !== userData.phone) {
        await updateDoc(doc(db, "users", user.uid), { phone: formData.phone });
      }

      // Atualizar E-mail (requer re-autenticação)
      if (formData.email !== userData.email && formData.currentPassword) {
        try {
          const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
          await reauthenticateWithCredential(user, credential);
          await updateEmail(user, formData.email);
          await updateDoc(doc(db, "users", user.uid), { email: formData.email });
        } catch (error) {
          setMessage({ type: "error", text: "Senha atual incorreta" });
          return;
        }
      }

      // Atualizar Senha (requer re-autenticação)
      if (formData.newPassword && formData.currentPassword) {
        try {
          const credential = EmailAuthProvider.credential(user.email, formData.currentPassword);
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, formData.newPassword);
          setFormData(prev => ({
            ...prev,
            newPassword: "",
            currentPassword: "",
          }));
        } catch (error) {
          setMessage({ type: "error", text: "Senha atual incorreta" });
          return;
        }
      }

      setUserData(prev => ({
        ...prev,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      }));

      setMessage({ type: "success", text: "Perfil atualizado com sucesso!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setMessage({ type: "error", text: "Erro ao atualizar perfil" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 text-white">
      {/* Header - seta volta ao painel */}
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
              src={userData.photoURL}
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
            {/* Input de arquivo invisível */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUploadImage}
              className="hidden"
            />
          </div>
        </div>

        {/* Mensagens de Status */}
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
              Para alterar o e-mail, insira sua senha atual abaixo
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
              disabled={loading}
              className="w-full bg-[#E18003] hover:bg-[#d97003] disabled:opacity-50 h-14 rounded-2xl text-lg font-semibold"
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
