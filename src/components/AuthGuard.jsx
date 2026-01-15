// src/components/AuthGuard.jsx
import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../utils/auth";

const AuthGuard = ({ children, allowedRoles = [] }) => {
  // Verificar se usuário está autenticado
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Se roles específicos são requeridos, verificar
  if (allowedRoles.length > 0) {
    const userRole = getUserRole();
    if (!allowedRoles.includes(userRole)) {
      // Redirecionar para a página apropriada baseada no papel
      if (userRole === "agricultor") return <Navigate to="/agricultor" replace />;
      if (userRole === "transportador") return <Navigate to="/transportador" replace />;
      if (userRole === "comprador") return <Navigate to="/comprador" replace />;
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default AuthGuard;