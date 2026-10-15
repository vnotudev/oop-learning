// script.js — turns the lesson data in content.js into an interactive page.
// All content is built with createElement/textContent, never innerHTML.
const { concepts, together, whyOop, cheatSheet, quiz, runCode } = window.OOP;
const $ = selector => document.querySelector(selector);

// ---------- Small DOM helpers ----------

function el(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...[].concat(children));
  return node;
}

// Supports `code` and **bold** inside lesson text, safely.
function rich(text) {
  const fragment = document.createDocumentFragment();
  for (const part of text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/)) {
    if (!part) continue;
    if (part.startsWith('`')) fragment.append(el('code', { textContent: part.slice(1, -1) }));
    else if (part.startsWith('**')) fragment.append(el('strong', { textContent: part.slice(2, -2) }));
    else if (part.startsWith('*') && part.length > 2) fragment.append(el('em', { textContent: part.slice(1, -1) }));
    else fragment.append(part);
  }
  return fragment;
}

// A tiny syntax highlighter: comments, strings, keywords, numbers and #private names.
const TOKENS = /(\/\/[^\n]*)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")|\b(class|extends|constructor|new|return|this|super|const|let|if|else|throw|try|catch|for|of|in|function|get|set|static|typeof|instanceof|switch|case|true|false|null|undefined)\b|(\b\d+(?:\.\d+)?\b)|(#[A-Za-z_]\w*)/g;
const TOKEN_CLASSES = ['tok-comment', 'tok-string', 'tok-keyword', 'tok-number', 'tok-private'];

function highlight(target, code) {
  target.replaceChildren();
  let last = 0;
  for (const match of code.matchAll(TOKENS)) {
    target.append(code.slice(last, match.index));
    const group = match.slice(1).findIndex(Boolean);
    target.append(el('span', { className: TOKEN_CLASSES[group], textContent: match[0] }));
    last = match.index + match[0].length;
  }
  target.append(code.slice(last));
}

function codeBlock(code) {
  const codeEl = el('code');
  highlight(codeEl, code);
  return el('pre', {}, codeEl);
}

function showRun(outputEl, code) {
  const result = runCode(code);
  outputEl.textContent = result.output || '(No output)';
  outputEl.classList.toggle('error', !result.ok);
}

function copyButton(getText) {
  const button = el('button', { className: 'ghost', textContent: 'Copy code', type: 'button' });
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(getText());
      button.textContent = 'Copied!';
    } catch {
      button.textContent = 'Copy failed';
    }
    setTimeout(() => (button.textContent = 'Copy code'), 1500);
  });
  return button;
}

// ---------- Hero ----------

const exampleCount = concepts.reduce((sum, c) => sum + c.examples.length, 0) + 1;
$('#heroStats').append(
  el('li', {}, [el('strong', { textContent: concepts.length }), ' concepts']),
  el('li', {}, [el('strong', { textContent: exampleCount }), ' runnable examples']),
  el('li', {}, [el('strong', { textContent: quiz.length }), ' quiz questions']),
);

// ---------- 1. Why OOP ----------

highlight($('#whyProcedural'), whyOop.procedural);
highlight($('#whyOop'), whyOop.oop);
whyOop.helps.forEach(text => $('#whyHelps').append(el('li', {}, rich(text))));
whyOop.overkill.forEach(text => $('#whyOverkill').append(el('li', {}, rich(text))));

// ---------- 2. Concepts ----------

const conceptButtons = $('#conceptButtons');
const conceptPanel = $('#conceptPanel');

function section(title, ...children) {
  return el('section', { className: 'block' }, [el('h4', { textContent: title }), ...children]);
}

function renderExamples(concept) {
  const tabs = el('div', { className: 'subtabs', role: 'tablist' });
  const body = el('div', { className: 'example' });

  function show(index) {
    const example = concept.examples[index];
    const output = el('div', { className: 'output', textContent: 'Predict the output, then click Run.' });
    const run = el('button', { textContent: 'Run example', type: 'button' });
    run.addEventListener('click', () => showRun(output, example.code));
    body.replaceChildren(
      el('p', { className: 'example-note' }, rich(example.note)),
      codeBlock(example.code),
      el('div', { className: 'actions' }, [run, copyButton(() => example.code)]),
      output,
    );
    [...tabs.children].forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
      tab.setAttribute('aria-selected', String(i === index));
    });
  }

  concept.examples.forEach((example, index) => {
    const tab = el('button', { type: 'button', role: 'tab' }, rich(`${index + 1}. ${example.title}`));
    tab.addEventListener('click', () => show(index));
    tabs.append(tab);
  });
  show(0);
  return [tabs, body];
}

