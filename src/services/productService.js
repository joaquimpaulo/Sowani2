const STORAGE_KEY = "sowani_products_v1"

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error("Erro ao ler produtos:", e)
    return []
  }
}

const write = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    // dispatch event
    window.dispatchEvent(new CustomEvent("productsUpdated", { detail: list }))
  } catch (e) {
    console.error("Erro ao gravar produtos:", e)
  }
}

export const getProducts = () => read()

export const addProduct = (p) => {
  const list = read()
  const id = Date.now()
  const product = { id, ...p }
  list.unshift(product)
  write(list)
  return product
}

export default { getProducts, addProduct }
