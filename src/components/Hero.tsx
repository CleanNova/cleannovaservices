import { useState } from 'react';
import { ArrowRight, Check, MessageCircle } from 'lucide-react';
import { SERVICE_ORDER, type ServiceId } from '../config/pricing';
import { links } from '../config/site';
import { useI18n } from '../i18n';
import { estimate, isHomeService, usd } from '../lib/quote';
import type { Seed } from '../App';
import { Counter } from './Counter';

export function Hero({ onStart }: { onStart: (seed: Partial<Seed>) => void }) {
  const { t } = useI18n();
  const e = t.hero.estimator;
  const [service, setService] = useState<ServiceId>('standard');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);

  const homeLike = isHomeService(service);
  const est = estimate({
    service,
    bedrooms,
    bathrooms,
    homeSize: 's2',
    officeSize: 'o2',
    frequency: 'once',
    extras: [],
  });

  return (
    <section className="hero" id="top">
      <div className="hero-bg" aria-hidden="true">
        <span className="blob blob--1" />
        <span className="blob blob--2" />
      </div>

      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">{t.hero.eyebrow}</p>
          <h1>
            {t.hero.titleA} <span className="grad">{t.hero.titleB}</span>
          </h1>
          <p className="lead">{t.hero.sub}</p>

          <div className="hero-cta">
            <a href="#quote" className="btn btn--primary btn--lg">
              {t.hero.cta} <ArrowRight size={18} aria-hidden="true" />
            </a>
            <a href={links.whatsapp()} className="btn btn--ghost btn--lg" target="_blank" rel="noopener noreferrer">
              <MessageCircle size={18} aria-hidden="true" /> {t.hero.ctaSecondary}
            </a>
          </div>

          <ul className="chips">
            {t.hero.chips.map((c) => (
              <li key={c}>
                <Check size={16} aria-hidden="true" /> {c}
              </li>
            ))}
          </ul>
        </div>

        <div className="estimator card-glass" aria-labelledby="est-title">
          <h2 id="est-title" className="estimator-title">
            {e.title}
          </h2>

          <label className="field">
            <span>{e.service}</span>
            <select value={service} onChange={(ev) => setService(ev.target.value as ServiceId)}>
              {SERVICE_ORDER.map((s) => (
                <option key={s} value={s}>
                  {t.services.items[s].name}
                </option>
              ))}
            </select>
          </label>

          {homeLike ? (
            <div className="counters">
              <Counter
                label={e.bedrooms}
                value={bedrooms}
                min={0}
                max={6}
                format={(n) => (n === 0 ? e.studio : String(n))}
                onChange={setBedrooms}
              />
              <Counter label={e.bathrooms} value={bathrooms} min={1} max={5} onChange={setBathrooms} />
            </div>
          ) : null}

          <div className="estimator-result" aria-live="polite">
            {est.kind === 'range' ? (
              <>
                <span className="estimator-from">{e.from}</span>
                <strong>
                  {usd(est.low)} – {usd(est.high)}
                </strong>
                <span className="estimator-per">{e.perVisit}</span>
              </>
            ) : (
              <>
                <strong>{e.custom}</strong>
                <span className="estimator-per">{e.customNote}</span>
              </>
            )}
          </div>

          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => onStart({ service, bedrooms, bathrooms })}
          >
            {e.cta} <ArrowRight size={18} aria-hidden="true" />
          </button>
          <p className="fine">{e.note}</p>
        </div>
      </div>
    </section>
  );
}
