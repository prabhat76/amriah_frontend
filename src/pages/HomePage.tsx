import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { products } from '@/data/products'
import ProductCard from '@/components/ProductCard'

export default function HomePage() {
  const newThisWeek = products.slice(0, 4)
  const collections = products.slice(0, 3)

  return (
    <main className="bg-white">

      {/* ══ HERO ══ */}
      <section className="border-b border-gray-200">
        <div className="max-w-content mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-[1fr_1fr] min-h-[82vh] items-center gap-0">

            {/* Left: text */}
            <div className="py-16 lg:py-24 order-2 lg:order-1">
              <p className="eyebrow mb-4">New Collection · Summer 2024</p>

              <h1
                className="headline text-[5rem] sm:text-[7rem] lg:text-[8rem] xl:text-[9rem] leading-[0.9] text-black mb-2"
              >
                NEW<br />
                COLLEC<br />
                TION
              </h1>

              <p className="text-sm text-gray-500 mt-6 max-w-xs leading-relaxed">
                An elegant vogue — we blend creativity with craftsmanship to create fashion
                that transcends trends and stands the test of time.
              </p>

              <div className="mt-8">
                <Link to="/shop" className="btn-black">
                  Go To Shop <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Right: product duo */}
            <div className="relative order-1 lg:order-2 h-[55vw] lg:h-full max-h-[640px] flex items-end justify-center gap-4 pb-0 overflow-hidden">
              {/* Tall image */}
              <div className="w-[45%] h-[90%] bg-gray-100 overflow-hidden self-end">
                <img
                  src="https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=600&q=85"
                  alt="New Collection"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              {/* Short image */}
              <div className="w-[42%] h-[72%] bg-gray-100 overflow-hidden self-end">
                <img
                  src="https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=85"
                  alt="New Collection 2"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ NEW THIS WEEK ══ */}
      <section className="py-14 border-b border-gray-200">
        <div className="max-w-content mx-auto px-6 lg:px-10">

          {/* Section header */}
          <div className="flex items-end justify-between mb-8">
            <div className="flex items-end gap-4">
              <h2 className="headline text-4xl sm:text-5xl text-black">
                NEW THIS WEEK
              </h2>
              <span className="text-sm text-gray-400 mb-1">({newThisWeek.length})</span>
            </div>
            <Link to="/shop" className="text-xs font-semibold uppercase tracking-widest hover:opacity-60 transition-opacity flex items-center gap-1">
              See All <ArrowRight size={12} />
            </Link>
          </div>

          {/* Products row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {newThisWeek.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ XIV COLLECTIONS 23–24 ══ */}
      <section className="py-14 border-b border-gray-200">
        <div className="max-w-content mx-auto px-6 lg:px-10">

          {/* Section header with filter bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <h2 className="headline text-4xl sm:text-5xl text-black">
              XIV COLLECTIONS<br className="sm:hidden" />
              <span className="text-gray-400"> 23–24</span>
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="text-gray-400 uppercase tracking-wider">Filters:</span>
              {['Price', 'Sort By', 'View'].map(f => (
                <button
                  key={f}
                  className="border border-gray-200 px-3 py-1.5 text-xs font-medium uppercase tracking-wide hover:border-black transition-colors"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* 3-col grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {collections.map(p => (
              <div key={p.id} className="group">
                <Link to={`/product/${p.id}`} className="block">
                  <div className="product-img aspect-[3/4]">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="eyebrow">{p.category}</p>
                      <h3 className="text-sm font-medium text-black mt-0.5 leading-snug">{p.name}</h3>
                    </div>
                    <p className="text-sm font-semibold text-black shrink-0">$ {p.price}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/shop" className="btn-outline">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ══ OUR APPROACH TO FASHION DESIGN ══ */}
      <section className="py-20 border-b border-gray-200">
        <div className="max-w-content mx-auto px-6 lg:px-10">
          <div className="text-center max-w-lg mx-auto mb-12">
            <h2 className="text-xl font-semibold text-black tracking-tight">
              OUR APPROACH TO FASHION DESIGN
            </h2>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              At elegant vogue — we blend creativity with craftsmanship to create fashion that
              transcends trends and stands the test of time. Each design is meticulously crafted,
              ensuring the highest quality, exquisite finish.
            </p>
          </div>

          {/* Photo collage */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500&q=80',
              'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=500&q=80',
              'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80',
              'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=80',
            ].map((src, i) => (
              <div
                key={i}
                className={`overflow-hidden bg-gray-100 ${i === 0 || i === 3 ? 'aspect-[3/4]' : 'aspect-[3/5]'}`}
              >
                <img src={src} alt="Fashion" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BRAND FOOTER MARK ══ */}
      <section className="py-20">
        <div className="max-w-content mx-auto px-6 lg:px-10 text-center">
          <p
            className="headline text-[6rem] sm:text-[9rem] lg:text-[12rem] leading-none text-black opacity-[0.06] select-none"
          >
            XIV QR
          </p>
          <div className="-mt-8 relative z-10">
            <Link to="/shop" className="btn-black mx-auto">
              Explore Collection <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
