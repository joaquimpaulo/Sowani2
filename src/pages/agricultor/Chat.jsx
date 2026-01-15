import { useState } from "react"

const sampleContacts = [
  { id: 1, name: "João Silva", phone: "+5511999999999", last: "Olá, tem produto disponível?" },
  { id: 2, name: "Maria Souza", phone: "+5511888888888", last: "Quando será a entrega?" },
  { id: 3, name: "Transp. Rápido", phone: "+5511777777777", last: "Orçamento enviado." },
]

const Chat = () => {
  const [contacts] = useState(sampleContacts)
  const [activeId, setActiveId] = useState(null)
  const [message, setMessage] = useState("")

  const activeContact = contacts.find((c) => c.id === activeId)

  const sendMessage = () => {
    if (!message.trim()) return
    // placeholder: aqui você integraria com o serviço de envio
    // por enquanto apenas limpa o input
    console.log(`Enviando para ${activeContact?.name}: ${message}`)
    setMessage("")
    alert(`Mensagem enviada para ${activeContact?.name}`)
  }

  return (
    <div className="text-white">
      <h2 className="text-2xl font-bold mb-4">Chat</h2>
      <p className="text-gray-300">Aqui você poderá conversar com compradores e transportadores.</p>

      <div className="mt-6 grid grid-cols-1 gap-6">
        {/* Lista de contactos */}
        <div className="col-span-1 bg-black/20 rounded-xl p-2 h-80 overflow-y-auto">
          <h3 className="font-semibold px-3 py-2">Contactos</h3>
          <ul>
            {contacts.map((c) => (
              <li
                key={c.id}
                className={`px-3 py-2 rounded-md mx-2 my-1 flex items-center justify-between ${c.id === activeId ? 'bg-[#06392B]' : 'hover:bg-black/10'}`}
              >
                <div onClick={() => setActiveId(c.id)} className="cursor-pointer">
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-gray-400">{c.last}</div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`tel:${c.phone}`} className="text-xs text-gray-400 px-2 py-1 rounded hover:bg-white/5">Ligar</a>
                  <button
                    onClick={() => {
                      // mensagem rápida sem abrir conversa
                      const quick = prompt(`Mensagem rápida para ${c.name}:`)
                      if (quick && quick.trim()) {
                        console.log(`Mensagem rápida para ${c.name}: ${quick}`)
                        alert(`Mensagem enviada para ${c.name}`)
                      }
                    }}
                    className="text-xs text-gray-400 px-2 py-1 rounded hover:bg-white/5"
                  >
                    Mensagem
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Conversa */}
        
      </div>
    </div>
  )
}

export default Chat
