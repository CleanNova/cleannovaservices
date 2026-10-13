import {
  Building2,
  HardHat,
  KeyRound,
  LayoutGrid,
  Sparkles,
  SprayCan,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import type { ServiceId } from '../config/pricing';

export const serviceIcons: Record<ServiceId, LucideIcon> = {
  standard: Sparkles,
  deep: SprayCan,
  move: Truck,
  office: Building2,
  airbnb: KeyRound,
  construction: HardHat,
  organization: LayoutGrid,
};
