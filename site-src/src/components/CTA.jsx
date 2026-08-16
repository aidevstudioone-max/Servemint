import { motion } from 'framer-motion'
import Reveal from './Reveal.jsx'
import { IconKey } from './Icons.jsx'

export default function CTA() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand to-brand-dark p-10 text-center text-white md:p-16">
          <motion.div aria-hidden animate={{ rotate: 360 }} transition={{ duration: 36, repeat: Infinity, ease: 'linear' }} className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
          <h2 className="relative mb-3 font-display text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold tracking-tight">Ready to see Orderly in action?</h2>
          <p className="relative mx-auto mb-8 max-w-[46ch] text-[1.02rem] text-white/85">No sign-up, no setup — log in with the demo account and try the full thing.</p>
          <a href="app.html" className="relative inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 font-bold text-brand-dark transition-transform hover:-translate-y-0.5">
            Try Live Demo <IconKey width={17} height={17} />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
