import { useState, useEffect } from "react"
import { auth, db } from "../../firebase"
import { useNavigate, useLocation } from "react-router-dom"
import { doc, setDoc, getDoc } from "firebase/firestore"
import agricultor from "../../assets/agricultor.jpg";
import transportador from "../../assets/transportador.jpg";
import comprador from "../../assets/comprador.jpg";

const Register = () => {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState("")
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const roleParam = params.get("role")
    if (roleParam) setRole(roleParam)
    else navigate("/select-role")
  }, [location, navigate])

  const validatePhone = (phone) => {
    const regex = /^\+258[8-9]\d{7,8}$/
    return regex.test(phone)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = {}

    if (!name.trim()) newErrors.name = "O campo Nome é obrigatório."
    if (!phone.trim()) newErrors.phone = "O campo Telefone é obrigatório."
    else if (!validatePhone(phone))
      newErrors.phone = "Número inválido. Use o padrão moçambicano (+258...)."

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      // Verificar se o telefone já está registrado
      const userDocRef = doc(db, "users", phone)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        setErrors({ submit: "Este número já está registrado. Tente fazer login." })
        return
      }

      // Criar usuário simulado (MVP)
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      await setDoc(doc(db, "users", userId), {
        id: userId,
        name,
        phone,
        role,
        createdAt: new Date(),
        isVerified: true // MVP - considerar verificado
      })

      // Armazenar no localStorage para simular sessão
      localStorage.setItem("currentUser", JSON.stringify({
        id: userId,
        name,
        phone,
        role
      }))

      // Redirecionar baseado no papel
      if (role === "agricultor") navigate("/agricultor")
      else if (role === "transportador") navigate("/transportador")
      else navigate("/comprador")
    } catch (err) {
      console.error("Erro ao registrar:", err)
      setErrors({ submit: "Erro ao registrar. Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  const roleNames = {
    agricultor: "Vendedor",
    transportador: "Transportador",
    comprador: "Comprador",
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#05291C] p-8">
      <div className="flex flex-col items-center w-full max-w-md rounded-2xl px-8 py-10 border border-[#103a2f] bg-[#112C25]/70 backdrop-blur-md shadow-lg text-white text-sm">

        <div className="w-32 h-32 mb-4 flex items-center justify-center bg-[#05291C] rounded-full border border-white/20">
          <img
            src={role === "agricultor" ? agricultor : role === "transportador" ? transportador : comprador}
            alt={roleNames[role]}
            className="w-full h-full object-contain rounded-full"
          />
        </div>

        <h2 className="text-2xl font-bold text-[#FE9300] mb-1">
          Criar conta - {roleNames[role]}
        </h2>
        <p className="text-slate-300 mb-6">Preencha os campos para registrar</p>

        {errors.submit && <p className="text-red-500 text-sm mb-3">{errors.submit}</p>}

        <form className="w-full" onSubmit={handleSubmit}>
          {/* Nome */}
          <label className="block mb-1 font-medium text-slate-300">Nome</label>
          <input
            type="text"
            placeholder="Digite seu nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-3 mb-1 bg-[#05291C] border rounded-xl focus:outline-none focus:ring-2 transition focus:ring-[#BF7F17] focus:border-[#BF7F17] placeholder-slate-500
              ${errors.name ? "border-red-500" : "border-slate-700"}`}
          />
          {errors.name && <p className="text-red-500 text-xs mb-2">{errors.name}</p>}

          {/* Telefone */}
          <label className="block mb-1 font-medium text-slate-300">Telefone</label>
          <input
            type="text"
            placeholder="+258XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`w-full p-3 mb-1 bg-[#05291C] border rounded-xl focus:outline-none focus:ring-2 transition focus:ring-[#BF7F17] focus:border-[#BF7F17] placeholder-slate-500
              ${errors.phone ? "border-red-500" : "border-slate-700"}`}
          />
          {errors.phone && <p className="text-red-500 text-xs mb-2">{errors.phone}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 px-4 py-3 font-semibold text-white rounded-xl transition duration-300
              ${loading ? "bg-[#FE9300]/70 cursor-not-allowed" : "bg-[#FE9300] hover:bg-[#E38004] hover:scale-105"}`}
          >
            {loading ? "Registrando..." : "Registrar"}
          </button>

          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#FE9300] hover:underline"
            >
              Já tem conta? Fazer login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
