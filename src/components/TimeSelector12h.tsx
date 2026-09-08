import React, { useState, useEffect } from 'react';

export const parseTimeTo12h = (timeStr: string) => {
  if (!timeStr) return { hour: '09', minute: '00', ampm: 'AM' as const };

  const clean = timeStr.trim().toUpperCase();

  // Match 12-hour format like "09:30 AM" or "9:30 PM"
  const match12h = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12h) {
    let h = parseInt(match12h[1], 10);
    if (h < 1) h = 12;
    if (h > 12) h = 12;
    const hour = String(h).padStart(2, '0');
    const minute = match12h[2].padStart(2, '0');
    const ampm = match12h[3] as 'AM' | 'PM';
    return { hour, minute, ampm };
  }

  // Match 24-hour format like "18:30" or "09:15"
  const match24h = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24h) {
    let h = parseInt(match24h[1], 10);
    const minute = match24h[2].padStart(2, '0');
    let ampm: 'AM' | 'PM' = 'AM';
    let hour12 = h;

    if (h === 0) {
      hour12 = 12;
      ampm = 'AM';
    } else if (h === 12) {
      hour12 = 12;
      ampm = 'PM';
    } else if (h > 12) {
      hour12 = h - 12;
      ampm = 'PM';
    } else {
      hour12 = h;
      ampm = 'AM';
    }

    const hour = String(hour12).padStart(2, '0');
    return { hour, minute, ampm };
  }

  return { hour: '09', minute: '00', ampm: 'AM' as const };
};

export const format12hTo24h = (hourStr: string, minuteStr: string, ampm: 'AM' | 'PM'): string => {
  let h = parseInt(hourStr, 10);
  if (isNaN(h)) h = 12;

  let h24 = h;
  if (ampm === 'AM') {
    h24 = (h === 12) ? 0 : h;
  } else {
    h24 = (h === 12) ? 12 : h + 12;
  }

  const mStr = minuteStr.padStart(2, '0');
  return `${String(h24).padStart(2, '0')}:${mStr}`;
};

export const format12hToDisplay = (hourStr: string, minuteStr: string, ampm: 'AM' | 'PM'): string => {
  const hStr = hourStr.padStart(2, '0');
  const mStr = minuteStr.padStart(2, '0');
  return `${hStr}:${mStr} ${ampm}`;
};

interface TimeSelector12hProps {
  value: string;
  onChange: (value24h: string, value12hDisplay: string) => void;
  label?: string;
  hourLabel?: string;
  minuteLabel?: string;
  ampmLabel?: string;
}

export const TimeSelector12h: React.FC<TimeSelector12hProps> = ({
  value,
  onChange,
  label,
  hourLabel = 'Hour',
  minuteLabel = 'Minute',
  ampmLabel = 'AM / PM'
}) => {
  const initial = parseTimeTo12h(value);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>(initial.ampm);

  useEffect(() => {
    const parsed = parseTimeTo12h(value);
    setHour(parsed.hour);
    setMinute(parsed.minute);
    setAmpm(parsed.ampm);
  }, [value]);

  const updateTime = (newH: string, newM: string, newAmpm: 'AM' | 'PM') => {
    setHour(newH);
    setMinute(newM);
    setAmpm(newAmpm);
    const val24h = format12hTo24h(newH, newM, newAmpm);
    const val12h = format12hToDisplay(newH, newM, newAmpm);
    onChange(val24h, val12h);
  };

  const hourOptions = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-bold text-brand-navy mb-2">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hour Dropdown */}
        <div className="flex-1 min-w-[70px]">
          <span className="text-[11px] font-black uppercase text-brand-purple tracking-wider mb-1 block text-center">
            {hourLabel}
          </span>
          <select
            value={hour}
            onChange={(e) => updateTime(e.target.value, minute, ampm)}
            className="w-full px-2.5 sm:px-3 py-3 rounded-xl border-2 border-brand-purpleLight focus:border-brand-purple bg-brand-lavender/30 text-brand-navy font-extrabold text-base text-center cursor-pointer min-h-[48px] shadow-2xs"
          >
            {hourOptions.map(h => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </div>

        <span className="text-xl font-black text-brand-navy self-end pb-3 select-none">:</span>

        {/* Minute Dropdown */}
        <div className="flex-1 min-w-[70px]">
          <span className="text-[11px] font-black uppercase text-brand-purple tracking-wider mb-1 block text-center">
            {minuteLabel}
          </span>
          <select
            value={minute}
            onChange={(e) => updateTime(hour, e.target.value, ampm)}
            className="w-full px-2.5 sm:px-3 py-3 rounded-xl border-2 border-brand-purpleLight focus:border-brand-purple bg-brand-lavender/30 text-brand-navy font-extrabold text-base text-center cursor-pointer min-h-[48px] shadow-2xs"
          >
            {minuteOptions.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* AM / PM Select */}
        <div className="w-24 sm:w-28 flex-shrink-0">
          <span className="text-[11px] font-black uppercase text-brand-purple tracking-wider mb-1 block text-center">
            {ampmLabel}
          </span>
          <select
            value={ampm}
            onChange={(e) => updateTime(hour, minute, e.target.value as 'AM' | 'PM')}
            className={`w-full px-3 py-3 rounded-xl border-2 font-black text-base text-center cursor-pointer min-h-[48px] shadow-2xs transition-all ${
              ampm === 'AM'
                ? 'bg-amber-100/90 border-amber-300 text-amber-950'
                : 'bg-indigo-100/90 border-indigo-300 text-indigo-950'
            }`}
          >
            <option value="AM">AM 🌅</option>
            <option value="PM">PM 🌙</option>
          </select>
        </div>
      </div>
    </div>
  );
};
