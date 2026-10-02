import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Lock, CheckCircle2, Loader2, ChevronRight } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { addressApi, cartApi, ordersApi, ApiError } from '@/lib/api'

type Step = 'address' | 'payment'
const PLACEHOLDER = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&q=70'

// ─── Per-country postal code rules ──────────────────────────────────────────
const POSTAL_RULES: Record<string, { pattern: RegExp; example: string; label: string }> = {
  GB: { pattern: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, example: 'EC1A 1BB', label: 'Postcode' },
  US: { pattern: /^\d{5}(-\d{4})?$/, example: '10001', label: 'ZIP Code' },
  IN: { pattern: /^\d{6}$/, example: '110001', label: 'PIN Code' },
  CA: { pattern: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, example: 'M5V 3A8', label: 'Postal Code' },
  AU: { pattern: /^\d{4}$/, example: '2000', label: 'Postcode' },
  DE: { pattern: /^\d{5}$/, example: '10115', label: 'PLZ' },
  FR: { pattern: /^\d{5}$/, example: '75001', label: 'Code postal' },
  AE: { pattern: /^\d{5}$/, example: '00000', label: 'Postal Code' },
  SG: { pattern: /^\d{6}$/, example: '018956', label: 'Postal Code' },
}

const DEFAULT_POSTAL_RULE = { pattern: /^.{2,10}$/, example: '', label: 'Postal Code' }

function getPostalRule(country: string) {
  return POSTAL_RULES[country] ?? DEFAULT_POSTAL_RULE
}

// ─── Field-level validators ──────────────────────────────────────────────────
function validateField(field: string, value: string, country: string): string {
  switch (field) {
    case 'fullName': {
      if (!value.trim()) return 'Full name is required.'
      if (value.trim().length < 2) return 'Name must be at least 2 characters.'
      if (!/^[\p{L}\s''\-\.]+$/u.test(value.trim())) return 'Name contains invalid characters.'
      if (!value.trim().includes(' ')) return 'Please enter both first and last name.'
      return ''
    }
    case 'phone': {
      if (!value.trim()) return 'Phone number is required.'
      // Strip spaces, dashes, brackets for digit count check
      const digits = value.replace(/[\s\-().+]/g, '')
      if (!/^\+?[\d\s\-().]+$/.test(value)) return 'Enter a valid phone number.'
      if (digits.length < 7 || digits.length > 15) return 'Phone number must be 7–15 digits.'
      return ''
    }
    case 'line1': {
      if (!value.trim()) return 'Address line 1 is required.'
      if (value.trim().length < 5) return 'Please enter a complete street address.'
      if (!/\d/.test(value)) return 'Include a house/flat number.'
      return ''
    }
    case 'city': {
      if (!value.trim()) return 'City is required.'
      if (value.trim().length < 2) return 'Enter a valid city name.'
      if (!/^[\p{L}\s''\-\.]+$/u.test(value.trim())) return 'City name contains invalid characters.'
      return ''
    }
    case 'postalCode': {
      if (!value.trim()) return `${getPostalRule(country).label} is required.`
      if (!getPostalRule(country).pattern.test(value.trim())) {
        const ex = getPostalRule(country).example
        return `Invalid ${getPostalRule(country).label}.${ex ? ` Example: ${ex}` : ''}`
      }
      return ''
    }
    default:
      return ''
  }
}

