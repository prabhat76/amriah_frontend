import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function StoryPage() {
  return (
    <main className="bg-pearl">

      {/* Hero */}
      <section className="bg-navy text-pearl py-24 text-center relative overflow-hidden">
        <div className="container-astrimi relative z-10">
          <p className="eyebrow text-gold mb-4">Our Story</p>
          <h1 className="display-xl text-pearl mb-5">
            Shine Your<br />
            <em className="italic font-light text-gold">Own Light.</em>
          </h1>
          <p className="text-sm text-stone max-w-md mx-auto leading-relaxed">
            ASTRIMI is more than textile and more than a fashion label. It is a world of light, craftsmanship, individuality and timeless design.
          </p>
        </div>
      </section>

      {/* Identity */}
      <section className="section" id="identity">
        <div className="container-astrimi grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="eyebrow mb-4">Brand Identity</p>
            <h2 className="display-md text-navy mb-5">
              Inspired by a Star.<br />
              <em className="italic font-light text-gold">Born Rare.</em>
            </h2>
            <p className="text-sm text-stone leading-relaxed mb-5">
              ASTRIMI draws its soul from the idea of a star — a little light, a radiant presence, a guiding glow. The brand represents individuality, confidence, beauty and inner light.
            </p>
            <p className="text-sm text-stone leading-relaxed mb-8">
              We combine the richness of traditional Indian textiles, skilled craftsmanship and contemporary design to create pieces that are made to be remembered.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Premium', 'Elegant', 'Timeless', 'Artistic', 'Sophisticated', 'Global', 'Personal'].map(v => (
                <span key={v} className="badge-cream">{v}</span>
              ))}
            </div>
          </div>
          <div className="bg-cream aspect-square flex items-center justify-center p-10">
            <div className="text-center">
              <p className="font-display text-7xl text-gold/20 leading-none mb-4">✦</p>
              <p className="font-display italic text-2xl text-navy mb-4">
                "Not for everyone.<br />For the ones who<br />glow differently."
              </p>
              <div className="divider-gold mx-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="section bg-navy text-pearl" id="craftsmanship">
        <div className="container-astrimi text-center">
          <p className="eyebrow text-gold mb-4">Craftsmanship</p>
          <h2 className="display-md text-pearl mb-6">
            Heritage Reimagined.<br />
            <em className="italic font-light text-gold">Craftsmanship Without Borders.</em>
          </h2>
          <p className="text-sm text-stone max-w-2xl mx-auto leading-relaxed mb-16">
            Every ASTRIMI piece is a collaboration between traditional Indian artisans and contemporary design. Our craftsmen bring centuries of knowledge — from Banarasi weaving to Zardozi embroidery — to each commission.
          </p>
          <div className="grid sm:grid-cols-3 gap-px bg-white/10">
            {[
              { title: 'Traditional Weaving', desc: "Banarasi silk, Chanderi, Kantha — India's finest textile traditions brought to life." },
              { title: 'Hand Embroidery', desc: 'Zardozi, Chikankari, mirror work — embellishments that transform fabric into art.' },
              { title: 'Contemporary Design', desc: 'Heritage reimagined for the modern world — timeless by nature, relevant by design.' },
            ].map(c => (
              <div key={c.title} className="bg-ink p-8 text-left">
                <div className="text-gold text-xl mb-4">✦</div>
                <h3 className="font-display text-xl text-pearl mb-3">{c.title}</h3>
                <p className="text-xs text-stone leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision + Philosophy */}
      <section className="section" id="vision">
        <div className="container-astrimi max-w-narrow mx-auto text-center">
          <p className="eyebrow mb-4">Our Philosophy</p>
          <h2 className="display-md text-navy mb-6">
            Less Noise.<br />
            <em className="italic font-light text-gold">More Presence.</em>
          </h2>
          <blockquote className="italic-quote border-l-2 border-gold pl-6 text-left mb-10 max-w-lg mx-auto">
            "True luxury doesn't follow trends. It is felt in the quality of a fabric, seen in the precision of craftsmanship and remembered through the experience."
          </blockquote>
          <div className="divider-gold mx-auto mb-8" />
          <p className="text-sm text-stone leading-relaxed mb-10">
            We believe fashion should speak quietly — but leave a lasting impression. Our vision is to build ASTRIMI into a globally recognised brand, connecting authentic craftsmanship with customers, designers and fashion lovers around the world.
          </p>
        </div>
      </section>

      {/* Community */}
      <section className="section bg-cream" id="community">
        <div className="container-astrimi text-center">
          <p className="eyebrow mb-4">Community</p>
          <h2 className="display-md text-navy mb-5">
            Don't just buy a product.<br />
            <em className="italic font-light text-gold">Join a world.</em>
          </h2>
          <p className="text-sm text-stone max-w-xl mx-auto leading-relaxed mb-10">
            People buy a feeling. They buy an identity. They buy a story. ASTRIMI makes customers feel they are becoming one with the brand, not simply purchasing a product.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {['Individuality', 'Craftsmanship', 'Creativity', 'Timeless Style', 'Self-Expression'].map(v => (
              <span key={v} className="badge-cream text-xs px-5 py-2 tracking-widest uppercase">{v}</span>
            ))}
          </div>
          <Link to="/shop" className="btn-gold inline-flex items-center gap-2">
            Discover the Collection <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  )
}
