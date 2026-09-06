import { useState, useEffect, useRef } from 'react'
import { Navigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, Image, ShoppingBag, Package, TrendingUp,
  Users, AlertTriangle, Plus, Pencil, Trash2, Upload, X,
  ChevronDown, Loader2, Eye, EyeOff, RefreshCw
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  adminApi, adminOrdersApi, adminProductsApi, bannerApi, productsApi,
  DashboardSummary, BannerResponse, OrderResponse, ProductSummary,
  ApiError
} from '@/lib/api'

// ─── Shared ───────────────────────────────────────────────────────────────────

type AdminTab = 'overview' | 'banners' | 'orders' | 'products'

function StatCard({ label, value, icon: Icon, sub }: { label: string; value: string | number; icon: React.ElementType; sub?: string }) {
  return (
    <div className="bg-white border border-stone/20 p-5 rounded-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-stone/60 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-semibold text-navy">{value}</p>
          {sub && <p className="text-xs text-stone/50 mt-1">{sub}</p>}
        </div>
        <div className="w-9 h-9 bg-gold/10 rounded-sm flex items-center justify-center text-gold">
          <Icon size={18} />
        </div>
      </div>
    </div>
  )
}

function AdminError({ msg }: { msg: string }) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-sm">
      {msg}
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    setError(null)
    adminApi.summary()
      .then(setSummary)
      .catch(e => setError(e instanceof ApiError ? e.message : 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="py-20 flex justify-center"><Loader2 size={28} className="animate-spin text-gold" /></div>
  if (error) return <AdminError msg={error} />
  if (!summary) return null

  const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(1)}k` : `₹${n}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy">Dashboard Overview</h2>
        <button onClick={load} className="flex items-center gap-1.5 text-xs text-stone/60 hover:text-navy transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Revenue" value={fmt(summary.totalRevenue)} icon={TrendingUp} sub="All time" />
        <StatCard label="Today's Revenue" value={fmt(summary.revenueToday)} icon={TrendingUp} sub="Since midnight" />
        <StatCard label="Total Orders" value={summary.ordersTotal} icon={ShoppingBag} sub={`${summary.ordersPending} pending`} />
        <StatCard label="Customers" value={summary.totalCustomers} icon={Users} sub={`+${summary.newCustomersToday} today`} />
        <StatCard label="Low Stock" value={summary.lowStockProducts} icon={AlertTriangle} sub={`of ${summary.totalProducts} products`} />
      </div>
      <div className="bg-white border border-stone/20 p-5 rounded-sm">
        <p className="text-xs uppercase tracking-widest text-stone/60 mb-1">Avg. Order Value (30d)</p>
        <p className="text-3xl font-semibold text-navy">{fmt(summary.averageOrderValue)}</p>
      </div>
    </div>
  )
}

// ─── Banners Tab ──────────────────────────────────────────────────────────────

