import assert from 'node:assert/strict';
import { getMockAnswer } from './getMockAnswer.ts';

assert.equal(getMockAnswer('1')?.id, 'task-saved-cards');
assert.equal(getMockAnswer('1')?.telemetry[0].file, 'telemetry/payment-failures.json');
assert.equal(getMockAnswer('2')?.id, 'task-4h-window-indore');
assert.equal(getMockAnswer('3')?.id, 'task-auto-substitution');
assert.equal(getMockAnswer('3')?.telemetry.length, 2);
assert.equal(getMockAnswer('4'), null);
assert.equal(getMockAnswer('0'), null);
assert.equal(getMockAnswer('nope'), null);
