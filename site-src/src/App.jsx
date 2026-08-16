import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Features from './components/Features.jsx'
import LivePreview from './components/LivePreview.jsx'
import Pricing from './components/Pricing.jsx'
import CTA from './components/CTA.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <LivePreview />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
