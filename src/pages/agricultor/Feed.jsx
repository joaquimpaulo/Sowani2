import { useEffect, useState } from "react"
import productService from "../../services/productService"

const Feed = ({ products: propProducts, onEdit, onDelete, searchTerm = "", onTabChange }) => {
  const [products, setProducts] = useState(propProducts ?? [])

  useEffect(() => {
    if (!propProducts) {
      setProducts(productService.getProducts())

      const handler = (e) => setProducts(e.detail ?? productService.getProducts())
      window.addEventListener("productsUpdated", handler)
      return () => window.removeEventListener("productsUpdated", handler)
    } else {
      setProducts(propProducts)
    }
  }, [propProducts])

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4">
    {/* Cards de Estatísticas */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {/* Produtos */}
      <div className="bg-black/20 rounded-2xl p-4 border border-white/30 text-center cursor-pointer hover:bg-black/30 transition">
        <div className="text-orange-400 text-2xl mb-2">📦</div>
        <div className="text-3xl font-bold text-white">{products.length}</div>
        <div className="text-gray-300 text-sm">Produtos</div>
      </div>

      {/* Pedidos */}
      <div
        onClick={() => onTabChange?.("Entregas")}
        className="bg-black/20 rounded-2xl p-4 border border-white/30 text-center cursor-pointer hover:bg-black/30 transition"
      >
        <div className="text-orange-400 text-2xl mb-2">📈</div>
        <div className="text-3xl font-bold text-white">{products.reduce((sum, p) => sum + (p?.sold || 0), 0)}</div>
        <div className="text-gray-300 text-sm">Pedidos</div>
      </div>

      {/* Visualizações */}
      <div
        onClick={() => onTabChange?.("Stats")}
        className="bg-black/20 rounded-2xl p-4 border border-white/30 text-center cursor-pointer hover:bg-black/30 transition"
      >
        <div className="text-green-400 text-2xl mb-2">👁️</div>
        <div className="text-3xl font-bold text-white">{products.reduce((sum, p) => sum + (p?.visualizacoes || 0), 0)}</div>
        <div className="text-gray-300 text-sm">Visualizações</div>
      </div>

      {/* Avaliações */}
      <div className="bg-black/20 rounded-2xl p-4 border border-white/30 text-center">
        <div className="text-yellow-400 text-2xl mb-2">⭐</div>
        <div className="text-3xl font-bold text-white">4.5</div>
        <div className="text-gray-300 text-sm">Avaliações</div>
      </div>
    </div>

    {/* Título do Feed */}
    <h2 className="text-2xl font-bold text-white mb-4">Meus Produtos</h2>

    {/* Lista de Produtos */}
    <div className="space-y-4">
      {filteredProducts.length > 0 ? (
        filteredProducts.map((p) => (
        <div
          key={p.id}
          className="bg-black/20 rounded-2xl border border-white/20 overflow-hidden p-4 flex justify-between items-center hover:shadow-lg transition"
        >
          {/* Imagem do Produto */}
          <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
            {p.imageUrl ? (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-700 text-gray-400 text-xs">
                Sem imagem
              </div>
            )}
          </div>

          {/* Detalhes do Produto */}
          <div className="flex-1 ml-4">
            <h3 className="text-lg font-semibold text-white">{p.name}</h3>
            <p className="text-gray-300">Qtd: {p.quantity}</p>
            <p className="text-gray-300">Preço: {p.price} MZN</p>
          </div>

          {/* Botões de Ação */}
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(p)}
              className="w-10 h-10 bg-gradient-to-br from-[#0d8467]/70 to-[#0d8467]/40 backdrop-blur-md rounded-full flex items-center justify-center hover:from-[#0d8467] hover:to-[#0d8467]/60 shadow-md transition-all duration-200"
            >
              <img
                src="https://img.icons8.com/?size=100&id=59856&format=png&color=FFFFFF"
                alt="editar"
                className="w-5 h-5"
              />
            </button>

            <button
              onClick={() => onDelete(p.id)}
              className="w-10 h-10 bg-gradient-to-br from-[#fe9300]/70 to-[#fe9300]/40 backdrop-blur-md rounded-full flex items-center justify-center hover:from-[#fe9300] hover:to-[#fe9300]/60 shadow-md transition-all duration-200"
            >
              <img
                src="https://img.icons8.com/?size=100&id=67884&format=png&color=FFFFFF"
                alt="apagar"
                className="w-5 h-5"
              />
            </button>
          </div>
        </div>
      ))
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  </div>
  );
};

export default Feed;
