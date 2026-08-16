import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconMenu, IconClose, IconRegister } from './Icons.jsx'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#preview', label: 'Live Preview' },
  { href: '#pricing', label: 'Pricing' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${scrolled ? 'border-border bg-paper/85 backdrop-blur-md' : 'border-transparent bg-transparent'}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5 font-display text-[1.15rem] font-bold text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-[8px] bg-brand text-white">
            <IconRegister width={16} height={16} />
          </span>
          Orderly
        </a>
        <ul className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
          {LINKS.map((l) => (<li key={l.href}><a href={l.href} className="transition-colors hover:text-brand">{l.label}</a></li>))}
        </ul>
        <div className="flex items-center gap-3">
          <a href="app.html" className="hidden rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(234,88,12,.28)] transition-transform hover:-translate-y-0.5 md:inline-block">
            Try Live Demo
          </a>
          <button aria-label="Toggle menu" onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-md border border-border text-ink md:hidden">
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} className="overflow-hidden border-b border-border bg-paper md:hidden">
            <ul className="flex flex-col gap-1 px-6 py-4">
              {LINKS.map((l) => (<li key={l.href}><a href={l.href} onClick={() => setOpen(false)} className="block py-2 text-ink-soft">{l.label}</a></li>))}
              <li><a href="app.html" className="mt-2 block rounded-lg bg-brand px-5 py-3 text-center text-sm font-semibold text-white">Try Live Demo</a></li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
