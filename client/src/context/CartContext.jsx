import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../utils/apiClient'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

function normalizeItems(items = []) {
  return items
    .filter((item) => item.product)
    .map((item) => ({
      product: { ...item.product, id: item.product._id },
      quantity: item.quantity,
    }))
}

export function CartProvider({ children }) {
  const { authLoading, isAuthenticated } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const refresh = useCallback(async () => {
    try {
      const data = await api.get('/cart')
      setItems(normalizeItems(data.items))
    } catch (err) {
      console.error('Failed to load cart', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Wait for the auth/me check to resolve first so a freshly-logged-in user's
  // merged cart is fetched, not a stale guest cart.
  useEffect(() => {
    if (authLoading) return
    refresh()
  }, [authLoading, isAuthenticated, refresh])

  const addItem = async (product, quantity = 1) => {
    setDrawerOpen(true)
    try {
      const data = await api.post('/cart/items', { productId: product.id || product._id, quantity })
      setItems(normalizeItems(data.items))
    } catch (err) {
      console.error('Failed to add item to cart', err)
    }
  }

  const updateQuantity = async (productId, quantity) => {
    try {
      const data = await api.patch(`/cart/items/${productId}`, { quantity: Math.max(1, quantity) })
      setItems(normalizeItems(data.items))
    } catch (err) {
      console.error('Failed to update cart item', err)
    }
  }

  const removeItem = async (productId) => {
    try {
      const data = await api.delete(`/cart/items/${productId}`)
      setItems(normalizeItems(data.items))
    } catch (err) {
      console.error('Failed to remove cart item', err)
    }
  }

  const clearCart = async () => {
    try {
      const data = await api.delete('/cart')
      setItems(normalizeItems(data.items))
    } catch (err) {
      console.error('Failed to clear cart', err)
    }
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0)

  const value = useMemo(
    () => ({
      items,
      loading,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      refresh,
      itemCount,
      subtotal,
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, loading, isDrawerOpen]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
