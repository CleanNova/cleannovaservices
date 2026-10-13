import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, CalendarDays, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { findAreaByZip } from '../../config/areas';
import {
  extras as extraCatalog,
  homeSizes,
  officeSizes,
  SERVICE_ORDER,
  type ExtraId,
  type Frequency,
  type HomeSizeId,
  type OfficeSizeId,
  type ServiceId,
} from '../../config/pricing';
import { links, site } from '../../config/site';
import { fmt, useI18n } from '../../i18n';
import { estimate, isCustom, isHomeService, isRecurring, usd } from '../../lib/quote';
import {
  hasEndpoint,
  mailtoUrl,
  requestToText,
  sendToEndpoint,
  whatsappUrl,
  type RequestPayload,
} from '../../lib/submit';
import type { Seed } from '../../App';
import { Counter } from '../Counter';
import { serviceIcons } from '../icons';

type Window = 'morning' | 'afternoon' | 'flexible';
type Preferred = 'call' | 'whatsapp' | 'text' | 'email';
type Phase = 'form' | 'sending' | 'sent' | 'fallback' | 'failed';

interface FormState {
  service: ServiceId;
  bedrooms: number;
  bathrooms: number;
  homeSize: HomeSizeId;
  officeSize: OfficeSizeId;
  frequency: Frequency;
  extras: ExtraId[];
  date: string;
  window: Window;
  name: string;
  phone: string;
  email: string;
  address: string;
  zip: string;
  notes: string;
  preferred: Preferred;
  website: string; // honeypot — must stay empty
}

type Errors = Partial<Record<'date' | 'name' | 'phone' | 'email' | 'address' | 'zip', string>>;

const FREQS: Frequency[] = ['once', 'weekly', 'biweekly', 'monthly'];
const WINDOWS: Window[] = ['morning', 'afternoon', 'flexible'];
const PREFERRED: Preferred[] = ['call', 'whatsapp', 'text', 'email'];
const STEP_COUNT = 5;

function tomorrowISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function initialState(seed: Seed): FormState {
  return {
    service: seed.service ?? 'standard',
    bedrooms: seed.bedrooms ?? 2,
    bathrooms: seed.bathrooms ?? 2,
    homeSize: 's2',
    officeSize: 'o2',
    frequency: 'once',
    extras: [],
    date: '',
    window: 'morning',
    name: '',
    phone: '',
    email: '',
    address: '',
    zip: '',
    notes: '',
    preferred: 'whatsapp',
    website: '',
  };
}

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: ReactNode;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
}) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : '', hint ? hintId : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint ? (
        <span className="hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="error" id={errId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function BookingWizard({ seed }: { seed: Seed }) {
  const { t, lang, locale } = useI18n();
  const b = t.booking;
  const [step, setStep] = useState(0);
  const [f, setF] = useState<FormState>(() => initialState(seed));
  const [errors, setErrors] = useState<Errors>({});
  const [phase, setPhase] = useState<Phase>('form');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const min = useMemo(tomorrowISO, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));

  // move focus to the step heading when the step (or phase) changes, but not on first paint
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    document.getElementById('quote')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step, phase]);

  const custom = isCustom(f.service);
  const recurring = isRecurring(f.service);
  const office = f.service === 'office';
  const est = estimate({ ...f });
  const visibleExtras = extraCatalog.filter((x) => !office || x.appliesToOffice);
  const zipOk = /^\d{5}$/.test(f.zip) ? findAreaByZip(f.zip) : undefined;

  const serviceName = t.services.items[f.service].name;
  const frequencyName = recurring ? t.pricing.frequencies[f.frequency] : t.pricing.frequencies.once;
  const extrasName = f.extras.filter((id) => visibleExtras.some((x) => x.id === id)).map((id) => t.pricing.extras[id]);

  const spaceText = custom
    ? '—'
    : office
      ? (officeSizes.find((s) => s.id === f.officeSize)?.label ?? '')
      : [
          f.bedrooms === 0 ? t.hero.estimator.studio : fmt(b.review.bedroomsLabel, { n: f.bedrooms }),
          fmt(b.review.bathroomsLabel, { n: f.bathrooms }),
          homeSizes.find((s) => s.id === f.homeSize)?.label ?? '',
        ].join(' · ');

  const estimateText =
    est.kind === 'range' ? `${usd(est.low)} – ${usd(est.high)} ${b.review.perVisit}` : b.review.custom;

  const dateLabel = f.date
    ? new Date(`${f.date}T12:00:00`).toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '—';

  function validate(forStep: number): Errors {
    const e: Errors = {};
    if (forStep === 2) {
      if (!f.date || f.date < min) e.date = b.errors.date;
    }
    if (forStep === 3) {
      if (f.name.trim().length < 2) e.name = b.errors.required;
      const digits = f.phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) e.phone = b.errors.phone;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = b.errors.email;
      if (f.address.trim().length < 4) e.address = b.errors.required;
      if (!/^\d{5}$/.test(f.zip.trim())) e.zip = b.errors.zip;
    }
    return e;
  }

  function buildPayload(): RequestPayload {
    return {
      language: lang,
      service: serviceName,
      details: spaceText,
      extras: extrasName.length ? extrasName.join(', ') : b.review.none,
      frequency: frequencyName,
      estimate: estimateText,
      date: dateLabel,
      window: b.schedule.windows[f.window],
      name: f.name.trim(),
      phone: f.phone.trim(),
      email: f.email.trim(),
      address: f.address.trim(),
      zip: f.zip.trim(),
      preferredContact: b.contact.preferredOpts[f.preferred],
      notes: f.notes.trim(),
    };
  }

  async function submit() {
    if (f.website) {
      setPhase('sent'); // bot: pretend success, send nothing
      return;
    }
    const payload = buildPayload();
    if (!hasEndpoint) {
      setPhase('fallback');
      return;
    }
    setPhase('sending');
    try {
      await sendToEndpoint(b.message.heading, payload);
      setPhase('sent');
    } catch {
      setPhase('failed');
    }
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (step < STEP_COUNT - 1) setStep(step + 1);
    else void submit();
  }

  function reset() {
    setF(initialState({ n: 0 }));
    setErrors({});
    setStep(0);
    setPhase('form');
  }

  const payloadText = phase === 'fallback' || phase === 'failed' ? requestToText(b.message.heading, buildPayload()) : '';

  /* ---------- result screens ---------- */
  if (phase === 'sent') {
    return (
      <div className="wizard-result card">
        <span className="result-icon">
          <Check size={30} aria-hidden="true" />
        </span>
        <h3 ref={headingRef} tabIndex={-1}>
          {b.success.title}
        </h3>
        <p>{fmt(b.success.text, { name: f.name.trim().split(' ')[0] || '', channel: b.channels[f.preferred] })}</p>
        <button type="button" className="btn btn--soft" onClick={reset}>
          {b.success.newRequest}
        </button>
      </div>
    );
  }

  if (phase === 'fallback' || phase === 'failed') {
    const failed = phase === 'failed';
    return (
      <div className="wizard-result card">
        <span className={`result-icon${failed ? ' result-icon--warn' : ''}`}>
          {failed ? <Phone size={28} aria-hidden="true" /> : <MessageCircle size={28} aria-hidden="true" />}
        </span>
        <h3 ref={headingRef} tabIndex={-1}>
          {failed ? b.failure.title : b.fallback.title}
        </h3>
        <p>{failed ? b.failure.text : b.fallback.text}</p>
        <div className="result-actions">
          <a className="btn btn--wa btn--lg" href={whatsappUrl(payloadText)} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={18} aria-hidden="true" /> {b.fallback.whatsapp}
          </a>
          <a className="btn btn--ghost btn--lg" href={mailtoUrl(b.message.heading, payloadText)}>
            <Mail size={18} aria-hidden="true" /> {b.fallback.email}
          </a>
          {failed ? (
            <button type="button" className="btn btn--soft" onClick={() => void submit()}>
              {b.failure.retry}
            </button>
          ) : null}
        </div>
        <p className="fine">
          {site.phoneDisplay} · {site.email}
        </p>
        <button type="button" className="link-btn" onClick={() => setPhase('form')}>
          {b.fallback.newRequest}
        </button>
      </div>
    );
  }

  /* ---------- steps ---------- */
  const stepTitle = [b.service.title, b.details.title, b.schedule.title, b.contact.title, b.review.title][step];

  return (
    <div className="wizard">
      <form className="wizard-main card" onSubmit={onSubmit} noValidate>
        <ol className="progress" aria-label={fmt(b.stepOf, { n: step + 1, total: STEP_COUNT })}>
          {b.steps.map((name, i) => (
            <li key={name} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
              <span className="progress-dot">{i < step ? <Check size={14} aria-hidden="true" /> : i + 1}</span>
              <span className="progress-name">{name}</span>
            </li>
          ))}
        </ol>

        <h3 className="wizard-title" ref={headingRef} tabIndex={-1}>
          {stepTitle}
        </h3>

        {/* honeypot */}
        <input
          type="text"
          name="website"
          className="hp"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={f.website}
          onChange={(e) => set('website', e.target.value)}
        />

        {step === 0 && (
          <fieldset className="options">
            <legend className="sr-only">{b.service.title}</legend>
            <p className="muted">{b.service.sub}</p>
            <div className="option-grid">
              {SERVICE_ORDER.map((id) => {
                const Icon = serviceIcons[id];
                return (
                  <label key={id} className="option">
                    <input type="radio" name="service" value={id} checked={f.service === id} onChange={() => set('service', id)} />
                    <span className="option-body">
                      <span className="option-icon">
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <span className="option-text">
                        <strong>{t.services.items[id].name}</strong>
                        {isCustom(id) ? <em>{b.service.custom}</em> : null}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {step === 1 && custom && (
          <div className="info-box">
            <strong>{b.details.customTitle}</strong>
            <p>{b.details.customText}</p>
          </div>
        )}

        {step === 1 && !custom && (
          <div className="stack">
            {isHomeService(f.service) && (
              <>
                <div className="counters">
                  <Counter
                    label={b.details.bedrooms}
                    value={f.bedrooms}
                    min={0}
                    max={6}
                    format={(n) => (n === 0 ? b.details.studio : String(n))}
                    onChange={(n) => set('bedrooms', n)}
                  />
                  <Counter label={b.details.bathrooms} value={f.bathrooms} min={1} max={5} onChange={(n) => set('bathrooms', n)} />
                </div>
                <Field label={b.details.size}>
                  {({ id }) => (
                    <select id={id} value={f.homeSize} onChange={(e) => set('homeSize', e.target.value as HomeSizeId)}>
                      {homeSizes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </>
            )}

            {office && (
              <Field label={b.details.officeSize}>
                {({ id }) => (
                  <select id={id} value={f.officeSize} onChange={(e) => set('officeSize', e.target.value as OfficeSizeId)}>
                    {officeSizes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
            )}

            {recurring && (
              <fieldset className="pills">
                <legend>{b.details.frequency}</legend>
                <div className="pill-row">
                  {FREQS.map((fr) => (
                    <label key={fr} className="pill-opt">
                      <input type="radio" name="frequency" checked={f.frequency === fr} onChange={() => set('frequency', fr)} />
                      <span>{t.pricing.frequencies[fr]}</span>
                    </label>
                  ))}
                </div>
                <p className="fine">{b.details.frequencyNote}</p>
              </fieldset>
            )}

            <fieldset className="pills">
              <legend>{b.details.extras}</legend>
              <div className="check-grid">
                {visibleExtras.map((x) => (
                  <label key={x.id} className="check-opt">
                    <input
                      type="checkbox"
                      checked={f.extras.includes(x.id)}
                      onChange={(e) =>
                        set('extras', e.target.checked ? [...f.extras, x.id] : f.extras.filter((id) => id !== x.id))
                      }
                    />
                    <span className="check-body">
                      <span>{t.pricing.extras[x.id]}</span>
                      <em>+{usd(x.price)}</em>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 2 && (
          <div className="stack">
            <Field label={b.schedule.date} error={errors.date} hint={b.schedule.dateHelp}>
              {({ id, describedBy, invalid }) => (
                <input
                  id={id}
                  type="date"
                  min={min}
                  value={f.date}
                  onChange={(e) => set('date', e.target.value)}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  required
                />
              )}
            </Field>
            <fieldset className="pills">
              <legend>{b.schedule.window}</legend>
              <div className="pill-row">
                {WINDOWS.map((w) => (
                  <label key={w} className="pill-opt">
                    <input type="radio" name="window" checked={f.window === w} onChange={() => set('window', w)} />
                    <span>{b.schedule.windows[w]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 3 && (
          <div className="stack">
            <div className="two-col">
              <Field label={b.contact.name} error={errors.name}>
                {({ id, describedBy, invalid }) => (
                  <input id={id} value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" aria-invalid={invalid} aria-describedby={describedBy} />
                )}
              </Field>
              <Field label={b.contact.phone} error={errors.phone}>
                {({ id, describedBy, invalid }) => (
                  <input
                    id={id}
                    type="tel"
                    inputMode="tel"
                    value={f.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    autoComplete="tel"
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                  />
                )}
              </Field>
            </div>
            <Field label={b.contact.email} error={errors.email}>
              {({ id, describedBy, invalid }) => (
                <input id={id} type="email" value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="email" aria-invalid={invalid} aria-describedby={describedBy} />
              )}
            </Field>
            <div className="two-col two-col--zip">
              <Field label={b.contact.address} error={errors.address}>
                {({ id, describedBy, invalid }) => (
                  <input id={id} value={f.address} onChange={(e) => set('address', e.target.value)} autoComplete="street-address" aria-invalid={invalid} aria-describedby={describedBy} />
                )}
              </Field>
              <Field
                label={b.contact.zip}
                error={errors.zip}
                hint={
                  /^\d{5}$/.test(f.zip) ? (
                    <span className={zipOk ? 'ok' : 'warn'}>
                      <MapPin size={12} aria-hidden="true" /> {zipOk ? fmt(b.areaOk, { city: zipOk.city }) : b.areaNo}
                    </span>
                  ) : undefined
                }
              >
                {({ id, describedBy, invalid }) => (
                  <input
                    id={id}
                    inputMode="numeric"
                    maxLength={5}
                    value={f.zip}
                    onChange={(e) => set('zip', e.target.value.replace(/\D/g, ''))}
                    autoComplete="postal-code"
                    aria-invalid={invalid}
                    aria-describedby={describedBy}
                  />
                )}
              </Field>
            </div>
            <fieldset className="pills">
              <legend>{b.contact.preferred}</legend>
              <div className="pill-row">
                {PREFERRED.map((p) => (
                  <label key={p} className="pill-opt">
                    <input type="radio" name="preferred" checked={f.preferred === p} onChange={() => set('preferred', p)} />
                    <span>{b.contact.preferredOpts[p]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Field label={b.contact.notes}>
              {({ id }) => (
                <textarea id={id} rows={3} value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder={b.contact.notesPlaceholder} />
              )}
            </Field>
            <p className="fine">{b.contact.privacy}</p>
          </div>
        )}

        {step === 4 && (
          <div className="stack">
            <dl className="summary">
              <div>
                <dt>{b.review.service}</dt>
                <dd>{serviceName}</dd>
              </div>
              {!custom && (
                <>
                  <div>
                    <dt>{b.review.space}</dt>
                    <dd>{spaceText}</dd>
                  </div>
                  {recurring && (
                    <div>
                      <dt>{b.review.frequency}</dt>
                      <dd>{frequencyName}</dd>
                    </div>
                  )}
                  <div>
                    <dt>{b.review.extras}</dt>
                    <dd>{extrasName.length ? extrasName.join(', ') : b.review.none}</dd>
                  </div>
                </>
              )}
              <div>
                <dt>{b.review.when}</dt>
                <dd>
                  {dateLabel} · {b.schedule.windows[f.window]}
                </dd>
              </div>
              <div>
                <dt>{b.review.where}</dt>
                <dd>
                  {f.address}, {f.zip}
                </dd>
              </div>
              <div>
                <dt>{b.review.who}</dt>
                <dd>
                  {f.name} · {f.phone} · {f.email}
                </dd>
              </div>
            </dl>
            <p className="fine">{b.review.disclaimer}</p>
          </div>
        )}

        <div className="wizard-nav">
          {step > 0 ? (
            <button type="button" className="btn btn--ghost" onClick={() => setStep(step - 1)} disabled={phase === 'sending'}>
              <ArrowLeft size={16} aria-hidden="true" /> {b.back}
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className="btn btn--primary btn--lg" disabled={phase === 'sending'}>
            {step < STEP_COUNT - 1 ? (
              <>
                {b.next} <ArrowRight size={18} aria-hidden="true" />
              </>
            ) : phase === 'sending' ? (
              b.sending
            ) : (
              <>
                {b.submit} <ArrowRight size={18} aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>

      <aside className="wizard-aside card-glass" aria-label={b.review.estimate}>
        <h4>{b.review.estimate}</h4>
        <p className="aside-price" aria-live="polite">
          {est.kind === 'range' ? (
            <>
              <strong>
                {usd(est.low)} – {usd(est.high)}
              </strong>
              <span>{b.review.perVisit}</span>
            </>
          ) : (
            <strong className="aside-custom">{b.service.custom}</strong>
          )}
        </p>
        <ul className="aside-list">
          <li>{serviceName}</li>
          {!custom && <li>{spaceText}</li>}
          {!custom && recurring && <li>{frequencyName}</li>}
          {!custom && extrasName.length > 0 && <li>+ {extrasName.length} {b.details.extras.replace(/\s*\(.*\)/, '').toLowerCase()}</li>}
          {f.date && (
            <li>
              <CalendarDays size={14} aria-hidden="true" /> {dateLabel}
            </li>
          )}
        </ul>
        <p className="fine">{b.review.disclaimer}</p>
        <a className="aside-contact" href={links.tel}>
          <Phone size={14} aria-hidden="true" /> {site.phoneDisplay}
        </a>
      </aside>
    </div>
  );
}
