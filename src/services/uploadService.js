import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();

/**
 * Faz upload de uma imagem para o Firebase Storage
 * @param {File} imageFile - O arquivo de imagem
 * @param {string} userId - ID do usuário
 * @param {string} productId - ID do produto (pode ser um identificador único)
 * @returns {Promise<string>} - URL da imagem armazenada
 */
export async function uploadProductImage(imageFile, userId, productId) {
  if (!imageFile) {
    throw new Error("Nenhum arquivo de imagem fornecido");
  }

  try {
    // Cria um caminho único para a imagem
    const timestamp = Date.now();
    const fileName = `${productId}_${timestamp}`;
    const storagePath = `products/${userId}/${fileName}`;
    
    const storageRef = ref(storage, storagePath);
    
    // Faz upload do arquivo
    const snapshot = await uploadBytes(storageRef, imageFile);
    
    // Obtém a URL de download
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw new Error(`Falha ao salvar imagem: ${error.message}`);
  }
}

export default { uploadProductImage };
