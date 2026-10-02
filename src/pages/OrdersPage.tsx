import { Link } from 'react-router-dom'
import { Package, ChevronRight, Truck, Loader2 } from 'lucide-react'
import { ordersApi, OrderResponse } from '@/lib/api'
import { useApi } from '@/hooks/useApi'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING:    { label: 'Pending',    color: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  CONFIRMED:  { label: 'Confirmed',  color: 'text-blue-700 bg-blue-50 border-blue-200' },
  PROCESSING: { label: 'Processing', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  SHIPPED:    { label: 'Shipped',    color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  DELIVERED:  { label: 'Delivered',  color: 'text-green-700 bg-green-50 border-green-200' },
  CANCELLED:  { label: 'Cancelled',  color: 'text-red-700 bg-red-50 border-red-200' },
  RETURNED:   { label: 'Returned',   color: 'text-orange-700 bg-orange-50 border-orange-200' },
  REFUNDED:   { label: 'Refunded',   color: 'text-teal-700 bg-teal-50 border-teal-200' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: 'text-stone bg-cream border-mist' }
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 border ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function OrderCard({ order }: { order: OrderResponse }) {
  const first = order.items[0]
  return (
    <Link
      to={`/orders/${order.orderNumber}`}
      className="block border border-mist hover:border-gold transition-colors bg-pearl"
    >
      <div className="p-5 flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-16 h-20 bg-cream shrink-0 overflow-hidden">
          {first?.imageUrl
            ? <img src={first.imageUrl} alt={first.productName} className="w-full h-full object-cover object-top" />
            : <div className="w-full h-full flex items-center justify-center text-stone"><Package size={20} /></div>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="caption mb-0.5">Order {order.orderNumber}</p>
              <p className="text-sm font-medium text-navy leading-snug">
                {first?.productName}
                {order.items.length > 1 && (
                  <span className="text-stone font-normal"> +{order.items.length - 1} more</span>
                )}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <span className="text-[10px] text-stone">
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="text-sm font-medium text-navy">
              {order.currency} {order.total.toFixed(2)}
            </span>
            {order.trackingNumber && (
              <span className="caption flex items-center gap-1">
                <Truck size={10} /> {order.trackingNumber}
              </span>
            )}
          </div>
        </div>

        <ChevronRight size={14} className="text-stone shrink-0 mt-1" />
      </div>
    </Link>
  )
}

export default function OrdersPage() {
  const { data, loading, error } = useApi(() => ordersApi.list(0, 20), [])

  return (
    <main className="bg-pearl min-h-screen">
      <div className="container-astrimi py-12">
        <p className="eyebrow mb-3">Your Account</p>
        <h1 className="font-display text-4xl sm:text-5xl text-navy mb-10">My Orders</h1>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gold/40" />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Link to="/shop" className="btn-outline-gold">Browse Products</Link>
          </div>
        )}

        {!loading && !error && data?.content.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-cream flex items-center justify-center mx-auto mb-5">
              <Package size={24} className="text-stone" />
            </div>
            <h2 className="font-display text-2xl text-navy mb-3">No orders yet</h2>
            <p className="text-sm text-stone mb-8">Your order history will appear here once you make a purchase.</p>
            <Link to="/shop" className="btn-gold">Explore Collection</Link>
          </div>
        )}

        {data && data.content.length > 0 && (
          <div className="space-y-3">
            {data.content.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
