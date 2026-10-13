/**
 * SERVICE AREAS — PLACEHOLDER VALUES
 * ---------------------------------------------------------------------------
 * The reference site only shows a mailing address in Oceanside, CA — it does not list
 * service areas. This list is a reasonable starting point for San Diego + North County
 * and the ZIP codes are approximate. Replace with the official coverage when available.
 */
export const AREAS_ARE_PLACEHOLDER = true;

export interface Area {
  city: string;
  zips: string[];
}

export const areas: Area[] = [
  {
    city: 'San Diego',
    zips: [
      '92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108', '92109', '92110',
      '92111', '92113', '92114', '92115', '92116', '92117', '92119', '92120', '92121', '92122',
      '92123', '92124', '92126', '92127', '92128', '92129', '92130', '92131', '92037',
    ],
  },
  { city: 'Oceanside', zips: ['92054', '92056', '92057', '92058'] },
  { city: 'Carlsbad', zips: ['92008', '92009', '92010', '92011'] },
  { city: 'Vista', zips: ['92081', '92083', '92084'] },
  { city: 'San Marcos', zips: ['92069', '92078'] },
  { city: 'Encinitas', zips: ['92023', '92024'] },
  { city: 'Escondido', zips: ['92025', '92026', '92027', '92029'] },
  { city: 'Solana Beach', zips: ['92075'] },
  { city: 'Del Mar', zips: ['92014'] },
  { city: 'Poway', zips: ['92064'] },
  { city: 'La Mesa', zips: ['91941', '91942'] },
  { city: 'Chula Vista', zips: ['91910', '91911', '91913', '91914', '91915'] },
];

export function findAreaByZip(zip: string): Area | undefined {
  const z = zip.trim();
  return areas.find((a) => a.zips.includes(z));
}
