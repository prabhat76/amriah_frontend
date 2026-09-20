import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, Loader2, SlidersHorizontal, X } from 'lucide-react'
import { productsApi, categoriesApi, ProductSummary, CategoryResponse } from '@/lib/api'
import { products as localProducts, categories as localCategories } from '@/data/products'
import ProductCard from '@/components/ProductCard'

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest,desc' },
  { label: 'Price: Low → High', value: 'price,asc' },
  { label: 'Price: High → Low', value: 'price,desc' },
  { label: 'Top Rated', value: 'averageRating,desc' },
]
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '8', '10', '12', '14', '16']

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-mist py-4">
      <button onClick={() => setOpen(v => !v)} className="flex items-center justify-between w-full text-left">
        <span className="eyebrow">{title}</span>
        {open ? <ChevronUp size={12} className="text-stone" /> : <ChevronDown size={12} className="text-stone" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sort, setSort] = useState('featured')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get('categoryId') ?? null)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(1000)
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [page, setPage] = useState(0)
  const [mobileFilters, setMobileFilters] = useState(false)

  const [products, setProducts] = useState<ProductSummary[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<CategoryResponse[]>([])

  useEffect(() => {
    categoriesApi.list()
      .then(setCategories)
      .catch(() => {
        // Fall back to local categories if backend is unavailable
        setCategories(localCategories.map((c, i) => ({
          id: String(c.id),
          name: c.name,
          slug: c.name.toLowerCase().replace(/\s+/g, '-'),
          description: null,
          imageUrl: c.image,
          parentId: null,
          displayOrder: i,
          active: true,
        })))
      })
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await productsApi.search({
        q: search.trim() || undefined,
        categoryId: selectedCategory ?? undefined,
        maxPrice: maxPrice < 1000 ? maxPrice : undefined,
        page,
        size: 12,
        sort: sort !== 'featured' ? sort : undefined,
      })
      setProducts(res.content)
      setTotalElements(res.totalElements)
      setTotalPages(res.totalPages)
    } catch {
      // Backend unavailable — filter local products instead
      let filtered = localProducts.map(p => ({
        id: String(p.id),
        name: p.name,
        slug: p.name.toLowerCase().replace(/\s+/g, '-'),
        sku: `ASTRIMI-${p.id}`,
        shortDescription: p.description,
        mainImageUrl: p.image,
        price: p.price,
        compareAtPrice: p.originalPrice ?? null,
        averageRating: p.rating,
        reviewCount: p.reviewCount,
        featured: true,
        newArrival: p.badge === 'new',
        categoryId: String(p.id),
        categoryName: p.category,
        brandId: null,
        brandName: 'ASTRIMI',
        minVariantPrice: p.price,
      } as ProductSummary))
      if (search) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      }
      if (maxPrice < 1000) {
        filtered = filtered.filter(p => p.price <= maxPrice)
      }
      setProducts(filtered)
      setTotalElements(filtered.length)
      setTotalPages(1)
      setError(null) // Don't show error — we have data
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory, maxPrice, selectedSizes, page, sort])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const toggleSize = (s: string) =>
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const clearFilters = () => {
    setSelectedCategory(null); setSelectedSizes([])
    setMaxPrice(1000); setSearch(''); setPage(0)
    setSearchParams({})
  }

  const hasFilters = selectedCategory || selectedSizes.length > 0 || search || maxPrice < 1000

  const FilterContent = () => (
    <>
      <div className="border-b border-mist pb-4 mb-0">
        <input
          type="text"
          placeholder="Search pieces…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          className="field text-xs py-2"
        />
      </div>

      <FilterSection title="Category">
        <label className="flex items-center gap-2 mb-2 cursor-pointer">
          <input type="radio" name="cat" checked={selectedCategory === null}
            onChange={() => { setSelectedCategory(null); setPage(0) }} className="accent-gold" />
          <span className="text-xs text-stone">All Collections</span>
        </label>
        {categories.map(c => (
          <label key={c.id} className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="radio" name="cat" checked={selectedCategory === c.id}
              onChange={() => { setSelectedCategory(c.id); setPage(0) }} className="accent-gold" />
            <span className="text-xs text-stone">{c.name}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="Size">
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => { toggleSize(s); setPage(0) }}
              className={`w-9 h-9 text-xs font-medium border transition-colors ${
                selectedSizes.includes(s)
                  ? 'bg-gold text-navy border-gold'
                  : 'border-mist text-stone hover:border-gold hover:text-navy'
              }`}
            >{s}</button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price Range">
        <input
          type="range" min={0} max={1000} step={25} value={maxPrice}
          onChange={e => { setMaxPrice(Number(e.target.value)); setPage(0) }}
          className="w-full cursor-pointer accent-gold h-px"
        />
        <div className="flex justify-between mt-2 text-[10px] text-stone">
          <span>$0</span>
          <span className="text-gold font-medium">${maxPrice}{maxPrice >= 1000 ? '+' : ''}</span>
        </div>
      </FilterSection>
    </>
  )

  return (
    <main className="bg-pearl min-h-screen">

      {/* Header */}
      <div className="border-b border-mist bg-pearl">
        <div className="container-astrimi py-8">
          <p className="eyebrow mb-2">
            {categories.find(c => c.id === selectedCategory)?.name ?? 'All Collections'}
          </p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1 className="font-display text-4xl sm:text-5xl text-navy">COLLECTIONS</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 btn-ghost border border-mist px-3 py-2"
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(0) }}
                className="text-xs border border-mist px-3 py-2 bg-pearl text-navy focus:outline-none focus:border-gold cursor-pointer"
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container-astrimi py-10">
        <div className="grid lg:grid-cols-[240px_1fr] gap-12">

          {/* Desktop filters */}
          <aside className="hidden lg:block">
            <FilterContent />
          </aside>

          {/* Grid */}
          <div>
            {/* Active filter tags */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {search && (
                  <span className="flex items-center gap-1 text-[10px] bg-gold/10 text-gold border border-gold/20 px-2.5 py-1">
                    "{search}" <button onClick={() => setSearch('')}><X size={10} /></button>
                  </span>
                )}
                {selectedCategory && (
                  <span className="flex items-center gap-1 text-[10px] bg-gold/10 text-gold border border-gold/20 px-2.5 py-1">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    <button onClick={() => setSelectedCategory(null)}><X size={10} /></button>
                  </span>
                )}
                <button onClick={clearFilters} className="text-[10px] text-stone underline hover:text-navy ml-1">
                  Clear all
                </button>
              </div>
            )}

            <p className="caption mb-8">
              {loading ? 'Loading…' : `${totalElements} pieces`}
            </p>

            {error && (
              <div className="py-10 text-center">
                <p className="text-sm text-red-400 mb-4">{error}</p>
                <button onClick={fetchProducts} className="btn-outline-gold btn-sm">Retry</button>
              </div>
            )}

            {loading ? (
              <div className="py-20 flex justify-center">
                <Loader2 size={24} className="animate-spin text-gold/40" />
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center">
                <p className="font-display text-2xl text-navy mb-3">No pieces found</p>
                <p className="text-sm text-stone mb-6">Try adjusting your filters</p>
                <button onClick={clearFilters} className="btn-outline-gold btn-sm">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 gap-y-10">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
                {totalPages > 1 && (
                  <div className="flex justify-center gap-3 mt-14">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                      className="btn-ghost border border-mist btn-sm disabled:opacity-30">← Prev</button>
                    <span className="text-xs text-stone self-center">Page {page + 1} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                      className="btn-ghost border border-mist btn-sm disabled:opacity-30">Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFilters && (
        <>
          <div className="fixed inset-0 bg-navy/50 z-50" onClick={() => setMobileFilters(false)} />
          <div className="fixed bottom-0 left-0 right-0 bg-pearl z-50 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl">Filters</h3>
              <button onClick={() => setMobileFilters(false)}><X size={20} /></button>
            </div>
            <FilterContent />
            <button onClick={() => setMobileFilters(false)} className="btn-gold w-full mt-6">
              Apply Filters
            </button>
          </div>
        </>
      )}
    </main>
  )
}
