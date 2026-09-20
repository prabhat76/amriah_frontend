import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  variantId: string
  productId: string
  productName: string
  size: string
  color: string
  imageUrl: string | null
  unitPrice: number
  qty: number
}

interface CartContextType {
  items: CartItem[]
  isOpen: boolean
  itemCount: number
  subtotal: number
  addItem: (
    product: { id: string; name: string; mainImageUrl?: string | null; price: number },
    variantId: string,
    color: string,
    size: string,
    qty?: number
  ) => void
  removeItem: (variantId: string, color: string, size: string) => void
  updateQty: (variantId: string, color: string, size: string, qty: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}

const CART_KEY = 'astrimi_cart'

function loadCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_KEY)
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart)
  const [isOpen, setIsOpen] = useState(false)

  // Persist to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (
    product: { id: string; name: string; mainImageUrl?: string | null; price: number },
    variantId: string,
    color: string,
    size: string,
    qty = 1,
  ) => {
    setItems(prev => {
      const existing = prev.find(
        i => i.variantId === variantId && i.color === color && i.size === size,
      )
      if (existing) {
        return prev.map(i =>
          i.variantId === variantId && i.color === color && i.size === size
            ? { ...i, qty: i.qty + qty }
            : i,
        )
      }
      return [...prev, {
        variantId,
        productId: product.id,
        productName: product.name,
        imageUrl: product.mainImageUrl ?? null,
        unitPrice: product.price,
        color,
        size,
        qty,
      }]
    })
  }

  const removeItem = (variantId: string, color: string, size: string) => {
    setItems(prev =>
      prev.filter(i => !(i.variantId === variantId && i.color === color && i.size === size)),
    )
  }

  const updateQty = (variantId: string, color: string, size: string, qty: number) => {
    if (qty <= 0) { removeItem(variantId, color, size); return }
    setItems(prev =>
      prev.map(i =>
        i.variantId === variantId && i.color === color && i.size === size ? { ...i, qty } : i,
      ),
    )
  }

  const clearCart = () => {
    setItems([])
    localStorage.removeItem(CART_KEY)
  }
  const toggleCart = () => setIsOpen(o => !o)
  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const itemCount = items.reduce((s, i) => s + i.qty, 0)
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0)

  return (
    <CartContext.Provider value={{
      items, isOpen, itemCount, subtotal,
      addItem, removeItem, updateQty, clearCart,
      toggleCart, openCart, closeCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
