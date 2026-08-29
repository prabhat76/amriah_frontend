import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight, ChevronLeft, Minus, Plus, Star, Loader2, Heart } from 'lucide-react'
import { productsApi, reviewsApi, aiApi, ProductDetail, ReviewResponse, ProductSummary } from '@/lib/api'
import { useCart } from '@/context/CartContext'
import ProductCard from '@/components/ProductCard'

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

  // Load product
  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    setActiveImg(0)

    // Try slug first, fall back to ID
    const fetcher = id.includes('-') && !id.match(/^[0-9a-f-]{36}$/)
      ? productsApi.getBySlug(id)
      : productsApi.getById(id).catch(() => productsApi.getBySlug(id))

    fetcher
      .then(async detail => {
        setProduct(detail)
        setSelectedColor(detail.availableColors[0] ?? '')
        // Set default variant
        const first = detail.variants.find(v => v.active)
        if (first) setSelectedVariantId(first.id)

        // Record view (fire-and-forget)
        productsApi.recordView(detail.product.id).catch(() => {})

        // Load reviews and related in parallel
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

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    setSelectedSize('')
    setSelectedVariantId(null)
  }

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    setSizeError(false)
    // Find matching variant
    const v = product?.variants.find(
      v => v.active && v.size === size && (!selectedColor || v.color === selectedColor || !v.color)
    )
    setSelectedVariantId(v?.id ?? null)
  }

  const handleAdd = () => {
    if (!selectedSize) { setSizeError(true); return }
    if (!product || !selectedVariantId) return
    setSizeError(false)
    addItem(product.product, selectedVariantId, selectedColor, selectedSize, qty)
    toggleCart()
    setAddedMsg(true)
    setTimeout(() => setAddedMsg(false), 2000)
  }

  // Available sizes filtered by selected colour
  const availableSizes = product
    ? (selectedColor
      ? [...new Set(product.variants.filter(v => v.active && (v.color === selectedColor || !v.color)).map(v => v.size).filter(Boolean))]
      : product.availableSizes)
    : []

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-300" />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-400">{error ?? 'Product not found.'}</p>
        <Link to="/shop" className="btn-outline btn-sm">Back to Shop</Link>
      </div>
    )
  }

  const p = product.product
  const images = [p.mainImageUrl, ...product.imageUrls.filter(u => u !== p.mainImageUrl)].filter(Boolean) as string[]
  if (images.length === 0) images.push('https://placehold.co/600x750?text=No+Image')

  const effectivePrice = product.variants.find(v => v.id === selectedVariantId)?.effectivePrice ?? p.price

  return (
    <main className="bg-white">
      {/* Breadcrumb */}
      <div className="max-w-content mx-auto px-6 lg:px-10 py-4 flex items-center gap-1.5 text-xs text-gray-400">
        <Link to="/" className="hover:text-black transition-colors">Home</Link>
        <ChevronRight size={11} />
        <Link to="/shop" className="hover:text-black transition-colors">Products</Link>
        {p.categoryName && (
          <>
            <ChevronRight size={11} />
            <Link to={`/shop?categoryId=${p.categoryId}`} className="hover:text-black transition-colors">
              {p.categoryName}
            </Link>
          </>
        )}
        <ChevronRight size={11} />
        <span className="text-black truncate max-w-[120px]">{p.name}</span>
      </div>

      <div className="max-w-content mx-auto px-6 lg:px-10 pb-16">
        <div className="grid lg:grid-cols-[1fr_440px] gap-10 xl:gap-16">

          {/* IMAGE GALLERY */}
          <div className="flex gap-3">
            <div className="hidden sm:flex flex-col gap-2 w-[72px] shrink-0">
              {images.slice(0, 4).map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden bg-gray-50 border-2 transition-colors ${
                    activeImg === i ? 'border-black' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="flex-1 relative bg-gray-50 aspect-[4/5] overflow-hidden group">
              <img
                src={images[activeImg]}
                alt={p.name}
                className="w-full h-full object-cover object-top"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveImg(i => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* PRODUCT DETAIL */}
          <div className="flex flex-col gap-5 lg:pt-4">
            <div>
              <p className="eyebrow mb-1">{p.categoryName}</p>
              <h1 className="text-2xl font-bold text-black leading-tight tracking-tight">
                {p.name.toUpperCase()}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-xl font-semibold">
                  {p.compareAtPrice && p.compareAtPrice > effectivePrice ? (
                    <>
                      <span className="text-red-600">$ {effectivePrice.toFixed(2)}</span>
                      <span className="text-gray-400 line-through text-base ml-2">$ {p.compareAtPrice.toFixed(2)}</span>
                    </>
                  ) : (
                    `$ ${effectivePrice.toFixed(2)}`
                  )}
                </p>
                {p.reviewCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span>{p.averageRating.toFixed(1)}</span>
                    <span>({p.reviewCount})</span>
                  </div>
                )}
              </div>
              {(p.featured || p.newArrival) && (
                <div className="flex gap-2 mt-2">
                  {p.newArrival && <span className="text-[10px] bg-black text-white px-2 py-0.5 font-bold tracking-widest">NEW</span>}
                  {p.featured && <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 font-bold tracking-widest">FEATURED</span>}
                </div>
              )}
            </div>

            {p.shortDescription && (
              <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                {p.shortDescription}
              </p>
            )}

            <div className="rule" />

            {/* Colour swatches */}
            {product.availableColors.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3">
                  Color: <span className="font-normal normal-case tracking-normal text-gray-600">{selectedColor}</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.variants
                    .filter(v => v.active && v.color)
                    .reduce<string[]>((acc, v) => acc.includes(v.color!) ? acc : [...acc, v.color!], [])
                    .map(color => {
                      const hex = product.variants.find(v => v.color === color)?.colorHex
                      return (
                        <button
                          key={color}
                          onClick={() => handleColorSelect(color)}
                          title={color}
                          className={`w-8 h-8 border-2 transition-all ${
                            selectedColor === color ? 'border-black' : 'border-transparent hover:border-gray-400'
                          }`}
                          style={{ backgroundColor: hex ?? color }}
                        />
                      )
                    })}
                </div>
              </div>
            )}

            {/* Sizes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${sizeError ? 'text-red-500' : ''}`}>
                  Size {sizeError && <span className="font-normal normal-case tracking-normal">— select a size</span>}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(availableSizes.length > 0 ? availableSizes : product.availableSizes).map(s => (
                  <button
                    key={s}
                    onClick={() => handleSizeSelect(s!)}
                    className={`min-w-[40px] h-10 px-3 text-xs font-semibold border transition-colors ${
                      selectedSize === s
                        ? 'bg-black text-white border-black'
                        : `border-gray-200 hover:border-black ${sizeError ? 'border-red-200' : ''}`
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + Add */}
            <div className="flex gap-3 items-stretch">
              <div className="flex items-center border border-gray-200">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Minus size={13} />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <Plus size={13} />
                </button>
              </div>
              <button onClick={handleAdd} className="btn-black flex-1 justify-center">
                {addedMsg ? '✓ Added!' : 'Add to Bag'}
              </button>
              <button className="w-11 h-11 border border-gray-200 flex items-center justify-center hover:border-black transition-colors">
                <Heart size={16} />
              </button>
            </div>

            <div className="rule" />

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map(tag => (
                  <Link
                    key={tag}
                    to={`/shop?tag=${tag}`}
                    className="text-[10px] border border-gray-200 px-2 py-1 text-gray-500 hover:border-black hover:text-black transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div>
              <div className="flex border-b border-gray-100 gap-6">
                {(['description', 'reviews', 'shipping'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors border-b-2 -mb-px ${
                      activeTab === tab ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'
                    }`}
                  >
                    {tab === 'reviews' ? `Reviews (${p.reviewCount})` : tab}
                  </button>
                ))}
              </div>
              <div className="pt-4 text-sm text-gray-600 leading-relaxed">
                {activeTab === 'description' && (
                  <p>{product.aiGeneratedDescription ?? product.description ?? p.shortDescription ?? 'No description available.'}</p>
                )}
                {activeTab === 'reviews' && (
                  reviews.length === 0 ? (
                    <p className="text-gray-400">No reviews yet. Be the first!</p>
                  ) : (
                    <div className="space-y-5">
                      {reviews.map(r => (
                        <div key={r.id} className="border-b border-gray-100 pb-5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} size={11} className={i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'} />
                                ))}
                              </div>
                              <p className="text-xs font-semibold">{r.title}</p>
                            </div>
                            <p className="text-[10px] text-gray-400 shrink-0">
                              {r.userName} · {new Date(r.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {r.comment && <p className="text-xs text-gray-600 mt-2 leading-relaxed">{r.comment}</p>}
                          {r.verifiedPurchase && <p className="text-[10px] text-green-600 mt-1">✓ Verified Purchase</p>}
                        </div>
                      ))}
                    </div>
                  )
                )}
                {activeTab === 'shipping' && (
                  <p>Standard 5–7 days · Express 2–3 days · Free returns within 30 days</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <div className="flex items-end justify-between mb-8">
              <h2 className="headline text-3xl">YOU MAY ALSO LIKE</h2>
              <Link to="/shop" className="text-xs uppercase tracking-widest font-semibold hover:opacity-60 transition-opacity">See All</Link>
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
