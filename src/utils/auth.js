// src/utils/auth.js

/**
 * Utilitários para autenticação simulada (MVP)
 */

// Verificar se usuário está logado
export const isAuthenticated = () => {
  const user = localStorage.getItem("currentUser");
  return user !== null;
};

// Obter dados do usuário atual
export const getCurrentUser = () => {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
};

// Fazer logout
export const logout = () => {
  localStorage.removeItem("currentUser");
};

// Verificar papel do usuário
export const hasRole = (role) => {
  const user = getCurrentUser();
  return user && user.role === role;
};

// Obter papel do usuário
export const getUserRole = () => {
  const user = getCurrentUser();
  return user ? user.role : null;
};

// Verificar se é agricultor
export const isAgricultor = () => hasRole("agricultor");

// Verificar se é transportador
export const isTransportador = () => hasRole("transportador");

// Verificar se é comprador
export const isComprador = () => hasRole("comprador");