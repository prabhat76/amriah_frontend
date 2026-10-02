import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Package, Truck, CheckCircle2, Clock, XCircle,
  ChevronLeft, MapPin, CreditCard, Loader2, AlertTriangle,
} from 'lucide-react'
import { ordersApi } from '@/lib/api'
import { useApi } from '@/hooks/useApi'

// ─── Tracking steps ───────────────────────────────────────────────────────────

const STEPS = [
  { key: 'PENDING',    label: 'Order Placed',  Icon: Clock },
  { key: 'CONFIRMED',  label: 'Confirmed',     Icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Processing',    Icon: Package },
  { key: 'SHIPPED',    label: 'Shipped',       Icon: Truck },
  { key: 'DELIVERED',  label: 'Delivered',     Icon: CheckCircle2 },
]

function TrackingTimeline({ status }: { status: string }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 text-sm py-4">
        <XCircle size={16} className="text-red-500" />
        <span className="text-red-600 font-medium">This order has been cancelled.</span>
      </div>
    )
  }
  if (status === 'RETURNED') {
    return (
      <div className="flex items-center gap-2 text-sm py-4">
        <XCircle size={16} className="text-orange-500" />
        <span className="text-orange-600 font-medium">This order has been returned.</span>
      </div>
    )
  }

  const currentIdx = STEPS.findIndex(s => s.key === status)

  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-1">
      {STEPS.map((step, i) => {
        const done = i <= currentIdx
        const { Icon } = step
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
              <div className={`w-8 h-8 flex items-center justify-center border-2 transition-colors ${
                done
                  ? 'bg-navy border-navy text-pearl'
                  : 'bg-cream border-mist text-stone'
              }`}>
                <Icon size={13} />
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight tracking-wide ${
                done ? 'text-navy' : 'text-stone'
              }`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 mb-5 transition-colors ${
                i < currentIdx ? 'bg-navy' : 'bg-mist'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  PENDING:    'text-yellow-700 bg-yellow-50 border-yellow-200',
  CONFIRMED:  'text-blue-700 bg-blue-50 border-blue-200',
  PROCESSING: 'text-purple-700 bg-purple-50 border-purple-200',
  SHIPPED:    'text-indigo-700 bg-indigo-50 border-indigo-200',
  DELIVERED:  'text-green-700 bg-green-50 border-green-200',
  CANCELLED:  'text-red-700 bg-red-50 border-red-200',
  RETURNED:   'text-orange-700 bg-orange-50 border-orange-200',
  REFUNDED:   'text-teal-700 bg-teal-50 border-teal-200',
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? 'text-stone bg-cream border-mist'
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 border ${color}`}>
      {status}
    </span>
  )
}

// ─── Cancel dialog ────────────────────────────────────────────────────────────

