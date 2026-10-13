import { useId } from 'react';
import { Minus, Plus } from 'lucide-react';

export function Counter({
  label,
  value,
  min,
  max,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  format?: (n: number) => string;
  onChange: (n: number) => void;
}) {
  const id = useId();
  return (
    <div className="counter">
      <span className="counter-label" id={id}>
        {label}
      </span>
      <div className="counter-ctl" role="group" aria-labelledby={id}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`− ${label}`}>
          <Minus size={16} aria-hidden="true" />
        </button>
        <output aria-live="polite">{format ? format(value) : value}</output>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`+ ${label}`}>
          <Plus size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
