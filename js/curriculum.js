// curriculum.js — the single source of truth for what the site teaches and in what order.
//
// Every page in the app (sidebar, router, progress bar, Previous/Next buttons)
// reads from this file. Lesson *content* lives in js/lessons/*.js and is looked up
// by the lesson `id` defined here, so adding a lesson means:
//   1. add an entry below, and
//   2. add matching content in the module's lesson file.

/**
 * @typedef {'lesson' | 'project'} LessonKind
 *
 * @typedef {Object} LessonMeta
 * @property {string} id        Unique, URL-safe id. Used in routes (#/lesson/<id>) and in saved progress.
 * @property {string} title     Shown in the sidebar and the top bar.
 * @property {LessonKind} kind  'lesson' = explanation + playground; 'project' = interactive mini app.
 *
 * @typedef {Object} ModuleMeta
 * @property {string} id
 * @property {number} number    Display number ("Module 3").
 * @property {string} title
 * @property {string} summary   One sentence shown on the dashboard and roadmap.
 * @property {LessonMeta[]} lessons
 */

/** @type {ModuleMeta[]} */
export const MODULES = [
  {
    id: 'fundamentals',
    number: 1,
    title: 'JavaScript Fundamentals',
    summary: 'The JavaScript building blocks every OOP concept depends on.',
    lessons: [
      { id: 'variables-types', title: 'Variables and Data Types', kind: 'lesson' },
      { id: 'functions', title: 'Functions and Arrow Functions', kind: 'lesson' },
      { id: 'arrays-objects', title: 'Arrays and Objects', kind: 'lesson' },
      { id: 'scope-closures', title: 'Scope and Closures', kind: 'lesson' },
      { id: 'this-keyword', title: 'The this Keyword', kind: 'lesson' },
      { id: 'constructor-functions', title: 'Constructor Functions', kind: 'lesson' },
      { id: 'es6-classes', title: 'ES6 Classes', kind: 'lesson' },
      { id: 'object-references', title: 'Object References', kind: 'lesson' },
    ],
  },
  {
    id: 'oop-basics',
    number: 2,
    title: 'Introduction to OOP',
    summary: 'Think in objects: classes, instances, properties, and methods.',
    lessons: [
      { id: 'what-is-oop', title: 'What Is OOP?', kind: 'lesson' },
      { id: 'procedural-vs-oop', title: 'Procedural vs Object-Oriented', kind: 'lesson' },
      { id: 'classes-objects', title: 'Classes and Objects', kind: 'lesson' },
      { id: 'properties-methods', title: 'Properties and Methods', kind: 'lesson' },
      { id: 'constructors-instances', title: 'Constructors and Instances', kind: 'lesson' },
      { id: 'this-in-classes', title: 'this Inside Classes', kind: 'lesson' },
      { id: 'static-members', title: 'Static Properties and Methods', kind: 'lesson' },
    ],
  },
  {
    id: 'pillars',
    number: 3,
    title: 'Four Pillars of OOP',
    summary: 'Encapsulation, abstraction, inheritance, and polymorphism in depth.',
    lessons: [
      { id: 'encapsulation', title: 'Encapsulation', kind: 'lesson' },
      { id: 'abstraction', title: 'Abstraction', kind: 'lesson' },
      { id: 'inheritance', title: 'Inheritance', kind: 'lesson' },
      { id: 'polymorphism', title: 'Polymorphism', kind: 'lesson' },
    ],
  },
  {
    id: 'advanced',
    number: 4,
    title: 'Advanced OOP',
    summary: 'Design principles and patterns used in real codebases.',
    lessons: [
      { id: 'composition-vs-inheritance', title: 'Composition vs Inheritance', kind: 'lesson' },
      { id: 'association-aggregation', title: 'Association and Aggregation', kind: 'lesson' },
      { id: 'dependency-injection', title: 'Dependency Injection Basics', kind: 'lesson' },
      { id: 'solid', title: 'SOLID Principles', kind: 'lesson' },
      { id: 'factory-pattern', title: 'Factory Pattern', kind: 'lesson' },
      { id: 'singleton-pattern', title: 'Singleton Pattern', kind: 'lesson' },
      { id: 'strategy-pattern', title: 'Strategy Pattern', kind: 'lesson' },
      { id: 'observer-pattern', title: 'Observer Pattern', kind: 'lesson' },
      { id: 'prototype-chain', title: 'The Prototype Chain', kind: 'lesson' },
    ],
  },
  {
    id: 'projects',
    number: 5,
    title: 'Mini Projects',
    summary: 'Small working apps that put each concept into practice.',
    lessons: [
      { id: 'student-management', title: 'Student Management System', kind: 'project' },
      { id: 'bank-account', title: 'Bank Account Simulator', kind: 'project' },
      { id: 'employee-management', title: 'Employee Management System', kind: 'project' },
      { id: 'shopping-cart', title: 'Shopping Cart', kind: 'project' },
    ],
  },
  {
    id: 'final',
    number: 6,
    title: 'Final Project',
    summary: 'A Library Management System that uses all four pillars together.',
    lessons: [
      { id: 'library-management', title: 'Library Management System', kind: 'project' },
    ],
  },
];

// Flattened, ordered list of every lesson with its module attached.
// Built once so lookups below are simple array/map operations.
const ORDERED_LESSONS = MODULES.flatMap((module) =>
  module.lessons.map((lesson) => ({ ...lesson, moduleId: module.id }))
);
const LESSONS_BY_ID = new Map(ORDERED_LESSONS.map((lesson) => [lesson.id, lesson]));

/** All lessons in learning order. */
export function getAllLessons() {
  return ORDERED_LESSONS;
}

/** @returns {(LessonMeta & {moduleId: string}) | undefined} */
export function getLesson(id) {
  return LESSONS_BY_ID.get(id);
}

/** @returns {ModuleMeta | undefined} */
export function getModule(id) {
  return MODULES.find((module) => module.id === id);
}

/** The lessons immediately before and after `id`, crossing module boundaries. */
export function getAdjacentLessons(id) {
  const index = ORDERED_LESSONS.findIndex((lesson) => lesson.id === id);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: ORDERED_LESSONS[index - 1] ?? null,
    next: ORDERED_LESSONS[index + 1] ?? null,
  };
}
