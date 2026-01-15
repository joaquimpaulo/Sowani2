import { useState } from "react";
import { auth, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePhone = (phone) => {
    const regex = /^\+258[8-9]\d{7,8}$/
    return regex.test(phone)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!phone) {
      setError("Por favor, digite seu número de telefone.");
      return;
    }

    if (!validatePhone(phone)) {
      setError("Número inválido. Use o padrão moçambicano (+258...).");
      return;
    }

    setLoading(true);

    try {
      // Buscar usuário no Firestore pelo telefone
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phone", "==", phone));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError("Número não encontrado. Verifique ou crie uma conta.");
        setLoading(false);
        return;
      }

      // Obter dados do usuário
      const userData = snapshot.docs[0].data();

      // Armazenar no localStorage para simular sessão (MVP)
      localStorage.setItem("currentUser", JSON.stringify({
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        role: userData.role
      }));

      // Redirecionar baseado no papel
      const role = userData.role;
      if (role === "agricultor") navigate("/agricultor");
      else if (role === "transportador") navigate("/transportador");
      else navigate("/comprador");

    } catch (err) {
      console.error("Erro ao fazer login:", err);
      setError("Erro ao fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#05291C] p-8">
      <div className="flex flex-col justify-center w-full max-w-md rounded-2xl px-8 py-10 border border-[#103a2f] bg-[#112C25]/70 backdrop-blur-md shadow-lg text-white text-sm">
        <h2 className="text-2xl font-bold text-[#FE9300]">Entrar</h2>
        <p className="text-slate-300 mt-1 mb-6">Digite seu número de telefone</p>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <form className="mt-2" onSubmit={handleSubmit}>
          <label className="block mb-1 font-medium text-slate-200">
            Número de Telefone
          </label>
          <input
            type="text"
            placeholder="+258XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 mb-4 bg-[#05291C] border border-slate-700 rounded-xl focus:outline-none focus:ring-2 transition focus:ring-[#BF7F17] focus:border-[#BF7F17] placeholder-slate-500"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 px-4 py-3 font-semibold text-white rounded-4xl transition duration-300
              ${loading ? "bg-[#FE9300]/70 cursor-not-allowed" : "bg-[#FE9300] hover:bg-[#E38004] hover:scale-105"}`}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={() => navigate("/select-role")}
              className="text-[#FE9300] hover:underline"
            >
              Criar conta
            </button>
          </div>
        </form>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium transition hover:bg-white/20 hover:scale-105"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
