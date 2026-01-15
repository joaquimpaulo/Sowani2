import { useNavigate } from "react-router-dom";
import agricultor from "../../assets/agricultor.jpg";
import transportador from "../../assets/transportador.jpg";
import comprador from "../../assets/comprador.jpg";



const SelectRole = () => {
  const navigate = useNavigate();

  const roles = [
    {
      key: "agricultor",
      title: "Vendedor",
      image: agricultor,
      subtitle: "Venda seus produtos",
    },
    {
      key: "transportador",
      title: "Transportador",
      image: transportador,
      subtitle: "Transporte produtos",
    },
    {
      key: "comprador",
      title: "Comprador",
      image: comprador,
      subtitle: "Compre produtos",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#00241A] p-6 text-white text-center">
      <h1 className="text-3xl font-bold text-[#ffffff] mb-10">
        Selecione seu perfil para continuar
      </h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {roles.map((role) => (
          <div
            key={role.key}
            onClick={() => navigate(`/register?role=${role.key}`)}
            className="cursor-pointer bg-[#112C25]/70 backdrop-blur-md border border-white/20 p-7.5 rounded-3xl shadow-lg w-full hover:scale-105 hover:bg-[#112C25]/90 transition transform"
          >
            <div className="flex items-center gap-4">
              {/* Div da Imagem */}
              <div className="flex-shrink-0 min-w-20 h-20 flex items-center justify-center bg-[#05291C] rounded-full border border-white/20">
                <img
                  src={role.image}
                  alt={role.title}
                  className="w-full h-full object-contain rounded-full"
                />
              </div>

              {/* Div dos Textos */}
              <div className="flex flex-col text-left">
                <h2 className="text-xl font-semibold text-[#ffffff] mb-1">
                  {role.title}
                </h2>
                <p className="text-[#A6BF80] text-m">{role.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botão Voltar */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium transition hover:bg-white/20 hover:scale-105"
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
};

export default SelectRole;
