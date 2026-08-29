import { createContext, useContext, useState, ReactNode } from 'react'
import { ProductSummary } from '@/lib/api'
import { CartItem } from '@/types'

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  itemCount: number
  subtotal: number
  addItem: (product: ProductSummary, variantId: string, color: string, size: string, qty?: number) => void
  removeItem: (id: string, variantId: string) => void
  updateQty: (id: string, variantId: string, qty: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addItem = (product: ProductSummary, variantId: string, color: string, size: string, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.variantId === variantId)
      if (existing) {
        return prev.map(i => i.variantId === variantId ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { product, variantId, color, size, qty }]
    })
  }

  const removeItem = (id: string, variantId: string) => {
    setItems(prev => prev.filter(i => !(i.product.id === id && i.variantId === variantId)))
  }

  const updateQty = (id: string, variantId: string, qty: number) => {
    if (qty <= 0) { removeItem(id, variantId); return }
    setItems(prev =>
      prev.map(i =>
        i.product.id === id && i.variantId === variantId ? { ...i, qty } : i
      )
    )
  }

  const clearCart = () => setItems([])
  const toggleCart = () => setIsOpen(o => !o)
  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0)
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, isOpen, itemCount, subtotal, addItem, removeItem, updateQty, clearCart, toggleCart, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
