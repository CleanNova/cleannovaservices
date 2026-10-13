import {
  CUSTOM_QUOTE_SERVICES,
  MINIMUM_PRICE,
  RANGE,
  extras as extraCatalog,
  frequencyFactor,
  homeRates,
  homeSizes,
  officeSizes,
  HOME_SERVICES,
  RECURRING_SERVICES,
  type ExtraId,
  type Frequency,
  type HomeServiceId,
  type HomeSizeId,
  type OfficeSizeId,
  type ServiceId,
} from '../config/pricing';

export interface QuoteInput {
  service: ServiceId;
  bedrooms: number;
  bathrooms: number;
  homeSize: HomeSizeId;
  officeSize: OfficeSizeId;
  frequency: Frequency;
  extras: ExtraId[];
}

export type Estimate =
  | { kind: 'custom' }
  | { kind: 'range'; low: number; high: number; perVisit: number };

const round5 = (n: number) => Math.round(n / 5) * 5;

export const isCustom = (s: ServiceId) => CUSTOM_QUOTE_SERVICES.includes(s);
export const isRecurring = (s: ServiceId) => RECURRING_SERVICES.includes(s);
export const isHomeService = (s: ServiceId): s is HomeServiceId => (HOME_SERVICES as readonly string[]).includes(s);

/** Estimated per-visit price for a home service (no extras / frequency). */
export function homePrice(service: HomeServiceId, bedrooms: number, bathrooms: number, size: HomeSizeId = 's2'): number {
  const r = homeRates[service];
  const surcharge = homeSizes.find((s) => s.id === size)?.surcharge ?? 0;
  return r.base + r.perBedroom * bedrooms + r.perBathroom * bathrooms + surcharge * r.sizeFactor;
}

export function estimate(input: QuoteInput): Estimate {
  if (isCustom(input.service)) return { kind: 'custom' };

  let subtotal: number;
  if (input.service === 'office') {
    subtotal = officeSizes.find((s) => s.id === input.officeSize)?.price ?? officeSizes[0].price;
  } else if (isHomeService(input.service)) {
    subtotal = homePrice(input.service, input.bedrooms, input.bathrooms, input.homeSize);
  } else {
    return { kind: 'custom' };
  }

  const allowed = extraCatalog.filter((e) => input.service !== 'office' || e.appliesToOffice);
  const extrasTotal = allowed.filter((e) => input.extras.includes(e.id)).reduce((sum, e) => sum + e.price, 0);

  const factor = isRecurring(input.service) ? frequencyFactor[input.frequency] : 1;
  const perVisit = Math.max(MINIMUM_PRICE, (subtotal + extrasTotal) * factor);

  return {
    kind: 'range',
    perVisit: round5(perVisit),
    low: Math.max(MINIMUM_PRICE, round5(perVisit * RANGE.low)),
    high: round5(perVisit * RANGE.high),
  };
}

export const usd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