function showConcept(index) {
  const c = concepts[index];
  conceptPanel.replaceChildren(
    el('h3', { textContent: c.name }),
    el('p', { className: 'lead' }, rich(c.summary)),

    section('In plain words', ...c.explanation.map(p => el('p', {}, rich(p)))),

    el('aside', { className: 'callout' }, [
      el('span', { className: 'callout-label', textContent: 'Real-world analogy' }),
      el('strong', { textContent: c.analogy.title }),
      el('p', {}, rich(c.analogy.body)),
    ]),

    section('Where you will see it in real software',
      el('ul', { className: 'bullets' }, c.realWorld.map(text => el('li', {}, rich(text))))),

    section(`Examples (${c.examples.length})`, ...renderExamples(c)),

    section('Common mistakes',
      el('div', { className: 'mistakes' }, c.mistakes.map(m => el('div', { className: 'mistake' }, [
        el('p', {}, [el('span', { className: 'badge bad', textContent: 'Mistake' }), ' ', rich(m.wrong)]),
        el('p', { className: 'muted' }, [el('strong', { textContent: 'Why it hurts: ' }), rich(m.why)]),
        el('p', {}, [el('span', { className: 'badge good', textContent: 'Fix' }), ' ', rich(m.fix)]),
      ])))),

    section('Key takeaways',
      el('ul', { className: 'takeaways' }, c.keyPoints.map(text => el('li', {}, rich(text))))),
  );
  [...conceptButtons.children].forEach((button, i) => {
    button.classList.toggle('active', i === index);
    button.setAttribute('aria-selected', String(i === index));
  });
}

concepts.forEach((concept, index) => {
  const button = el('button', { textContent: concept.name, type: 'button', role: 'tab' });
  button.addEventListener('click', () => showConcept(index));
  conceptButtons.append(button);
});
showConcept(0);

// ---------- 3. Bank demo ----------
// The class source below is shown on the page via Function.prototype.toString(),
// so the "See the classes" panel can never drift from the code that runs.

const roundCents = value => Math.round(value * 100) / 100;

class BankAccount {
  #balance;
  #history = [];

  constructor(holder, startingBalance) {
    if (!holder.trim()) throw new Error('Enter an account holder.');
    if (!Number.isFinite(startingBalance) || startingBalance < 0) {
      throw new Error('Starting balance must be zero or greater.');
    }
    this.holder = holder.trim();
    this.#balance = roundCents(startingBalance);
    this.#record('Opened', startingBalance);
  }

