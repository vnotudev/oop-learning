// Run with: node --test 'tests/**/*.test.js'
// Uses Node's built-in test runner — no npm install needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MODULES, getAllLessons, getLesson, getAdjacentLessons } from '../js/curriculum.js';

test('has six modules numbered 1 to 6 in order', () => {
  assert.deepEqual(MODULES.map((m) => m.number), [1, 2, 3, 4, 5, 6]);
});

test('every module has at least one lesson', () => {
  for (const module of MODULES) {
    assert.ok(module.lessons.length > 0, `${module.id} has no lessons`);
  }
});

test('lesson and module ids are unique and URL-safe', () => {
  const ids = [...MODULES.map((m) => m.id), ...getAllLessons().map((l) => l.id)];
  assert.equal(new Set(ids).size, ids.length, 'duplicate id found');
  for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/, `bad id: ${id}`);
});

test('every lesson has a valid kind', () => {
  for (const lesson of getAllLessons()) {
    assert.ok(['lesson', 'project'].includes(lesson.kind), `${lesson.id}: ${lesson.kind}`);
  }
});

test('getLesson finds a lesson and knows its module', () => {
  assert.equal(getLesson('inheritance').moduleId, 'pillars');
  assert.equal(getLesson('does-not-exist'), undefined);
});

test('Previous/Next crosses module boundaries and stops at the ends', () => {
  const first = getAllLessons()[0].id;
  const last = getAllLessons().at(-1).id;
  assert.equal(getAdjacentLessons(first).previous, null);
  assert.equal(getAdjacentLessons(last).next, null);
  // Last lesson of Module 1 → first lesson of Module 2.
  assert.equal(getAdjacentLessons('object-references').next.id, 'what-is-oop');
  assert.deepEqual(getAdjacentLessons('unknown'), { previous: null, next: null });
});
