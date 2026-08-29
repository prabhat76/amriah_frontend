import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { productsApi, categoriesApi, ProductSummary, CategoryResponse } from '@/lib/api'
import ProductCard from '@/components/ProductCard'

const SORT_OPTIONS = [
  { label: 'Featured', value: 'featured' },
  { label: 'Newest', value: 'newest,desc' },
  { label: 'Price: Low → High', value: 'price,asc' },
  { label: 'Price: High → Low', value: 'price,desc' },
  { label: 'Top Rated', value: 'averageRating,desc' },
]
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-gray-100 py-4">
      <button onClick={() => setOpen(v => !v)} className="flex items-center justify-between w-full text-left">
        <span className="text-xs font-semibold uppercase tracking-[0.14em]">{title}</span>
        {open ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sort, setSort] = useState('featured')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('categoryId') ?? null
  )
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(500)
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [page, setPage] = useState(0)

  const [products, setProducts] = useState<ProductSummary[]>([])
  const [totalElements, setTotalElements] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categories, setCategories] = useState<CategoryResponse[]>([])

  // Load categories once
  useEffect(() => {
    categoriesApi.list()
      .then(setCategories)
      .catch(() => {/* non-critical */})
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const sizeTag = selectedSizes.length === 1 ? selectedSizes[0] : undefined
      const res = await productsApi.search({
        q: search.trim() || undefined,
        categoryId: selectedCategory ?? undefined,
        maxPrice: maxPrice < 500 ? maxPrice : undefined,
        tag: sizeTag,
        page,
        size: 18,
        sort: sort !== 'featured' ? sort : undefined,
      })
      setProducts(res.content)
      setTotalElements(res.totalElements)
      setTotalPages(res.totalPages)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory, maxPrice, selectedSizes, page, sort])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const toggleSize = (s: string) =>
    setSelectedSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const clearFilters = () => {
    setSelectedCategory(null)
    setSelectedSizes([])
    setMaxPrice(500)
    setSearch('')
    setPage(0)
    setSearchParams({})
  }

  const activeCategory = categories.find(c => c.id === selectedCategory)

  return (
    <main className="bg-white min-h-screen">
      {/* Page header */}
      <div className="border-b border-gray-200 px-6 lg:px-10 py-5">
        <div className="max-w-content mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow mb-1">All Items {activeCategory ? `/ ${activeCategory.name}` : ''}</p>
            <h1 className="headline text-4xl">PRODUCTS</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">Sort:</span>
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(0) }}
              className="text-xs border border-gray-200 px-3 py-2 focus:outline-none focus:border-black bg-white cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-content mx-auto px-6 lg:px-10 py-8">
        <div className="grid lg:grid-cols-[220px_1fr] gap-10">

          {/* SIDEBAR FILTERS */}
          <aside className="hidden lg:block shrink-0">
            <div className="border-b border-gray-100 pb-4 mb-0">
              <input
                type="text"
                placeholder="Search products…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0) }}
                className="field text-xs py-2 text-sm"
              />
            </div>

            <FilterSection title="Category">
              <label className="flex items-center gap-2 mb-2 cursor-pointer group">
                <input type="radio" name="category" checked={selectedCategory === null}
                  onChange={() => { setSelectedCategory(null); setPage(0) }} className="accent-black" />
                <span className="text-xs text-gray-600 group-hover:text-black transition-colors">All</span>
              </label>
              {categories.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 mb-2 cursor-pointer group">
                  <input type="radio" name="category"
                    checked={selectedCategory === cat.id}
                    onChange={() => { setSelectedCategory(cat.id); setPage(0) }}
                    className="accent-black" />
                  <span className="text-xs text-gray-600 group-hover:text-black transition-colors">{cat.name}</span>
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
                        ? 'bg-black text-white border-black'
                        : 'border-gray-200 text-black hover:border-black'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Price Range">
              <input
                type="range" min={0} max={500} step={10} value={maxPrice}
                onChange={e => { setMaxPrice(Number(e.target.value)); setPage(0) }}
                className="w-full accent-black h-px cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>$ 0</span>
                <span>$ {maxPrice}{maxPrice >= 500 ? '+' : ''}</span>
              </div>
            </FilterSection>
          </aside>

          {/* PRODUCT GRID */}
          <div>
            {/* Mobile category strip */}
            <div className="lg:hidden flex gap-2 mb-5 overflow-x-auto pb-1">
              <button
                onClick={() => { setSelectedCategory(null); setPage(0) }}
                className={`shrink-0 text-xs px-3 py-1.5 border transition-colors ${
                  selectedCategory === null ? 'bg-black text-white border-black' : 'border-gray-200 text-black hover:border-black'
                }`}
              >All</button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setPage(0) }}
                  className={`shrink-0 text-xs px-3 py-1.5 border transition-colors ${
                    selectedCategory === cat.id ? 'bg-black text-white border-black' : 'border-gray-200 text-black hover:border-black'
                  }`}
                >{cat.name}</button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-gray-400">
                {loading ? 'Loading…' : `${totalElements} products`}
              </p>
              {(selectedCategory || selectedSizes.length > 0 || search || maxPrice < 500) && (
                <button onClick={clearFilters} className="text-xs text-gray-400 underline hover:text-black transition-colors">
                  Clear filters
                </button>
              )}
            </div>

            {error && (
              <div className="py-8 text-center">
                <p className="text-sm text-red-500 mb-4">{error}</p>
                <button onClick={fetchProducts} className="btn-outline btn-sm">Retry</button>
              </div>
            )}

            {loading ? (
              <div className="py-24 flex justify-center">
                <Loader2 size={28} className="animate-spin text-gray-300" />
              </div>
            ) : products.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-sm text-gray-400">No products match your filters.</p>
                <button onClick={clearFilters} className="btn-outline btn-sm mt-5">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-10">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-12">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="btn-outline btn-sm disabled:opacity-40"
                    >← Prev</button>
                    <span className="text-xs text-gray-500 self-center">
                      Page {page + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="btn-outline btn-sm disabled:opacity-40"
                    >Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
