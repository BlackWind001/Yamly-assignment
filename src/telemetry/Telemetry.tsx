import type { CSSProperties } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getMockAnswer, type MockAnswer } from '../search/getMockAnswer';
import { buildChart, CHARTS, dataTables, linePoints, telemetryName, type Chart, type TelemetryJson } from './charts';

type TelemetryRef = MockAnswer['telemetry'][number];

const FILES = import.meta.glob<TelemetryJson>('../../GreenCartArtifacts/greencart-docket/telemetry/*.json', {
  eager: true,
  import: 'default',
});

function loadTelemetry(file: string): TelemetryJson | undefined {
  return FILES[`../../GreenCartArtifacts/greencart-docket/${file}`];
}

const SERIES_COLORS = ['var(--chart-1)', 'var(--chart-2)'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-06-16" -> "16 Jun 2026"
function niceDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

function barWidth(value: number, max: number, scale: number): string {
  return `${Math.max(0.8, (value / max) * scale).toFixed(1)}%`;
}

function dots(points: readonly (readonly [number, number])[]): string {
  return points.map(([x, y]) => `M${x.toFixed(1)} ${y.toFixed(1)}h0`).join(' ');
}

function polyline(points: readonly (readonly [number, number])[]): string {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

// Preview on a tile: the same data as the full chart, no text.
function ChartPreview({ chart }: { chart: Chart }) {
  const { rows, max } = chart;
  if (chart.kind === 'columns') {
    return (
      <span className="lib-spark-cols" aria-hidden="true">
        {rows.map((row) => (
          <span
            key={row.label}
            className={!chart.anyHighlight || row.highlight ? 'is-match' : undefined}
            style={{ height: Math.round((row.values[0] / max) * 40) }}
          />
        ))}
      </span>
    );
  }
  if (chart.kind === 'line') {
    const points = linePoints(rows.map((row) => row.values[0]), max, { width: 160, height: 44, pad: [4, 4, 4, 4] });
    return (
      <svg className="lib-spark-line" viewBox="0 0 160 44" aria-hidden="true">
        <line className="lib-spark-line__base" x1="0" x2="160" y1="42" y2="42" />
        <polyline className="lib-spark-line__path" points={polyline(points)} />
        <path className="lib-spark-line__dots" d={dots(points)} />
      </svg>
    );
  }
  const paired = chart.seriesNames.length > 1;
  return (
    <span className={`lib-spark-bars${paired ? ' lib-spark-bars--paired' : ''}`} aria-hidden="true">
      {rows.map((row) => (
        <span key={row.label} className="lib-spark-bars__row">
          {row.values.map((value, i) => (
            <span
              key={i}
              className={`lib-spark-bars__bar${chart.anyHighlight && !row.highlight ? ' is-muted' : ''}`}
              style={{ width: barWidth(value, max, 100) }}
            />
          ))}
        </span>
      ))}
    </span>
  );
}

export function TelemetryTiles({
  refs,
  openName,
  onOpen,
}: {
  refs: TelemetryRef[];
  openName: string | undefined;
  onOpen: (name: string) => void;
}) {
  return (
    <section className="lib-tele-set" aria-label="Telemetry for this search">
      <div className="lib-tele-set__label">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 3v18h18" />
          <path d="m7 15 4-4 3 3 5-6" />
        </svg>
        Telemetry for this search
      </div>
      <div className="lib-tiles">
        {refs.map((ref) => {
          const name = telemetryName(ref.file);
          const specs = CHARTS[ref.file] ?? [];
          const json = loadTelemetry(ref.file);
          const first = specs.length && json ? buildChart(specs[0], json) : null;
          return (
            <button
              key={ref.file}
              type="button"
              className="lib-tile"
              aria-pressed={openName === name}
              aria-label={`Open telemetry ${name}`}
              title="Open full telemetry"
              onClick={() => onOpen(name)}
            >
              <span className="lib-tile__head">
                <span className="lib-tile__title">{first?.title ?? name}</span>
                <svg className="lib-tile__open" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="21" y1="3" x2="13" y2="11" />
                  <path d="M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
                </svg>
              </span>
              {first && <ChartPreview chart={first} />}
              <span className="lib-tile__foot">
                <span className="lib-tile__file">{name}</span>
                {specs.length > 1 && <span className="lib-tile__more">+{specs.length - 1} more</span>}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function FullChart({ chart }: { chart: Chart }) {
  const { rows, max, format } = chart;
  const paired = chart.seriesNames.length > 1;
  const notes = rows.filter((row) => row.note);

  let plot;
  if (chart.kind === 'columns') {
    plot = (
      <div className="lib-cols">
        <div className="lib-cols__plot">
          {rows.map((row) => (
            <div
              key={row.label}
              className={`lib-cols__col${!chart.anyHighlight || row.highlight ? ' is-match' : ''}`}
              title={`${row.label}: ${format(row.values[0])}`}
            >
              <span className="lib-mchart__value">{format(row.values[0])}</span>
              <span className="lib-cols__bar" style={{ height: Math.round((row.values[0] / max) * 210) }} />
            </div>
          ))}
        </div>
        <div className="lib-cols__labels">
          {rows.map((row) => (
            <span key={row.label}>{row.label}</span>
          ))}
        </div>
      </div>
    );
  } else if (chart.kind === 'line') {
    const [width, height] = [640, 220];
    const pad: [number, number, number, number] = [22, 20, 22, 44];
    const points = linePoints(rows.map((row) => row.values[0]), max, { width, height, pad });
    const [x1, x2, top, base] = [pad[3], width - pad[1], pad[0], height - pad[2]];
    const mid = top + (base - top) / 2;
    const [endX, endY] = points[points.length - 1];
    const tip = rows.map((row) => `${row.label}: ${format(row.values[0])}`).join(' · ');
    plot = (
      <div className="lib-mline" title={tip}>
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${chart.title}: ${tip}`}>
          <line className="lib-mline__grid" x1={x1} x2={x2} y1={top} y2={top} />
          <line className="lib-mline__grid" x1={x1} x2={x2} y1={mid} y2={mid} />
          <line className="lib-mline__base" x1={x1} x2={x2} y1={base} y2={base} />
          <text className="lib-mline__tick" x="0" y={top} dy="4">{format(max)}</text>
          <text className="lib-mline__tick" x="0" y={mid} dy="4">{format(max / 2)}</text>
          <text className="lib-mline__tick" x="0" y={base} dy="4">{format(0)}</text>
          <polyline className="lib-mline__path" points={polyline(points)} />
          <path className="lib-mline__ring" d={dots(points)} />
          <path className="lib-mline__dots" d={dots(points)} />
          <text className="lib-mline__end" x={(endX - 2).toFixed(1)} y={(endY - 12).toFixed(1)} textAnchor="end">
            {format(rows[rows.length - 1].values[0])}
          </text>
        </svg>
        <div className="lib-mline__labels">
          {rows.map((row) => (
            <span key={row.label}>{row.label}</span>
          ))}
        </div>
      </div>
    );
  } else {
    const className = ['lib-hbars', paired && 'lib-hbars--paired', chart.anyHighlight && 'lib-hbars--focus'].filter(Boolean).join(' ');
    plot = (
      <div className={className}>
        {rows.map((row) => (
          <div key={row.label} className={`lib-hbars__row${row.highlight ? ' is-match' : ''}`}>
            <span className="lib-hbars__label">{row.label}</span>
            <div className="lib-hbars__bars">
              {row.values.map((value, i) => (
                <div
                  key={i}
                  className="lib-hbars__line"
                  title={`${row.label}${paired ? ` · ${chart.seriesNames[i]}` : ''}: ${format(value)}`}
                >
                  <span className="lib-hbars__bar" style={{ width: barWidth(value, max, 80) }} />
                  <span className="lib-mchart__value">{format(value)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <figure className="lib-mchart">
      <figcaption className="lib-mchart__title">{chart.title}</figcaption>
      {paired && (
        <div className="lib-mchart__legend">
          {chart.seriesNames.map((name, i) => (
            <span key={name} className="lib-mchart__key" style={{ '--key-color': SERIES_COLORS[i] } as CSSProperties}>
              {name}
            </span>
          ))}
        </div>
      )}
      {plot}
      {notes.length > 0 && (
        <ul className="lib-mchart__notes">
          {notes.map((row) => (
            <li key={row.label}>
              {row.label}: {row.note}
            </li>
          ))}
        </ul>
      )}
      <span className="lib-mchart__source">{chart.source}</span>
    </figure>
  );
}

// Fills the document pane: /telemetry/:name?q=<search>. The search supplies why the file is attached.
export function TelemetryView() {
  const { name } = useParams();
  const question = useSearchParams()[0].get('q');
  const ref = question ? getMockAnswer(question)?.telemetry.find((item) => telemetryName(item.file) === name) : undefined;
  const json = ref && loadTelemetry(ref.file);

  if (!ref || !json) {
    return <h1>Telemetry not found</h1>;
  }

  const { tables, fields } = dataTables(json);
  const title = telemetryName(ref.file).replace(/-/g, ' ').replace(/^./, (ch) => ch.toUpperCase());

  return (
    <div className="lib-tele-page">
      <div className="lib-tele-view">
        <header>
          <div className="lib-tele-view__meta">
            <span className="lib-tele-view__kicker">Telemetry</span>
            {json.window && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {niceDate(json.window.from)} – {niceDate(json.window.to)}
                </span>
              </>
            )}
          </div>
          <h2 className="lib-tele-view__title">{title}</h2>
          {json.description && <p className="lib-tele-view__desc">{json.description}</p>}
        </header>
        <div className="lib-tele-why" role="note">
          <span className="lib-tele-why__label">Why it’s attached to this search</span>
          <span>{ref.why}</span>
          <span className="lib-tele-why__look">
            Look at <code>{ref.look_at}</code>
          </span>
          <span className="lib-tele-why__idea">Chart idea: {ref.chart_idea}</span>
        </div>
        {(CHARTS[ref.file] ?? []).map((spec) => (
          <FullChart key={spec.title} chart={buildChart(spec, json)} />
        ))}
        <section className="lib-data" aria-label="All data in this file">
          <h3>All data in this file</h3>
          {tables.map((table) => (
            <div key={table.name} className="lib-data__block">
              <span className="lib-data__name">{table.name}</span>
              <div className="lib-data__scroll">
                <div
                  className="lib-data__grid"
                  style={{
                    gridTemplateColumns: table.columns
                      .map((column) => (column === 'note' ? 'minmax(200px, 2.4fr)' : 'minmax(0, 1fr)'))
                      .join(' '),
                  }}
                >
                  {table.columns.map((column) => (
                    <div key={column} className="lib-data__cell lib-data__cell--head">{column}</div>
                  ))}
                  {table.rows.flatMap((row, i) =>
                    table.columns.map((column) => {
                      const value = row[column];
                      const kind = typeof value === 'number' ? ' lib-data__cell--num' : column === 'note' ? ' lib-data__cell--note' : '';
                      return (
                        <div key={`${i}:${column}`} className={`lib-data__cell${kind}`}>
                          {value === undefined ? '' : String(value)}
                        </div>
                      );
                    }),
                  )}
                </div>
              </div>
            </div>
          ))}
          {fields.length > 0 && (
            <div className="lib-data__fields">
              {fields.flatMap((field) => [
                <div key={`${field.key}:k`} className="lib-data__key">{field.key}</div>,
                <div key={`${field.key}:v`}>{field.value}</div>,
              ])}
            </div>
          )}
        </section>
        <div className="lib-tele-view__footer">
          <code>{ref.file}</code>
          {json.generated_at && <span>Generated {json.generated_at}</span>}
        </div>
      </div>
    </div>
  );
}
