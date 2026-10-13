import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, ChevronDown, Mail, MapPin, MessageCircle, Phone, Search } from 'lucide-react';
import { areas, findAreaByZip } from '../config/areas';
import {
  extras,
  frequencyFactor,
  sampleLayouts,
  SERVICE_ORDER,
  type Frequency,
  type HomeServiceId,
  type ServiceId,
} from '../config/pricing';
import { links, site } from '../config/site';
import { fmt, useI18n } from '../i18n';
import { estimate, usd } from '../lib/quote';
import type { Seed } from '../App';
import { serviceIcons } from './icons';

type Start = (seed: Partial<Seed>) => void;

function Heading({ eyebrow, title, sub, center = true }: { eyebrow: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div className={`section-head${center ? ' section-head--center' : ''}`}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {sub ? <p className="lead">{sub}</p> : null}
    </div>
  );
}

export function Strip() {
  const { t } = useI18n();
  return (
    <div className="container">
      <ul className="strip">
        {t.strip.map((s) => (
          <li key={s}>
            <Check size={16} aria-hidden="true" /> {s}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Services({ onStart }: { onStart: Start }) {
  const { t } = useI18n();
  const grid = SERVICE_ORDER.filter((s) => s !== 'organization');
  return (
    <section className="section" id="services">
      <div className="container">
        <Heading eyebrow={t.services.eyebrow} title={t.services.title} sub={t.services.sub} />
        <div className="grid grid--3">
          {grid.map((id) => {
            const copy = t.services.items[id];
            const Icon = serviceIcons[id];
            return (
              <article key={id} className="card service">
                {id === 'standard' ? <span className="badge">{t.services.popular}</span> : null}
                <span className="service-icon">
                  <Icon size={26} aria-hidden="true" />
                </span>
                <h3>{copy.name}</h3>
                <p>{copy.short}</p>
                <details className="service-includes">
                  <summary>
                    {t.services.includes} <ChevronDown size={16} aria-hidden="true" />
                  </summary>
                  <ul>
                    {copy.includes.map((i) => (
                      <li key={i}>
                        <Check size={14} aria-hidden="true" /> {i}
                      </li>
                    ))}
                  </ul>
                </details>
                <button type="button" className="btn btn--soft" onClick={() => onStart({ service: id })}>
                  {t.services.request} <ArrowRight size={16} aria-hidden="true" />
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const { t } = useI18n();
  return (
    <section className="section section--tint" id="how">
      <div className="container">
        <Heading eyebrow={t.how.eyebrow} title={t.how.title} sub={t.how.sub} />
        <ol className="steps">
          {t.how.steps.map((s, i) => (
            <li key={s.title} className="step">
              <span className="step-n">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const PRICE_COLS: ('standard' | 'deep' | 'move')[] = ['standard', 'deep', 'move'];
const FREQS: Frequency[] = ['once', 'weekly', 'biweekly', 'monthly'];

export function Pricing({ onStart }: { onStart: Start }) {
  const { t } = useI18n();
  const p = t.pricing;

  const fromPrice = (service: HomeServiceId, bedrooms: number, bathrooms: number) => {
    const e = estimate({
      service,
      bedrooms,
      bathrooms,
      homeSize: 's2',
      officeSize: 'o1',
      frequency: 'once',
      extras: [],
    });
    return e.kind === 'range' ? e.low : 0;
  };

  return (
    <section className="section" id="pricing">
      <div className="container">
        <Heading eyebrow={p.eyebrow} title={p.title} sub={p.sub} />

        <div className="price-table-wrap">
          <table className="price-table">
            <thead>
              <tr>
                <th scope="col">{p.layoutCol}</th>
                {PRICE_COLS.map((c) => (
                  <th key={c} scope="col">
                    {p.cols[c]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sampleLayouts.map((l) => (
                <tr key={l.id}>
                  <th scope="row">{p.layouts[l.id]}</th>
                  {PRICE_COLS.map((c) => (
                    <td key={c}>
                      <span className="from">{p.from}</span> <strong>{usd(fromPrice(c, l.bedrooms, l.bathrooms))}</strong>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fine fine--center">{p.disclaimer}</p>

        <div className="pricing-extras">
          <div className="card">
            <h3>{p.freqTitle}</h3>
            <p className="muted">{p.freqSub}</p>
            <ul className="freq">
              {FREQS.map((f) => {
                const pct = Math.round((1 - frequencyFactor[f]) * 100);
                return (
                  <li key={f}>
                    <span>{p.frequencies[f]}</span>
                    {pct > 0 ? (
                      <span className="pill pill--accent">
                        {p.save} {pct}%
                      </span>
                    ) : (
                      <span className="pill">—</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card">
            <h3>{p.extrasTitle}</h3>
            <ul className="extras-list">
              {extras.map((x) => (
                <li key={x.id}>
                  <span>{p.extras[x.id]}</span>
                  <strong>+{usd(x.price)}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="card card--accent">
            <h3>{p.customTitle}</h3>
            <p>{p.customText}</p>
            <button type="button" className="btn btn--light" onClick={() => onStart({ service: 'office' })}>
              {p.customCta} <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Organization({ onStart }: { onStart: Start }) {
  const { t } = useI18n();
  const o = t.org;
  const Icon = serviceIcons.organization;
  return (
    <section className="section">
      <div className="container">
        <div className="org">
          <div className="org-art" aria-hidden="true">
            <span className="org-icon">
              <Icon size={54} />
            </span>
            <span className="org-tile org-tile--1" />
            <span className="org-tile org-tile--2" />
            <span className="org-tile org-tile--3" />
            <span className="org-tile org-tile--4" />
          </div>
          <div className="org-copy">
            <p className="eyebrow eyebrow--light">{o.eyebrow}</p>
            <h2>{o.title}</h2>
            <p>{o.text}</p>
            <ul className="org-list">
              {o.items.map((i) => (
                <li key={i}>
                  <Check size={16} aria-hidden="true" /> {i}
                </li>
              ))}
            </ul>
            <button type="button" className="btn btn--light" onClick={() => onStart({ service: 'organization' as ServiceId })}>
              {o.cta} <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Areas() {
  const { t } = useI18n();
  const a = t.areas;
  const [zip, setZip] = useState('');
  const [result, setResult] = useState<null | { kind: 'ok'; city: string; zip: string } | { kind: 'no'; zip: string } | { kind: 'bad' }>(null);

  const check = (e: FormEvent) => {
    e.preventDefault();
    const z = zip.trim();
    if (!/^\d{5}$/.test(z)) return setResult({ kind: 'bad' });
    const area = findAreaByZip(z);
    setResult(area ? { kind: 'ok', city: area.city, zip: z } : { kind: 'no', zip: z });
  };

  return (
    <section className="section section--tint" id="areas">
      <div className="container areas">
        <div>
          <Heading eyebrow={a.eyebrow} title={a.title} sub={a.sub} center={false} />
          <form className="zip-form" onSubmit={check} noValidate>
            <label className="field field--inline">
              <span className="sr-only">{a.zipLabel}</span>
              <input
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                placeholder={a.zipPlaceholder}
                value={zip}
                onChange={(e) => {
                  setZip(e.target.value.replace(/\D/g, ''));
                  setResult(null);
                }}
                aria-label={a.zipLabel}
              />
            </label>
            <button type="submit" className="btn btn--primary">
              <Search size={16} aria-hidden="true" /> {a.check}
            </button>
          </form>
          <div className="zip-result" role="status" aria-live="polite">
            {result?.kind === 'ok' ? (
              <p className="ok">
                <Check size={16} aria-hidden="true" /> {fmt(a.ok, { city: result.city, zip: result.zip })}
              </p>
            ) : null}
            {result?.kind === 'no' ? <p className="warn">{fmt(a.no, { zip: result.zip })}</p> : null}
            {result?.kind === 'bad' ? <p className="warn">{a.invalid}</p> : null}
          </div>
        </div>

        <div className="card">
          <h3>{a.citiesTitle}</h3>
          <ul className="city-list">
            {areas.map((c) => (
              <li key={c.city}>
                <MapPin size={14} aria-hidden="true" /> {c.city}
              </li>
            ))}
          </ul>
          <p className="fine">{a.more}</p>
        </div>
      </div>
    </section>
  );
}

export function Faq() {
  const { t } = useI18n();
  return (
    <section className="section" id="faq">
      <div className="container container--narrow">
        <Heading eyebrow={t.faq.eyebrow} title={t.faq.title} />
        <div className="faq">
          {t.faq.items.map((it) => (
            <details key={it.q}>
              <summary>
                {it.q} <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const { t } = useI18n();
  const c = t.contact;
  return (
    <section className="section section--tint" id="contact">
      <div className="container">
        <Heading eyebrow={c.eyebrow} title={c.title} sub={c.sub} />
        <div className="grid grid--3">
          <a className="card contact-card" href={links.tel}>
            <span className="service-icon">
              <Phone size={24} aria-hidden="true" />
            </span>
            <h3>{c.call}</h3>
            <p>{site.phoneDisplay}</p>
          </a>
          <a className="card contact-card" href={links.whatsapp()} target="_blank" rel="noopener noreferrer">
            <span className="service-icon">
              <MessageCircle size={24} aria-hidden="true" />
            </span>
            <h3>{c.whatsapp}</h3>
            <p>{site.phoneDisplay}</p>
          </a>
          <a className="card contact-card" href={links.mailto}>
            <span className="service-icon">
              <Mail size={24} aria-hidden="true" />
            </span>
            <h3>{c.email}</h3>
            <p>{site.email}</p>
          </a>
        </div>
        <p className="contact-owner">
          {c.ask} <strong>{site.owner}</strong>
        </p>
      </div>
    </section>
  );
}