function BannerForm({
  initial, onSave, onCancel,
}: {
  initial?: BannerResponse | null
  onSave: () => void
  onCancel: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState(initial?.imageUrl ?? '')
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    subtitle: initial?.subtitle ?? '',
    ctaText: initial?.ctaText ?? '',
    ctaLink: initial?.ctaLink ?? '',
    imageUrl: initial?.imageUrl ?? '',
    displayOrder: initial?.displayOrder ?? 0,
    active: initial?.active ?? true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (initial) {
        // Update existing
        if (file) {
          // Upload new image first, get URL, then update
          const uploaded = await bannerApi.uploadAndCreate(file, { ...form, active: form.active })
          // If editing, delete the old uploaded one right away (just use the new URL)
          // Actually: update existing with new upload's imageUrl
          await bannerApi.update(initial.id, { ...form, imageUrl: uploaded.imageUrl })
          await bannerApi.delete(uploaded.id) // remove the inadvertently created duplicate
        } else {
          await bannerApi.update(initial.id, form)
        }
      } else {
        // Create
        if (file) {
          await bannerApi.uploadAndCreate(file, form)
        } else if (form.imageUrl) {
          await bannerApi.create(form)
        } else {
          setError('Please provide an image file or image URL')
          setSubmitting(false)
          return
        }
      }
      onSave()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally {
      setSubmitting(false)
    }
  }

  const field = 'w-full border border-stone/30 px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white'

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-stone/20 rounded-sm p-5 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-navy">{initial ? 'Edit Banner' : 'New Banner'}</h3>
        <button type="button" onClick={onCancel} className="text-stone/60 hover:text-navy"><X size={16} /></button>
      </div>

      {error && <AdminError msg={error} />}

      {/* Image */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-stone/60 mb-2">Image</label>
        {preview && (
          <img src={preview} alt="Preview" className="w-full h-36 object-cover object-center mb-2 bg-stone/10" />
        )}
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs border border-stone/30 px-3 py-2 hover:border-navy transition-colors">
            <Upload size={13} /> Upload File
          </button>
          <span className="text-xs text-stone/50 self-center">or</span>
          <input
            type="url" placeholder="https://..." value={form.imageUrl} onChange={set('imageUrl')}
            className={`${field} flex-1`}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone/60 mb-1">Title</label>
          <input type="text" value={form.title} onChange={set('title')} className={field} placeholder="Inspired by Jaipur…" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone/60 mb-1">Subtitle</label>
          <input type="text" value={form.subtitle} onChange={set('subtitle')} className={field} placeholder="Sub-headline" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone/60 mb-1">CTA Text</label>
          <input type="text" value={form.ctaText} onChange={set('ctaText')} className={field} placeholder="Explore Collection" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone/60 mb-1">CTA Link</label>
          <input type="text" value={form.ctaLink} onChange={set('ctaLink')} className={field} placeholder="/shop" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone/60 mb-1">Display Order</label>
          <input type="number" min={0} value={form.displayOrder}
            onChange={e => setForm(p => ({ ...p, displayOrder: parseInt(e.target.value) || 0 }))}
            className={field} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active}
              onChange={e => setForm(p => ({ ...p, active: e.target.checked }))}
              className="accent-navy w-4 h-4" />
            <span className="text-sm text-navy font-medium">Active (visible on storefront)</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm border border-stone/30 hover:border-navy transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-navy text-white hover:bg-navy/90 transition-colors disabled:opacity-50">
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {initial ? 'Save Changes' : 'Create Banner'}
        </button>
      </div>
    </form>
  )
}

