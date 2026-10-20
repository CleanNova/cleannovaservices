import { socials } from '../config/site';
import { useI18n } from '../i18n';

export function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.6l.5-3.2h-3.1V8.3c0-.9.4-1.7 1.8-1.7h1.4V3.8S15.4 3.6 14.3 3.6c-2.5 0-4.1 1.5-4.1 4.2v2.5H7.5v3.2h2.7V21h3.3z" />
    </svg>
  );
}

/** Icon-only links, used in the footer. */
export function SocialIcons() {
  const { t } = useI18n();
  return (
    <ul className="social-icons">
      <li>
        <a href={socials.instagram.url} target="_blank" rel="noopener noreferrer" aria-label={`${t.contact.instagram} ${socials.instagram.handle}`}>
          <InstagramIcon />
        </a>
      </li>
      <li>
        <a href={socials.facebook.url} target="_blank" rel="noopener noreferrer" aria-label={t.contact.facebook}>
          <FacebookIcon />
        </a>
      </li>
    </ul>
  );
}
