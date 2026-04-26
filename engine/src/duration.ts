// ISO 8601 duration parser and adder. Pure, deterministic, no dependencies.

export type ParsedDuration = {
  years: number; months: number; days: number;
  hours: number; minutes: number; seconds: number;
};

const PATTERN = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;

export function parseDuration(s: string): ParsedDuration {
  const m = s.match(PATTERN);
  if (!m || s === "P" || s === "PT") {
    throw new Error(`invalid ISO 8601 duration: ${JSON.stringify(s)}`);
  }
  const [, y, mo, d, h, mi, sec] = m;
  if (!y && !mo && !d && !h && !mi && !sec) {
    throw new Error(`invalid ISO 8601 duration: ${JSON.stringify(s)} has no components`);
  }
  return {
    years:   y   ? parseInt(y,   10) : 0,
    months:  mo  ? parseInt(mo,  10) : 0,
    days:    d   ? parseInt(d,   10) : 0,
    hours:   h   ? parseInt(h,   10) : 0,
    minutes: mi  ? parseInt(mi,  10) : 0,
    seconds: sec ? parseFloat(sec)   : 0
  };
}

const TZ_RE = /(?:[+-]\d{2}:\d{2}|Z)$/;

export function addDuration(timestamp: string, duration: string): string {
  if (!TZ_RE.test(timestamp)) {
    throw new Error(`addDuration requires a timezone-bearing timestamp; got ${JSON.stringify(timestamp)}`);
  }
  const tzMatch = timestamp.match(TZ_RE);
  const tz = tzMatch![0]!;
  const d = parseDuration(duration);
  const ms = Date.parse(timestamp);
  if (Number.isNaN(ms)) throw new Error(`unparseable timestamp: ${JSON.stringify(timestamp)}`);

  // Calendar arithmetic in UTC, then format back in the original TZ.
  const dt = new Date(ms);
  dt.setUTCFullYear(dt.getUTCFullYear() + d.years);
  dt.setUTCMonth(dt.getUTCMonth()       + d.months);
  dt.setUTCDate(dt.getUTCDate()         + d.days);
  dt.setUTCHours(dt.getUTCHours()       + d.hours);
  dt.setUTCMinutes(dt.getUTCMinutes()   + d.minutes);
  dt.setUTCSeconds(dt.getUTCSeconds()   + Math.floor(d.seconds));
  dt.setUTCMilliseconds(dt.getUTCMilliseconds() + Math.round((d.seconds % 1) * 1000));

  return formatInTimezone(dt, tz);
}

function formatInTimezone(dt: Date, tz: string): string {
  const offsetMin = tz === "Z" ? 0 : tzOffsetMinutes(tz);
  const local = new Date(dt.getTime() + offsetMin * 60_000);
  const yyyy = local.getUTCFullYear().toString().padStart(4, "0");
  const mm   = (local.getUTCMonth() + 1).toString().padStart(2, "0");
  const dd   = local.getUTCDate().toString().padStart(2, "0");
  const HH   = local.getUTCHours().toString().padStart(2, "0");
  const MI   = local.getUTCMinutes().toString().padStart(2, "0");
  const SS   = local.getUTCSeconds().toString().padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${HH}:${MI}:${SS}${tz}`;
}

function tzOffsetMinutes(tz: string): number {
  const m = tz.match(/^([+-])(\d{2}):(\d{2})$/);
  if (!m) throw new Error(`invalid TZ offset: ${tz}`);
  const sign = m[1]! === "+" ? 1 : -1;
  return sign * (parseInt(m[2]!, 10) * 60 + parseInt(m[3]!, 10));
}
