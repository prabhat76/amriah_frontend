import { useState, FormEvent } from 'react'
import { CheckCircle2, Sparkles } from 'lucide-react'

const FABRIC_OPTIONS = ['Silk', 'Cotton', 'Linen', 'Chiffon', 'Georgette', 'Velvet', 'Banarasi Silk', 'Chanderi', 'Kantha', 'Other']
const GARMENT_TYPES = ['Saree', 'Lehenga', 'Kurta / Kurti', 'Anarkali', 'Salwar Suit', 'Blazer / Jacket', 'Dress', 'Co-ord Set', 'Dupatta', 'Other']

export default function CustomPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    garmentType: '', fabric: '', colour: '', size: '',
    occasion: '', budget: '', requirements: '',
    referenceImages: '',
  })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="min-h-[80vh] bg-pearl flex items-center justify-center px-6 py-20">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={28} className="text-gold" />
          </div>
          <h1 className="font-display text-4xl text-navy mb-4">
            Your Vision,<br />
            <em className="italic font-light text-gold">Received.</em>
          </h1>
          <p className="text-sm text-stone leading-relaxed mb-8">
            Thank you, {form.name}. Our team will review your custom order request and reach out to <strong>{form.email}</strong> within 2–3 business days to discuss your vision in detail.
          </p>
          <p className="italic-quote text-sm mb-8">
            "Your vision. Our craftsmanship. One unique piece."
          </p>
          <a href="/" className="btn-gold inline-flex">Return Home</a>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-pearl min-h-screen">

      {/* Hero */}
      <section className="bg-navy text-pearl py-20 text-center relative overflow-hidden">
        <div className="container-astrimi relative z-10">
          <p className="eyebrow text-gold mb-4">Our Speciality</p>
          <h1 className="display-xl text-pearl mb-4">
            Not Just Made.<br />
            <em className="italic font-light text-gold">Made for You.</em>
          </h1>
          <p className="text-sm text-stone max-w-lg mx-auto leading-relaxed">
            ASTRIMI is a custom-made and bespoke outfit specialist. Tell us your vision and our craftsmen will create something truly yours.
          </p>
        </div>
        <p className="absolute bottom-0 left-1/2 -translate-x-1/2 font-display text-[80px] leading-none text-white/5 select-none whitespace-nowrap">
          CUSTOM
        </p>
      </section>

      {/* Customisation options */}
      <section className="py-14 border-b border-mist">
        <div className="container-astrimi">
          <div className="grid md:grid-cols-3 gap-px bg-mist">
            {[
              { title: 'Buy As Shown', desc: 'Purchase the exact product photographed, available immediately subject to stock.', badge: 'Ready to Buy' },
              { title: 'Customise the Design', desc: 'Choose a different colour, fabric, quality, size, or finish on any ASTRIMI design.', badge: 'Customisable', highlighted: true },
              { title: 'Create Your Own Version', desc: 'Use an ASTRIMI design as inspiration and build a fully personalised piece with us.', badge: 'Bespoke' },
            ].map(opt => (
              <div key={opt.title} className={`p-8 ${opt.highlighted ? 'bg-navy text-pearl' : 'bg-pearl'}`}>
                <span className={`badge mb-4 inline-block ${opt.highlighted ? 'badge-gold' : 'badge-cream'}`}>
                  {opt.badge}
                </span>
                <h3 className={`font-display text-xl mb-3 ${opt.highlighted ? 'text-pearl' : 'text-navy'}`}>
                  {opt.title}
                </h3>
                <p className="text-sm text-stone leading-relaxed">{opt.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-20">
        <div className="container-astrimi max-w-2xl">
          <div className="text-center mb-12">
            <p className="eyebrow mb-3">Start Your Custom Order</p>
            <h2 className="display-md text-navy">Tell Us Your Vision</h2>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-10">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-3 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-colors ${
                  step >= s ? 'bg-gold text-navy' : 'bg-mist text-stone'
                }`}>
                  {s}
                </div>
                <p className={`text-xs ${step >= s ? 'text-navy' : 'text-stone'} hidden sm:block`}>
                  {s === 1 ? 'Your Details' : s === 2 ? 'Your Design' : 'Requirements'}
                </p>
                {s < 3 && <div className={`flex-1 h-px ${step > s ? 'bg-gold' : 'bg-mist'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Contact */}
            {step === 1 && (
              <>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="caption mb-2 block uppercase tracking-widest">Full Name *</label>
                    <input type="text" value={form.name} onChange={set('name')} required className="field" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="caption mb-2 block uppercase tracking-widest">Email *</label>
                    <input type="email" value={form.email} onChange={set('email')} required className="field" placeholder="you@email.com" />
                  </div>
                </div>
                <div>
                  <label className="caption mb-2 block uppercase tracking-widest">Phone (Optional)</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} className="field" placeholder="+44 000 000 0000" />
                </div>
                <button type="button" onClick={() => setStep(2)} className="btn-gold w-full">
                  Continue →
                </button>
              </>
            )}

            {/* Step 2: Design */}
            {step === 2 && (
              <>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="caption mb-2 block uppercase tracking-widest">Garment Type *</label>
                    <select value={form.garmentType} onChange={set('garmentType')} required className="field">
                      <option value="">Select…</option>
                      {GARMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="caption mb-2 block uppercase tracking-widest">Preferred Fabric</label>
                    <select value={form.fabric} onChange={set('fabric')} className="field">
                      <option value="">Select or describe below</option>
                      {FABRIC_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="caption mb-2 block uppercase tracking-widest">Colour Preference</label>
                    <input type="text" value={form.colour} onChange={set('colour')} className="field" placeholder="e.g. Deep emerald green" />
                  </div>
                  <div>
                    <label className="caption mb-2 block uppercase tracking-widest">Your Size</label>
                    <input type="text" value={form.size} onChange={set('size')} className="field" placeholder="e.g. UK 12 / measurements" />
                  </div>
                </div>
                <div>
                  <label className="caption mb-2 block uppercase tracking-widest">Occasion</label>
                  <input type="text" value={form.occasion} onChange={set('occasion')} className="field" placeholder="e.g. Wedding, formal event, everyday wear" />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1 border border-mist">
                    ← Back
                  </button>
                  <button type="button" onClick={() => setStep(3)} className="btn-gold flex-1">
                    Continue →
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Requirements */}
            {step === 3 && (
              <>
                <div>
                  <label className="caption mb-2 block uppercase tracking-widest">Approximate Budget</label>
                  <input type="text" value={form.budget} onChange={set('budget')} className="field" placeholder="e.g. £300–£500 / flexible" />
                </div>
                <div>
                  <label className="caption mb-2 block uppercase tracking-widest">Reference Images or Links (Optional)</label>
                  <input type="text" value={form.referenceImages} onChange={set('referenceImages')} className="field" placeholder="Paste image links or describe inspiration" />
                </div>
                <div>
                  <label className="caption mb-2 block uppercase tracking-widest">Additional Requirements *</label>
                  <textarea
                    value={form.requirements}
                    onChange={set('requirements')}
                    required
                    rows={5}
                    className="field resize-none"
                    placeholder="Tell us everything about your vision — embroidery details, neckline, sleeve length, embellishments, any special requirements…"
                  />
                </div>
                <div className="bg-cream p-5 border border-mist">
                  <p className="text-xs text-stone leading-relaxed">
                    <span className="text-gold font-medium">✦ What happens next:</span> Our team will review your request and contact you within 2–3 business days to discuss your vision, provide a detailed quote, and begin the design process.
                  </p>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(2)} className="btn-ghost flex-1 border border-mist">
                    ← Back
                  </button>
                  <button type="submit" className="btn-gold flex-1 gap-2">
                    Submit Request <Sparkles size={14} />
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </section>
    </main>
  )
}
