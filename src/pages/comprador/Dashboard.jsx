import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { home, chatIcon, entregasIcon, carinha, settingsIcon } from "../../assets/assets";

import Header from "./Header";
import TopTabs from "./TopTabs";
import BottomTabs from "./BottomTabs";
import SearchBar from "./SearchBar";
import ProductCard from "./ProductCard";
import SupplierSlider from "./SupplierSlider";
import Cart from "./Cart";
import Transport from "./Transport";
import SettingsPanel from "../common/settings/SettingsPanel"; // full-screen

const DashboardComprador = () => {
  const [products, setProducts] = useState([]);
  const [suppliersData, setSuppliersData] = useState([]);
  const [activeTopTab, setActiveTopTab] = useState("Descobrir");
  const [activeBottomTab, setActiveBottomTab] = useState("Feed"); // Feed | Carrinho | Pedidos | Chat | Configurações
  const [cart, setCart] = useState([]);
  const [selectedQty, setSelectedQty] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const bottomTabs = [
    { name: "Feed", icon: home },
    { name: "Carrinho", icon: carinha },
    { name: "Pedidos", icon: entregasIcon },
    { name: "Chat", icon: chatIcon },
    { name: "Configurações", icon: settingsIcon },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const allProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(allProducts);

        const suppliers = [
          { id: "s1", name: "João Silva", location: "Matola Gare" },
          { id: "s2", name: "Maria Santos", location: "Nampula Centro" },
          { id: "s3", name: "Carlos Pereira", location: "Maputo Cidade" },
        ];

        const suppliersWithProducts = suppliers.map((s, idx) => ({
          ...s,
          products: allProducts.filter((_, i) => i % suppliers.length === idx),
        }));

        setSuppliersData(suppliersWithProducts);
      } catch (err) {
        console.error("Erro a buscar produtos:", err);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    const quantity = parseInt(selectedQty[product.id], 10) || 1;
    if (quantity <= 0 || (product.quantity && quantity > product.quantity)) return;

    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + quantity } : item
        )
      );
    } else {
      setCart([...cart, { ...product, cartQuantity: quantity }]);
    }
    setSelectedQty({ ...selectedQty, [product.id]: "" });
  };

  const handleBuyNow = (product) => alert(`Comprou ${product.name} por ${product.price} MZN ✅`);
  const handleCheckout = () => {
    alert("Compra finalizada 🎉");
    setCart([]);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cartItemsCount = cart.reduce((sum, item) => sum + (item.cartQuantity || 0), 0);

  // Abrir painel de settings quando seleciona aba Configurações
  useEffect(() => {
    setSettingsOpen(activeBottomTab === "Configurações");
  }, [activeBottomTab]);

  const handleCloseSettings = () => {
    setSettingsOpen(false);
    setActiveBottomTab("Feed");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 text-white pb-24">
      {/* Header principal */}
      {activeBottomTab !== "Carrinho" &&
        activeBottomTab !== "Pedidos" &&
        activeBottomTab !== "Configurações" && (
          <Header
            onSettings={() => {
              setActiveBottomTab("Configurações");
              setSettingsOpen(true);
            }}
          />
      )}

      {/* Painel de Configurações Full-Screen */}
      <SettingsPanel open={settingsOpen} onClose={handleCloseSettings} />

      {/* Aba Feed */}
      {activeBottomTab === "Feed" && (
        <>
          <TopTabs
            tabs={["Descobrir", "Meus Fornecedores"]}
            activeTab={activeTopTab}
            onTabClick={setActiveTopTab}
          />

          <SearchBar value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

          {activeTopTab === "Descobrir" && (
            <div className="px-4 space-y-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selectedQty={selectedQty}
                  setSelectedQty={setSelectedQty}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          )}

          {activeTopTab === "Meus Fornecedores" &&
            suppliersData.map((supplier) => (
              <SupplierSlider
                key={supplier.id}
                supplier={supplier}
                selectedQty={selectedQty}
                setSelectedQty={setSelectedQty}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
        </>
      )}

      {/* Aba Carrinho */}
      {activeBottomTab === "Carrinho" && (
        <Cart
          cart={cart}
          onCheckout={handleCheckout}
          updateQuantity={(id, delta) =>
            setCart(
              cart.map((item) =>
                item.id === id
                  ? { ...item, cartQuantity: Math.max(1, item.cartQuantity + delta) }
                  : item
              )
            )
          }
          removeItem={(id) => setCart(cart.filter((item) => item.id !== id))}
        />
      )}

      {/* Aba Pedidos */}
      {activeBottomTab === "Pedidos" && <Transport />}

      {/* Aba Chat */}
      {activeBottomTab === "Chat" && (
        <div className="text-white px-4">
          <h2 className="text-2xl font-bold mb-4">Chat</h2>
          <p className="text-gray-300">Aqui você poderá conversar com compradores e transportadores.</p>
          <div className="mt-6 bg-black/20 rounded-xl p-4 h-64 overflow-y-auto">
            <p className="text-gray-400 text-sm">Nenhuma conversa ainda...</p>
          </div>
          <input
            type="text"
            placeholder="Digite uma mensagem..."
            className="w-full mt-4 p-3 rounded-xl bg-[#05291C] border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-[#BF7F17]"
          />
        </div>
      )}

      {/* Bottom Tabs */}
      <BottomTabs
        tabs={bottomTabs}
        activeTab={activeBottomTab}
        onTabClick={(name) => setActiveBottomTab(name)}
        cartItemsCount={cartItemsCount}
      />
    </div>
  );
};

export default DashboardComprador;