function CancelDialog({
  orderNumber,
  onConfirm,
  onClose,
  loading,
}: {
  orderNumber: string
  onConfirm: () => void
  onClose: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 px-4">
      <div className="bg-pearl border border-mist p-8 max-w-sm w-full">
        <div className="flex items-start gap-3 mb-5">
          <AlertTriangle size={20} className="text-gold shrink-0 mt-0.5" />
          <div>
            <h3 className="font-display text-lg text-navy mb-1">Cancel order?</h3>
            <p className="text-sm text-stone">
              Order <strong className="text-navy">{orderNumber}</strong> will be cancelled.
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn-outline-gold flex-1 justify-center"
          >
            Keep Order
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-widest uppercase border border-red-400 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : null}
            Confirm Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const { data: order, loading, error, refetch } = useApi(
    () => ordersApi.getByNumber(orderNumber!),
    [orderNumber],
  )

  const [showCancel, setShowCancel] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  async function handleCancel() {
    if (!order) return
    setCancelLoading(true)
    setCancelError(null)
    try {
      await ordersApi.cancel(order.orderNumber)
      setShowCancel(false)
      await refetch()
    } catch (e: unknown) {
      setCancelError(e instanceof Error ? e.message : 'Failed to cancel order')
    } finally {
      setCancelLoading(false)
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <main className="bg-pearl min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gold/40" />
      </main>
    )
  }

  // ── Error ──
  if (error || !order) {
    return (
      <main className="bg-pearl min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-600">{error ?? 'Order not found'}</p>
        <Link to="/orders" className="btn-gold">Back to Orders</Link>
      </main>
    )
  }

  const addr = order.shippingAddress
  const canCancel = order.status === 'PENDING' || order.status === 'CONFIRMED'

  return (
    <>
      {showCancel && (
        <CancelDialog
          orderNumber={order.orderNumber}
          onConfirm={handleCancel}
          onClose={() => setShowCancel(false)}
          loading={cancelLoading}
        />
      )}

      <main className="bg-pearl min-h-screen">
        <div className="container-astrimi py-12">

          {/* Back */}
          <Link
            to="/orders"
            className="inline-flex items-center gap-1 caption hover:text-navy transition-colors mb-8"
          >
            <ChevronLeft size={12} /> All Orders
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
            <div>
              <p className="eyebrow mb-1">Order #{order.orderNumber}</p>
              <h1 className="font-display text-3xl sm:text-4xl text-navy">
                Order Details
              </h1>
              <p className="caption mt-1.5">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <p className="font-display text-2xl text-navy">
                {order.currency} {order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <StatusBadge status={order.status} />
              <span className={`text-xs font-semibold ${
                order.paymentStatus === 'PAID' ? 'text-green-600' :
                order.paymentStatus === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
              }`}>
                Payment: {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Tracking */}
          <div className="border border-mist bg-white p-6 mb-6">
            <p className="eyebrow mb-5">Order Status</p>
            <TrackingTimeline status={order.status} />
            {order.trackingNumber && (
              <div className="mt-4 flex items-center gap-2 text-xs text-stone border-t border-mist pt-4">
                <Truck size={12} />
                <span>
                  Tracking:{' '}
                  <strong className="text-navy">{order.trackingNumber}</strong>
                </span>
                {order.shippingCarrier && (
                  <span className="text-stone">via {order.shippingCarrier}</span>
                )}
              </div>
            )}
          </div>

          {cancelError && (
            <div className="mb-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {cancelError}
            </div>
          )}

          <div className="grid lg:grid-cols-[1fr_300px] gap-6">

            {/* Items + totals */}
            <div className="border border-mist bg-white p-6">
              <p className="eyebrow mb-5">Items ({order.items.length})</p>
              <div className="space-y-5">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-14 h-[70px] bg-cream shrink-0 overflow-hidden">
                      {item.imageUrl
                        ? <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover object-top"
                          />
                        : <div className="w-full h-full flex items-center justify-center text-stone">
                            <Package size={18} />
                          </div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.productId}`}
                        className="text-sm font-medium text-navy hover:underline line-clamp-2"
                      >
                        {item.productName}
                      </Link>
                      <div className="flex flex-wrap gap-2 text-[11px] text-stone mt-1">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-navy shrink-0">
                      {order.currency} {item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-mist mt-6 pt-5 space-y-2 text-sm">
                <div className="flex justify-between text-stone">
                  <span>Subtotal</span>
                  <span>{order.currency} {order.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{order.currency} {order.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone">
                  <span>Shipping</span>
                  <span>
                    {order.shippingCost === 0
                      ? 'Free'
                      : `${order.currency} ${order.shippingCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                    }
                  </span>
                </div>
                {order.tax > 0 && (
                  <div className="flex justify-between text-stone">
                    <span>Tax</span>
                    <span>{order.currency} {order.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between font-display text-base text-navy border-t border-mist pt-3">
                  <span>Total</span>
                  <span>{order.currency} {order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">

              {/* Shipping address */}
              {addr && (
                <div className="border border-mist bg-white p-5">
                  <div className="flex items-center gap-2 eyebrow mb-3">
                    <MapPin size={11} /> Shipping To
                  </div>
                  <div className="text-sm space-y-0.5 text-stone">
                    <p className="font-medium text-navy">{addr.fullName}</p>
                    <p>{addr.line1}</p>
                    {addr.line2 && <p>{addr.line2}</p>}
                    <p>{addr.city}, {addr.stateProvince} {addr.postalCode}</p>
                    <p>{addr.country}</p>
                    <p className="text-stone/60 pt-1">{addr.phone}</p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="border border-mist bg-white p-5">
                <div className="flex items-center gap-2 eyebrow mb-3">
                  <CreditCard size={11} /> Timeline
                </div>
                <div className="space-y-2 text-xs text-stone">
                  <div className="flex justify-between">
                    <span>Ordered</span>
                    <span>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  {order.shippedAt && (
                    <div className="flex justify-between">
                      <span>Shipped</span>
                      <span>{new Date(order.shippedAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="flex justify-between font-semibold text-green-600">
                      <span>Delivered</span>
                      <span>{new Date(order.deliveredAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                  {order.cancelledAt && (
                    <div className="flex justify-between text-red-600">
                      <span>Cancelled</span>
                      <span>{new Date(order.cancelledAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {canCancel && (
                <button
                  onClick={() => setShowCancel(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-widest uppercase border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <XCircle size={13} /> Cancel Order
                </button>
              )}

              <Link to="/shop" className="btn-gold w-full justify-center text-center block">
                Continue Shopping
              </Link>

            </div>
          </div>
        </div>
      </main>
    </>
  )
}
