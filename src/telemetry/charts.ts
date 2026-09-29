export type TelemetryJson = {
  description?: string;
  window?: { from: string; to: string };
  generated_at?: string;
  [key: string]: unknown;
};

type Row = Record<string, unknown>;
type Format = (value: number) => string;

const PCT: Format = (value) => `${Math.round(value * 1000) / 10}%`;
const INT: Format = (value) => value.toLocaleString('en-US');

type SeriesSpec = {
  kind: 'bars' | 'columns' | 'line';
  title: string;
  from: string;
  label: string;
  series: [key: string, name: string][];
  max?: number;
  highlight?: string;
  format: Format;
};

type PairsSpec = {
  kind: 'pairs';
  title: string;
  max: number;
  format: Format;
  pairs: { label: string; source: string; get: (json: TelemetryJson) => number }[];
};

export type ChartSpec = SeriesSpec | PairsSpec;

// Which charts each file gets, from the design reference: titles are the chart_idea in its own words,
// maxima are axis choices, not data. A file missing here still shows its tables.
export const CHARTS: Record<string, ChartSpec[]> = {
  'telemetry/stock-and-substitutions.json': [
    {
      kind: 'bars', title: 'Acceptance rate by category split by swap type', from: 'substitution_offer_outcomes', label: 'category',
      series: [['accepted_rate_size_swap', 'Size swap'], ['accepted_rate_brand_swap', 'Brand swap']], max: 1, format: PCT,
    },
    {
      kind: 'bars', title: 'Morning vs evening OOS by category', from: 'oos_rate_by_category', label: 'category',
      series: [['oos_rate_morning', 'Morning'], ['oos_rate_evening_peak', 'Evening peak']], max: 0.2, format: PCT,
    },
  ],
  'telemetry/refunds-summary.json': [
    {
      kind: 'bars', title: 'Refund reasons ranked; unwanted_substitute highlighted', from: 'by_reason', label: 'reason',
      series: [['count', 'Count']], highlight: 'unwanted_substitute', format: INT,
    },
  ],
  'telemetry/delivery-lateness.json': [
    {
      kind: 'bars', title: 'On-time rate by city', from: 'on_time_rate_by_city', label: 'city',
      series: [['on_time_rate', 'On-time rate']], max: 1, format: PCT,
    },
    {
      kind: 'columns', title: 'Indore’s by-hour dip', from: 'indore_on_time_rate_by_hour', label: 'hour_ist',
      series: [['on_time_rate', 'On-time rate']], max: 1, format: PCT,
    },
  ],
  'telemetry/payment-failures.json': [
    {
      kind: 'pairs', title: 'Typed-card vs saved-token first-attempt failure rate', max: 0.1, format: PCT,
      pairs: [
        {
          label: 'Typed card',
          source: 'by_method[method=card].first_attempt_failure_rate',
          get: (json) => (json.by_method as Row[]).find((row) => row.method === 'card')?.first_attempt_failure_rate as number,
        },
        {
          label: 'Saved token (provider benchmark)',
          source: 'card_detail.provider_benchmark_saved_token_first_attempt_failure_rate',
          get: (json) => (json.card_detail as Row).provider_benchmark_saved_token_first_attempt_failure_rate as number,
        },
      ],
    },
    {
      kind: 'line', title: 'The weekly typed-card trend', from: 'weekly_card_failure_trend', label: 'week_starting',
      series: [['first_attempt_failure_rate', 'First-attempt failure rate']], max: 0.1, format: PCT,
    },
  ],
};

export type ChartRow = { label: string; values: number[]; highlight: boolean; note?: string };

export type Chart = {
  title: string;
  // Pairs draw as bars: one bar per pair.
  kind: 'bars' | 'columns' | 'line';
  rows: ChartRow[];
  seriesNames: string[];
  max: number;
  format: Format;
  source: string;
  anyHighlight: boolean;
};

export function buildChart(spec: ChartSpec, json: TelemetryJson): Chart {
  let rows: ChartRow[];
  let seriesNames: string[];
  let source: string;
  if (spec.kind === 'pairs') {
    rows = spec.pairs.map((pair) => ({ label: pair.label, values: [pair.get(json)], highlight: false }));
    seriesNames = [''];
    source = spec.pairs.map((pair) => pair.source).join(' · ');
  } else {
    rows = (json[spec.from] as Row[]).map((row) => ({
      label: String(row[spec.label]),
      values: spec.series.map(([key]) => row[key] as number),
      highlight: spec.highlight !== undefined && row[spec.label] === spec.highlight,
      note: typeof row.note === 'string' ? row.note : undefined,
    }));
    seriesNames = spec.series.map(([, name]) => name);
    source = spec.from;
  }
  return {
    title: spec.title,
    kind: spec.kind === 'pairs' ? 'bars' : spec.kind,
    rows,
    seriesNames,
    max: spec.max ?? Math.max(...rows.flatMap((row) => row.values)),
    format: spec.format,
    source,
    anyHighlight: rows.some((row) => row.highlight),
  };
}

// Line geometry in a viewBox of width × height with the given padding: [x, y] per value.
export function linePoints(values: number[], max: number, box: { width: number; height: number; pad: [number, number, number, number] }) {
  const [top, right, bottom, left] = box.pad;
  const step = (box.width - left - right) / Math.max(1, values.length - 1);
  return values.map((value, i) => [left + i * step, top + (1 - value / max) * (box.height - top - bottom)] as const);
}

export type DataTable = { name: string; columns: string[]; rows: Row[] };

// Every value in the file as it arrives: arrays of objects become tables, everything else key → value.
export function dataTables(json: TelemetryJson): { tables: DataTable[]; fields: { key: string; value: string }[] } {
  const tables: DataTable[] = [];
  const fields: { key: string; value: string }[] = [];
  for (const [key, value] of Object.entries(json)) {
    if (key === 'description' || key === 'window' || key === 'generated_at') {
      continue;
    }
    if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
      const columns = [...new Set((value as Row[]).flatMap((row) => Object.keys(row)))];
      tables.push({ name: key, columns, rows: value as Row[] });
    } else if (Array.isArray(value)) {
      value.forEach((item, i) => fields.push({ key: `${key}[${i}]`, value: String(item) }));
    } else if (value && typeof value === 'object') {
      for (const [sub, subValue] of Object.entries(value)) {
        fields.push({ key: `${key}.${sub}`, value: String(subValue) });
      }
    } else {
      fields.push({ key, value: String(value) });
    }
  }
  return { tables, fields };
}

// "telemetry/payment-failures.json" -> "payment-failures"
export function telemetryName(file: string): string {
  return file.replace(/^.*\//, '').replace(/\.json$/, '');
}
