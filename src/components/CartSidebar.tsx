import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&q=80'

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, itemCount } = useCart()

  const freeShippingThreshold = 200
  const progressPct = Math.min(100, (subtotal / freeShippingThreshold) * 100)
  const remaining = Math.max(0, freeShippingThreshold - subtotal)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-pearl z-50 flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-mist">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-gold" />
            <h2 className="font-display text-lg tracking-wide">Your Selections</h2>
            {itemCount > 0 && (
              <span className="text-xs text-stone">({itemCount} {itemCount === 1 ? 'piece' : 'pieces'})</span>
            )}
          </div>
          <button onClick={closeCart} className="text-stone hover:text-navy transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Free shipping progress */}
        {itemCount > 0 && (
          <div className="px-6 py-3 bg-cream border-b border-mist">
            <div className="flex justify-between mb-1.5">
              <span className="text-[10px] text-stone">Free shipping progress</span>
              <span className="text-[10px] text-gold font-medium">
                {remaining > 0 ? `$${remaining.toFixed(0)} away` : '✦ Free shipping unlocked'}
              </span>
            </div>
            <div className="h-0.5 bg-mist">
              <div className="h-full bg-gold transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-5 text-center">
              <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center">
                <ShoppingBag size={24} className="text-stone" />
              </div>
              <div>
                <p className="font-display text-lg text-navy mb-1">Your selection is empty</p>
                <p className="text-xs text-stone">Discover pieces made for you</p>
              </div>
              <Link to="/shop" onClick={closeCart} className="btn-gold btn-sm mt-2">
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map(item => (
                <div key={`${item.variantId}-${item.color}-${item.size}`} className="flex gap-4 py-4 border-b border-mist last:border-0">
                  {/* Image */}
                  <Link to={`/product/${item.productId}`} onClick={closeCart} className="shrink-0">
                    <img
                      src={item.imageUrl ?? PLACEHOLDER}
                      alt={item.productName}
                      className="w-20 h-24 object-cover object-top bg-cream"
                      onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER }}
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.productId}`}
                      onClick={closeCart}
                      className="text-sm font-medium text-navy hover:text-gold transition-colors line-clamp-2 leading-snug"
                    >
                      {item.productName}
                    </Link>
                    <div className="flex gap-2 mt-1">
                      {item.size && <span className="text-[10px] text-stone">Size: {item.size}</span>}
                      {item.color && <span className="text-[10px] text-stone">Colour: {item.color}</span>}
                    </div>
                    <p className="text-sm font-medium text-navy mt-1">${item.unitPrice.toFixed(2)}</p>

                    {/* Qty + remove */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-mist">
                        <button
                          onClick={() => updateQty(item.variantId, item.color, item.size, item.qty - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-cream transition-colors"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-8 text-center text-xs font-medium">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item.variantId, item.color, item.size, item.qty + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-cream transition-colors"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.variantId, item.color, item.size)}
                        className="text-[10px] text-stone hover:text-navy underline underline-offset-2 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-mist px-6 py-6 bg-pearl">
            <div className="flex justify-between mb-4">
              <span className="text-sm text-stone">Subtotal</span>
              <span className="text-sm font-medium text-navy">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-stone mb-5">Shipping and taxes calculated at checkout</p>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="btn-navy w-full flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={14} />
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-center text-xs text-stone hover:text-navy transition-colors mt-3 py-2"
            >
              Continue Browsing
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
