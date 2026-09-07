import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react'
import { productsApi, bannerApi, ProductSummary, BannerResponse } from '@/lib/api'
import ProductCard from '@/components/ProductCard'

const TEXTILE_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80'
const SARI_IMAGE = 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80'

export default function HomePage() {
  const [featured, setFeatured] = useState<ProductSummary[]>([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [banners, setBanners] = useState<BannerResponse[]>([])
  const [bannerIdx, setBannerIdx] = useState(0)

  useEffect(() => {
    productsApi.featured(0, 8)
      .then(res => setFeatured(res.content))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false))
    bannerApi.list()
      .then(setBanners)
      .catch(() => {})
  }, [])

  // Auto-advance banner carousel
  useEffect(() => {
    if (banners.length < 2) return
    const t = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 5000)
    return () => clearInterval(t)
  }, [banners.length])

  const activeBanner = banners[bannerIdx]

  return (
    <main className="bg-pearl">

      {/* ═══════════════════════════════════════════════════════
          HERO — API Banner carousel (or static fallback)
      ═══════════════════════════════════════════════════════ */}
      {activeBanner ? (
        <section className="relative min-h-[80vh] sm:min-h-screen overflow-hidden">
          {/* Background image */}
          <img
            src={activeBanner.imageUrl}
            alt={activeBanner.title ?? 'Banner'}
            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/40 to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-24 min-h-[80vh]">
            {activeBanner.title && (
              <h1 className="font-display text-pearl leading-[0.9] mb-4 animate-fade-up"
                  style={{ fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}>
                {activeBanner.title}
              </h1>
            )}
            {activeBanner.subtitle && (
              <p className="text-sm text-stone leading-relaxed max-w-sm mb-8">{activeBanner.subtitle}</p>
            )}
            {activeBanner.ctaText && activeBanner.ctaLink && (
              <Link to={activeBanner.ctaLink} className="btn-gold w-fit">
                {activeBanner.ctaText}
              </Link>
            )}
          </div>

          {/* Carousel controls */}
          {banners.length > 1 && (
            <>
              <button
                onClick={() => setBannerIdx(i => (i - 1 + banners.length) % banners.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setBannerIdx(i => (i + 1) % banners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
                aria-label="Next"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setBannerIdx(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === bannerIdx ? 'bg-gold' : 'bg-white/40'}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      ) : (
        /* Static fallback hero — uses actual ASTRIMI brand banner */
        <section className="relative w-full overflow-hidden">
          <img
            src="/astrimi-banner.jpg"
            alt="ASTRIMI — Inspired by Jaipur. Designed for You."
            className="w-full h-auto block"
            style={{ maxHeight: '95vh', objectFit: 'cover', objectPosition: 'center' }}
          />
          {/* CTA overlay at bottom-center */}
          <div className="absolute inset-0 flex items-end justify-center pb-8 sm:pb-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 px-8 py-3 bg-[#2a1f14]/90 text-[#e8d5a3] text-xs tracking-[0.25em] uppercase font-medium hover:bg-[#2a1f14] transition-colors"
            >
              Explore Collection <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          BRAND PHILOSOPHY — 3 values
      ═══════════════════════════════════════════════════════ */}
      <section className="section border-b border-mist">
        <div className="container-astrimi">
          <div className="grid md:grid-cols-3 gap-8 md:gap-16">
            {[
              { icon: '✦', title: 'Custom Made', body: 'Every piece can be created exactly to your vision. Size, colour, fabric, finish — truly yours.' },
              { icon: '◈', title: 'Indian Textiles', body: 'We combine centuries of Indian craftsmanship with contemporary design to create pieces made to be remembered.' },
              { icon: '◇', title: 'Rare by Design', body: 'ASTRIMI is not for everyone — it is for those who understand the value of quiet luxury and timeless elegance.' },
            ].map(v => (
              <div key={v.title} className="text-center">
                <div className="text-gold text-2xl mb-4">{v.icon}</div>
                <h3 className="font-display text-xl text-navy mb-3">{v.title}</h3>
                <p className="text-sm text-stone leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ═══════════════════════════════════════════════════════ */}
      <section className="section">
        <div className="container-astrimi">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="eyebrow mb-2">The Collection</p>
              <h2 className="display-lg text-navy">Pieces Made<br /><em className="italic font-light text-gold">to be Remembered</em></h2>
            </div>
            <Link to="/shop" className="btn-ghost hidden sm:flex items-center gap-2">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loadingFeatured ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] shimmer" />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 gap-y-10">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            // Placeholder when backend returns empty
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 gap-y-10">
              {PLACEHOLDER_PRODUCTS.map((p, i) => (
                <div key={i} className="card-product">
                  <div className="aspect-[3/4] bg-cream overflow-hidden">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="pt-3">
                    <p className="eyebrow text-[9px] mb-1">{p.cat}</p>
                    <h3 className="text-sm font-medium text-navy">{p.name}</h3>
                    <p className="text-sm text-navy mt-1">${p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12 sm:hidden">
            <Link to="/shop" className="btn-outline-gold btn-sm">View All Pieces</Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CUSTOM MADE BANNER
      ═══════════════════════════════════════════════════════ */}
      <section className="section bg-navy text-pearl overflow-hidden relative">
        <div className="container-astrimi relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="eyebrow text-gold mb-4">Our Speciality</p>
              <h2 className="display-lg text-pearl mb-6">
                Not Just Made.<br />
                <em className="italic font-light text-gold">Made for You.</em>
              </h2>
              <p className="text-sm text-stone leading-relaxed mb-6 max-w-md">
                ASTRIMI is a custom-made and bespoke outfit specialist. We don't believe customers should choose from what's already available.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['Size', 'Colour', 'Fabric', 'Finish', 'Design Details', 'Personal Requirements'].map(opt => (
                  <div key={opt} className="flex items-center gap-2 text-xs text-stone">
                    <span className="text-gold text-[8px]">✦</span>
                    {opt}
                  </div>
                ))}
              </div>
              <p className="italic-quote text-cream/80 text-sm mb-8 border-l-2 border-gold pl-5">
                "Your vision. Our craftsmanship.<br />One unique piece."
              </p>
              <Link to="/custom" className="btn-gold">
                Start Your Custom Order <ArrowRight size={14} />
              </Link>
            </div>
            <div className="relative">
              <img
                src={TEXTILE_IMAGE}
                alt="Custom craftsmanship"
                className="w-full aspect-square object-cover"
              />
              <div className="absolute -bottom-4 -left-4 bg-gold text-navy p-5 max-w-[200px]">
                <p className="font-display text-3xl font-light leading-none mb-1">100%</p>
                <p className="text-xs tracking-widest uppercase">Bespoke &<br />Custom Made</p>
              </div>
            </div>
          </div>
        </div>
        {/* Gold dust decorative text */}
        <p className="absolute bottom-0 right-0 font-display text-[120px] leading-none text-white/5 select-none whitespace-nowrap">
          CUSTOM
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3 OPTIONS — Buy / Customise / Create
      ═══════════════════════════════════════════════════════ */}
      <section className="section border-y border-mist">
        <div className="container-astrimi">
          <div className="text-center mb-14">
            <p className="eyebrow mb-3">One Design. Many Possibilities.</p>
            <h2 className="display-md text-navy">
              See it. Love it.<br />
              <em className="italic font-light text-gold">Make it yours.</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-1">
            {[
              {
                num: '01',
                title: 'Buy As Shown',
                desc: 'Purchase the exact piece displayed — real ASTRIMI products, available immediately.',
                cta: 'Shop Now',
                to: '/shop?type=ready',
                badge: 'Ready to Buy',
              },
              {
                num: '02',
                title: 'Customise the Design',
                desc: 'Choose a different colour, fabric, size or finish. The same artistry — your personal vision.',
                cta: 'Customise',
                to: '/custom',
                badge: 'Customisable',
                featured: true,
              },
              {
                num: '03',
                title: 'Create Your Own',
                desc: 'Use ASTRIMI as inspiration and create an entirely personalised version with our craftsmen.',
                cta: 'Get Started',
                to: '/custom#create',
                badge: 'Bespoke',
              },
            ].map(opt => (
              <div key={opt.num} className={`p-8 ${opt.featured ? 'bg-navy text-pearl' : 'bg-cream'}`}>
                <p className={`font-display text-4xl font-light mb-2 ${opt.featured ? 'text-gold' : 'text-mist'}`}>
                  {opt.num}
                </p>
                <span className={`badge mb-4 inline-block ${opt.featured ? 'badge-gold' : 'badge-cream'}`}>
                  {opt.badge}
                </span>
                <h3 className={`font-display text-2xl mb-3 ${opt.featured ? 'text-pearl' : 'text-navy'}`}>
                  {opt.title}
                </h3>
                <p className={`text-sm leading-relaxed mb-6 ${opt.featured ? 'text-stone' : 'text-stone'}`}>
                  {opt.desc}
                </p>
                <Link
                  to={opt.to}
                  className={`btn btn-sm inline-flex items-center gap-2 ${
                    opt.featured ? 'btn-gold' : 'btn-outline-gold'
                  }`}
                >
                  {opt.cta} <ArrowRight size={12} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRE-ORDERS
      ═══════════════════════════════════════════════════════ */}
      <section className="section-cream section">
        <div className="container-astrimi">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img src={SARI_IMAGE} alt="Pre-order collection" className="w-full aspect-[4/3] object-cover" />
            </div>
            <div>
              <p className="eyebrow mb-3">Designed with Intention</p>
              <h2 className="display-md text-navy mb-5">
                Pre-Order —<br />
                <em className="italic font-light text-gold">Produced with Purpose</em>
              </h2>
              <p className="text-sm text-stone leading-relaxed mb-5 max-w-md">
                Discover a design, choose your options, and place your order before production begins. ASTRIMI creates pieces specifically for you — reducing waste and ensuring every detail is perfect.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Greater customisation options',
                  'Produced only when ordered',
                  'Conscious, considered fashion',
                  'Your piece from start to finish',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-stone">
                    <span className="text-gold mt-0.5">✦</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/shop?type=preorder" className="btn-navy inline-flex items-center gap-2">
                View Pre-Orders <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          COMMUNITY / PHILOSOPHY
      ═══════════════════════════════════════════════════════ */}
      <section className="section bg-navy text-pearl text-center relative overflow-hidden">
        <div className="container-astrimi narrow relative z-10">
          <p className="eyebrow text-gold mb-6">Our Philosophy</p>
          <blockquote className="font-display italic text-pearl leading-relaxed mb-8"
                      style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
            "True luxury doesn't follow trends.<br />
            It is felt in the quality of a fabric, seen in the precision of craftsmanship<br />
            and <span className="text-gold">remembered through the experience.</span>"
          </blockquote>
          <div className="divider-gold mx-auto mb-8" />
          <p className="text-sm text-stone leading-relaxed max-w-lg mx-auto mb-10">
            We believe fashion should speak quietly — but leave a lasting impression. Less noise. More presence. Heritage reimagined. Craftsmanship without borders.
          </p>
          <Link to="/story" className="btn-outline-cream btn-sm inline-flex items-center gap-2">
            Our Story <ArrowRight size={12} />
          </Link>
        </div>
        <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-display text-[100px] sm:text-[160px] leading-none text-white/5 select-none whitespace-nowrap">
          ASTRIMI
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════
          COMMUNITY CALLOUT
      ═══════════════════════════════════════════════════════ */}
      <section className="section border-t border-mist">
        <div className="container-astrimi text-center">
          <p className="eyebrow mb-4">Build Community</p>
          <h2 className="display-md text-navy mb-5">
            People don't only buy clothes.<br />
            <em className="italic font-light text-gold">They buy a feeling.</em>
          </h2>
          <p className="text-sm text-stone max-w-xl mx-auto leading-relaxed mb-10">
            Become part of a community that believes in individuality, craftsmanship, creativity, timeless style and self-expression. ASTRIMI is a world you'll want to belong to.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {['Individuality', 'Craftsmanship', 'Creativity', 'Timeless Style', 'Self-Expression'].map(v => (
              <span key={v} className="badge-cream text-xs px-4 py-2 tracking-widest uppercase font-medium">
                {v}
              </span>
            ))}
          </div>
          <Link to="/shop" className="btn-gold">
            Discover ASTRIMI <Sparkles size={14} />
          </Link>
        </div>
      </section>

    </main>
  )
}

// Placeholder products when backend is empty
const PLACEHOLDER_PRODUCTS = [
  { name: 'Silk Embroidered Kurta', cat: 'Custom Made', price: '280', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80' },
  { name: 'Banarasi Silk Saree', cat: 'Ready to Buy', price: '420', img: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80' },
  { name: 'Chanderi Co-ord Set', cat: 'Pre-Order', price: '350', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { name: 'Zardozi Lehenga', cat: 'Bespoke', price: '890', img: 'https://images.unsplash.com/photo-1519851856928-ba6e3f81b26b?w=600&q=80' },
  { name: 'Linen Anarkali', cat: 'Custom Made', price: '320', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80' },
  { name: 'Kantha Work Tunic', cat: 'Ready to Buy', price: '195', img: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80' },
  { name: 'Ikat Print Dress', cat: 'Pre-Order', price: '240', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80' },
  { name: 'Velvet Blazer', cat: 'Custom Made', price: '480', img: 'https://images.unsplash.com/photo-1519851856928-ba6e3f81b26b?w=600&q=80' },
]
