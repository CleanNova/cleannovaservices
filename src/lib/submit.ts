import { links, site } from '../config/site';

export interface RequestPayload {
  language: 'en' | 'es';
  service: string;
  details: string;
  extras: string;
  frequency: string;
  estimate: string;
  date: string;
  window: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  zip: string;
  preferredContact: string;
  notes: string;
}

const ENDPOINT = (import.meta.env.VITE_FORM_ENDPOINT as string | undefined)?.trim() || '';
const ACCESS_KEY = (import.meta.env.VITE_FORM_ACCESS_KEY as string | undefined)?.trim() || '';

/** True when a form backend (Formspree / Web3Forms…) is configured. */
export const hasEndpoint = ENDPOINT.length > 0;

/** Plain-text version of the request, used for WhatsApp / e-mail and as the e-mail body. */
export function requestToText(heading: string, p: RequestPayload): string {
  return [
    heading,
    '',
    `Service: ${p.service}`,
    `Details: ${p.details}`,
    `Frequency: ${p.frequency}`,
    `Add-ons: ${p.extras}`,
    `Estimate: ${p.estimate}`,
    `Preferred: ${p.date} · ${p.window}`,
    '',
    `Name: ${p.name}`,
    `Phone: ${p.phone}`,
    `Email: ${p.email}`,
    `Address: ${p.address} ${p.zip}`,
    `Reach me by: ${p.preferredContact}`,
    p.notes ? `Notes: ${p.notes}` : '',
    '',
    `(Sent from the CleanNova website · ${p.language.toUpperCase()})`,
  ]
    .filter((line, i, arr) => !(line === '' && arr[i - 1] === ''))
    .join('\n');
}

export const whatsappUrl = (text: string) => links.whatsapp(text);
export const mailtoUrl = (subject: string, text: string) =>
  `${links.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

/** POSTs the request to the configured endpoint. Throws on failure. */
export async function sendToEndpoint(heading: string, p: RequestPayload): Promise<void> {
  const body: Record<string, string> = {
    ...p,
    subject: `${heading} — ${p.name}`,
    message: requestToText(heading, p),
    _replyto: p.email,
    from_name: `${site.name} website`,
  };
  if (ACCESS_KEY) body.access_key = ACCESS_KEY;

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Form endpoint responded ${res.status}`);
}
