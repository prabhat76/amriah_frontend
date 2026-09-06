import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Minus, Plus, Star, Loader2, Heart, Sparkles } from 'lucide-react'
import { productsApi, reviewsApi, aiApi, ProductDetail, ReviewResponse, ProductSummary } from '@/lib/api'
import { useCart } from '@/context/CartContext'
import ProductCard from '@/components/ProductCard'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { addItem, toggleCart } = useCart()

  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [reviews, setReviews] = useState<ReviewResponse[]>([])
  const [related, setRelated] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeImg, setActiveImg] = useState(0)
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [qty, setQty] = useState(1)
  const [sizeError, setSizeError] = useState(false)
  const [addedMsg, setAddedMsg] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'shipping'>('description')

  useEffect(() => {
    if (!id) return
    setLoading(true); setError(null); setActiveImg(0)

    const fetcher = id.match(/^[0-9a-f-]{36}$/)
      ? productsApi.getById(id)
      : productsApi.getBySlug(id).catch(() => productsApi.getById(id))

    fetcher
      .then(async detail => {
        setProduct(detail)
        setSelectedColor(detail.availableColors[0] ?? '')
        const first = detail.variants.find(v => v.active)
        if (first) setSelectedVariantId(first.id)
        productsApi.recordView(detail.product.id).catch(() => {})
        const [revRes, relRes] = await Promise.allSettled([
          reviewsApi.listForProduct(detail.product.id, 0, 5),
          aiApi.similar(detail.product.id, 4),
        ])
        if (revRes.status === 'fulfilled') setReviews(revRes.value.content)
        if (relRes.status === 'fulfilled') setRelated(relRes.value)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Product not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size); setSizeError(false)
    const v = product?.variants.find(
      v => v.active && v.size === size && (!selectedColor || v.color === selectedColor || !v.color)
    )
    setSelectedVariantId(v?.id ?? null)
  }

  const handleAdd = () => {
    if (!selectedSize && (product?.availableSizes.length ?? 0) > 0) { setSizeError(true); return }
    if (!product) return
    addItem(
      { id: product.product.id, name: product.product.name, mainImageUrl: product.product.mainImageUrl, price: product.product.price },
      selectedVariantId ?? product.variants[0]?.id ?? '',
      selectedColor,
      selectedSize,
      qty,
    )
    toggleCart()
    setAddedMsg(true)
    setTimeout(() => setAddedMsg(false), 2500)
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center bg-pearl">
      <Loader2 size={28} className="animate-spin text-gold/40" />
    </div>
  )

  if (error || !product) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 bg-pearl text-center px-6">
      <p className="text-sm text-stone">{error ?? 'Product not found.'}</p>
      <Link to="/shop" className="btn-outline-gold btn-sm">Back to Collections</Link>
    </div>
  )

  const p = product.product
  const images = [p.mainImageUrl, ...product.imageUrls.filter(u => u !== p.mainImageUrl)].filter(Boolean) as string[]
  if (images.length === 0) images.push(PLACEHOLDER)
  const effectivePrice = product.variants.find(v => v.id === selectedVariantId)?.effectivePrice ?? p.price
  const hasDiscount = p.compareAtPrice != null && p.compareAtPrice > effectivePrice

  // Unique colours from active variants
  const variantColors = product.variants
    .filter(v => v.active && v.color)
    .reduce<{ color: string; hex: string | null }[]>((acc, v) => {
      if (!acc.find(c => c.color === v.color)) acc.push({ color: v.color!, hex: v.colorHex ?? null })
      return acc
    }, [])

  return (
    <main className="bg-pearl">
      {/* Breadcrumb */}
      <div className="container-astrimi py-4 flex items-center gap-1.5 flex-wrap">
        <Link to="/" className="caption hover:text-gold transition-colors">Home</Link>
        <ChevronRight size={10} className="text-stone" />
        <Link to="/shop" className="caption hover:text-gold transition-colors">Collections</Link>
        {p.categoryName && <>
          <ChevronRight size={10} className="text-stone" />
          <Link to={`/shop?categoryId=${p.categoryId}`} className="caption hover:text-gold transition-colors">{p.categoryName}</Link>
        </>}
        <ChevronRight size={10} className="text-stone" />
        <span className="caption text-navy truncate max-w-[160px]">{p.name}</span>
      </div>

      <div className="container-astrimi pb-20">
        <div className="grid lg:grid-cols-[1fr_460px] gap-12 xl:gap-20">

          {/* IMAGE GALLERY */}
          <div className="flex gap-4">
            <div className="hidden sm:flex flex-col gap-2 w-[76px] shrink-0">
              {images.slice(0, 5).map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden bg-cream border-2 transition-colors ${activeImg === i ? 'border-gold' : 'border-transparent hover:border-mist'}`}>
                  <img src={src} alt="" className="w-full h-full object-cover object-top"
                    onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER }} />
                </button>
              ))}
            </div>
            <div className="flex-1 relative bg-cream aspect-[4/5] overflow-hidden group">
              <img src={images[activeImg]} alt={p.name}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER }} />
              {images.length > 1 && <>
                <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-pearl/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-pearl/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={16} />
                </button>
              </>}
              <div className="absolute top-4 right-4">
                <span className="badge-cream flex items-center gap-1"><Sparkles size={8} /> Customisable</span>
              </div>
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="flex flex-col gap-6 lg:pt-2">
            <div>
              {p.brandName && <p className="eyebrow mb-1">{p.brandName}</p>}
              <h1 className="font-display text-3xl sm:text-4xl text-navy leading-tight mb-3">{p.name}</h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-baseline gap-2">
                  {hasDiscount ? <>
                    <span className="font-display text-2xl text-gold">${effectivePrice.toFixed(2)}</span>
                    <span className="text-sm text-stone line-through">${p.compareAtPrice!.toFixed(2)}</span>
                  </> : (
                    <span className="font-display text-2xl text-navy">${effectivePrice.toFixed(2)}</span>
                  )}
                </div>
                {p.reviewCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10} className={i < Math.round(p.averageRating) ? 'fill-gold text-gold' : 'fill-mist text-mist'} />
                    ))}
                    <span className="caption">({p.reviewCount})</span>
                  </div>
                )}
              </div>
            </div>

            {p.shortDescription && (
              <p className="text-sm text-stone leading-relaxed border-t border-mist pt-5">{p.shortDescription}</p>
            )}

            <div className="divider" />

            {/* Colour */}
            {variantColors.length > 0 && (
              <div>
                <p className="eyebrow mb-3">
                  Colour: <span className="font-normal normal-case tracking-normal text-navy text-xs">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {variantColors.map(({ color, hex }) => (
                    <button key={color} onClick={() => setSelectedColor(color)} title={color}
                      className={`w-9 h-9 border-2 transition-all ${selectedColor === color ? 'border-gold' : 'border-transparent hover:border-mist'}`}
                      style={{ backgroundColor: hex ?? color }} />
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {product.availableSizes.length > 0 && (
              <div>
                <p className={`eyebrow mb-3 ${sizeError ? 'text-red-400' : ''}`}>
                  Size {sizeError && <span className="font-normal normal-case tracking-normal">— please select a size</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes.map(s => (
                    <button key={s} onClick={() => handleSizeSelect(s!)}
                      className={`min-w-[44px] h-11 px-3 text-xs font-medium border transition-colors ${
                        selectedSize === s ? 'bg-navy text-pearl border-navy' : `border-mist text-navy hover:border-gold ${sizeError ? 'border-red-200' : ''}`
                      }`}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Add + Wishlist */}
            <div className="flex gap-3">
              <div className="flex items-center border border-mist">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-12 flex items-center justify-center hover:bg-cream transition-colors"><Minus size={12} /></button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-11 h-12 flex items-center justify-center hover:bg-cream transition-colors"><Plus size={12} /></button>
              </div>
              <button onClick={handleAdd}
                className={`flex-1 btn ${addedMsg ? 'bg-gold text-navy' : 'bg-navy text-pearl hover:bg-ink'} gap-2`}>
                {addedMsg ? '✦ Added to Bag' : 'Add to Bag'}
              </button>
              <button className="w-12 h-12 border border-mist flex items-center justify-center hover:border-gold hover:text-gold transition-colors">
                <Heart size={16} />
              </button>
            </div>

            {/* Custom CTA */}
            <div className="bg-cream border border-mist p-5">
              <p className="text-xs text-stone mb-2 flex items-center gap-1.5">
                <Sparkles size={11} className="text-gold" />
                Want this in a different colour, fabric, or size?
              </p>
              <Link to="/custom" className="text-xs text-gold font-medium hover:underline underline-offset-2">
                Create your custom version →
              </Link>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map(tag => (
                  <Link key={tag} to={`/shop?tag=${tag}`} className="badge-cream hover:border-gold hover:text-gold transition-colors">{tag}</Link>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="border-t border-mist">
              <div className="flex gap-6">
                {(['description', 'reviews', 'shipping'] as const).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`py-4 text-xs font-medium uppercase tracking-widest border-t-2 -mt-px transition-colors ${
                      activeTab === tab ? 'border-gold text-navy' : 'border-transparent text-stone hover:text-navy'
                    }`}>
                    {tab === 'reviews' ? `Reviews (${p.reviewCount})` : tab}
                  </button>
                ))}
              </div>
              <div className="py-5 text-sm text-stone leading-relaxed">
                {activeTab === 'description' && (
                  <p>{product.aiGeneratedDescription ?? product.description ?? p.shortDescription ?? 'No description available.'}</p>
                )}
                {activeTab === 'reviews' && (reviews.length === 0 ? (
                  <p className="text-stone">No reviews yet — be the first to share your experience.</p>
                ) : (
                  <div className="space-y-5">
                    {reviews.map(r => (
                      <div key={r.id} className="border-b border-mist pb-5 last:border-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} size={10} className={i < r.rating ? 'fill-gold text-gold' : 'fill-mist text-mist'} />
                            ))}
                          </div>
                          <span className="caption">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        {r.title && <p className="text-xs font-medium text-navy mb-1">{r.title}</p>}
                        {r.comment && <p className="text-xs text-stone leading-relaxed">{r.comment}</p>}
                        <p className="caption mt-2">— {r.userName}{r.verifiedPurchase && ' ✓ Verified'}</p>
                      </div>
                    ))}
                  </div>
                ))}
                {activeTab === 'shipping' && (
                  <ul className="space-y-2 text-xs">
                    <li>✦ &nbsp;Standard delivery: 5–10 business days worldwide</li>
                    <li>✦ &nbsp;Express delivery: 2–4 business days</li>
                    <li>✦ &nbsp;Custom / bespoke orders: 4–8 weeks from confirmation</li>
                    <li>✦ &nbsp;Free returns within 14 days on ready-to-buy pieces</li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-24 border-t border-mist pt-16">
            <div className="flex items-end justify-between mb-10">
              <h2 className="display-md text-navy">
                You May Also<br /><em className="italic font-light text-gold">Love</em>
              </h2>
              <Link to="/shop" className="caption hover:text-gold transition-colors">View All →</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
