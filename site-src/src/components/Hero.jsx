import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { IconRegister, IconTable, IconChart, IconKey } from './Icons.jsx'

const rise = (delay) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] } })

export default function Hero() {
  const cardRef = useRef(null)
  useEffect(() => {
    if (cardRef.current) gsap.to(cardRef.current, { y: -10, duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  }, [])

  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-20 md:pt-36">
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-24 h-[440px] w-[440px] rounded-full opacity-70 blur-[10px]" style={{ background: 'radial-gradient(circle, rgba(234,88,12,.16), rgba(234,88,12,0) 65%)' }} />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
        <div>
          <motion.span {...rise(0)} className="mb-5 inline-flex items-center gap-2 rounded-full bg-brand-light px-3.5 py-1.5 font-sans text-[.72rem] font-semibold uppercase tracking-[.07em] text-brand-dark">
            <IconRegister width={14} height={14} /> Restaurant Point of Sale
          </motion.span>
          <h1 className="mb-5 max-w-xl font-display text-[clamp(2.1rem,5vw,3.4rem)] font-extrabold leading-[1.1] tracking-tight text-balance">
            <motion.span {...rise(0.06)} className="block">Billing, tables, and reports</motion.span>
            <motion.span {...rise(0.14)} className="block text-brand">— running the floor.</motion.span>
          </h1>
          <motion.p {...rise(0.24)} className="mb-8 max-w-[46ch] text-[1.08rem] leading-relaxed text-ink-soft text-pretty">
            Servemint is a complete restaurant POS — instant billing, live table status, reservations, inventory, and daily sales reports, all in one clean dashboard your staff will actually enjoy using.
          </motion.p>
          <motion.div {...rise(0.32)} className="mb-9 flex flex-wrap gap-3">
            <a href="app.html" className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3.5 font-semibold text-white shadow-[0_10px_22px_rgba(234,88,12,.28)] transition-transform hover:-translate-y-0.5">
              Try Live Demo <IconKey width={17} height={17} />
            </a>
            <a href="#features" className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-6 py-3.5 font-semibold text-ink transition-colors hover:border-brand hover:bg-brand-light">
              See Features
            </a>
          </motion.div>
          <motion.div {...rise(0.4)} className="flex flex-wrap gap-x-6 gap-y-2 text-[.88rem] font-medium text-ink-soft">
            <span className="inline-flex items-center gap-2"><IconRegister width={16} height={16} /> Full POS &amp; billing</span>
            <span className="inline-flex items-center gap-2"><IconTable width={16} height={16} /> Live table status</span>
            <span className="inline-flex items-center gap-2"><IconChart width={16} height={16} /> Daily sales reports</span>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
          <div ref={cardRef} className="rounded-2xl border border-border bg-surface p-6 shadow-[0_30px_70px_-30px_rgba(194,65,12,.35)]">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <div className="font-display text-[1.02rem] font-bold">Table 7 · Receipt</div>
              <span className="rounded-full bg-green-light px-3 py-1 font-sans text-[.68rem] font-bold uppercase text-green">Paid</span>
            </div>
            {[['Chicken Biryani ×2', '₹600.00'], ['Masala Chai ×2', '₹60.00'], ['Discount (10%)', '-₹66.00'], ['CGST+SGST 5%', '₹29.70']].map(([label, val]) => (
              <div key={label} className="flex justify-between py-2 text-[.9rem] text-ink-soft"><span>{label}</span><span>{val}</span></div>
            ))}
            <div className="mt-3 flex justify-between border-t border-border pt-3 font-display text-[1.15rem] font-bold"><span>Total Paid</span><span>₹623.70</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
