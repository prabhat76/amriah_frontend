import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, Sparkles } from 'lucide-react'
import type { ProductSummary } from '@/lib/api'

interface Props {
  product: ProductSummary
  images?: string[]   // extra images beyond mainImageUrl for slideshow
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80'

export default function ProductCard({ product: p, images: extraImages }: Props) {
  const allImages = [
    p.mainImageUrl ?? PLACEHOLDER,
    ...(extraImages ?? []).filter(u => u && u !== p.mainImageUrl),
  ]

  const [idx, setIdx] = useState(0)
  const [hovered, setHovered] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (hovered && allImages.length > 1) {
      timerRef.current = setInterval(() => {
        setIdx(i => (i + 1) % allImages.length)
      }, 1200)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      setIdx(0)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [hovered, allImages.length])

  const hasDiscount = p.compareAtPrice != null && p.compareAtPrice > p.price
  const discountPct = hasDiscount ? Math.round((1 - p.price / p.compareAtPrice!) * 100) : 0

  return (
    <Link
      to={`/product/${p.id}`}
      className="card-product block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-cream">
        {allImages.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={p.name}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${
              i === idx ? 'opacity-100' : 'opacity-0'
            } ${hovered ? 'scale-105' : 'scale-100'} transition-transform duration-700`}
            loading="lazy"
            onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER }}
          />
        ))}

        {/* Dot indicators */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {allImages.map((_, i) => (
              <span
                key={i}
                className={`block rounded-full transition-all duration-300 ${
                  i === idx ? 'w-3 h-1.5 bg-pearl' : 'w-1.5 h-1.5 bg-pearl/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Badges top-left */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {p.newArrival && <span className="badge-navy">New</span>}
          {p.featured && <span className="badge-gold">Featured</span>}
          {hasDiscount && <span className="badge-custom">−{discountPct}%</span>}
        </div>

        {/* Product type badge top-right */}
        <div className="absolute top-3 right-3 z-10">
          <span className="badge-cream flex items-center gap-1">
            <Sparkles size={8} />
            Customisable
          </span>
        </div>

        {/* Hover wishlist */}
        <button
          onClick={e => { e.preventDefault() }}
          className="absolute bottom-3 right-3 w-8 h-8 bg-pearl/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-pearl z-10"
          aria-label="Save to wishlist"
        >
          <Heart size={14} className="text-navy" />
        </button>

        <div className="absolute inset-x-0 bottom-0 h-20 overlay-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className="pt-3 pb-1">
        {p.brandName && <p className="eyebrow text-[9px] mb-1">{p.brandName}</p>}
        <h3 className="font-body text-sm font-medium text-navy leading-snug line-clamp-2 group-hover:text-gold transition-colors duration-200">
          {p.name}
        </h3>

        {p.reviewCount > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={9} className="fill-gold text-gold" />
            <span className="text-[10px] text-stone">{p.averageRating.toFixed(1)} ({p.reviewCount})</span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm font-medium text-navy">₹{p.price.toLocaleString('en-IN')}</span>
          {hasDiscount && (
            <span className="text-xs text-stone line-through">₹{p.compareAtPrice!.toLocaleString('en-IN')}</span>
          )}
        </div>

        <div className="mt-3 w-full flex items-center justify-center py-2.5 text-xs font-medium tracking-widest uppercase border border-mist text-navy group-hover:bg-navy group-hover:text-pearl group-hover:border-navy transition-all duration-200">
          Select Options
        </div>
      </div>
    </Link>
  )
}
