import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'

export default function CartSidebar() {
  const { isOpen, closeCart, items, removeItem, updateQty, subtotal, itemCount } = useCart()

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={closeCart}
      />

      <aside
        className={`fixed right-0 top-0 h-full w-full sm:w-[400px] bg-white z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em]">Shopping Bag</h2>
            {itemCount > 0 && (
              <span className="text-xs text-gray-500">({itemCount})</span>
            )}
          </div>
          <button onClick={closeCart} className="hover:opacity-60 transition-opacity" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
              <ShoppingBag size={40} className="text-gray-200" />
              <p className="text-sm text-gray-400">Your bag is empty</p>
              <button onClick={closeCart} className="btn-outline btn-sm">
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={`${item.product.id}-${item.color}-${item.size}`} className="flex gap-4">
                <Link to={`/product/${item.product.id}`} onClick={closeCart} className="shrink-0 w-[80px] h-[100px] bg-gray-50 overflow-hidden">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <Link to={`/product/${item.product.id}`} onClick={closeCart} className="text-sm font-medium leading-snug hover:opacity-60 transition-opacity">
                      {item.product.name}
                    </Link>
                    <div className="flex gap-2 mt-1 text-xs text-gray-500">
                      {item.size && <span>Size: {item.size}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200">
                      <button onClick={() => updateQty(item.product.id, item.color, item.size, item.qty - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <Minus size={11} />
                      </button>
                      <span className="w-8 text-center text-xs font-medium">{item.qty}</span>
                      <button onClick={() => updateQty(item.product.id, item.color, item.size, item.qty + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <Plus size={11} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">$ {(item.product.price * item.qty).toFixed(0)}</span>
                      <button onClick={() => removeItem(item.product.id, item.color, item.size)} className="text-gray-300 hover:text-black transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold">$ {subtotal.toFixed(0)}</span>
            </div>
            <p className="text-xs text-gray-400">Shipping &amp; taxes calculated at checkout</p>
            <Link to="/checkout" onClick={closeCart} className="btn-black w-full justify-between">
              <span>Checkout</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
