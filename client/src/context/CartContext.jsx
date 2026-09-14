import { createContext, useContext, useMemo, useReducer, useState } from 'react'

const CartContext = createContext(null)

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find((item) => item.product.id === action.product.id)
      if (existing) {
        return state.map((item) =>
          item.product.id === action.product.id
            ? { ...item, quantity: item.quantity + action.quantity }
            : item
        )
      }
      return [...state, { product: action.product, quantity: action.quantity }]
    }
    case 'REMOVE':
      return state.filter((item) => item.product.id !== action.productId)
    case 'UPDATE_QUANTITY':
      return state.map((item) =>
        item.product.id === action.productId
          ? { ...item, quantity: Math.max(1, action.quantity) }
          : item
      )
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, [])
  const [isDrawerOpen, setDrawerOpen] = useState(false)

  const value = useMemo(() => {
    const addItem = (product, quantity = 1) => {
      dispatch({ type: 'ADD', product, quantity })
      setDrawerOpen(true)
    }
    const removeItem = (productId) => dispatch({ type: 'REMOVE', productId })
    const updateQuantity = (productId, quantity) =>
      dispatch({ type: 'UPDATE_QUANTITY', productId, quantity })
    const clearCart = () => dispatch({ type: 'CLEAR' })

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.product.price, 0)

    return {
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      isDrawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    }
  }, [items, isDrawerOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
