import { useState, useRef } from "react"
import { analyzeImageFile } from "../../services/gptImageService"
import productService from "../../services/productService"

const AddProductPopup = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [errorAI, setErrorAI] = useState("")
  const [loadingSave, setLoadingSave] = useState(false)
  const inputRef = useRef(null)

  const resetForm = () => {
    setName(""); setPrice(""); setQuantity(""); setCategory(""); setDescription("");
    setImageFile(null); setImagePreview(null); setErrorAI(""); setLoadingAI(false); setLoadingSave(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoadingSave(true)
    try {
      const payload = { name, price, quantity, category, description, imageUrl: imagePreview }
      if (onAdd) {
        // enviar também a preview para permitir fallback no caller
        await onAdd({ name, price, quantity, category, description, image: imageFile, imagePreview })
      } else {
        // fallback to local product service
        productService.addProduct(payload)
      }
      resetForm()
      onClose()
    } catch (error) {
      setErrorAI("Erro ao salvar produto: " + error.message)
    } finally {
      setLoadingSave(false)
    }
  }

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    setImageFile(f)
    const url = URL.createObjectURL(f)
    setImagePreview(url)
  }

  const handleAnalyze = async () => {
    if (!imageFile) {
      setErrorAI("Carregue uma imagem antes de analisar.")
      return
    }
    setErrorAI("")
    setLoadingAI(true)
    try {
      const result = await analyzeImageFile(imageFile, { lang: "pt" })
      if (result.name) setName(result.name)
      if (result.price) setPrice(result.price)
      if (result.quantity) setQuantity(result.quantity)
      if (result.category) setCategory(result.category)
      if (result.description) setDescription(result.description)
    } catch (err) {
      console.error(err)
      setErrorAI(err.message || "Erro ao analisar imagem")
    } finally {
      setLoadingAI(false)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (inputRef.current) inputRef.current.value = null
  }

  if (!isOpen) return null

  const isFormComplete =
    name.trim() !== "" &&
    String(price).trim() !== "" &&
    String(quantity).trim() !== "" &&
    category.trim() !== "" &&
    description.trim() !== "" &&
    imageFile !== null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form className="bg-[#112C25] p-8 rounded-3xl w-full max-w-md flex flex-col space-y-3" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-white">Adicionar Produto</h2>

        {/* Campo de Imagem Retangular */}
        <div className="w-full">
          <div className="relative w-full h-42 bg-white/5 border-2 border-dashed border-white/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition group">
            <input 
              ref={inputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer rounded-2xl"
            />
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="preview" className="w-full h-full object-cover rounded-2xl" />
                <button 
                  type="button" 
                  onClick={removeImage} 
                  className="absolute top-2 right-2 px-3 py-1 bg-red-600 rounded-full text-white text-xs font-semibold hover:bg-red-700 transition"
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">📷</div>
                <p className="text-white font-semibold text-center">Carregar Imagem</p>
                <p className="text-gray-400 text-xs text-center mt-1">Clique para selecionar</p>
              </>
            )}
          </div>
          {/* <p className="text-gray-300 text-sm mt-2">
            Faça upload de uma imagem e clique em "Analisar com IA" para preencher automaticamente
          </p> */}
        </div>

        {/* Botão Analisar com IA */}
        <div className="flex flex-col gap-2">
          <button 
            type="button" 
            onClick={handleAnalyze} 
            disabled={loadingAI || !imageFile}
            className="w-full px-4 py-3 rounded-2xl bg-[#E18003] hover:bg-[#d97302] disabled:bg-gray-500 text-white font-semibold transition"
          >
            {loadingAI ? "Analisando..." : "Analisar com IA"}
          </button>
          {errorAI && <span className="text-red-400 text-sm text-center">{errorAI}</span>}
        </div>

        {/* Nome */}
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Nome do Produto</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 rounded-2xl text-white bg-white/10 border border-white/20 focus:border-[#E18003] focus:outline-none focus:ring-2 focus:ring-[#E18003]/30 transition"
          />
        </div>

        {/* Preço e Quantidade (lado a lado) */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm text-gray-300 mb-1 block">Preço (MZN)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 rounded-2xl text-white bg-white/10 border border-white/20 focus:border-[#E18003] focus:outline-none focus:ring-2 focus:ring-[#E18003]/30 transition"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-gray-300 mb-1 block">Quantidade</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-3 rounded-2xl text-white bg-white/10 border border-white/20 focus:border-[#E18003] focus:outline-none focus:ring-2 focus:ring-[#E18003]/30 transition"
            />
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Categoria</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 rounded-2xl text-white bg-white/10 border border-white/20 focus:border-[#E18003] focus:outline-none focus:ring-2 focus:ring-[#E18003]/30 transition"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="text-sm text-gray-300 mb-1 block">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-2xl text-white bg-white/10 border border-white/20 focus:border-[#E18003] focus:outline-none focus:ring-2 focus:ring-[#E18003]/30 transition resize-none h-24"
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="flex-1 px-4 py-3 rounded-2xl bg-[#FA8900] hover:bg-[#d97302] text-white font-semibold transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!isFormComplete || loadingSave}
            className={`flex-1 px-4 py-3 rounded-2xl font-semibold transition ${
              isFormComplete && !loadingSave
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
          >
            {loadingSave ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddProductPopup
