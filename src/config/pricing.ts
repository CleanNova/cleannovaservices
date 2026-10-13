/**
 * PRICING — PLACEHOLDER VALUES
 * ---------------------------------------------------------------------------
 * The reference site (Ruiz & Daughter's) publishes no prices, so these numbers are
 * NOT copied from anyone. They are rough San Diego-area starting points, calibrated
 * against national 2026 ranges (standard ≈ $120–$280, deep ≈ $200–$500,
 * move-out ≈ $200–$500).
 *
 * Replace everything in this file with CleanNova's official prices when available.
 * Nothing else in the codebase hard-codes a price.
 */
export const PRICING_IS_PLACEHOLDER = true;

export type ServiceId =
  | 'standard'
  | 'deep'
  | 'move'
  | 'office'
  | 'airbnb'
  | 'construction'
  | 'organization';

export type Frequency = 'once' | 'weekly' | 'biweekly' | 'monthly';
export type ExtraId = 'oven' | 'fridge' | 'cabinets' | 'windows' | 'baseboards' | 'laundry' | 'pets';
export type HomeSizeId = 's1' | 's2' | 's3' | 's4' | 's5';
export type OfficeSizeId = 'o1' | 'o2' | 'o3' | 'o4';

/** Services priced online. The rest are "custom quote" (reviewed by a person). */
export const HOME_SERVICES = ['standard', 'deep', 'move', 'airbnb'] as const;
export type HomeServiceId = (typeof HOME_SERVICES)[number];
export const CUSTOM_QUOTE_SERVICES: ServiceId[] = ['construction', 'organization'];

export const SERVICE_ORDER: ServiceId[] = [
  'standard',
  'deep',
  'move',
  'office',
  'airbnb',
  'construction',
  'organization',
];

/** Services that can repeat on a schedule (weekly / bi-weekly / monthly). */
export const RECURRING_SERVICES: ServiceId[] = ['standard', 'office'];

export const homeRates: Record<HomeServiceId, { base: number; perBedroom: number; perBathroom: number; sizeFactor: number }> = {
  standard: { base: 70, perBedroom: 20, perBathroom: 25, sizeFactor: 1 },
  deep: { base: 120, perBedroom: 32, perBathroom: 38, sizeFactor: 1.6 },
  move: { base: 130, perBedroom: 36, perBathroom: 42, sizeFactor: 1.8 },
  airbnb: { base: 60, perBedroom: 22, perBathroom: 26, sizeFactor: 1 },
};

/** Flat surcharge for bigger homes (multiplied by the service's sizeFactor). */
export const homeSizes: { id: HomeSizeId; label: string; surcharge: number }[] = [
  { id: 's1', label: '< 1,000 sq ft', surcharge: 0 },
  { id: 's2', label: '1,000 – 1,800 sq ft', surcharge: 0 },
  { id: 's3', label: '1,800 – 2,600 sq ft', surcharge: 30 },
  { id: 's4', label: '2,600 – 3,500 sq ft', surcharge: 65 },
  { id: 's5', label: '3,500+ sq ft', surcharge: 110 },
];

export const officeSizes: { id: OfficeSizeId; label: string; price: number }[] = [
  { id: 'o1', label: '< 1,000 sq ft', price: 120 },
  { id: 'o2', label: '1,000 – 2,500 sq ft', price: 220 },
  { id: 'o3', label: '2,500 – 5,000 sq ft', price: 380 },
  { id: 'o4', label: '5,000 – 10,000 sq ft', price: 650 },
];

/** Multiplier applied to the per-visit price. */
export const frequencyFactor: Record<Frequency, number> = {
  once: 1,
  weekly: 0.85,
  biweekly: 0.9,
  monthly: 0.95,
};

export const extras: { id: ExtraId; price: number; appliesToOffice: boolean }[] = [
  { id: 'oven', price: 35, appliesToOffice: false },
  { id: 'fridge', price: 35, appliesToOffice: true },
  { id: 'cabinets', price: 45, appliesToOffice: false },
  { id: 'windows', price: 40, appliesToOffice: true },
  { id: 'baseboards', price: 30, appliesToOffice: false },
  { id: 'laundry', price: 25, appliesToOffice: false },
  { id: 'pets', price: 20, appliesToOffice: false },
];

export const MINIMUM_PRICE = 99;
/** The estimate is shown as a range: [total × low, total × high], rounded to $5. */
export const RANGE = { low: 0.92, high: 1.15 };

/** Typical layouts used by the "Starting prices" table on the home page. */
export const sampleLayouts: { id: string; bedrooms: number; bathrooms: number }[] = [
  { id: 'studio', bedrooms: 0, bathrooms: 1 },
  { id: 'bd1', bedrooms: 1, bathrooms: 1 },
  { id: 'bd2', bedrooms: 2, bathrooms: 2 },
  { id: 'bd3', bedrooms: 3, bathrooms: 2 },
  { id: 'bd4', bedrooms: 4, bathrooms: 3 },
];
