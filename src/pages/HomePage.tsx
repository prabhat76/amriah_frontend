import 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ChevronRight } from 'lucide-react'
import { products as localProducts } from '@/data/products'
import ProductCard from '@/components/ProductCard'
import { ProductSummary } from '@/lib/api'

const TEXTILE_IMAGE = 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80'
const SARI_IMAGE = 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=80'

// Convert local Product to ProductSummary shape for ProductCard
function toSummary(p: typeof localProducts[0]): ProductSummary {
  return {
    id: String(p.id),
    name: p.name,
    slug: p.name.toLowerCase().replace(/\s+/g, '-'),
    sku: `ASTRIMI-${p.id}`,
    shortDescription: p.description,
    mainImageUrl: p.image,
    price: p.price,
    compareAtPrice: p.originalPrice ?? null,
    averageRating: p.rating,
    reviewCount: p.reviewCount,
    featured: true,
    newArrival: p.badge === 'new',
    categoryId: String(p.id),
    categoryName: p.category,
    brandId: null,
    brandName: 'ASTRIMI',
    minVariantPrice: p.price,
  }
}

export default function HomePage() {
  const featured = localProducts.slice(0, 8).map(toSummary)

  return (
    <main className="bg-pearl">

      {/* ═══════════════════════════════════════════════════════
          HERO — Static ASTRIMI banner
      ═══════════════════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden">
        <Link to="/shop">
          <img
            src="/astrimi-banner.jpg"
            alt="ASTRIMI — Inspired by Jaipur. Designed for You."
            className="w-full h-auto block cursor-pointer hover:opacity-95 transition-opacity"
            style={{ maxHeight: '95vh', objectFit: 'cover', objectPosition: 'center' }}
          />
        </Link>
      </section>

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

          {featured.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 gap-y-10">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : null}

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
