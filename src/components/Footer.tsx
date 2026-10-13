import { Mail, MessageCircle, Phone } from 'lucide-react';
import { links, site } from '../config/site';
import { useI18n } from '../i18n';
import { Logo } from './Logo';

export function Footer() {
  const { t } = useI18n();
  const nav = [
    { href: '#services', label: t.nav.services },
    { href: '#pricing', label: t.nav.pricing },
    { href: '#areas', label: t.nav.areas },
    { href: '#faq', label: t.nav.faq },
    { href: '#quote', label: t.nav.quote },
  ];
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo light />
          <p className="footer-tag">{t.footer.tagline}</p>
        </div>
        <div>
          <h4>{t.footer.explore}</h4>
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>{t.footer.reach}</h4>
          <ul>
            <li>
              <a href={links.tel}>
                <Phone size={14} aria-hidden="true" /> {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={links.whatsapp()} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={14} aria-hidden="true" /> WhatsApp
              </a>
            </li>
            <li>
              <a href={links.mailto}>
                <Mail size={14} aria-hidden="true" /> {site.email}
              </a>
            </li>
            <li className="footer-area">{t.footer.area}</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {site.name}. {t.footer.rights}
        </span>
        <span>{site.owner} · Professional Cleaning Services</span>
      </div>
    </footer>
  );
}

/** Mobile: sticky action bar. Desktop: floating WhatsApp button. */
export function FloatingBar() {
  const { t } = useI18n();
  return (
    <div className="floating">
      <a className="floating-btn floating-btn--call" href={links.tel}>
        <Phone size={20} aria-hidden="true" />
        <span>{t.floating.call}</span>
      </a>
      <a className="floating-btn floating-btn--wa" href={links.whatsapp()} target="_blank" rel="noopener noreferrer" aria-label={t.floating.whatsapp}>
        <MessageCircle size={20} aria-hidden="true" />
        <span className="floating-wa-label">WhatsApp</span>
      </a>
      <a className="floating-btn floating-btn--quote" href="#quote">
        <span>{t.floating.quote}</span>
      </a>
    </div>
  );
}
