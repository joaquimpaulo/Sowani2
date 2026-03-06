import { useState } from "react";
import {
  User,
  Globe,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ArrowLeft,
  Accessibility as AccessibilityIcon,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useUserType } from "../../../context/UserTypeContext";

import Profile from "./Profile";
import SwitchProfile from "./SwitchProfile";
import Accessibility from "./Accessibility";
import Notifications from "./Notifications";
import Privacy from "./Privacy";
import Help from "./Help";
import Logout from "./Logout";

const SettingsPanel = ({ open, onClose }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentProfile, setCurrentProfile] = useState("Vendedor");
  const [currentLanguage, setCurrentLanguage] = useState("Português");
  const { user } = useAuth();
  const { userType } = useUserType();

  // Função para obter o nome do perfil atual
  const getCurrentProfileName = () => {
    switch (userType) {
      case "agricultor":
        return "Vendedor";
      case "transportador":
        return "Transportador";
      case "comprador":
        return "Comprador";
      default:
        return "Não definido";
    }
  };

  if (!open) return null;

  // ✅ Definição dos cards
  const cards = [
    {
      icon: <User className="w-6 h-6 text-orange-500" />,
      title: "Alternar Perfil",
      desc: `Atual: ${getCurrentProfileName()}`,
      component: (
        <SwitchProfile
          currentProfile={currentProfile}
          setCurrentProfile={setCurrentProfile}
          onBack={() => setSelectedCard(null)}
          user={user}
        />
      ),
    },
    {
      icon: <User className="w-6 h-6 text-orange-500" />,
      title: "Perfil",
      desc: "Gerir informações pessoais",
      component: <Profile onBack={() => setSelectedCard(null)} />,
    },
    {
      icon: <Globe className="w-6 h-6 text-orange-500" />,
      title: "Idioma",
      desc: `Atual: ${currentLanguage}`,
      component: null, // não abriremos outro painel
    },
    {
      icon: <Bell className="w-6 h-6 text-orange-500" />,
      title: "Notificações",
      desc: "Configurar alertas e avisos",
      component: <Notifications onBack={() => setSelectedCard(null)} />,
    },
    {
      icon: <Shield className="w-6 h-6 text-orange-500" />,
      title: "Privacidade",
      desc: "Controlar dados e privacidade",
      component: <Privacy onBack={() => setSelectedCard(null)} />,
    },
    {
      icon: <AccessibilityIcon className="w-6 h-6 text-orange-500" />,
      title: "Acessibilidade",
      desc: "Configurar recursos de acessibilidade",
      component: <Accessibility onBack={() => setSelectedCard(null)} />,
    },
    {
      icon: <HelpCircle className="w-6 h-6 text-orange-500" />,
      title: "Ajuda",
      desc: "Manual e suporte técnico",
      component: <Help onBack={() => setSelectedCard(null)} />,
    },
    {
      icon: <LogOut className="w-6 h-6 text-red-500" />,
      title: "Terminar sessão",
      desc: "Sair da aplicação",
      component: <Logout />,
    },
  ];

  // ✅ Clique no card
  const handleCardClick = (idx) => {
    const card = cards[idx];

    if (card.title === "Idioma") {
      // alternar o idioma em vez de abrir outra tela
      setCurrentLanguage((prev) =>
        prev === "Português" ? "Emakhua" : "Português"
      );
    } else {
      setSelectedCard(idx);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Fundo escuro */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          setSelectedCard(null);
          onClose();
        }}
      />

      {/* Painel principal */}
      <div className="relative min-h-screen w-full bg-gradient-to-b from-gray-900 via-green-900 to-gray-900 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-2xl font-bold-forced">
            {selectedCard === null ? "Definições" : cards[selectedCard].title}
          </h2>

          {/* Botão fechar / voltar */}
          {!(selectedCard !== null &&
            (
              cards[selectedCard].title === "Perfil" ||
              cards[selectedCard].title === "Alternar Perfil" ||
              cards[selectedCard].title === "Notificações" ||
              cards[selectedCard].title === "Privacidade" ||
              cards[selectedCard].title === "Acessibilidade" ||
              cards[selectedCard].title === "Ajuda"
            )) && (
            <button
              onClick={() => {
                if (selectedCard === null) onClose();
                else setSelectedCard(null);
              }}
              className="text-white/70 hover:text-white transition text-2xl"
            >
              {selectedCard === null ? "✕" : <ArrowLeft className="w-6 h-6" />}
            </button>
          )}
        </div>

        {/* Nome do utilizador */}
        {selectedCard === null && (
          <p className="text-white/70 text-center mb-6">
            Olá, <span className="font-semibold text-white">{user?.displayName || user?.email || "Utilizador"}</span>
          </p>
        )}

        {/* Conteúdo principal do painel (cards ou card selecionado) */}
        {selectedCard === null ? (
          <div className="space-y-3">
            {cards.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleCardClick(idx)}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    item.title === "Terminar sessão"
                      ? "bg-red-500/20"
                      : "bg-orange-500/20"
                  }`}
                >
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-lg font-bold-forced ${
                      item.title === "Terminar sessão"
                        ? "text-red-500"
                        : "text-white"
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-white/70 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
              {cards[selectedCard].component}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
