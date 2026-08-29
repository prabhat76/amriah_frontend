import { Link } from 'react-router-dom'
import { Package, ChevronRight, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react'
import { ordersApi, OrderResponse } from '@/lib/api'
import { useApi } from '@/hooks/useApi'

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  PENDING:    { label: 'Pending',    icon: <Clock size={14} />,        color: 'text-yellow-600 bg-yellow-50' },
  CONFIRMED:  { label: 'Confirmed',  icon: <CheckCircle2 size={14} />, color: 'text-blue-600 bg-blue-50' },
  PROCESSING: { label: 'Processing', icon: <Package size={14} />,      color: 'text-purple-600 bg-purple-50' },
  SHIPPED:    { label: 'Shipped',    icon: <Truck size={14} />,        color: 'text-indigo-600 bg-indigo-50' },
  DELIVERED:  { label: 'Delivered',  icon: <CheckCircle2 size={14} />, color: 'text-green-600 bg-green-50' },
  CANCELLED:  { label: 'Cancelled',  icon: <XCircle size={14} />,      color: 'text-red-600 bg-red-50' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, icon: null, color: 'text-gray-600 bg-gray-50' }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 ${cfg.color}`}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function OrderCard({ order }: { order: OrderResponse }) {
  const first = order.items[0]
  return (
    <Link
      to={`/orders/${order.orderNumber}`}
      className="block border border-gray-100 hover:border-gray-300 transition-colors"
    >
      <div className="p-5 flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-16 h-20 bg-gray-50 shrink-0 overflow-hidden">
          {first?.imageUrl
            ? <img src={first.imageUrl} alt={first.productName} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24} /></div>
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Order #{order.orderNumber}</p>
              <p className="text-sm font-semibold leading-snug">
                {first?.productName}
                {order.items.length > 1 && (
                  <span className="text-gray-400 font-normal"> +{order.items.length - 1} more</span>
                )}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 flex-wrap">
            <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="text-black font-semibold">
              {order.currency} {order.total.toLocaleString()}
            </span>
            {order.trackingNumber && (
              <span className="text-gray-400">Tracking: {order.trackingNumber}</span>
            )}
          </div>
        </div>

        <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" />
      </div>
    </Link>
  )
}

export default function OrdersPage() {
  const { data, loading, error } = useApi(() => ordersApi.list(0, 20), [])

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-content mx-auto px-6 lg:px-10 py-10">
        <h1 className="headline text-4xl mb-8" style={{ fontFamily: 'Anton, Impact, sans-serif' }}>
          MY ORDERS
        </h1>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <Link to="/shop" className="btn-black">Browse Products</Link>
          </div>
        )}

        {!loading && !error && data?.content.length === 0 && (
          <div className="text-center py-20">
            <Package size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-sm text-gray-500 mb-6">You haven&apos;t placed any orders yet.</p>
            <Link to="/shop" className="btn-black">Start Shopping</Link>
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
