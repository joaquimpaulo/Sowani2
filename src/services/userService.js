import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

/**
 * Schema padrão para documento do usuário
 */
const USER_SCHEMA = {
  uid: "",
  email: "",
  name: "",
  phone: "",
  role: "Usuário",
  photoURL: null,
  createdAt: null,
  updatedAt: null,
};

/**
 * Valida e sanitiza dados do usuário contra o schema
 * @param {Object} data - Dados brutos do Firestore
 * @returns {Object} Dados validados
 */
const validateUserData = (data = {}) => {
  return {
    uid: data.uid || "",
    email: data.email || "",
    name: data.name || "",
    phone: data.phone || "",
    role: data.role || data.userType || "Usuário",
    photoURL: data.photoURL || null,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
};

/**
 * Busca dados do usuário combinando Firebase Auth e Firestore
 * Se o documento não existir, cria automaticamente
 * @param {Object} firebaseUser - Usuário do Firebase Auth
 * @returns {Promise<Object>} Dados do usuário validados
 */
export const getUserData = async (firebaseUser) => {
  if (!firebaseUser?.uid) {
    throw new Error("Usuário não autenticado");
  }

  try {
    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDocSnapshot = await getDoc(userDocRef);

    let firestoreData = {};

    if (userDocSnapshot.exists()) {
      firestoreData = userDocSnapshot.data();
      console.log("[UserService] Documento encontrado para:", firebaseUser.uid);
    } else {
      console.warn("[UserService] Documento não encontrado, criando para:", firebaseUser.uid);
      
      // Criar documento padrão
      const defaultData = {
        ...USER_SCHEMA,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || "",
        photoURL: firebaseUser.photoURL || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      try {
        await setDoc(userDocRef, defaultData);
        firestoreData = defaultData;
      } catch (error) {
        console.error("[UserService] Erro ao criar documento:", error);
        // Continuar mesmo se falhar na criação
      }
    }

    // Combinar dados do Auth com dados do Firestore
    const userData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firestoreData.name || "",
      phone: firestoreData.phone || "",
      role: firestoreData.role || firestoreData.userType || "Usuário",
      photoURL: firebaseUser.photoURL || firestoreData.photoURL || null,
      createdAt: firestoreData.createdAt || null,
      updatedAt: firestoreData.updatedAt || null,
    };

    // Validar contra schema
    return validateUserData(userData);
  } catch (error) {
    console.error("[UserService] Erro ao buscar dados do usuário:", error);
    throw new Error(`Falha ao carregar perfil: ${error.message}`);
  }
};

/**
 * Atualiza dados do usuário no Firestore
 * @param {string} uid - UID do usuário
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<void>}
 */
export const updateUserData = async (uid, updates) => {
  if (!uid) {
    throw new Error("UID do usuário é obrigatório");
  }

  try {
    const userDocRef = doc(db, "users", uid);
    const sanitizedUpdates = {
      ...updates,
      updatedAt: new Date(),
    };

    await updateDoc(userDocRef, sanitizedUpdates);
    console.log("[UserService] Dados atualizados para:", uid);
  } catch (error) {
    console.error("[UserService] Erro ao atualizar dados:", error);
    throw new Error(`Falha ao atualizar perfil: ${error.message}`);
  }
};

/**
 * Verifica se um documento de usuário existe
 * @param {string} uid - UID do usuário
 * @returns {Promise<boolean>}
 */
export const userDocumentExists = async (uid) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDocSnapshot = await getDoc(userDocRef);
    return userDocSnapshot.exists();
  } catch (error) {
    console.error("[UserService] Erro ao verificar documento:", error);
    return false;
  }
};
