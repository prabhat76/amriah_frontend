import { Link } from 'react-router-dom'
import { Heart, Star, Sparkles } from 'lucide-react'
import type { ProductSummary } from '@/lib/api'

interface Props {
  product: ProductSummary
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80'

export default function ProductCard({ product: p }: Props) {
  const image = p.mainImageUrl ?? PLACEHOLDER
  const hasDiscount = p.compareAtPrice != null && p.compareAtPrice > p.price
  const discountPct = hasDiscount
    ? Math.round((1 - p.price / p.compareAtPrice!) * 100)
    : 0

  return (
    <Link to={`/product/${p.id}`} className="card-product block">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-cream">
        <img
          src={image}
          alt={p.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER }}
        />

        {/* Badges top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {p.newArrival && <span className="badge-navy">New</span>}
          {p.featured && <span className="badge-gold">Featured</span>}
          {hasDiscount && <span className="badge-custom">−{discountPct}%</span>}
        </div>

        {/* Product type badge top-right */}
        <div className="absolute top-3 right-3">
          <span className="badge-cream flex items-center gap-1">
            <Sparkles size={8} />
            Customisable
          </span>
        </div>

        {/* Hover wishlist */}
        <button
          onClick={e => { e.preventDefault(); /* wishlist */ }}
          className="absolute bottom-3 right-3 w-8 h-8 bg-pearl/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-pearl"
          aria-label="Save to wishlist"
        >
          <Heart size={14} className="text-navy" />
        </button>

        {/* Bottom gradient on hover */}
        <div className="absolute inset-x-0 bottom-0 h-20 overlay-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className="pt-3 pb-1">
        {p.brandName && (
          <p className="eyebrow text-[9px] mb-1">{p.brandName}</p>
        )}
        <h3 className="font-body text-sm font-medium text-navy leading-snug line-clamp-2 group-hover:text-gold transition-colors duration-200">
          {p.name}
        </h3>

        {/* Rating */}
        {p.reviewCount > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={9} className="fill-gold text-gold" />
            <span className="text-[10px] text-stone">{p.averageRating.toFixed(1)} ({p.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-medium text-navy">
            ${p.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-stone line-through">
              ${p.compareAtPrice!.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
