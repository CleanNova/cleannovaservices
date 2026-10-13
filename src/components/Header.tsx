import { useEffect, useState } from 'react';
import { Menu, X, Languages } from 'lucide-react';
import { useI18n } from '../i18n';
import { Logo } from './Logo';

export function Header() {
  const { t, toggle, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', open);
    return () => document.body.classList.remove('no-scroll');
  }, [open]);

  const nav = [
    { href: '#services', label: t.nav.services },
    { href: '#how', label: t.nav.how },
    { href: '#pricing', label: t.nav.pricing },
    { href: '#areas', label: t.nav.areas },
    { href: '#faq', label: t.nav.faq },
    { href: '#contact', label: t.nav.contact },
  ];

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}${open ? ' header--open' : ''}`}>
      <div className="container header-inner">
        <a href="#top" className="header-logo" aria-label="CleanNova" onClick={() => setOpen(false)}>
          <Logo />
        </a>

        <nav className={`nav${open ? ' nav--open' : ''}`} aria-label="Main">
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
          <a href="#quote" className="btn btn--primary nav-cta-mobile" onClick={() => setOpen(false)}>
            {t.nav.quote}
          </a>
        </nav>

        <div className="header-actions">
          <button type="button" className="lang-btn" onClick={toggle} aria-label={`Switch language to ${t.nav.language}`}>
            <Languages size={16} aria-hidden="true" />
            <span lang={lang === 'en' ? 'es' : 'en'}>{t.nav.language}</span>
          </button>
          <a href="#quote" className="btn btn--primary btn--sm header-cta">
            {t.nav.quote}
          </a>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-label={open ? t.nav.close : t.nav.menu}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
