import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Product } from '@/types'
import { useCart } from '@/context/CartContext'

interface Props {
  product: Product
  showAdd?: boolean
}

export default function ProductCard({ product, showAdd = false }: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem(product, product.colors[0], product.sizes[0])
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  const origINR  = product.originalPrice ? Math.round(product.originalPrice * 83) : null

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="product-img relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          loading="lazy"
        />

        {/* Hover overlay — quick add */}
        {(showAdd || hovered) && (
          <button
            onClick={handleAdd}
            className={`absolute bottom-0 left-0 right-0 py-3 text-xs font-semibold tracking-[0.1em] uppercase
              transition-all duration-200 translate-y-full group-hover:translate-y-0
              ${added ? 'bg-gray-800 text-white' : 'bg-black text-white hover:bg-gray-800'}`}
          >
            {added ? 'Added ✓' : 'Quick Add'}
          </button>
        )}

        {/* Badge */}
        {product.badge === 'new' && (
          <span className="absolute top-3 left-3 bg-black text-white text-2xs font-semibold tracking-widest uppercase px-2 py-1">
            New
          </span>
        )}
        {product.badge === 'sale' && origINR && (
          <span className="absolute top-3 left-3 bg-black text-white text-2xs font-semibold tracking-widest uppercase px-2 py-1">
            Sale
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-0.5">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</p>
        <h3 className="text-sm font-medium text-black leading-snug group-hover:opacity-70 transition-opacity">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 pt-0.5">
          {origINR && (
            <span className="text-xs text-gray-400 line-through">$ {product.originalPrice}</span>
          )}
          <span className="text-sm font-semibold text-black">$ {product.price}</span>
        </div>
      </div>
    </Link>
  )
}
