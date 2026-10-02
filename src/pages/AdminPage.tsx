import { useState, useEffect, useRef } from 'react'
import { Navigate, Link } from 'react-router-dom'
import {
  LayoutDashboard, Image, ShoppingBag, Package, TrendingUp,
  Users, AlertTriangle, Plus, Pencil, Trash2, Upload, X,
  ChevronDown, Loader2, Eye, EyeOff, RefreshCw, Tag,
  ChevronLeft, ChevronRight as ChevronRightIcon, Save, PlusCircle,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  adminApi, adminOrdersApi, adminProductsApi, bannerApi, productsApi, categoriesApi,
  DashboardSummary, BannerResponse, OrderResponse, ProductSummary, ProductDetail,
  ProductCreateBody, ProductUpdateBody, VariantCreateBody, CategoryResponse,
  ApiError,
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

const FIELD = 'w-full border border-stone/30 px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white'
const LABEL = 'block text-xs font-semibold uppercase tracking-wider text-stone/60 mb-1'

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true); setError(null)
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

function BannerForm({ initial, onSave, onCancel }: { initial?: BannerResponse | null; onSave: () => void; onCancel: () => void }) {
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

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    setFile(f); setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSubmitting(true)
    try {
      if (initial) {
        if (file) {
          const uploaded = await bannerApi.uploadAndCreate(file, { ...form, active: form.active })
          await bannerApi.update(initial.id, { ...form, imageUrl: uploaded.imageUrl })
          await bannerApi.delete(uploaded.id)
        } else {
          await bannerApi.update(initial.id, form)
        }
      } else {
        if (file) {
          await bannerApi.uploadAndCreate(file, form)
        } else if (form.imageUrl) {
          await bannerApi.create(form)
        } else {
          setError('Please provide an image file or URL'); setSubmitting(false); return
        }
      }
      onSave()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-stone/20 rounded-sm p-5 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-navy">{initial ? 'Edit Banner' : 'New Banner'}</h3>
        <button type="button" onClick={onCancel} className="text-stone/60 hover:text-navy"><X size={16} /></button>
      </div>
      {error && <AdminError msg={error} />}
      <div>
        <label className={LABEL}>Image</label>
        {preview && <img src={preview} alt="Preview" className="w-full h-36 object-cover object-center mb-2 bg-stone/10" />}
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs border border-stone/30 px-3 py-2 hover:border-navy transition-colors">
            <Upload size={13} /> Upload File
          </button>
          <span className="text-xs text-stone/50 self-center">or</span>
          <input type="url" placeholder="https://..." value={form.imageUrl}
            onChange={e => setForm(p => ({ ...p, imageUrl: e.target.value }))}
            className={`${FIELD} flex-1`} />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className={LABEL}>Title</label><input type="text" value={form.title} onChange={set('title')} className={FIELD} /></div>
        <div><label className={LABEL}>Subtitle</label><input type="text" value={form.subtitle} onChange={set('subtitle')} className={FIELD} /></div>
        <div><label className={LABEL}>CTA Text</label><input type="text" value={form.ctaText} onChange={set('ctaText')} className={FIELD} /></div>
        <div><label className={LABEL}>CTA Link</label><input type="text" value={form.ctaLink} onChange={set('ctaLink')} className={FIELD} /></div>
        <div>
          <label className={LABEL}>Display Order</label>
          <input type="number" min={0} value={form.displayOrder}
            onChange={e => setForm(p => ({ ...p, displayOrder: parseInt(e.target.value) || 0 }))} className={FIELD} />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={set('active')} className="accent-navy w-4 h-4" />
            <span className="text-sm text-navy font-medium">Active</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-stone/30 hover:border-navy transition-colors">Cancel</button>
        <button type="submit" disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-navy text-white hover:bg-navy/90 disabled:opacity-50">
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
    bannerApi.listAll().then(setBanners).catch(e => setError(e instanceof ApiError ? e.message : 'Failed')).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    setDeleting(id)
    try { await bannerApi.delete(id); setBanners(b => b.filter(x => x.id !== id)) }
    catch (e) { alert(e instanceof ApiError ? e.message : 'Delete failed') }
    finally { setDeleting(null) }
  }

  const handleToggleActive = async (banner: BannerResponse) => {
    try {
      const updated = await bannerApi.update(banner.id, { active: !banner.active })
      setBanners(b => b.map(x => x.id === banner.id ? updated : x))
    } catch (e) { alert(e instanceof ApiError ? e.message : 'Update failed') }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy">Banners</h2>
        <button onClick={() => setEditing('new')} className="flex items-center gap-1.5 text-sm bg-navy text-white px-3 py-2 hover:bg-navy/90">
          <Plus size={14} /> Add Banner
        </button>
      </div>
      {error && <AdminError msg={error} />}
      {editing === 'new' && <BannerForm onSave={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} />}
      {editing && editing !== 'new' && <BannerForm initial={editing} onSave={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} />}
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
            <div key={b.id} className={`flex items-center gap-4 p-4 bg-white border rounded-sm ${b.active ? 'border-stone/20' : 'border-stone/10 opacity-60'}`}>
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
                <button onClick={() => handleToggleActive(b)}
                  className={`p-1.5 rounded-sm ${b.active ? 'text-green-600 hover:bg-green-50' : 'text-stone/40 hover:bg-stone/10'}`}>
                  {b.active ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => setEditing(b)} className="p-1.5 text-stone/60 hover:text-navy"><Pencil size={15} /></button>
                <button onClick={() => handleDelete(b.id)} disabled={deleting === b.id}
                  className="p-1.5 text-stone/60 hover:text-red-600 disabled:opacity-40">
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

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED']

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  CONFIRMED: 'bg-blue-50 text-blue-700',
  PROCESSING: 'bg-purple-50 text-purple-700',
  SHIPPED: 'bg-indigo-50 text-indigo-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-red-50 text-red-700',
  RETURNED: 'bg-orange-50 text-orange-700',
  REFUNDED: 'bg-gray-100 text-gray-600',
}

function OrderDetailModal({ order: initial, onClose, onUpdated }: {
  order: OrderResponse; onClose: () => void; onUpdated: () => void
}) {
  const [order, setOrder] = useState(initial)
  const [status, setStatus] = useState(initial.status)
  const [tracking, setTracking] = useState(initial.trackingNumber ?? '')
  const [carrier, setCarrier] = useState(initial.shippingCarrier ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Refresh on open
  useEffect(() => {
    adminOrdersApi.get(initial.orderNumber).then(setOrder).catch(() => {})
  }, [initial.orderNumber])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSuccess(null); setSubmitting(true)
    try {
      await adminOrdersApi.updateStatus(order.orderNumber, {
        status,
        trackingNumber: tracking || undefined,
        shippingCarrier: carrier || undefined,
      })
      setSuccess('Order updated successfully')
      setOrder(o => ({ ...o, status, trackingNumber: tracking || null, shippingCarrier: carrier || null }))
      onUpdated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed')
    } finally { setSubmitting(false) }
  }

  const handleCancel = async () => {
    if (!confirm(`Cancel order ${order.orderNumber}? This cannot be undone.`)) return
    setSubmitting(true); setError(null)
    try {
      await adminOrdersApi.cancel(order.orderNumber)
      setOrder(o => ({ ...o, status: 'CANCELLED' }))
      setStatus('CANCELLED')
      setSuccess('Order cancelled')
      onUpdated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Cancel failed')
    } finally { setSubmitting(false) }
  }

  const addr = order.shippingAddress

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone/20 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-semibold text-navy">Order #{order.orderNumber}</h3>
            <p className="text-xs text-stone/60 mt-0.5">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>
          <button onClick={onClose} className="text-stone/60 hover:text-navy"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-5">
          {error && <AdminError msg={error} />}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-sm">{success}</div>}

          {/* Status badge */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-3 py-1 rounded-sm ${STATUS_COLORS[order.status] ?? 'bg-stone/10 text-stone'}`}>
              {order.status}
            </span>
            <span className="text-xs text-stone/60">Payment: {order.paymentStatus}</span>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone/50 mb-3">Items</p>
            <div className="space-y-2">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-stone/5 p-2 rounded-sm">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt="" className="w-10 h-12 object-cover bg-stone/10 shrink-0" />
                    : <div className="w-10 h-12 bg-stone/10 shrink-0 flex items-center justify-center"><Package size={14} className="text-stone/30" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-navy truncate">{item.productName}</p>
                    <p className="text-[10px] text-stone/50">{[item.size, item.color].filter(Boolean).join(' · ')} · SKU: {item.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-navy">{order.currency} {item.lineTotal.toLocaleString()}</p>
                    <p className="text-[10px] text-stone/50">x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-stone/5 p-4 rounded-sm space-y-1.5 text-xs">
            <div className="flex justify-between text-stone/70"><span>Subtotal</span><span>{order.currency} {order.subtotal.toLocaleString()}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>- {order.currency} {order.discount.toLocaleString()}</span></div>}
            <div className="flex justify-between text-stone/70"><span>Shipping</span><span>{order.shippingCost === 0 ? 'Free' : `${order.currency} ${order.shippingCost}`}</span></div>
            <div className="flex justify-between text-stone/70"><span>Tax</span><span>{order.currency} {order.tax.toLocaleString()}</span></div>
            <div className="flex justify-between font-semibold text-navy pt-1 border-t border-stone/20">
              <span>Total</span><span>{order.currency} {order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Shipping address */}
          {addr && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone/50 mb-2">Shipping Address</p>
              <div className="text-xs text-stone/80 leading-relaxed bg-stone/5 p-3 rounded-sm">
                <p className="font-medium text-navy">{addr.fullName}</p>
                <p>{addr.phone}</p>
                <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                <p>{addr.city}{addr.stateProvince ? `, ${addr.stateProvince}` : ''} {addr.postalCode}</p>
                <p>{addr.country}</p>
              </div>
            </div>
          )}

          {/* Tracking */}
          {(order.trackingNumber || order.shippingCarrier) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone/50 mb-2">Tracking</p>
              <div className="text-xs text-stone/80 bg-stone/5 p-3 rounded-sm">
                {order.trackingNumber && <p>Tracking #: <span className="font-mono font-semibold">{order.trackingNumber}</span></p>}
                {order.shippingCarrier && <p>Carrier: {order.shippingCarrier}</p>}
              </div>
            </div>
          )}

          {/* Update form */}
          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
            <form onSubmit={handleUpdate} className="border border-stone/20 p-4 rounded-sm space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-stone/50">Update Order</p>
              <div>
                <label className={LABEL}>Status</label>
                <div className="relative">
                  <select value={status} onChange={e => setStatus(e.target.value)}
                    className="w-full border border-stone/30 px-3 py-2 text-sm focus:outline-none focus:border-navy appearance-none bg-white">
                    {ORDER_STATUSES.filter(s => s !== 'PENDING').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone/40 pointer-events-none" />
                </div>
              </div>
              {(status === 'SHIPPED' || tracking) && (
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={LABEL}>Tracking #</label>
                    <input type="text" value={tracking} onChange={e => setTracking(e.target.value)} className={FIELD} placeholder="e.g. IN123456" /></div>
                  <div><label className={LABEL}>Carrier</label>
                    <input type="text" value={carrier} onChange={e => setCarrier(e.target.value)} className={FIELD} placeholder="e.g. Blue Dart" /></div>
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-navy text-white hover:bg-navy/90 disabled:opacity-50">
                  {submitting && <Loader2 size={14} className="animate-spin" />} <Save size={14} /> Update Status
                </button>
                <button type="button" onClick={handleCancel} disabled={submitting}
                  className="px-4 py-2 text-sm border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50">
                  Cancel Order
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function OrdersTab() {
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewing, setViewing] = useState<OrderResponse | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const load = (s = statusFilter, p = page) => {
    setLoading(true); setError(null)
    adminOrdersApi.list(s, p, 30)
      .then(res => { setOrders(res.content); setTotalPages(res.totalPages) })
      .catch(e => setError(e instanceof ApiError ? e.message : 'Failed to load orders'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { setPage(0); load(statusFilter, 0) }, [statusFilter])
  useEffect(() => { load(statusFilter, page) }, [page])

  return (
    <div className="space-y-5">
      {viewing && (
        <OrderDetailModal
          order={viewing}
          onClose={() => setViewing(null)}
          onUpdated={() => { load(); setViewing(null) }}
        />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-semibold text-navy">Orders</h2>
        <button onClick={() => load()} className="flex items-center gap-1.5 text-xs text-stone/60 hover:text-navy transition-colors">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Status filters */}
      <div className="flex gap-1 flex-wrap">
        {ORDER_STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 border transition-colors ${
              statusFilter === s ? 'bg-navy text-white border-navy' : 'border-stone/30 text-stone/70 hover:border-navy'
            }`}>
            {s}
          </button>
        ))}
      </div>

      {error && <AdminError msg={error} />}

      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-gold" /></div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-stone/60 text-center py-12">No {statusFilter.toLowerCase()} orders.</p>
      ) : (
        <>
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
                    <td className="py-3 pr-4 font-semibold text-navy text-xs">{o.currency} {o.total.toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${STATUS_COLORS[o.status] ?? 'bg-stone/10 text-stone'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-stone/50">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => setViewing(o)}
                        className="text-xs px-2 py-1 border border-stone/30 hover:border-navy text-stone/70 hover:text-navy transition-colors">
                        View / Edit
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
                className="text-xs px-3 py-1.5 border border-stone/30 hover:border-navy disabled:opacity-40 flex items-center gap-1">
                <ChevronLeft size={12} /> Prev
              </button>
              <span className="text-xs text-stone/60 self-center">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="text-xs px-3 py-1.5 border border-stone/30 hover:border-navy disabled:opacity-40 flex items-center gap-1">
                Next <ChevronRightIcon size={12} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function VariantForm({ productId, onSaved, onCancel }: { productId: string; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState<VariantCreateBody>({
    sku: '', size: '', color: '', colorHex: '', material: '', price: 0,
    salePrice: undefined, stockQuantity: 0, lowStockThreshold: 5, imageUrl: '', barcode: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof VariantCreateBody) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSubmitting(true)
    try {
      await adminProductsApi.addVariant(productId, {
        ...form,
        size: form.size || undefined,
        color: form.color || undefined,
        colorHex: form.colorHex || undefined,
        material: form.material || undefined,
        imageUrl: form.imageUrl || undefined,
        barcode: form.barcode || undefined,
        salePrice: form.salePrice || undefined,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally { setSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-stone/20 p-4 space-y-4 bg-stone/5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone/60">Add Variant</p>
        <button type="button" onClick={onCancel}><X size={14} className="text-stone/60" /></button>
      </div>
      {error && <AdminError msg={error} />}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div><label className={LABEL}>SKU *</label><input required type="text" value={form.sku} onChange={set('sku')} className={FIELD} /></div>
        <div><label className={LABEL}>Size</label><input type="text" value={form.size} onChange={set('size')} className={FIELD} placeholder="XS/S/M/L/XL" /></div>
        <div><label className={LABEL}>Color</label><input type="text" value={form.color} onChange={set('color')} className={FIELD} /></div>
        <div><label className={LABEL}>Color Hex</label><input type="text" value={form.colorHex} onChange={set('colorHex')} className={FIELD} placeholder="#ffffff" /></div>
        <div><label className={LABEL}>Material</label><input type="text" value={form.material} onChange={set('material')} className={FIELD} /></div>
        <div><label className={LABEL}>Price *</label><input required type="number" step="0.01" min="0" value={form.price} onChange={set('price')} className={FIELD} /></div>
        <div><label className={LABEL}>Sale Price</label><input type="number" step="0.01" min="0" value={form.salePrice ?? ''} onChange={e => setForm(p => ({ ...p, salePrice: parseFloat(e.target.value) || undefined }))} className={FIELD} /></div>
        <div><label className={LABEL}>Stock *</label><input required type="number" min="0" value={form.stockQuantity} onChange={set('stockQuantity')} className={FIELD} /></div>
        <div><label className={LABEL}>Low Stock Alert</label><input type="number" min="0" value={form.lowStockThreshold} onChange={set('lowStockThreshold')} className={FIELD} /></div>
      </div>
      <button type="submit" disabled={submitting}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-navy text-white hover:bg-navy/90 disabled:opacity-50">
        {submitting && <Loader2 size={14} className="animate-spin" />} Add Variant
      </button>
    </form>
  )
}

function ProductForm({
  initial, categories, onSaved, onCancel,
}: {
  initial?: ProductDetail | null
  categories: CategoryResponse[]
  onSaved: () => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<ProductCreateBody>({
    name: initial?.product.name ?? '',
    sku: initial?.product.sku ?? '',
    description: initial?.description ?? '',
    shortDescription: initial?.product.shortDescription ?? '',
    categoryId: initial?.product.categoryId ?? categories[0]?.id ?? '',
    price: initial?.product.price ?? 0,
    compareAtPrice: initial?.product.compareAtPrice ?? undefined,
    mainImageUrl: initial?.product.mainImageUrl ?? '',
    tags: initial?.tags ?? [],
    featured: initial?.product.featured ?? false,
    newArrival: initial?.product.newArrival ?? false,
    variants: [],
  })
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: keyof ProductCreateBody) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({
      ...p,
      [k]: e.target instanceof HTMLInputElement && e.target.type === 'checkbox'
        ? e.target.checked
        : e.target instanceof HTMLInputElement && e.target.type === 'number'
          ? parseFloat(e.target.value) || 0
          : e.target.value,
    }))

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.tags?.includes(t)) setForm(p => ({ ...p, tags: [...(p.tags ?? []), t] }))
    setTagInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSubmitting(true)
    try {
      const body: ProductCreateBody = {
        ...form,
        compareAtPrice: form.compareAtPrice || undefined,
        mainImageUrl: form.mainImageUrl || undefined,
        shortDescription: form.shortDescription || undefined,
        description: form.description || undefined,
      }
      if (initial) {
        const updateBody: ProductUpdateBody = {
          name: body.name,
          description: body.description,
          shortDescription: body.shortDescription,
          categoryId: body.categoryId,
          price: body.price,
          compareAtPrice: body.compareAtPrice,
          mainImageUrl: body.mainImageUrl,
          tags: body.tags,
          featured: body.featured,
          newArrival: body.newArrival,
        }
        await adminProductsApi.update(initial.product.id, updateBody)
      } else {
        await adminProductsApi.create(body)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-sm w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-stone/20 sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-navy">{initial ? 'Edit Product' : 'New Product'}</h3>
          <button onClick={onCancel}><X size={16} className="text-stone/60" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <AdminError msg={error} />}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={LABEL}>Product Name *</label>
              <input required type="text" value={form.name} onChange={set('name')} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>SKU *</label>
              <input required type="text" value={form.sku} onChange={set('sku')} className={FIELD} placeholder="e.g. KRT-001" />
            </div>
            <div>
              <label className={LABEL}>Category *</label>
              <div className="relative">
                <select required value={form.categoryId} onChange={set('categoryId')} className={`${FIELD} appearance-none`}>
                  <option value="">Select category…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone/40 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LABEL}>Price *</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={set('price')} className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Compare-at Price</label>
              <input type="number" step="0.01" min="0" value={form.compareAtPrice ?? ''} onChange={e => setForm(p => ({ ...p, compareAtPrice: parseFloat(e.target.value) || undefined }))} className={FIELD} placeholder="Optional" />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL}>Main Image URL</label>
              <input type="url" value={form.mainImageUrl ?? ''} onChange={set('mainImageUrl')} className={FIELD} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL}>Short Description</label>
              <input type="text" value={form.shortDescription ?? ''} onChange={set('shortDescription')} className={FIELD} placeholder="Brief tagline (140 chars)" />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL}>Description</label>
              <textarea value={form.description ?? ''} onChange={set('description')} rows={4}
                className="w-full border border-stone/30 px-3 py-2 text-sm focus:outline-none focus:border-navy bg-white resize-none" />
            </div>
            {/* Tags */}
            <div className="sm:col-span-2">
              <label className={LABEL}>Tags</label>
              <div className="flex gap-2 mb-2 flex-wrap">
                {(form.tags ?? []).map(t => (
                  <span key={t} className="flex items-center gap-1 text-xs bg-stone/10 px-2 py-0.5">
                    {t}
                    <button type="button" onClick={() => setForm(p => ({ ...p, tags: p.tags?.filter(x => x !== t) }))}><X size={10} /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  className={`${FIELD} flex-1`} placeholder="Add tag, press Enter" />
                <button type="button" onClick={addTag} className="px-3 py-2 text-sm border border-stone/30 hover:border-navy">
                  <Plus size={14} />
                </button>
              </div>
            </div>
            {/* Flags */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.featured ?? false} onChange={set('featured')} className="accent-navy w-4 h-4" />
                <span className="text-sm text-navy">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.newArrival ?? false} onChange={set('newArrival')} className="accent-navy w-4 h-4" />
                <span className="text-sm text-navy">New Arrival</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2 border-t border-stone/20">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm border border-stone/30 hover:border-navy">Cancel</button>
            <button type="submit" disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm bg-navy text-white hover:bg-navy/90 disabled:opacity-50">
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {initial ? 'Save Changes' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProductsTab() {
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<ProductDetail | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [addingVariantId, setAddingVariantId] = useState<string | null>(null)
  const [productDetail, setProductDetail] = useState<Record<string, ProductDetail>>({})
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({})

  const load = (p = page) => {
    setLoading(true)
    Promise.all([
      productsApi.list(p, 20),
      categoriesApi.list(),
    ]).then(([res, cats]) => {
      setProducts(res.content)
      setTotalPages(res.totalPages)
      setCategories(cats)
    }).catch(e => setError(e instanceof ApiError ? e.message : 'Failed'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [page])

  const loadDetail = async (productId: string) => {
    if (productDetail[productId]) return
    try {
      // Use getById since admin sees all products
      const detail = await productsApi.getById(productId)
      setProductDetail(d => ({ ...d, [productId]: detail }))
    } catch { /* no detail available */ }
  }

  const handleExpand = (productId: string) => {
    if (expandedId === productId) { setExpandedId(null); return }
    setExpandedId(productId)
    loadDetail(productId)
  }

  const handleImageUpload = async (productId: string, file: File) => {
    setUploadingId(productId)
    try {
      await adminProductsApi.uploadImage(productId, file, false)
      load()
    } catch (e) { alert(e instanceof ApiError ? e.message : 'Upload failed') }
    finally { setUploadingId(null) }
  }

  const handleDelete = async (p: ProductSummary) => {
    if (!confirm(`Archive product "${p.name}"? It will be soft-deleted (hidden from storefront).`)) return
    setDeletingId(p.id)
    try {
      await adminProductsApi.delete(p.id)
      setProducts(list => list.filter(x => x.id !== p.id))
    } catch (e) { alert(e instanceof ApiError ? e.message : 'Delete failed') }
    finally { setDeletingId(null) }
  }

  const handleEditClick = async (p: ProductSummary) => {
    try {
      const detail = productDetail[p.id] ?? await productsApi.getById(p.id)
      setProductDetail(d => ({ ...d, [p.id]: detail }))
      setEditing(detail)
    } catch { alert('Failed to load product details') }
  }

  return (
    <div className="space-y-5">
      {creating && (
        <ProductForm categories={categories} onSaved={() => { setCreating(false); load() }} onCancel={() => setCreating(false)} />
      )}
      {editing && (
        <ProductForm initial={editing} categories={categories} onSaved={() => { setEditing(null); load() }} onCancel={() => setEditing(null)} />
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy">Products</h2>
        <div className="flex gap-2">
          <Link to="/shop" className="text-xs text-stone/60 hover:text-navy underline">View storefront →</Link>
          <button onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 text-sm bg-navy text-white px-3 py-2 hover:bg-navy/90">
            <Plus size={14} /> Add Product
          </button>
        </div>
      </div>

      {error && <AdminError msg={error} />}

      {loading ? (
        <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin text-gold" /></div>
      ) : (
        <>
          <div className="space-y-1">
            {products.map(p => (
              <div key={p.id} className="bg-white border border-stone/20 rounded-sm overflow-hidden">
                {/* Row */}
                <div className="flex items-center gap-3 p-3 hover:bg-stone/5 transition-colors">
                  {/* Thumbnail */}
                  <div className="w-10 h-12 bg-stone/10 shrink-0 overflow-hidden">
                    {p.mainImageUrl
                      ? <img src={p.mainImageUrl} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Package size={14} className="text-stone/30" /></div>
                    }
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-navy line-clamp-1">{p.name}</p>
                    <p className="text-[10px] text-stone/40 font-mono">{p.sku} · {p.categoryName}</p>
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold text-navy">${p.price.toFixed(2)}</span>
                      {p.compareAtPrice && <span className="text-[10px] text-stone/40 line-through">${p.compareAtPrice.toFixed(2)}</span>}
                      {p.featured && <span className="text-[10px] text-gold font-semibold">★ Featured</span>}
                      {p.newArrival && <span className="text-[10px] text-indigo-500 font-semibold">New</span>}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleExpand(p.id)}
                      className="p-1.5 text-xs text-stone/60 hover:text-navy border border-stone/20 hover:border-navy transition-colors"
                      title="View variants">
                      <Tag size={13} />
                    </button>
                    <input type="file" accept="image/*" className="hidden"
                      ref={el => { fileInputs.current[p.id] = el }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(p.id, f) }} />
                    <button onClick={() => fileInputs.current[p.id]?.click()} disabled={uploadingId === p.id}
                      className="p-1.5 text-stone/60 hover:text-navy border border-stone/20 hover:border-navy transition-colors disabled:opacity-40"
                      title="Upload image">
                      {uploadingId === p.id ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    </button>
                    <button onClick={() => handleEditClick(p)}
                      className="p-1.5 text-stone/60 hover:text-navy border border-stone/20 hover:border-navy transition-colors"
                      title="Edit product">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(p)} disabled={deletingId === p.id}
                      className="p-1.5 text-stone/60 hover:text-red-600 border border-stone/20 hover:border-red-200 transition-colors disabled:opacity-40"
                      title="Archive product">
                      {deletingId === p.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>

                {/* Expanded variants */}
                {expandedId === p.id && (
                  <div className="border-t border-stone/10 bg-stone/5 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone/50">Variants</p>
                      <button onClick={() => setAddingVariantId(addingVariantId === p.id ? null : p.id)}
                        className="flex items-center gap-1 text-xs text-navy hover:text-gold transition-colors">
                        <PlusCircle size={13} /> Add Variant
                      </button>
                    </div>

                    {addingVariantId === p.id && (
                      <VariantForm
                        productId={p.id}
                        onSaved={() => { setAddingVariantId(null); loadDetail(p.id); setProductDetail(d => { const { [p.id]: _, ...rest } = d; return rest }) ; loadDetail(p.id) }}
                        onCancel={() => setAddingVariantId(null)}
                      />
                    )}

                    {productDetail[p.id] ? (
                      productDetail[p.id].variants.length === 0 ? (
                        <p className="text-xs text-stone/50 text-center py-2">No variants yet.</p>
                      ) : (
                        <div className="space-y-1">
                          {productDetail[p.id].variants.map(v => (
                            <div key={v.id} className="flex items-center gap-3 bg-white border border-stone/10 px-3 py-2 text-xs">
                              <div className="flex-1 grid grid-cols-4 gap-2">
                                <span className="font-mono text-stone/60 truncate">{v.sku}</span>
                                <span className="text-stone/80">{[v.size, v.color].filter(Boolean).join(' / ') || '—'}</span>
                                <span className="font-semibold text-navy">${v.effectivePrice.toFixed(2)}</span>
                                <span className={v.stockQuantity < 5 ? 'text-red-500 font-semibold' : 'text-stone/60'}>
                                  Stock: {v.stockQuantity}
                                </span>
                              </div>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-sm ${v.active ? 'bg-green-50 text-green-600' : 'bg-stone/10 text-stone/50'}`}>
                                {v.active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="flex justify-center py-4"><Loader2 size={16} className="animate-spin text-gold" /></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="text-xs px-3 py-1.5 border border-stone/30 hover:border-navy disabled:opacity-40 flex items-center gap-1">
                <ChevronLeft size={12} /> Prev
              </button>
              <span className="text-xs text-stone/60 self-center">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="text-xs px-3 py-1.5 border border-stone/30 hover:border-navy disabled:opacity-40 flex items-center gap-1">
                Next <ChevronRightIcon size={12} />
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
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left rounded-sm ${
                  tab === t.id ? 'bg-navy text-white' : 'text-stone/70 hover:bg-stone/10 hover:text-navy'
                }`}>
                <t.icon size={15} /> {t.label}
              </button>
            ))}
          </nav>

          {/* Mobile tab bar */}
          <div className="sm:hidden w-full -mx-4 px-4 mb-6 flex gap-2 overflow-x-auto pb-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-2 border transition-colors ${
                  tab === t.id ? 'bg-navy text-white border-navy' : 'border-stone/30 text-stone/70'
                }`}>
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
