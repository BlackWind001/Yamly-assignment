import assert from 'node:assert/strict';
import { getMockAnswer } from './getMockAnswer.ts';

// By number
assert.equal(getMockAnswer('1').id, 'task-saved-cards');
assert.equal(getMockAnswer('1').telemetry[0].file, 'telemetry/payment-failures.json');
assert.equal(getMockAnswer('2').id, 'task-4h-window-indore');
assert.equal(getMockAnswer('3').id, 'task-auto-substitution');
assert.equal(getMockAnswer('3').telemetry.length, 2);

// Exact question (the task title), any case and punctuation
assert.equal(getMockAnswer('Bring back saved cards at checkout').id, 'task-saved-cards');
assert.equal(getMockAnswer('evaluate a wider delivery window for indore?').id, 'task-4h-window-indore');
assert.equal(getMockAnswer('Make substitution suggestions automatic and smarter').id, 'task-auto-substitution');

// Keywords
assert.equal(getMockAnswer('saved card').id, 'task-saved-cards');
assert.equal(getMockAnswer('checkout').id, 'task-saved-cards');
assert.equal(getMockAnswer('Indore').id, 'task-4h-window-indore');
assert.equal(getMockAnswer('delivery windows').id, 'task-4h-window-indore');
assert.equal(getMockAnswer('substitutions').id, 'task-auto-substitution');

// No match: still one of the three, and the same one every time for the same query
const ids = ['task-saved-cards', 'task-4h-window-indore', 'task-auto-substitution'];
for (const query of ['nope', '4', '0', 'the', 'onboarding laptop', 'xyz']) {
  assert.ok(ids.includes(getMockAnswer(query).id), query);
  assert.equal(getMockAnswer(query).id, getMockAnswer(query).id, query);
}
assert.ok(new Set(['nope', 'onboarding laptop', 'xyz', 'hello', 'refund', 'pricing'].map((q) => getMockAnswer(q).id)).size > 1);
