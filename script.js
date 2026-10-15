// STEP 1: Learn OOP concepts through executable JavaScript examples.
const concepts = [
  { name: 'Class & Object', description: 'A class is a blueprint. An object is an instance created from that blueprint.', code: `class Employee {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return 'Hello, ' + this.name;
  }
}
const employee = new Employee('Alex');
console.log(employee.greet());` },
  { name: 'Encapsulation', description: 'Encapsulation keeps internal state private and exposes safe ways to change it.', code: `class Wallet {
  #balance = 100;
  deposit(amount) {
    if (amount <= 0) throw Error('Invalid amount');
    this.#balance += amount;
  }
  get balance() { return this.#balance; }
}
const wallet = new Wallet();
wallet.deposit(50);
console.log(wallet.balance);` },
  { name: 'Inheritance', description: 'A subclass can reuse and extend behavior from a parent class.', code: `class Animal {
  speak() { return 'Some sound'; }
}
class Dog extends Animal {
  speak() { return 'Woof!'; }
}
const dog = new Dog();
console.log(dog.speak());` },
  { name: 'Polymorphism', description: 'Different objects can respond differently to the same method call.', code: `class Cat { speak() { return 'Meow'; } }
class Dog { speak() { return 'Woof'; } }
const animals = [new Cat(), new Dog()];
animals.forEach(animal => console.log(animal.speak()));` },
  { name: 'Abstraction', description: 'Abstraction exposes what an object can do while hiding how it works. JavaScript can express this through a public interface.', code: `class PaymentService {
  pay(amount) {
    if (amount <= 0) throw Error('Invalid amount');
    return this.#sendPayment(amount);
  }
  #sendPayment(amount) {
    return 'Paid $' + amount;
  }
}
console.log(new PaymentService().pay(25));` }
];
const buttons = document.querySelector('#conceptButtons');
let selected = 0;
function showConcept(index) {
  selected = index;
  const item = concepts[index];
  document.querySelector('#conceptTitle').textContent = item.name;
  document.querySelector('#conceptText').textContent = item.description;
  document.querySelector('#conceptCode').textContent = item.code;
  document.querySelector('#exampleOutput').textContent = 'Click Run example to see the result.';
  [...buttons.children].forEach((button, i) => button.classList.toggle('active', i === index));
}
concepts.forEach((item, index) => {
  const button = document.createElement('button');
  button.textContent = item.name;
  button.addEventListener('click', () => showConcept(index));
  buttons.append(button);
});
document.querySelector('#runExample').addEventListener('click', () => {
  const lines = [];
  const safeConsole = { log: (...args) => lines.push(args.join(' ')) };
  try {
    // Only trusted, hardcoded lesson examples are evaluated here.
    new Function('console', concepts[selected].code)(safeConsole);
    document.querySelector('#exampleOutput').textContent = lines.join('\n') || '(No output)';
  } catch (error) {
    document.querySelector('#exampleOutput').textContent = error.message;
  }
});
showConcept(0);

// STEP 2: Encapsulation: balance is private and only methods can change it.
class BankAccount {
  #balance;
  constructor(holder, startingBalance) {
    if (!holder.trim()) throw Error('Enter an account holder.');
    if (!Number.isFinite(startingBalance) || startingBalance < 0) throw Error('Starting balance must be zero or greater.');
    this.holder = holder.trim();
    this.#balance = startingBalance;
  }
  get balance() { return this.#balance; }
  deposit(amount) {
    this.#validate(amount);
    this.#balance += amount;
  }
  withdraw(amount) {
    this.#validate(amount);
    if (amount > this.#balance) throw Error('Insufficient funds.');
    this.#balance -= amount;
  }
  #validate(amount) {
    if (!Number.isFinite(amount) || amount <= 0) throw Error('Enter an amount greater than zero.');
  }
}
let account = null;
const history = document.querySelector('#history');
const message = document.querySelector('#bankMessage');
const money = amount => '$' + amount.toFixed(2);
function refresh() {
  document.querySelector('#balance').textContent = account ? money(account.balance) : 'No account yet';
  document.querySelector('#accountInfo').textContent = account ? 'Account holder: ' + account.holder : 'Create an account to begin';
}
function addHistory(text) {
  if (history.children.length === 1 && history.firstElementChild.textContent === 'No transactions yet.') history.replaceChildren();
  const li = document.createElement('li');
  li.textContent = text;
  history.prepend(li);
}
document.querySelector('#create').addEventListener('click', () => {
  try {
    account = new BankAccount(document.querySelector('#holder').value, Number(document.querySelector('#initial').value));
    history.replaceChildren();
    addHistory('Account created with ' + money(account.balance));
    message.textContent = 'Account created successfully.';
    refresh();
  } catch (error) { message.textContent = error.message; }
});
function transact(type) {
  try {
    if (!account) throw Error('Create an account first.');
    const raw = document.querySelector('#amount').value;
    const amount = raw.trim() === '' ? NaN : Number(raw);
    account[type](amount);
    addHistory((type === 'deposit' ? 'Deposited ' : 'Withdrew ') + money(amount));
    message.textContent = 'Transaction successful.';
    refresh();
  } catch (error) { message.textContent = error.message; }
}
document.querySelector('#deposit').addEventListener('click', () => transact('deposit'));
document.querySelector('#withdraw').addEventListener('click', () => transact('withdraw'));

// STEP 3: Test what you learned.
const questions = [
  { q: 'What is a class?', options: ['A blueprint for objects', 'A CSS selector only', 'A database'], answer: 0 },
  { q: 'What does encapsulation protect?', options: ['Page layout', 'Internal object state', 'Network speed'], answer: 1 },
  { q: 'Which keyword creates a subclass in JavaScript?', options: ['implements', 'extends', 'import'], answer: 1 },
  { q: 'What is polymorphism?', options: ['Only one object exists', 'Objects must share fields', 'Different objects support the same operation'], answer: 2 },
  { q: 'What does abstraction hide?', options: ['Implementation details', 'All methods', 'All objects'], answer: 0 }
];
const quizContainer = document.querySelector('#quizQuestions');
questions.forEach((question, i) => {
  const group = document.createElement('div');
  group.className = 'question';
  const title = document.createElement('p');
  title.textContent = `${i + 1}. ${question.q}`;
  group.append(title);
  question.options.forEach((option, j) => {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio'; radio.name = `question-${i}`; radio.value = String(j);
    label.append(radio, ' ' + option);
    group.append(label);
  });
  quizContainer.append(group);
});
document.querySelector('#checkQuiz').addEventListener('click', () => {
  let correct = 0;
  questions.forEach((q, i) => {
    const selected = document.querySelector(`input[name="question-${i}"]:checked`);
    if (selected && Number(selected.value) === q.answer) correct++;
  });
  document.querySelector('#quizResult').textContent = `Your score: ${correct}/${questions.length}. ${correct === questions.length ? 'Excellent!' : 'Review the concepts and try again.'}`;
});
document.querySelector('#resetQuiz').addEventListener('click', () => {
  document.querySelectorAll('#quizQuestions input').forEach(input => input.checked = false);
  document.querySelector('#quizResult').textContent = '';
});
