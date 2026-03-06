import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateUserData } from "./userService";
import { storage } from "../firebase";

const profileService = {
  /**
   * Upload de imagem de perfil para Storage e sincronização com Auth/Firestore
   * @param {Object} user - Objeto de usuário do Firebase Auth
   * @param {File} file - Arquivo de imagem
   * @returns {Promise<string>} - URL de download da imagem
   */
  uploadProfileImage: async (user, file) => {
    if (!user) throw new Error("Usuário não autenticado");

    // Validação de tipo com whitelist
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Formato não permitido (JPEG, PNG ou WEBP)");
    }

    // Validação de tamanho
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Imagem muito grande (máx 5MB)");
    }

    try {
      // Upload para Storage
      const timestamp = Date.now();
      const storageRef = ref(storage, `profile-pictures/${user.uid}/avatar-${timestamp}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Atualizar Auth (source of truth)
      await updateProfile(user, { photoURL: downloadURL });

      // Sincronizar com Firestore
      await updateUserData(user.uid, { photoURL: downloadURL });

      return downloadURL;
    } catch (error) {
      console.error("[ProfileService] Erro ao fazer upload da imagem:", error);
      throw new Error("Erro ao fazer upload da imagem");
    }
  },

  /**
   * Atualizar perfil do usuário (nome, telefone, email, senha)
   * Implementa padrão: Auth → Firestore
   * @param {Object} user - Objeto de usuário do Firebase Auth
   * @param {Object} formData - {name, phone, email, currentPassword, newPassword}
   * @returns {Promise<Object>} - Objeto com atualizações persistidas no Firestore
   */
  updateProfile: async (user, formData) => {
    if (!user) throw new Error("Usuário não autenticado");

    const { name, phone, email, currentPassword, newPassword } = formData;
    const firestoreUpdates = {};

    try {
      // Determinar quais campos mudaram
      const nameChanged = name && name !== user.displayName;
      const phoneChanged = phone !== undefined;
      const emailChanged = email && email !== user.email;
      const passwordChanged = newPassword && newPassword.trim() !== "";

      // Validações
      if ((emailChanged || passwordChanged) && !currentPassword) {
        throw new Error("Digite a senha atual para confirmar alterações");
      }

      if (passwordChanged && newPassword.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
      }

      if (emailChanged && !/\S+@\S+\.\S+/.test(email)) {
        throw new Error("Formato de e-mail inválido");
      }

      // Re-autenticar uma única vez se necessário
      let reauthenticated = false;
      if ((emailChanged || passwordChanged) && currentPassword) {
        try {
          const credential = EmailAuthProvider.credential(user.email, currentPassword);
          await reauthenticateWithCredential(user, credential);
          reauthenticated = true;
        } catch (error) {
          console.error("[ProfileService] Erro na re-autenticação:", error);

          if (error.code === "auth/wrong-password") {
            throw new Error("Senha atual incorreta");
          } else if (error.code === "auth/too-many-requests") {
            throw new Error("Muitas tentativas. Tente novamente mais tarde");
          } else if (error.code === "auth/user-mismatch") {
            throw new Error("Erro de autenticação. Faça login novamente");
          } else if (error.code === "auth/network-request-failed") {
            throw new Error("Erro de conexão. Verifique sua internet");
          } else {
            throw new Error("Erro ao validar credenciais");
          }
        }
      }

      // Atualizar Nome (Auth + Firestore)
      if (nameChanged) {
        await updateProfile(user, { displayName: name });
        firestoreUpdates.name = name;
      }

      // Atualizar Telefone (apenas Firestore)
      if (phoneChanged) {
        firestoreUpdates.phone = phone;
      }

      // Atualizar E-mail (Auth → Firestore)
      if (emailChanged && reauthenticated) {
        try {
          await updateEmail(user, email);
          // Recarregar user object para garantir consistência
          await user.reload();
          firestoreUpdates.email = email;
        } catch (error) {
          console.error("[ProfileService] Erro ao atualizar e-mail:", error);

          if (error.code === "auth/requires-recent-login") {
            throw new Error("Sessão expirada. Faça login novamente");
          } else if (error.code === "auth/email-already-in-use") {
            throw new Error("Este e-mail já está em uso");
          } else if (error.code === "auth/invalid-email") {
            throw new Error("E-mail inválido");
          } else {
            throw new Error("Erro ao atualizar e-mail");
          }
        }
      }

      // Atualizar Senha (apenas Auth)
      if (passwordChanged && reauthenticated) {
        try {
          await updatePassword(user, newPassword);
          // Nota: Senha não é sincronizada com Firestore (Auth é o único lugar)
        } catch (error) {
          console.error("[ProfileService] Erro ao atualizar senha:", error);

          if (error.code === "auth/requires-recent-login") {
            throw new Error("Sessão expirada. Faça login novamente");
          } else if (error.code === "auth/weak-password") {
            throw new Error("Senha muito fraca. Use uma senha mais segura");
          } else if (error.code === "auth/operation-not-allowed") {
            throw new Error("Operação não permitida. Contacte o suporte");
          } else {
            throw new Error("Erro ao atualizar senha");
          }
        }
      }

      // Única chamada consolidada ao Firestore
      if (Object.keys(firestoreUpdates).length > 0) {
        await updateUserData(user.uid, firestoreUpdates);
      }

      // Retornar apenas os updates que foram salvos (simples e direto)
      return firestoreUpdates;
    } catch (error) {
      console.error("[ProfileService] Erro ao atualizar perfil:", error);
      throw error;
    }
  },
};

export default profileService;
