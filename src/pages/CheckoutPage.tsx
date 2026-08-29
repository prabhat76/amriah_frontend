import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Lock, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { addressApi, ordersApi, ApiError } from '@/lib/api'

type Step = 'information' | 'shipping' | 'payment'

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const navigate = useNavigate()

  const [step, setStep] = useState<Step>('information')
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const [form, setForm] = useState({
    email: '',
    firstName: '', lastName: '',
    address: '', city: '', state: '', zip: '', phone: '',
    shipping: 'standard',
    card: '', name: '', expiry: '', cvv: '',
    coupon: '',
  })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const shippingCost = form.shipping === 'express' ? 199 : subtotal > 36 ? 0 : 99
  const total = subtotal + shippingCost

  const steps: Step[] = ['information', 'shipping', 'payment']
  const stepIdx = steps.indexOf(step)

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)
    setSubmitting(true)

    try {
      // 1. Create (or reuse) shipping address
      const addr = await addressApi.create({
        fullName: `${form.firstName} ${form.lastName}`,
        phone: form.phone,
        line1: form.address,
        city: form.city,
        stateProvince: form.state,
        postalCode: form.zip,
        country: 'IN',
      })

      // 2. Place the order
      const order = await ordersApi.checkout({
        shippingAddressId: addr.id,
        paymentMethod: 'CARD',
        couponCode: form.coupon || undefined,
      })

      // 3. Clear local cart and redirect to order confirmation
      clearCart()
      navigate(`/orders/${order.orderNumber}`, { replace: true })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.'
      setApiError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center bg-white">
        <div className="max-w-sm text-center px-6">
          <CheckCircle2 size={40} className="mx-auto text-gray-200 mb-6" />
          <h1 className="headline text-4xl mb-4" style={{ fontFamily: 'Anton, Impact, sans-serif' }}>
            CART IS EMPTY
          </h1>
          <Link to="/shop" className="btn-black w-full justify-center block mt-4">
            Browse Products
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 lg:px-10 py-5">
        <div className="max-w-content mx-auto flex items-center justify-between">
          <Link to="/" className="headline text-2xl" style={{ fontFamily: 'Anton, Impact, sans-serif' }}>
            XIV QR
          </Link>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Lock size={11} /> Secure checkout
          </div>
        </div>
      </div>

      <div className="max-w-content mx-auto px-6 lg:px-10 py-10">
        <div className="grid lg:grid-cols-[1fr_360px] gap-12 items-start">

          {/* ── FORM SIDE ── */}
          <div>
            <h1 className="headline text-4xl mb-2" style={{ fontFamily: 'Anton, Impact, sans-serif' }}>
              CHECKOUT
            </h1>

            {/* Step tabs */}
            <div className="flex items-center gap-1 mb-8 text-xs">
              {steps.map((s, i) => (
                <span key={s} className="flex items-center gap-1">
                  <button
                    disabled={i > stepIdx}
                    onClick={() => i < stepIdx && setStep(s)}
                    className={`capitalize font-medium transition-colors ${
                      i === stepIdx ? 'text-black' :
                      i < stepIdx ? 'text-gray-400 hover:text-black cursor-pointer underline' :
                      'text-gray-300'
                    }`}
                  >
                    {s}
                  </button>
                  {i < steps.length - 1 && <ChevronRight size={10} className="text-gray-300" />}
                </span>
              ))}
            </div>

            {/* Global API error */}
            {apiError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-5">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                {apiError}
              </div>
            )}

            {/* ── INFORMATION ── */}
            {step === 'information' && (
              <form onSubmit={e => { e.preventDefault(); setStep('shipping') }} className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3">Contact Info</p>
                  <input placeholder="Email" type="email" required value={form.email} onChange={set('email')} className="field" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3">Shipping Address</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="First name" required value={form.firstName} onChange={set('firstName')} className="field" />
                      <input placeholder="Last name" required value={form.lastName} onChange={set('lastName')} className="field" />
                    </div>
                    <input placeholder="Address" required value={form.address} onChange={set('address')} className="field" />
                    <div className="grid grid-cols-3 gap-3">
                      <input placeholder="City" required value={form.city} onChange={set('city')} className="field" />
                      <input placeholder="State" required value={form.state} onChange={set('state')} className="field" />
                      <input placeholder="ZIP / PIN" required value={form.zip} onChange={set('zip')} className="field" />
                    </div>
                    <input placeholder="Phone" type="tel" required value={form.phone} onChange={set('phone')} className="field" />
                  </div>
                </div>
                <button type="submit" className="btn-black w-full justify-between mt-4">
                  Continue to Shipping <ChevronRight size={14} />
                </button>
              </form>
            )}

            {/* ── SHIPPING ── */}
            {step === 'shipping' && (
              <form onSubmit={e => { e.preventDefault(); setStep('payment') }} className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3">Shipping Method</p>
                {[
                  { id: 'standard', label: 'Standard Delivery', detail: '5–7 business days', price: subtotal > 36 ? 'Free' : '₹99' },
                  { id: 'express',  label: 'Express Delivery',  detail: '2–3 business days', price: '₹199' },
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-between gap-4 p-4 border-2 cursor-pointer transition-colors ${
                      form.shipping === opt.id ? 'border-black' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input type="radio" name="shipping" value={opt.id} checked={form.shipping === opt.id} onChange={set('shipping')} className="accent-black" />
                      <div>
                        <p className="text-sm font-semibold">{opt.label}</p>
                        <p className="text-xs text-gray-400">{opt.detail}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">{opt.price}</span>
                  </label>
                ))}
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep('information')} className="btn-outline">Back</button>
                  <button type="submit" className="btn-black flex-1 justify-between">
                    Continue to Payment <ChevronRight size={14} />
                  </button>
                </div>
              </form>
            )}

            {/* ── PAYMENT ── */}
            {step === 'payment' && (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3">Payment Details</p>
                <input placeholder="Card number" required maxLength={19} value={form.card} onChange={set('card')} className="field font-mono tracking-widest" />
                <input placeholder="Name on card" required value={form.name} onChange={set('name')} className="field" />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="MM / YY" required maxLength={7} value={form.expiry} onChange={set('expiry')} className="field font-mono" />
                  <input placeholder="CVV" required maxLength={4} value={form.cvv} onChange={set('cvv')} className="field font-mono" />
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setStep('shipping')} className="btn-outline" disabled={submitting}>
                    Back
                  </button>
                  <button type="submit" disabled={submitting} className="btn-black flex-1 justify-between gap-2">
                    {submitting
                      ? <><Loader2 size={14} className="animate-spin" /> Placing order…</>
                      : <><Lock size={13} /> Pay ₹{total.toLocaleString('en-IN')} <ChevronRight size={14} /></>
                    }
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── ORDER SUMMARY ── */}
          <div className="border border-gray-100 p-6 space-y-5 lg:sticky lg:top-24">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em]">Your Order</h2>

            <div className="space-y-4 max-h-56 overflow-y-auto">
              {items.map(item => (
                <div key={`${item.product.id}-${item.variantId}`} className="flex items-center gap-3">
                  <div className="relative w-14 h-[70px] bg-gray-50 overflow-hidden shrink-0">
                    <img src={item.product.mainImageUrl ?? 'https://placehold.co/56x70?text=—'} alt={item.product.name} className="w-full h-full object-cover" />
                    <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.qty}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug line-clamp-2">{item.product.name}</p>
                    {item.size && <p className="text-[10px] text-gray-400 mt-0.5">{item.size}</p>}
                  </div>
                  <span className="text-xs font-semibold shrink-0">$ {(item.product.price * item.qty).toFixed(0)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4" />

            {/* Coupon */}
            <div className="flex gap-2">
              <input
                placeholder="Coupon code"
                className="field text-xs py-2"
                value={form.coupon}
                onChange={set('coupon')}
              />
              <button type="button" className="btn-outline btn-sm shrink-0">Apply</button>
            </div>

            <div className="border-t border-gray-100 pt-4" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
              </div>
              <div className="border-t border-gray-100 pt-2" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>$ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
