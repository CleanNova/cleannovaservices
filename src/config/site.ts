/**
 * Business identity & contact details.
 * Source: the CleanNova business card (Roxana Guzmán).
 *
 * TODO(confirm): the card prints the phone as "+1 619 2052 135". It is read here as
 * +1 (619) 205-2135 — double-check the digits before launch.
 */
export const site = {
  name: 'CleanNova',
  owner: 'Roxana Guzmán',
  phoneDisplay: '(619) 205-2135',
  phoneE164: '+16192052135',
  whatsappNumber: '16192052135', // digits only, used for wa.me links
  email: 'cleannova1111@gmail.com',
  region: 'San Diego County, CA',
} as const;

export const links = {
  tel: `tel:${site.phoneE164}`,
  mailto: `mailto:${site.email}`,
  whatsapp: (text?: string) =>
    `https://wa.me/${site.whatsappNumber}${text ? `?text=${encodeURIComponent(text)}` : ''}`,
};
