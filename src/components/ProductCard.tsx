import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import { ProductSummary } from '@/lib/api'
import { useCart } from '@/context/CartContext'

interface Props {
  product: ProductSummary
  showAdd?: boolean
}

export default function ProductCard({ product, showAdd = false }: Props) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    // Add with empty variantId/color/size — user can select on detail page
    // Quick-add picks the first available variant by convention
    addItem(product, `${product.id}-default`, '', '', 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1600)
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const imageUrl = product.mainImageUrl ?? 'https://placehold.co/400x500?text=No+Image'

  return (
    <Link
      to={`/product/${product.id}`}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="product-img relative bg-gray-50">
        <img
          src={imageUrl}
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

        {/* Badges */}
        {product.newArrival && (
          <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-semibold tracking-widest uppercase px-2 py-1">
            New
          </span>
        )}
        {hasDiscount && !product.newArrival && (
          <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-semibold tracking-widest uppercase px-2 py-1">
            Sale
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-3 space-y-0.5">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{product.categoryName}</p>
        <h3 className="text-sm font-medium text-black leading-snug group-hover:opacity-70 transition-opacity line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">$ {product.compareAtPrice!.toFixed(2)}</span>
            )}
            <span className="text-sm font-semibold text-black">$ {product.price.toFixed(2)}</span>
          </div>
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-0.5 text-[10px] text-gray-400">
              <Star size={10} className="fill-yellow-400 text-yellow-400" />
              <span>{product.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