type AddressKey = 'fullName' | 'phone' | 'line1' | 'line2' | 'city' | 'stateProvince' | 'postalCode' | 'country'
const VALIDATED_FIELDS: AddressKey[] = ['fullName', 'phone', 'line1', 'city', 'postalCode']

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const [step, setStep] = useState<Step>('address')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  const [address, setAddress] = useState({
    fullName: '', phone: '', line1: '', line2: '',
    city: '', stateProvince: '', postalCode: '', country: 'GB',
  })
  const [touched, setTouched] = useState<Partial<Record<AddressKey, boolean>>>({})
  const [payment, setPayment] = useState({ method: 'COD' })

  // Compute inline errors only for touched fields
  const fieldError = (k: AddressKey) =>
    touched[k] ? validateField(k, address[k], address.country) : ''

  const setA = (k: AddressKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value
    setAddress(p => ({ ...p, [k]: val }))
    // If country changes, re-validate postalCode immediately if already touched
    if (k === 'country') {
      setTouched(t => ({ ...t, postalCode: t.postalCode ?? false }))
    }
  }

  const onBlur = (k: AddressKey) => () => setTouched(t => ({ ...t, [k]: true }))

  const shipping = subtotal >= 100 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleAddressSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Touch all validated fields to show any hidden errors
    const allTouched = VALIDATED_FIELDS.reduce((acc, k) => ({ ...acc, [k]: true }), {} as Record<AddressKey, boolean>)
    setTouched(allTouched)

    const hasErrors = VALIDATED_FIELDS.some(k => validateField(k, address[k], address.country) !== '')
    if (hasErrors) return

    setStep('payment')
  }

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const addr = await addressApi.create({
        fullName: address.fullName,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 || undefined,
        city: address.city,
        stateProvince: address.stateProvince || undefined,
        postalCode: address.postalCode,
        country: address.country,
      })

      const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      const syncableItems = items.filter(item => UUID_RE.test(item.variantId))

      if (syncableItems.length === 0) {
        throw new ApiError(400, 'INVALID_CART',
          'Your cart contains demo items that cannot be ordered. Please browse the shop, add real products to your cart, and try again.')
      }

      let cartSynced = false
      try {
        await cartApi.clear().catch(() => {})
        let syncedCount = 0
        for (const item of syncableItems) {
          try {
            await cartApi.addItem(item.variantId, item.qty)
            syncedCount++
          } catch {
            // Individual item unavailable — skip it
          }
        }
        cartSynced = syncedCount > 0
      } catch {
        // Cart sync entirely unavailable — attempt checkout anyway
      }

      if (!cartSynced) {
        throw new ApiError(400, 'CART_SYNC_FAILED',
          'Could not add items to your cart. The selected variants may be out of stock. Please go back to the shop and re-add your items.')
      }

      // 3. Place order
      const order = await ordersApi.checkout({
        shippingAddressId: addr.id,
        paymentMethod: payment.method as 'STRIPE' | 'PAYPAL' | 'COD',
      })

      const pt = order.paymentToken
      if (payment.method === 'STRIPE' && pt && !pt.startsWith('SIMULATED_')) {
        // Real Stripe flow — stripe.confirmPayment({ clientSecret: pt })
      }

      clearCart()
      setOrderNumber(order.orderNumber)
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (orderNumber) {
    return (
      <main className="min-h-[80vh] bg-pearl flex items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={28} className="text-gold" />
          </div>
          <p className="eyebrow mb-3 text-gold">Order Confirmed</p>
          <h1 className="display-md text-navy mb-4">
            Your piece is<br />
            <em className="italic font-light text-gold">on its way.</em>
          </h1>
          <p className="text-sm text-stone mb-2">Order reference:</p>
          <p className="font-display text-xl text-navy mb-6">{orderNumber}</p>
          <p className="text-xs text-stone leading-relaxed mb-8">
            You'll receive a confirmation email shortly. Our team will be in touch if your order includes a custom piece.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={`/orders/${orderNumber}`} className="btn-gold">Track Order</Link>
            <Link to="/shop" className="btn-outline-gold">Continue Shopping</Link>
          </div>
        </div>
      </main>
    )
  }

  const postalLabel = getPostalRule(address.country).label
  const postalPlaceholder = getPostalRule(address.country).example

  return (
    <main className="bg-pearl min-h-screen">
      {/* Header */}
      <div className="border-b border-mist bg-pearl">
        <div className="container-astrimi py-5 flex items-center justify-between">
          <Link to="/" className="font-display text-xl tracking-[0.2em] text-navy">ASTRIMI</Link>
          <div className="flex items-center gap-1.5 text-xs text-stone">
            <Lock size={11} /> Secure checkout
          </div>
        </div>
      </div>

      {/* Breadcrumb stepper */}
      <div className="border-b border-mist bg-pearl">
        <div className="container-astrimi py-4">
          <div className="flex items-center gap-3 text-xs">
            <Link to="/shop" className="caption hover:text-gold transition-colors">Cart</Link>
            <ChevronRight size={10} className="text-stone" />
            <span className={step === 'address' ? 'text-navy font-medium' : 'text-stone'}>Delivery</span>
            <ChevronRight size={10} className="text-stone" />
            <span className={step === 'payment' ? 'text-navy font-medium' : 'text-stone'}>Payment</span>
          </div>
        </div>
      </div>

      <div className="container-astrimi py-10">
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">

          {/* Form */}
          <div>
            {/* Address step */}
            {step === 'address' && (
              <form onSubmit={handleAddressSubmit} noValidate className="space-y-6">
                <div>
                  <p className="eyebrow mb-2">01</p>
                  <h2 className="display-md text-navy mb-6">Delivery Address</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">

                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="caption mb-2 block uppercase tracking-widest">Full Name *</label>
                    <input
                      type="text" value={address.fullName}
                      onChange={setA('fullName')} onBlur={onBlur('fullName')}
                      className={`field ${fieldError('fullName') ? 'border-red-400 focus:border-red-400' : ''}`}
                      placeholder="Jane Doe"
                    />
                    {fieldError('fullName') && (
                      <p className="mt-1.5 text-[11px] text-red-500">{fieldError('fullName')}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="caption mb-2 block uppercase tracking-widest">Phone *</label>
                    <input
                      type="tel" value={address.phone}
                      onChange={setA('phone')} onBlur={onBlur('phone')}
                      className={`field ${fieldError('phone') ? 'border-red-400 focus:border-red-400' : ''}`}
                      placeholder="+44 7700 000000"
                    />
                    {fieldError('phone') && (
                      <p className="mt-1.5 text-[11px] text-red-500">{fieldError('phone')}</p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="caption mb-2 block uppercase tracking-widest">Country *</label>
                    <select
                      value={address.country} onChange={setA('country')}
                      onBlur={onBlur('country')} required className="field"
                    >
                      <option value="GB">United Kingdom</option>
                      <option value="IN">India</option>
                      <option value="US">United States</option>
                      <option value="AE">UAE</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                      <option value="SG">Singapore</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                    </select>
                  </div>

                  {/* Address Line 1 */}
                  <div className="sm:col-span-2">
                    <label className="caption mb-2 block uppercase tracking-widest">Address Line 1 *</label>
                    <input
                      type="text" value={address.line1}
                      onChange={setA('line1')} onBlur={onBlur('line1')}
                      className={`field ${fieldError('line1') ? 'border-red-400 focus:border-red-400' : ''}`}
                      placeholder="12 Savile Row"
                    />
                    {fieldError('line1') && (
                      <p className="mt-1.5 text-[11px] text-red-500">{fieldError('line1')}</p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div className="sm:col-span-2">
                    <label className="caption mb-2 block uppercase tracking-widest">Address Line 2</label>
                    <input
                      type="text" value={address.line2} onChange={setA('line2')}
                      className="field" placeholder="Apartment, suite, floor (optional)"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="caption mb-2 block uppercase tracking-widest">City *</label>
                    <input
                      type="text" value={address.city}
                      onChange={setA('city')} onBlur={onBlur('city')}
                      className={`field ${fieldError('city') ? 'border-red-400 focus:border-red-400' : ''}`}
                      placeholder="London"
                    />
                    {fieldError('city') && (
                      <p className="mt-1.5 text-[11px] text-red-500">{fieldError('city')}</p>
                    )}
                  </div>

                  {/* Postal code — label + placeholder update with country */}
                  <div>
                    <label className="caption mb-2 block uppercase tracking-widest">{postalLabel} *</label>
                    <input
                      type="text" value={address.postalCode}
                      onChange={setA('postalCode')} onBlur={onBlur('postalCode')}
                      className={`field ${fieldError('postalCode') ? 'border-red-400 focus:border-red-400' : ''}`}
                      placeholder={postalPlaceholder}
                    />
                    {fieldError('postalCode') && (
                      <p className="mt-1.5 text-[11px] text-red-500">{fieldError('postalCode')}</p>
                    )}
                  </div>

                  {/* State / County */}
                  <div>
                    <label className="caption mb-2 block uppercase tracking-widest">State / County</label>
                    <input
                      type="text" value={address.stateProvince}
                      onChange={setA('stateProvince')} className="field" placeholder="Optional"
                    />
                  </div>

                </div>
                <button type="submit" className="btn-navy w-full gap-2">
                  Continue to Payment <ChevronRight size={14} />
                </button>
              </form>
            )}

            {/* Payment step */}
            {step === 'payment' && (
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <button type="button" onClick={() => setStep('address')} className="caption hover:text-gold transition-colors">
                    ← Edit delivery
                  </button>
                </div>
                <div>
                  <p className="eyebrow mb-2">02</p>
                  <h2 className="display-md text-navy mb-6">Payment</h2>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-4 space-y-2">
                    <p>{error}</p>
                    {error.includes('demo') && (
                      <button
                        type="button"
                        onClick={() => { clearCart(); setError(null) }}
                        className="underline font-medium hover:text-red-800"
                      >
                        Clear cart and start fresh →
                      </button>
                    )}
                  </div>
                )}

                {/* Delivery summary */}
                <div className="bg-cream border border-mist p-5">
                  <p className="eyebrow mb-2 text-[9px]">Delivering to</p>
                  <p className="text-sm font-medium text-navy">{address.fullName}</p>
                  <p className="text-xs text-stone">{address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}, {address.postalCode}</p>
                  <p className="text-xs text-stone">{address.phone}</p>
                </div>

                {/* Payment method */}
                <div>
                  <p className="eyebrow mb-4">Payment Method</p>
                  <div className="space-y-3">
                    {[
                      { id: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                      { id: 'STRIPE', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex — via Stripe' },
                      { id: 'PAYPAL', label: 'PayPal', desc: 'Pay with your PayPal account' },
                    ].map(m => (
                      <label key={m.id} className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${
                        payment.method === m.id ? 'border-gold bg-gold/5' : 'border-mist hover:border-stone'
                      }`}>
                        <input type="radio" name="method" value={m.id}
                          checked={payment.method === m.id}
                          onChange={() => setPayment({ method: m.id })}
                          className="mt-0.5 accent-gold" />
                        <div>
                          <p className="text-sm font-medium text-navy">{m.label}</p>
                          <p className="text-xs text-stone">{m.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-gold w-full gap-2">
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? 'Placing order…' : `Place Order · $${total.toFixed(2)}`}
                </button>
                <p className="text-[10px] text-stone text-center">
                  By placing your order you agree to ASTRIMI's Terms of Service and Privacy Policy.
                </p>
              </form>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:sticky lg:top-24 bg-cream border border-mist p-6">
            <h3 className="eyebrow mb-5">Your Selection</h3>
            <div className="space-y-4 mb-6">
              {items.map(item => (
                <div key={`${item.variantId}-${item.size}`} className="flex gap-3">
                  <img src={item.imageUrl ?? PLACEHOLDER} alt={item.productName}
                    className="w-14 h-16 object-cover bg-pearl shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-navy leading-snug line-clamp-2">{item.productName}</p>
                    <p className="caption mt-0.5">
                      {[item.size, item.color].filter(Boolean).join(' · ')}
                    </p>
                    <p className="text-xs text-navy mt-1">${item.unitPrice.toFixed(2)} × {item.qty}</p>
                  </div>
                  <p className="text-xs font-medium text-navy shrink-0">
                    ${(item.unitPrice * item.qty).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="divider mb-4" />

            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between text-stone">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-gold">Free</span> : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-stone">
                <span>Tax (8%)</span><span>${tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="divider mb-4" />
            <div className="flex justify-between font-medium text-navy">
              <span>Total</span><span>${total.toFixed(2)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-[10px] text-stone mt-3">
                Free shipping on orders over $100
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
