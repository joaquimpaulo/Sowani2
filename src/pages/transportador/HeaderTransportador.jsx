import { LogOut } from "lucide-react";
import { logout } from "../../utils/auth";
import { useNavigate } from "react-router-dom";

const HeaderTransportador = ({ name, onOpenSettings }) => {
  const navigate = useNavigate();
  const displayName = name || "Transportador";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-900 via-green-900 to-green-900 shadow-lg">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {displayName.charAt(0)}
        </div>
        <h1 className="text-2xl font-bold text-white">{displayName}</h1>
      </div>

      {/* Botão de Logout */}
      <button
        onClick={handleLogout}
        className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/30 transition text-red-400 hover:text-red-300"
        title="Sair"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  );
};

export default HeaderTransportador;
