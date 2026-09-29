import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import tasksFile from '../../GreenCartArtifacts/greencart-docket/tasks.json' with { type: 'json' };
import { parseDocument } from '../document/parseDocument.ts';
import { getMockAnswer } from './getMockAnswer.ts';
import { plainText, sentenceSnippet } from './snippet.ts';

// Every result quotes a sentence that is really in its fragment. Paragraph results show that paragraph
// from the start, with no sentence highlight.
const root = path.join(import.meta.dirname, '../../GreenCartArtifacts/greencart-docket');
for (const task of tasksFile.tasks) {
  for (const fragment of task.fragments) {
    const doc = parseDocument(fs.readFileSync(path.join(root, fragment.doc), 'utf8'));
    const body = doc.fragments.find((item) => item.id === fragment.frag)?.body;
    assert.ok(body, fragment.frag);
    assert.ok(fragment.match === 'sentence' || fragment.match === 'paragraph', fragment.frag);
    const text = plainText(body);
    assert.doesNotMatch(text, /\*\*|`|\]\(/, fragment.frag);
    assert.ok(text.includes(fragment.match_text), `${fragment.frag}: ${fragment.match_text}`);
  }
}
assert.equal(plainText('A **token** from [payments](03-payments-design.md), keyed on `listing_uid`.'), 'A token from payments, keyed on listing_uid.');
assert.deepEqual(sentenceSnippet('One. Two.', 'Two.'), { before: 'One. ', match: 'Two.', after: '' });
assert.equal(sentenceSnippet('x'.repeat(10) + ' ' + 'word '.repeat(20) + 'Match.', 'Match.')?.before.startsWith('…word'), true);
assert.equal(sentenceSnippet('x'.repeat(100) + ' Match.', 'Match.', Infinity)?.before, 'x'.repeat(100) + ' ');

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
