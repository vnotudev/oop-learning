// Runs every lesson example and checks it prints exactly what the lesson says it prints.
// Run with: node --test 'tests/**/*.test.js'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../content.js';

const { concepts, together, quiz, runCode } = globalThis.OOP;

for (const concept of concepts) {
  for (const example of concept.examples) {
    test(`${concept.name} › ${example.title}`, () => {
      const result = runCode(example.code);
      assert.equal(result.ok, true, result.output);
      assert.equal(result.output, example.output);
    });
  }
}

test('Putting it together example prints its documented output', () => {
  const result = runCode(together.code);
  assert.equal(result.ok, true, result.output);
  assert.equal(result.output, together.output);
});

test('every concept has the full set of teaching sections', () => {
  for (const c of concepts) {
    assert.ok(c.explanation.length >= 3, `${c.id}: explanation`);
    assert.ok(c.realWorld.length >= 3, `${c.id}: realWorld`);
    assert.ok(c.examples.length >= 3, `${c.id}: examples`);
    assert.ok(c.mistakes.length >= 2, `${c.id}: mistakes`);
    assert.ok(c.analogy.title && c.analogy.body, `${c.id}: analogy`);
  }
});

test('quiz answers point at a real option and have explanations', () => {
  for (const question of quiz) {
    assert.ok(question.answer >= 0 && question.answer < question.options.length, question.q);
    assert.ok(question.explain, question.q);
  }
});

test('runCode reports errors instead of throwing', () => {
  const result = runCode("console.log('before'); throw new Error('boom');");
  assert.equal(result.ok, false);
  assert.equal(result.output, 'before\nError: Error: boom');
});