  get balance() { return this.#balance; }
  get history() { return [...this.#history]; } // a copy, so callers can't edit it
  get kind() { return 'Standard account'; }
  get rules() { return 'You can only withdraw money you have.'; }

  deposit(amount, label = 'Deposit') {
    this.#validate(amount);
    this.#balance = roundCents(this.#balance + amount);
    this.#record(label, amount);
  }

  withdraw(amount) {
    this.#validate(amount);
    this.checkWithdrawal(amount); // subclasses change the rules here
    this.#balance = roundCents(this.#balance - amount);
    this.#record('Withdrawal', -amount);
  }

  checkWithdrawal(amount) {
    if (amount > this.#balance) throw new Error('Insufficient funds.');
  }

  #validate(amount) {
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter an amount greater than zero.');
  }

  #record(type, amount) {
    this.#history.push({ type, amount, balanceAfter: this.#balance });
  }
}

class CheckingAccount extends BankAccount {
  static OVERDRAFT_LIMIT = 200;

  get kind() { return 'Checking account'; }
  get rules() { return 'You may go up to $' + CheckingAccount.OVERDRAFT_LIMIT + ' below zero.'; }

  checkWithdrawal(amount) {
    if (this.balance - amount < -CheckingAccount.OVERDRAFT_LIMIT) {
      throw new Error('That would go past your $' + CheckingAccount.OVERDRAFT_LIMIT + ' overdraft limit.');
    }
  }
}

class SavingsAccount extends BankAccount {
  static INTEREST_RATE = 0.02;
  static MAX_WITHDRAWALS = 3;
  #withdrawalsLeft = SavingsAccount.MAX_WITHDRAWALS;

  get kind() { return 'Savings account'; }
  get rules() { return 'No overdraft, ' + this.#withdrawalsLeft + ' withdrawal(s) left this month, earns interest.'; }

  checkWithdrawal(amount) {
    if (this.#withdrawalsLeft === 0) {
      throw new Error('Savings accounts allow only ' + SavingsAccount.MAX_WITHDRAWALS + ' withdrawals per month.');
    }
    super.checkWithdrawal(amount); // keep the parent's "no overdraft" rule too
  }

  withdraw(amount) {
    super.withdraw(amount);
    this.#withdrawalsLeft--;
  }

  addInterest() {
    const interest = roundCents(this.balance * SavingsAccount.INTEREST_RATE);
    if (interest <= 0) throw new Error('No interest is paid on a zero balance.');
    this.deposit(interest, 'Interest');
    return interest;
  }
}

const ACCOUNT_CLASSES = { standard: BankAccount, checking: CheckingAccount, savings: SavingsAccount };
let account = null;

const historyList = $('#history');
const message = $('#bankMessage');
const money = amount => (amount < 0 ? '-$' : '$') + Math.abs(amount).toFixed(2);

highlight($('#bankSource'), [BankAccount, CheckingAccount, SavingsAccount].map(String).join('\n\n'));

function explain(code, pillar, text) {
  highlight($('#explainCode'), code);
  $('#explainPillar').textContent = pillar;
  $('#explainText').replaceChildren(rich(text));
}

function setMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('error', isError);
}

function refresh() {
  $('#balance').textContent = account ? money(account.balance) : 'No account yet';
  $('#balance').classList.toggle('negative', Boolean(account && account.balance < 0));
  $('#accountInfo').textContent = account
    ? `${account.holder} • ${account.kind} • ${account.rules}`
    : 'Create an account to begin';

  historyList.replaceChildren();
  const entries = account ? account.history.reverse() : [];
  if (entries.length === 0) historyList.append(el('li', { textContent: 'No transactions yet.' }));
  for (const entry of entries) {
    historyList.append(el('li', {}, [
      el('span', { textContent: entry.type }),
      el('span', { className: entry.amount < 0 ? 'neg' : 'pos', textContent: (entry.amount < 0 ? '' : '+') + money(entry.amount) }),
      el('span', { className: 'muted', textContent: 'balance ' + money(entry.balanceAfter) }),
    ]));
  }
}

function readAmount() {
  const raw = $('#amount').value;
  return raw.trim() === '' ? NaN : Number(raw);
}

// Returns false (and tells the learner why) when there is no account yet.
function hasAccount() {
  if (!account) setMessage('Create an account first.', true);
  return Boolean(account);
}

$('#create').addEventListener('click', () => {
  const type = $('#accountType').value;
  const AccountClass = ACCOUNT_CLASSES[type];
  const holder = $('#holder').value;
  const start = Number($('#initial').value);
  const code = `account = new ${AccountClass.name}('${holder.trim()}', ${start});`;
  try {
    account = new AccountClass(holder, start);
    setMessage(`${account.kind} created.`);
    explain(code, 'Class & Object' + (type === 'standard' ? '' : ' + Inheritance'),
      type === 'standard'
        ? 'A new object was built from the `BankAccount` class. The constructor checked the inputs before the object could exist, then stored the starting balance in the private `#balance` field.'
        : `A new object was built from \`${AccountClass.name}\`. It has no constructor of its own, so the inherited \`BankAccount\` constructor ran and set up the private balance. The object is an instance of both classes.`);
  } catch (error) {
    setMessage(error.message, true);
    explain(code, 'Constructor validation', `The constructor threw an error: **${error.message}** No object was created, so an invalid account can never exist.`);
  }
  refresh();
});

$('#deposit').addEventListener('click', () => {
  if (!hasAccount()) return;
  const amount = readAmount();
  const code = `account.deposit(${Number.isFinite(amount) ? amount : "''"});`;
  try {
    account.deposit(amount);
    setMessage(`Deposited ${money(amount)}.`);
    explain(code, 'Encapsulation', '`deposit()` is the only way to add money. It validated the amount with the private `#validate()` method, then updated the private `#balance` and recorded the transaction.');
  } catch (error) {
    setMessage(error.message, true);
    explain(code, 'Encapsulation', `The method refused the change: **${error.message}** Because \`#balance\` is private, there is no way around this check.`);
  }
  refresh();
});

$('#withdraw').addEventListener('click', () => {
  if (!hasAccount()) return;
  const amount = readAmount();
  const code = `account.withdraw(${Number.isFinite(amount) ? amount : "''"});\n// → this.checkWithdrawal(amount) runs the ${account.constructor.name} version`;
  try {
    account.withdraw(amount);
    setMessage(`Withdrew ${money(amount)}.`);
    explain(code, 'Polymorphism', `\`withdraw()\` is written once in \`BankAccount\`, but it calls \`this.checkWithdrawal()\` — and each account type answers differently. This is a **${account.kind}**: ${account.rules} Switch account type and try the same withdrawal to see a different result.`);
  } catch (error) {
    setMessage(error.message, true);
    explain(code, 'Polymorphism', `The ${account.constructor.name} rules said no: **${error.message}** The same \`withdraw()\` call can succeed on one account type and fail on another.`);
  }
  refresh();
});

$('#interest').addEventListener('click', () => {
  if (!hasAccount()) return;
  try {
    if (typeof account.addInterest !== 'function') {
      explain(`typeof account.addInterest; // 'undefined'`, 'Inheritance',
        `Only \`SavingsAccount\` defines \`addInterest()\`. A ${account.kind.toLowerCase()} simply does not have that method. Child classes can add abilities their siblings do not share.`);
      setMessage(`A ${account.kind.toLowerCase()} does not earn interest.`, true);
      return;
    }
    const interest = account.addInterest();
    setMessage(`Added ${money(interest)} interest.`);
    explain('account.addInterest();', 'Inheritance',
      '`addInterest()` exists only on `SavingsAccount`. It reuses the inherited `deposit()` method to add the money, so the validation and history logic is not duplicated.');
  } catch (error) {
    setMessage(error.message, true);
  }
  refresh();
});

$('#hack').addEventListener('click', () => {
  if (!hasAccount()) return;
  try {
    const before = account.balance;
    try { account.balance = 1000000; } catch { /* strict mode throws; either way nothing changes */ }
    setMessage(`Balance is still ${money(account.balance)}.`);
    explain(`account.balance = 1000000;  // ignored\naccount.#balance = 1000000; // SyntaxError`, 'Encapsulation',
      `\`balance\` has a getter but **no setter**, so outside code can read it but not change it. The real value lives in \`#balance\`, which code outside the class cannot even mention. Balance before: ${money(before)}, after: ${money(account.balance)}.`);
  } catch (error) {
    setMessage(error.message, true);
  }
});

// ---------- 4. Putting it all together ----------

$('#togetherTitle').textContent = together.title;
$('#togetherIntro').replaceChildren(rich(together.intro));
highlight($('#togetherCode'), together.code);
$('#runTogether').addEventListener('click', () => showRun($('#togetherOutput'), together.code));
for (const { pillar, where } of together.map) {
  $('#togetherMap').append(el('dt', { textContent: pillar }), el('dd', {}, rich(where)));
}

// ---------- 5. Quiz ----------

const quizContainer = $('#quizQuestions');
quiz.forEach((question, i) => {
  const [prompt, ...codeParts] = question.q.split('\n\n');
  const fieldset = el('fieldset', { className: 'question' }, [
    el('legend', {}, [`${i + 1}. `, rich(prompt)]),
  ]);
  if (codeParts.length) fieldset.append(codeBlock(codeParts.join('\n\n')));
  question.options.forEach((option, j) => {
    const radio = el('input', { type: 'radio', name: `question-${i}`, value: String(j) });
    fieldset.append(el('label', {}, [radio, ' ', rich(option)]));
  });
  fieldset.append(el('p', { className: 'feedback', hidden: true }));
  quizContainer.append(fieldset);
});

$('#checkQuiz').addEventListener('click', () => {
  let correct = 0;
  let answered = 0;
  quiz.forEach((question, i) => {
    const fieldset = quizContainer.children[i];
    const picked = fieldset.querySelector('input:checked');
    const feedback = fieldset.querySelector('.feedback');
    const isRight = picked && Number(picked.value) === question.answer;
    if (picked) answered++;
    if (isRight) correct++;
    fieldset.classList.toggle('right', Boolean(isRight));
    fieldset.classList.toggle('wrong', Boolean(picked && !isRight));
    feedback.hidden = false;
    feedback.replaceChildren(
      el('strong', { textContent: isRight ? '✔ Correct. ' : picked ? '✘ Not quite. ' : 'Not answered. ' }),
      isRight ? '' : rich(`Answer: ${question.options[question.answer]}. `),
      rich(question.explain),
    );
  });
  const verdict = correct === quiz.length ? 'Excellent — you have got it!'
    : correct >= quiz.length * 0.7 ? 'Great work. Read the explanations for the ones you missed.'
    : 'Review the concepts above, then try again.';
  const unanswered = quiz.length - answered;
  $('#quizResult').textContent = `Your score: ${correct}/${quiz.length}. ${verdict}${unanswered ? ` (${unanswered} unanswered)` : ''}`;
});

$('#resetQuiz').addEventListener('click', () => {
  quizContainer.querySelectorAll('input').forEach(input => (input.checked = false));
  quizContainer.querySelectorAll('.question').forEach(fieldset => fieldset.classList.remove('right', 'wrong'));
  quizContainer.querySelectorAll('.feedback').forEach(feedback => (feedback.hidden = true));
  $('#quizResult').textContent = '';
});

// ---------- 6. Cheat sheet ----------

for (const row of cheatSheet) {
  $('#cheatBody').append(el('tr', {}, [
    el('th', { scope: 'row', textContent: row.concept }),
    el('td', { textContent: row.idea }),
    el('td', {}, el('code', { textContent: row.syntax })),
    el('td', { textContent: row.example }),
  ]));
}
