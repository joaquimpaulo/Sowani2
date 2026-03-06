import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, User } from "lucide-react";
import { useUserType } from "../../../context/UserTypeContext";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

const profiles = [
  {
    id: "agricultor",
    title: "Vendedor",
    description: "Vender produtos e solicitar pedidos"
  },
  {
    id: "transportador",
    title: "Transportador",
    description: "Fazer entregas e ganhar comissões"
  },
  {
    id: "comprador",
    title: "Comprador",
    description: "Comprar produtos de agricultores locais"
  }
];

const SwitchProfile = ({ onBack, user }) => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("settings");
  const [currentProfile, setCurrentProfile] = useState("Vendedor");
  const { userType, setUserType } = useUserType();
  const [isLoading, setIsLoading] = useState(false);
  const profileRoutes = {
    agricultor: "/agricultor",
    comprador: "/comprador",
    transportador: "/transportador"
  };

  const handleSelect = async (profileId) => {
    if (profileId === userType) {
      onBack(); // volta ao SettingsPanel se já é o perfil ativo
      return;
    }

    // Obtém userId: primeiro tenta do Firebase, depois do localStorage (MVP)
    let userId = null;
    if (user && user.uid) {
      userId = user.uid;
    } else {
      // Fallback para localStorage (usado no MVP)
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        try {
          const parsed = JSON.parse(currentUser);
          userId = parsed.id;
        } catch (e) {
          console.error("Erro ao parsear currentUser do localStorage", e);
        }
      }
    }

    // Valida se conseguiu obter userId
    if (!userId) {
      console.error("Nenhum userId encontrado. user:", user, "localStorage:", localStorage.getItem("currentUser"));
      alert("Não foi possível atualizar o perfil: nenhum utilizador autenticado.");
      return;
    }

    setIsLoading(true);
    try {
      // Atualiza no Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: profileId });

      // Atualiza no contexto
      setUserType(profileId);

      // Atualiza o localStorage também (MVP)
      const currentUser = localStorage.getItem("currentUser");
      if (currentUser) {
        const parsed = JSON.parse(currentUser);
        parsed.role = profileId;
        localStorage.setItem("currentUser", JSON.stringify(parsed));
      }
      
      // Navega para o dashboard do novo perfil
      const route = profileRoutes[profileId];
      if (route) {
        navigate(route);
      }
    } catch (error) {
      console.error("Erro ao trocar perfil:", error);
      // mostra mensagem mais detalhada para ajudar a diagnosticar
      alert(`Erro ao trocar perfil: ${error.message || error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 text-white">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-white/10"
          disabled={isLoading}
        >
          <ArrowLeft />
        </button>

        <h2 className="text-2xl font-bold">Alternar Perfil</h2>
      </div>

      {/* Ícone */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-3">
          <User className="w-12 h-12 text-primary" />
        </div>

        <p className="text-center text-white/70 max-w-sm">
          Use a mesma conta para acessar diferentes funcionalidades
        </p>
      </div>

      {/* Lista de perfis */}
      <div className="space-y-4">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            onClick={() => !isLoading && handleSelect(profile.id)}
            className={`p-4 bg-white/10 rounded-xl flex justify-between items-center transition ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/20'
            }`}
          >
            <div>
              <h3 className="font-semibold text-lg">
                {profile.title}
              </h3>

              <p className="text-sm text-white/70">
                {profile.description}
              </p>
            </div>

            {userType === profile.id && (
              <Check className="text-green-400 w-6 h-6" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwitchProfile;