import { motion } from 'framer-motion'
import Reveal from './Reveal.jsx'
import { IconKey } from './Icons.jsx'

export default function LivePreview() {
  return (
    <section id="preview" className="border-t border-border bg-paper-alt py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto mb-12 max-w-[54ch] text-center">
          <span className="mb-4 inline-block rounded-full bg-brand-light px-3.5 py-1.5 font-sans text-[.72rem] font-semibold uppercase tracking-[.07em] text-brand-dark">Live Preview</span>
          <h2 className="mb-4 font-display text-[clamp(1.8rem,3.6vw,2.5rem)] font-extrabold leading-[1.15] tracking-tight">This isn't a mockup. It's the actual app.</h2>
          <p className="text-[1.02rem] leading-relaxed text-ink-soft text-pretty">What you see below is Orderly running live — log in with the demo credentials and try the full thing yourself.</p>
        </Reveal>
        <Reveal delay={0.1}>
          <motion.div whileHover={{ y: -4 }} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_30px_70px_-30px_rgba(194,65,12,.35)]">
            <div className="flex items-center gap-2 border-b border-border bg-paper-alt px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f5c4a2]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f0d6a8]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#b9d4bd]" />
              <span className="ml-3 font-sans text-[.75rem] text-ink-soft">orderly.app/dashboard</span>
            </div>
            <div className="h-[420px] overflow-hidden md:h-[560px]">
              <iframe src="app.html" title="Orderly live preview" loading="lazy" tabIndex={-1} aria-hidden="true" className="h-full w-full border-0" />
            </div>
          </motion.div>
          <div className="mt-8 text-center">
            <a href="app.html" className="inline-flex items-center gap-2 rounded-lg bg-brand px-7 py-3.5 font-semibold text-white shadow-[0_10px_22px_rgba(234,88,12,.28)] transition-transform hover:-translate-y-0.5">
              Open Full Demo <IconKey width={17} height={17} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
