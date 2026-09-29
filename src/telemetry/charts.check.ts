import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import tasksFile from '../../GreenCartArtifacts/greencart-docket/tasks.json' with { type: 'json' };
import { buildChart, CHARTS, dataTables, linePoints, telemetryName, type TelemetryJson } from './charts.ts';

const root = path.join(import.meta.dirname, '../../GreenCartArtifacts/greencart-docket');
const read = (file: string): TelemetryJson => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

// Every telemetry reference in the mock answers has charts, and every chart builds from the real file.
for (const task of tasksFile.tasks) {
  for (const ref of task.telemetry) {
    assert.ok(CHARTS[ref.file]?.length, ref.file);
    for (const spec of CHARTS[ref.file]) {
      const chart = buildChart(spec, read(ref.file));
      assert.ok(chart.rows.length > 0, spec.title);
      for (const row of chart.rows) {
        assert.ok(row.values.every((value) => typeof value === 'number' && !Number.isNaN(value)), `${spec.title}: ${row.label}`);
      }
    }
  }
}

const [pairs, line] = CHARTS['telemetry/payment-failures.json'].map((spec) => buildChart(spec, read('telemetry/payment-failures.json')));
assert.equal(pairs.kind, 'bars');
assert.deepEqual(pairs.rows.map((row) => row.values[0]), [0.091, 0.028]);
assert.equal(pairs.format(0.091), '9.1%');
assert.equal(line.kind, 'line');
assert.equal(line.rows.length, 4);

const [refunds] = CHARTS['telemetry/refunds-summary.json'].map((spec) => buildChart(spec, read('telemetry/refunds-summary.json')));
assert.equal(refunds.anyHighlight, true);
assert.deepEqual(refunds.rows.filter((row) => row.highlight).map((row) => row.label), ['unwanted_substitute']);
assert.equal(refunds.max, Math.max(...refunds.rows.map((row) => row.values[0])));

const [acceptance] = CHARTS['telemetry/stock-and-substitutions.json'].map((spec) => buildChart(spec, read('telemetry/stock-and-substitutions.json')));
assert.deepEqual(acceptance.seriesNames, ['Size swap', 'Brand swap']);
assert.ok(acceptance.rows.some((row) => row.note));

const { tables, fields } = dataTables(read('telemetry/stock-and-substitutions.json'));
assert.deepEqual(tables.map((table) => table.name).sort(), ['oos_rate_by_category', 'substitution_offer_outcomes']);
assert.deepEqual(fields.map((field) => field.key), ['no_response_rate_within_3_minutes', 'note']);
assert.ok(dataTables(read('telemetry/payment-failures.json')).fields.some((field) => field.key === 'card_detail.card_entry_abandonment_rate'));

assert.deepEqual(linePoints([0, 1], 1, { width: 100, height: 50, pad: [0, 0, 0, 0] }), [[0, 50], [100, 0]]);
assert.equal(telemetryName('telemetry/payment-failures.json'), 'payment-failures');
