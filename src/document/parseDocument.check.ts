import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseDocument, sectionPath } from './parseDocument.ts';

const docsDir = path.join(import.meta.dirname, '../../GreenCartArtifacts/greencart-docket/docs');
const files = fs.readdirSync(docsDir).filter((name) => name.endsWith('.md'));
assert.equal(files.length, 30);

let fragmentCount = 0;
for (const name of files) {
  const parsed = parseDocument(fs.readFileSync(path.join(docsDir, name), 'utf8'));
  assert.ok(parsed.frontmatter.title, name);
  assert.ok(parsed.frontmatter.author, name);
  assert.ok(parsed.frontmatter.last_updated, name);
  assert.ok(parsed.frontmatter.status, name);
  assert.ok(parsed.frontmatter.original_format, name);
  assert.equal(parsed.frontmatter.status === 'abandoned', parsed.frontmatter.abandoned_reason != null, name);
  assert.equal(parsed.frontmatter.status === 'stale', parsed.frontmatter.stale_reason != null, name);
  assert.ok(parsed.fragments.length >= 1, name);
  for (const block of parsed.blocks) {
    const text = block.kind === 'markdown' ? block.text : block.fragment.body;
    assert.equal(text.includes('<!--'), false, name);
    assert.equal(text.includes('original_format:'), false, name);
  }
  fragmentCount += parsed.fragments.length;
}
assert.equal(fragmentCount, 54);

const welcome = parseDocument(fs.readFileSync(path.join(docsDir, '01-welcome-to-greencart.md'), 'utf8'));
assert.equal(welcome.frontmatter.title, 'Welcome to GreenCart');
assert.equal(welcome.frontmatter.original_format, 'docx');
assert.equal(welcome.frontmatter.abandoned_reason, undefined);
assert.equal(welcome.fragments[0].id, 'model-pickers-in-stores');
assert.deepEqual(welcome.fragments[0].topics, ['company-model']);

const stale = parseDocument(fs.readFileSync(path.join(docsDir, '24-meera-notes.md'), 'utf8'));
assert.equal(stale.frontmatter.title, "Meera's notes — things I wish someone had told me");
assert.equal(stale.frontmatter.status, 'stale');
assert.match(stale.frontmatter.stale_reason ?? '', /Author left/);
assert.equal(stale.fragments.length, 4);

const abandoned = parseDocument(fs.readFileSync(path.join(docsDir, '15-prd-saved-cards-2024.md'), 'utf8'));
assert.equal(abandoned.frontmatter.status, 'abandoned');
assert.match(abandoned.frontmatter.abandoned_reason ?? '', /no longer allowed/);
assert.equal(abandoned.fragments[1].id, 'old-assumption-self-storage');
assert.deepEqual(abandoned.fragments[1].topics, ['saved-cards', 'payments', 'outdated']);

const payments = parseDocument(fs.readFileSync(path.join(docsDir, '03-payments-design.md'), 'utf8'));
assert.deepEqual(sectionPath(payments.blocks, 'pay-hold-120'), [
  "The core problem: we don't know the final price at checkout",
  'Cards: hold now, charge later',
]);
assert.deepEqual(sectionPath(payments.blocks, 'pay-retry-attempt-id'), ['Retries: the rule written in blood']);
assert.deepEqual(sectionPath(welcome.blocks, 'model-pickers-in-stores').includes('Welcome to GreenCart'), false);
assert.deepEqual(sectionPath(payments.blocks, 'missing'), []);
