import { Link, useParams } from 'react-router-dom'
import { Package, Truck, CheckCircle2, Clock, XCircle, ChevronLeft, MapPin, CreditCard } from 'lucide-react'
import { ordersApi } from '@/lib/api'
import { useApi } from '@/hooks/useApi'

const STEPS = [
  { key: 'PENDING',    label: 'Order Placed',  icon: Clock },
  { key: 'CONFIRMED',  label: 'Confirmed',     icon: CheckCircle2 },
  { key: 'PROCESSING', label: 'Processing',    icon: Package },
  { key: 'SHIPPED',    label: 'Shipped',       icon: Truck },
  { key: 'DELIVERED',  label: 'Delivered',     icon: CheckCircle2 },
]

function TrackingTimeline({ status }: { status: string }) {
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm py-4">
        <XCircle size={18} /> Order cancelled
      </div>
    )
  }

  const currentIdx = STEPS.findIndex(s => s.key === status)
  return (
    <div className="flex items-start gap-0 overflow-x-auto pb-2">
      {STEPS.map((step, i) => {
        const done = i <= currentIdx
        const Icon = step.icon
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                done ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-gray-300'
              }`}>
                <Icon size={14} />
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight ${done ? 'text-black' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 mb-5 transition-colors ${i < currentIdx ? 'bg-black' : 'bg-gray-100'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function OrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>()
  const { data: order, loading, error } = useApi(
    () => ordersApi.getByNumber(orderNumber!),
    [orderNumber],
  )

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-600">{error ?? 'Order not found'}</p>
        <Link to="/orders" className="btn-black">Back to Orders</Link>
      </div>
    )
  }

  const addr = order.shippingAddress

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-content mx-auto px-6 lg:px-10 py-10">

        {/* Back */}
        <Link to="/orders" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-black transition-colors mb-6">
          <ChevronLeft size={14} /> All Orders
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="headline text-3xl mb-1" style={{ fontFamily: 'Anton, Impact, sans-serif' }}>
              ORDER #{order.orderNumber}
            </h1>
            <p className="text-xs text-gray-400">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">{order.currency} {order.total.toLocaleString()}</p>
            <p className={`text-xs font-semibold mt-1 ${
              order.paymentStatus === 'PAID' ? 'text-green-600' :
              order.paymentStatus === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
            }`}>{order.paymentStatus}</p>
          </div>
        </div>

        {/* Tracking */}
        <div className="border border-gray-100 p-6 mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-5">Order Status</h2>
          <TrackingTimeline status={order.status} />
          {order.trackingNumber && (
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 border-t border-gray-50 pt-4">
              <Truck size={13} />
              <span>Tracking: <strong className="text-black">{order.trackingNumber}</strong></span>
              {order.shippingCarrier && <span className="text-gray-400">via {order.shippingCarrier}</span>}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-6">

          {/* Items */}
          <div className="border border-gray-100 p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.12em] mb-5">
              Items ({order.items.length})
            </h2>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-14 h-[70px] bg-gray-50 shrink-0 overflow-hidden">
                    {item.imageUrl
                      ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-200"><Package size={20} /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.productId}`} className="text-sm font-medium hover:underline line-clamp-2">
                      {item.productName}
                    </Link>
                    <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                      <span>Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold shrink-0">
                    {order.currency} {item.lineTotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 mt-6 pt-5 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span>{order.currency} {order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span><span>-{order.currency} {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>{order.shippingCost === 0 ? 'Free' : `${order.currency} ${order.shippingCost.toLocaleString()}`}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span><span>{order.currency} {order.tax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
                <span>Total</span><span>{order.currency} {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            {/* Shipping address */}
            {addr && (
              <div className="border border-gray-100 p-5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] mb-3">
                  <MapPin size={12} /> Shipping To
                </div>
                <div className="text-sm space-y-0.5 text-gray-600">
                  <p className="font-semibold text-black">{addr.fullName}</p>
                  <p>{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>{addr.city}, {addr.stateProvince} {addr.postalCode}</p>
                  <p>{addr.country}</p>
                  <p className="text-gray-400 pt-1">{addr.phone}</p>
                </div>
              </div>
            )}

            {/* Dates */}
            <div className="border border-gray-100 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] mb-3">
                <CreditCard size={12} /> Timeline
              </div>
              <div className="space-y-2 text-xs text-gray-500">
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
                  <div className="flex justify-between text-green-600 font-semibold">
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
            {order.status === 'PENDING' && (
              <button className="btn-outline w-full justify-center text-red-600 border-red-200 hover:bg-red-50">
                Cancel Order
              </button>
            )}
            <Link to="/shop" className="btn-black w-full justify-center text-center block">
              Continue Shopping
            </Link>
          </div>

        </div>
      </div>
    </main>
  )
}
