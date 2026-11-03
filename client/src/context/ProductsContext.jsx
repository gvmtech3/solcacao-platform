import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../utils/apiClient'

const ProductsContext = createContext(null)

function normalize(doc) {
  return { ...doc, id: doc._id }
}

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [origins, setOrigins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [productsRes, categoriesRes, originsRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/products/origins'),
      ])
      setProducts(productsRes.products.map(normalize))
      setCategories(categoriesRes.categories.map(normalize))
      setOrigins(originsRes.origins)
    } catch (err) {
      setError(err.message || 'Failed to load the catalog.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <ProductsContext.Provider value={{ products, categories, origins, loading, error, reload: load }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider')
  return ctx
}
