import { motion } from 'framer-motion'
import Reveal, { RevealStagger, staggerItem } from './Reveal.jsx'
import { IconRegister, IconTable, IconCalendar, IconChart, IconBoxes, IconBook } from './Icons.jsx'

const FEATURES = [
  { icon: IconRegister, title: 'Fast POS billing', body: 'Tap to add items, apply discounts, split half/full portions, and check out in seconds.' },
  { icon: IconTable, title: 'Live table status', body: "See every table's Free / Occupied / Reserved status on one floor plan, updated instantly." },
  { icon: IconCalendar, title: 'Reservations', body: 'Take bookings, assign tables ahead of time, and never double-book a party again.' },
  { icon: IconChart, title: 'Dashboard & daily reports', body: 'Revenue, bill count, payment mix, and top-selling items — updated the moment an order lands.' },
  { icon: IconBoxes, title: 'Inventory & staff', body: 'Track stock levels with low-stock alerts, and manage staff accounts with role-based access.' },
  { icon: IconBook, title: 'Ledger & customer history', body: 'Every transaction and every regular customer, searchable in one place.' },
]

export default function Features() {
  return (
    <section id="features" className="border-t border-border py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto mb-14 max-w-[54ch] text-center">
          <span className="mb-4 inline-block rounded-full bg-brand-light px-3.5 py-1.5 font-sans text-[.72rem] font-semibold uppercase tracking-[.07em] text-brand-dark">Features</span>
          <h2 className="mb-4 font-display text-[clamp(1.8rem,3.6vw,2.5rem)] font-extrabold leading-[1.15] tracking-tight">Everything the front of house needs.</h2>
        </Reveal>
        <RevealStagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <motion.div key={title} variants={staggerItem} whileHover={{ y: -6 }} className="rounded-xl border border-border bg-surface p-6 transition-shadow hover:shadow-[0_20px_40px_-25px_rgba(194,65,12,.35)]">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-brand-light text-brand-dark"><Icon width={19} height={19} /></div>
              <h3 className="mb-2 font-display text-[1.02rem] font-bold">{title}</h3>
              <p className="text-[.86rem] leading-relaxed text-ink-soft">{body}</p>
            </motion.div>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}
