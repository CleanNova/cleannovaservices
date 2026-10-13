import { useCallback, useState } from 'react';
import type { ServiceId } from './config/pricing';
import { useI18n } from './i18n';
import { BookingWizard } from './components/booking/BookingWizard';
import { Footer, FloatingBar } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Areas, Contact, Faq, HowItWorks, Organization, Pricing, Services, Strip } from './components/Sections';

/** Pre-fills the booking form (from the hero estimator or a service card). `n` re-mounts the wizard. */
export interface Seed {
  n: number;
  service?: ServiceId;
  bedrooms?: number;
  bathrooms?: number;
}

export default function App() {
  const { t } = useI18n();
  const [seed, setSeed] = useState<Seed>({ n: 0 });

  const start = useCallback((s: Partial<Seed>) => {
    setSeed((prev) => ({ ...s, n: prev.n + 1 }));
    requestAnimationFrame(() => document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        {t.nav.skip}
      </a>
      <Header />
      <main id="main">
        <Hero onStart={start} />
        <Strip />
        <Services onStart={start} />
        <HowItWorks />
        <Pricing onStart={start} />
        <Organization onStart={start} />
        <Areas />
        <section className="section section--quote" id="quote">
          <div className="container">
            <div className="section-head section-head--center">
              <p className="eyebrow">{t.booking.eyebrow}</p>
              <h2>{t.booking.title}</h2>
              <p className="lead">{t.booking.sub}</p>
            </div>
            <BookingWizard key={seed.n} seed={seed} />
          </div>
        </section>
        <Faq />
        <Contact />
      </main>
      <Footer />
      <FloatingBar />
    </>
  );
}
