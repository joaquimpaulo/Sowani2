// Service to send an image to OpenAI Vision API and return suggested product fields.

const API_KEY = import.meta.env.VITE_GPT_API_KEY;
const API_URL = "https://api.openai.com/v1/chat/completions";

// Helper to convert File to base64
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// Helper to extract MIME type from file
function getMimeType(file) {
  if (file.type) return file.type;
  // fallback based on extension
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".webp")) return "image/webp";
  return "image/jpeg"; // default
}

export async function analyzeImageFile(file, options = {}) {
  if (!file) throw new Error("Nenhum arquivo foi fornecido");
  if (!API_KEY)
    throw new Error("VITE_GPT_API_KEY não está configurada no .env.local");

  try {
    // Convert to base64 data URL
    const base64Data = await fileToBase64(file);
    const mimeType = getMimeType(file);

    // Call OpenAI Vision API
    const payload = {
      model: "gpt-4.1",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: base64Data,
              },
            },
            {
              type: "text",
              text: `Você é um assistente que analisa imagens de produtos agrícolas. 
                    Analize a imagem e extraia as seguintes informações em JSON (português PT):
                    - name: Nome do produto
                    - category: Categoria do produto (ex: Verduras, Frutas, Cereais, etc)
                    - description: Descrição breve do estado/qualidade do produto
                    - price: Preço estimado em MZN (moeda de Moçambique)
                    - quantity: Quantidade estimada (unidade apropriada)
                    Retorne APENAS o JSON, sem comentários adicionais.
                    Exemplo: {"name":"Tomate","category":"Verduras","description":"Tomate fresco e maduro","price":"50","quantity":"20"}`,
            },
          ],
        },
      ],
      max_tokens: 500,
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || `Erro da API: ${res.status}`);
    }

    const responseData = await res.json();
    const content = responseData.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Não foi possível extrair os dados da resposta da IA");
    }

    const result = JSON.parse(jsonMatch[0]);
    return result;
  } catch (err) {
    console.error("Erro ao analisar imagem com IA:", err);
    throw err;
  }
}

export default { analyzeImageFile };
