import { Search, LogOut } from "lucide-react";
import { logout } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

const HeaderAgricultor = ({
  userData,
  onOpenSettings,
  searchTerm,
  onSearchChange,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div className="bg-[#1A3A31] p-6 space-y-4">
      {/* Nome e Avatar */}
      <div className="flex items-center space-x-10 justify-between">
        <div className="flex items-center space-x-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg">
              {userData?.name?.[0] || "U"}
            </span>
          </div>

          {/* Nome */}
          <div>
            <h1 className="text-xl font-semibold text-white">
              {userData?.name || "Usuário"}
            </h1>
          </div>
        </div>

        {/* Botão de Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/30 transition text-red-400 hover:text-red-300"
          title="Sair"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <div className="relative">
          <Search className="absolute left-1 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm || ""}
            onChange={onSearchChange}
            placeholder="Pesquisar produtos..."
            className="w-11/12 pl-7 pr-4 py-2 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E18003] focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Barra de Pesquisa */}
    </div>
  );
};

export default HeaderAgricultor;