function BannersTab() {
  const [banners, setBanners] = useState<BannerResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<BannerResponse | null | 'new'>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    bannerApi.listAll()
      .then(setBanners)
      .catch(e => setError(e instanceof ApiError ? e.message : 'Failed to load banners'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    setDeleting(id)
    try {
      await bannerApi.delete(id)
      setBanners(b => b.filter(x => x.id !== id))
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (banner: BannerResponse) => {
    try {
      const updated = await bannerApi.update(banner.id, { active: !banner.active })
      setBanners(b => b.map(x => x.id === banner.id ? updated : x))
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Update failed')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy">Banners</h2>
        <button onClick={() => setEditing('new')}
          className="flex items-center gap-1.5 text-sm bg-navy text-white px-3 py-2 hover:bg-navy/90 transition-colors">
          <Plus size={14} /> Add Banner
        </button>
      </div>

      {error && <AdminError msg={error} />}

      {editing === 'new' && (
        <BannerForm onSave={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} />
      )}
      {editing && editing !== 'new' && (
        <BannerForm initial={editing} onSave={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} />
      )}

      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-gold" /></div>
      ) : banners.length === 0 ? (
        <div className="py-16 text-center">
          <Image size={40} className="mx-auto text-stone/30 mb-4" />
          <p className="text-sm text-stone/60 mb-4">No banners yet.</p>
          <button onClick={() => setEditing('new')} className="text-sm text-navy underline">Add your first banner</button>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map(b => (
            <div key={b.id} className={`flex items-center gap-4 p-4 bg-white border rounded-sm transition-opacity ${b.active ? 'border-stone/20' : 'border-stone/10 opacity-60'}`}>
              <img src={b.imageUrl} alt={b.title ?? ''} className="w-20 h-14 object-cover bg-stone/10 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy truncate">{b.title || '(No title)'}</p>
                <p className="text-xs text-stone/60 truncate">{b.subtitle ?? ''}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-[10px] text-stone/50">Order: {b.displayOrder}</span>
                  {b.ctaLink && <span className="text-[10px] text-stone/50 truncate">{b.ctaLink}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`p-1.5 rounded-sm transition-colors ${b.active ? 'text-green-600 hover:bg-green-50' : 'text-stone/40 hover:bg-stone/10'}`}
                  title={b.active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
                >
                  {b.active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => setEditing(b)} className="p-1.5 text-stone/60 hover:text-navy transition-colors">
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  disabled={deleting === b.id}
                  className="p-1.5 text-stone/60 hover:text-red-600 transition-colors disabled:opacity-40"
                >
                  {deleting === b.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  PROCESSING: 'bg-purple-50 text-purple-700',
  SHIPPED: 'bg-indigo-50 text-indigo-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
  REFUNDED: 'bg-gray-50 text-gray-700',
}

function StatusUpdateModal({ order, onClose, onUpdated }: { order: OrderResponse; onClose: () => void; onUpdated: () => void }) {
  const [status, setStatus] = useState(order.status)
  const [tracking, setTracking] = useState(order.trackingNumber ?? '')
  const [carrier, setCarrier] = useState(order.shippingCarrier ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await adminOrdersApi.updateStatus(order.orderNumber, {
        status,
        trackingNumber: tracking || undefined,
        shippingCarrier: carrier || undefined,
      })
      onUpdated()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-sm w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-navy">Update Order #{order.orderNumber}</h3>
          <button type="button" onClick={onClose}><X size={16} /></button>
        </div>
        {error && <AdminError msg={error} />}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone/60 mb-2">Status</label>
          <div className="relative">
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-stone/30 px-3 py-2 text-sm focus:outline-none focus:border-navy appearance-none bg-white"
            >
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone/40 pointer-events-none" />
          </div>
        </div>
        {(status === 'SHIPPED' || tracking) && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone/60 mb-1">Tracking #</label>
              <input type="text" value={tracking} onChange={e => setTracking(e.target.value)}
                placeholder="e.g. IN123456789"
                className="w-full border border-stone/30 px-3 py-2 text-sm focus:outline-none focus:border-navy" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone/60 mb-1">Carrier</label>
              <input type="text" value={carrier} onChange={e => setCarrier(e.target.value)}
                placeholder="e.g. Blue Dart"
                className="w-full border border-stone/30 px-3 py-2 text-sm focus:outline-none focus:border-navy" />
            </div>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm border border-stone/30 hover:border-navy transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-navy text-white hover:bg-navy/90 transition-colors disabled:opacity-50">
            {submitting && <Loader2 size={14} className="animate-spin" />} Update Status
          </button>
        </div>
      </form>
    </div>
  )
}

function OrdersTab() {
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<OrderResponse | null>(null)

  const load = (s = statusFilter) => {
    setLoading(true)
    setError(null)
    adminOrdersApi.list(s)
      .then(res => setOrders(res.content))
      .catch(e => setError(e instanceof ApiError ? e.message : 'Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter])

  return (
    <div className="space-y-5">
      {updating && (
        <StatusUpdateModal
          order={updating}
          onClose={() => setUpdating(null)}
          onUpdated={() => load()}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-navy">Orders</h2>
        <div className="flex gap-1 flex-wrap">
          {ORDER_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 border transition-colors ${
                statusFilter === s ? 'bg-navy text-white border-navy' : 'border-stone/30 text-stone/70 hover:border-navy'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {error && <AdminError msg={error} />}

      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-gold" /></div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-stone/60 text-center py-12">No {statusFilter.toLowerCase()} orders.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone/20 text-xs uppercase tracking-wider text-stone/50">
                <th className="text-left py-3 pr-4">Order</th>
                <th className="text-left py-3 pr-4">Customer</th>
                <th className="text-left py-3 pr-4">Items</th>
                <th className="text-left py-3 pr-4">Total</th>
                <th className="text-left py-3 pr-4">Status</th>
                <th className="text-left py-3 pr-4">Date</th>
                <th className="text-right py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/10">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-stone/5 transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs text-navy font-semibold">{o.orderNumber}</td>
                  <td className="py-3 pr-4 text-stone/80 text-xs">{o.shippingAddress?.fullName ?? '—'}</td>
                  <td className="py-3 pr-4 text-xs text-stone/60">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                  <td className="py-3 pr-4 font-semibold text-navy">{o.currency} {o.total.toLocaleString()}</td>
                  <td className="py-3 pr-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${STATUS_COLORS[o.status] ?? 'bg-stone/10 text-stone'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-stone/50">
                    {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => setUpdating(o)}
                      className="text-xs px-2 py-1 border border-stone/30 hover:border-navy text-stone/70 hover:text-navy transition-colors"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [uploading, setUploading] = useState<string | null>(null)
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  const load = (p = page) => {
    setLoading(true)
    productsApi.list(p, 20)
      .then(res => { setProducts(res.content); setTotalPages(res.totalPages) })
      .catch(e => setError(e instanceof ApiError ? e.message : 'Failed to load products'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const handleImageUpload = async (productId: string, file: File) => {
    setUploading(productId)
    try {
      await adminProductsApi.uploadImage(productId, file, false)
      load()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Upload failed')
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy">Products</h2>
        <Link to="/shop" className="text-xs text-stone/60 hover:text-navy underline transition-colors">View storefront →</Link>
      </div>

      {error && <AdminError msg={error} />}

      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-gold" /></div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone/20 text-xs uppercase tracking-wider text-stone/50">
                  <th className="text-left py-3 pr-4">Product</th>
                  <th className="text-left py-3 pr-4">Category</th>
                  <th className="text-left py-3 pr-4">Price</th>
                  <th className="text-left py-3 pr-4">Rating</th>
                  <th className="text-right py-3">Image</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/10">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-stone/5 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 bg-stone/10 shrink-0 overflow-hidden">
                          {p.mainImageUrl
                            ? <img src={p.mainImageUrl} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-stone/30"><Package size={16} /></div>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-navy text-xs leading-snug line-clamp-2">{p.name}</p>
                          <p className="text-[10px] text-stone/40 font-mono">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-stone/60">{p.categoryName}</td>
                    <td className="py-3 pr-4 text-xs font-semibold text-navy">
                      ${p.price.toFixed(2)}
                      {p.compareAtPrice && <span className="text-stone/40 line-through ml-1">${p.compareAtPrice.toFixed(2)}</span>}
                    </td>
                    <td className="py-3 pr-4 text-xs text-stone/60">
                      {p.reviewCount > 0 ? `★ ${p.averageRating.toFixed(1)} (${p.reviewCount})` : '—'}
                    </td>
                    <td className="py-3 text-right">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={el => { fileInputs.current[p.id] = el }}
                        onChange={e => {
                          const f = e.target.files?.[0]
                          if (f) handleImageUpload(p.id, f)
                        }}
                      />
                      <button
                        onClick={() => fileInputs.current[p.id]?.click()}
                        disabled={uploading === p.id}
                        className="flex items-center gap-1 text-xs px-2 py-1 border border-stone/30 hover:border-navy text-stone/70 hover:text-navy transition-colors disabled:opacity-40 ml-auto"
                      >
                        {uploading === p.id
                          ? <Loader2 size={12} className="animate-spin" />
                          : <Upload size={12} />}
                        Upload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="text-xs px-3 py-1.5 border border-stone/30 hover:border-navy disabled:opacity-40 transition-colors">
                ← Prev
              </button>
              <span className="text-xs text-stone/60 self-center">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="text-xs px-3 py-1.5 border border-stone/30 hover:border-navy disabled:opacity-40 transition-colors">
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

const TABS: { id: AdminTab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',  label: 'Overview',  icon: LayoutDashboard },
  { id: 'banners',   label: 'Banners',   icon: Image },
  { id: 'orders',    label: 'Orders',    icon: ShoppingBag },
  { id: 'products',  label: 'Products',  icon: Package },
]

export default function AdminPage() {
  const { user, isLoggedIn, isLoading } = useAuth()
  const [tab, setTab] = useState<AdminTab>('overview')

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 size={28} className="animate-spin text-gold" /></div>
  }

  if (!isLoggedIn || (user?.role !== 'ADMIN' && user?.role !== 'STAFF')) {
    return <Navigate to="/login" state={{ from: '/admin' }} replace />
  }

  return (
    <div className="min-h-screen bg-pearl">
      {/* Top bar */}
      <div className="bg-navy text-pearl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-display text-lg tracking-widest text-gold">ASTRIMI</Link>
          <span className="text-stone/40">·</span>
          <span className="text-xs uppercase tracking-wider text-stone/60">Admin</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-stone/60">
          <span>{user?.firstName} {user?.lastName}</span>
          <span className="bg-gold/20 text-gold px-2 py-0.5 text-[10px] font-bold tracking-wider">{user?.role}</span>
          <Link to="/" className="hover:text-pearl transition-colors">← Storefront</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar nav */}
          <nav className="hidden sm:flex flex-col gap-1 w-44 shrink-0">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left rounded-sm ${
                  tab === t.id
                    ? 'bg-navy text-white'
                    : 'text-stone/70 hover:bg-stone/10 hover:text-navy'
                }`}
              >
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </nav>

          {/* Mobile tab bar */}
          <div className="sm:hidden w-full -mx-4 px-4 mb-6 flex gap-2 overflow-x-auto pb-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 border transition-colors ${
                  tab === t.id ? 'bg-navy text-white border-navy' : 'border-stone/30 text-stone/70'
                }`}
              >
                <t.icon size={13} /> {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {tab === 'overview' && <OverviewTab />}
            {tab === 'banners'  && <BannersTab />}
            {tab === 'orders'   && <OrdersTab />}
            {tab === 'products' && <ProductsTab />}
          </div>
        </div>
      </div>
    </div>
  )
}
