// content.js — everything the page teaches, kept apart from the code that displays it.
//
// Each concept has: a summary, a plain-words explanation, a real-world analogy,
// places you'll meet it in real software, runnable examples, common mistakes,
// and key takeaways. `output` on each example is what Run should print; the test
// in tests/content.test.js runs every example and checks it, so the text never lies.
//
// Text fields support two kinds of inline formatting: `code` and **bold**.
// Loaded as a classic script (works from file://) and also imported by Node tests.

(function () {
  const concepts = [
    {
      id: 'class-object',
      name: 'Class & Object',
      summary: 'A class is a blueprint. An object is a real thing built from that blueprint.',
      explanation: [
        'A **class** describes what a kind of thing *has* (its data, called **properties**) and what it can *do* (its functions, called **methods**). The class itself holds no real data — it is only the plan.',
        'An **object** (also called an **instance**) is created from a class with the `new` keyword. Every object gets its own copy of the properties, but all objects made from the same class share the same methods.',
        'Why bother? Without classes you end up copy-pasting the same shape of object everywhere, and the functions that work on that data live somewhere else. A class keeps the data and the behaviour that belongs to it in one place, so it is easier to find, reuse and change.',
      ],
      analogy: {
        title: 'A house blueprint',
        body: 'An architect draws one blueprint (the class). A builder can build many houses from it (objects). Each house has its own paint colour and owner (property values), but every house has the same rooms and doors (methods) because they came from the same plan.',
      },
      realWorld: [
        '**Online stores:** every item for sale is a `Product` object with a `name`, `price` and `stock`.',
        '**Social apps:** each account is a `User` with a `username`, `followers` and methods like `follow()`.',
        '**Games:** every enemy on screen is an `Enemy` instance with its own `health` and `position`.',
        '**JavaScript itself:** `new Date()`, `new Map()` and `new URL()` are built-in classes you already use.',
      ],
      examples: [
        {
          title: 'Products in an online store',
          note: 'One `Product` class, many product objects. Each object holds its own data; the methods work on whichever object they are called on.',
          code: `class Product {
  constructor(name, price, stock) {
    this.name = name;
    this.price = price;
    this.stock = stock;
  }

  isAvailable() {
    return this.stock > 0;
  }

  label() {
    return this.name + ' - $' + this.price.toFixed(2);
  }
}

const phone = new Product('Phone', 699, 12);
const headphones = new Product('Headphones', 59.9, 0);

console.log(phone.label());
console.log(headphones.label());
console.log('Phone available?', phone.isAvailable());
console.log('Headphones available?', headphones.isAvailable());`,
          output: `Phone - $699.00
Headphones - $59.90
Phone available? true
Headphones available? false`,
        },
        {
          title: 'Each object owns its data',
          note: 'Two counters made from the same class do not affect each other — but they share one copy of the `increment` method.',
          code: `class Counter {
  constructor() {
    this.count = 0;
  }
  increment() {
    this.count++;
    return this.count;
  }
}

const likes = new Counter();
const views = new Counter();

likes.increment();
likes.increment();
views.increment();

console.log('likes:', likes.count);
console.log('views:', views.count);
console.log('Same method shared?', likes.increment === views.increment);`,
          output: `likes: 2
views: 1
Same method shared? true`,
        },
        {
          title: 'Built-in classes you already use',
          note: 'You have been using objects all along. `Date`, `Map` and `URL` are classes; `new` creates instances of them.',
          code: `const launch = new Date(2026, 0, 15);
console.log(launch.getFullYear());

const prices = new Map();
prices.set('coffee', 3.5);
console.log(prices.get('coffee'));

const link = new URL('https://shop.example.com/cart?item=42');
console.log(link.hostname);
console.log(link.searchParams.get('item'));

console.log(launch instanceof Date);`,
          output: `2026
3.5
shop.example.com
42
true`,
        },
        {
          title: 'Many objects in a list',
          note: 'Real apps work with collections of objects. Because every `User` has an `isInfluencer()` method, you can filter the list with it.',
          code: `class User {
  constructor(username, followers) {
    this.username = username;
    this.followers = followers;
  }
  isInfluencer() {
    return this.followers >= 10000;
  }
}

const users = [
  new User('sokha', 120),
  new User('dara_travels', 25000),
  new User('mealea_cooks', 15300),
];

const influencers = users
  .filter(user => user.isInfluencer())
  .map(user => user.username);

console.log(influencers.join(', '));
console.log(users.length + ' users created from 1 class');`,
          output: `dara_travels, mealea_cooks
3 users created from 1 class`,
        },
      ],
      mistakes: [
        {
          wrong: "Forgetting `new`: `const p = Product('Pen', 2, 5);`",
          why: "Calling a class like a normal function throws `TypeError: Class constructor Product cannot be invoked without 'new'`.",
          fix: "Always create instances with `new Product('Pen', 2, 5)`.",
        },
        {
          wrong: 'Writing `return name;` inside a method instead of `return this.name;`',
          why: '`name` looks for a variable, not the object\'s property, so you get `undefined` or a `ReferenceError`.',
          fix: 'Inside a class, reach the object\'s own data through `this`.',
        },
        {
          wrong: 'Writing `function label() { ... }` inside a class body',
          why: 'The `function` keyword is not allowed there — it is a `SyntaxError`.',
          fix: 'Methods are written without it: `label() { ... }`.',
        },
      ],
      keyPoints: [
        'A class is a blueprint; an object is an instance made with `new`.',
        'Properties hold data; methods hold behaviour.',
        'Each object owns its own data, while methods are shared by all instances.',
      ],
    },

    {
      id: 'constructor-this',
      name: 'Constructor & this',
      summary: 'The constructor sets up each new object. `this` means "the object this code is running for".',
      explanation: [
        'When you write `new User(\'Alex\')`, JavaScript does three things: it creates an empty object, runs the `constructor` with `this` pointing at that new object, then hands the object back to you.',
        'The constructor is the place for **required setup**: storing the arguments, setting default values, and rejecting bad input early — so an invalid object can never exist.',
        'Inside any method, `this` is **the object before the dot**. In `alex.greet()`, `this` is `alex`. If you lose the dot — for example by passing `alex.greet` as a callback — `this` gets lost too. This is one of the most common bugs in JavaScript.',
        '**Class fields** (`items = [];` written directly in the class body) are a short way to give every new object a default value without writing a constructor.',
      ],
      analogy: {
        title: 'Joining a gym',
        body: 'The front desk (the constructor) takes your details, checks your ID, and gives you a member card with your name and a default plan. Later, when you say "my plan", the word "my" (`this`) means your own card — not anyone else\'s.',
      },
      realWorld: [
        '**Checkout forms:** `new Order(customer, items)` checks required fields once, when the order is created.',
        '**App settings:** `new Settings()` starts with sensible defaults like `theme = \'light\'`.',
        '**Browser events:** `button.addEventListener(\'click\', () => this.save())` — the arrow function keeps `this` pointing at your object.',
        '**Fluent APIs:** libraries like jQuery and query builders return `this` so you can chain calls: `query.where(...).limit(10)`.',
      ],
      examples: [
        {
          title: 'Defaults and validation',
          note: 'The constructor gives `shipping` a default and refuses to build an order with no items. A broken `Order` can never exist.',
          code: `class Order {
  constructor(customer, items, shipping = 'standard') {
    if (!customer) throw new Error('Order needs a customer');
    if (items.length === 0) throw new Error('Order needs at least one item');

    this.customer = customer;
    this.items = items;
    this.shipping = shipping;
    this.status = 'pending';
  }
}

const order = new Order('Dara', ['Book', 'Pen']);
console.log(order.customer, order.shipping, order.status);

const rush = new Order('Mealea', ['Laptop'], 'express');
console.log(rush.shipping);

try {
  new Order('Sokha', []);
} catch (error) {
  console.log('Rejected:', error.message);
}`,
          output: `Dara standard pending
express
Rejected: Order needs at least one item`,
        },
        {
          title: '`this` is the object before the dot',
          note: 'The same `addPoints` method updates whichever player you call it on. Returning `this` lets you chain calls.',
          code: `class Player {
  constructor(name) {
    this.name = name;
    this.score = 0;
  }
  addPoints(points) {
    this.score += points;
    return this; // allows chaining
  }
  report() {
    return this.name + ' has ' + this.score + ' points';
  }
}

const nita = new Player('Nita');
const rith = new Player('Rith');

nita.addPoints(10);
rith.addPoints(3);
console.log(nita.report());
console.log(rith.report());

nita.addPoints(5).addPoints(5);
console.log(nita.report());`,
          output: `Nita has 10 points
Rith has 3 points
Nita has 20 points`,
        },
        {
          title: 'Losing `this` (and two fixes)',
          note: 'Copying a method into a variable detaches it from its object. `bind` or an arrow function puts the object back.',
          code: `class Timer {
  constructor(label) {
    this.label = label;
  }
  describe() {
    return 'Timer: ' + this.label;
  }
}

const timer = new Timer('Pomodoro');

const detached = timer.describe; // no dot when called = no this
try {
  detached();
} catch (error) {
  console.log('Broken:', error.message);
}

const bound = timer.describe.bind(timer);
console.log('Fix 1 (bind):', bound());

const wrapped = () => timer.describe();
console.log('Fix 2 (arrow):', wrapped());`,
          output: `Broken: Cannot read properties of undefined (reading 'label')
Fix 1 (bind): Timer: Pomodoro
Fix 2 (arrow): Timer: Pomodoro`,
        },
        {
          title: 'Class fields as defaults',
          note: 'Fields declared in the class body are created fresh for every object, so two carts never share one `items` array.',
          code: `class ShoppingCart {
  items = [];
  currency = 'USD';

  add(item) {
    this.items.push(item);
  }
}

const cartA = new ShoppingCart();
const cartB = new ShoppingCart();
cartA.add('Shoes');

console.log(cartA.items.length, cartB.items.length);
console.log(cartA.currency);`,
          output: `1 0
USD`,
        },
      ],
      mistakes: [
        {
          wrong: 'Writing `constructor(name) { name = name; }`',
          why: 'That only reassigns the parameter. The object never gets a `name` property.',
          fix: 'Store it on the object: `this.name = name;`',
        },
        {
          wrong: 'Passing a method as a callback: `setTimeout(timer.describe, 1000)`',
          why: 'The method is detached from its object, so `this` is `undefined` when it runs.',
          fix: 'Wrap it: `setTimeout(() => timer.describe(), 1000)` or use `timer.describe.bind(timer)`.',
        },
        {
          wrong: 'Fetching data from a server inside the constructor',
          why: 'A constructor cannot be `async`, so you get an object that is only half ready, with no way to wait for it.',
          fix: 'Keep constructors fast. Put slow work in a separate `async load()` method.',
        },
      ],
      keyPoints: [
        '`new` creates an object, runs the constructor on it, and returns it.',
        'Use the constructor to store arguments, set defaults and reject bad input.',
        '`this` is the object before the dot — be careful when passing methods around.',
      ],
    },

    {
      id: 'encapsulation',
      name: 'Encapsulation',
      summary: 'Keep an object\'s data private and only allow changes through methods that enforce the rules.',
      explanation: [
        'Encapsulation means **bundling** data together with the methods that use it, and **hiding** the data that outside code should not touch directly.',
        'In JavaScript, a field whose name starts with `#` is truly private: code outside the class cannot read or write it. Even trying (`account.#balance`) is a `SyntaxError`.',
        'The payoff is **guaranteed rules**. If the only way to change a balance is `withdraw()`, and `withdraw()` checks there is enough money, then no part of your app can ever create a negative balance by accident.',
        '**Getters** (`get balance()`) let other code *read* a value without being able to *change* it. **Setters** (`set email(value)`) let you check a value every time someone assigns it.',
      ],
      analogy: {
        title: 'An ATM',
        body: 'You can check your balance, deposit and withdraw using the buttons, but you cannot open the cash vault. The machine checks your PIN and your daily limit every single time. The buttons are the public methods; the vault is the private data.',
      },
      realWorld: [
        '**Banking:** a balance changes only through `deposit()` and `withdraw()`, which also record every transaction.',
        '**User accounts:** passwords are stored as a hash in a private field and are never returned by any method.',
        '**Inventory:** stock can never drop below zero because `remove()` checks first.',
        '**Libraries:** a library keeps its internals private so it can change them in a new version without breaking your code.',
      ],
      examples: [
        {
          title: 'Bank account with a private balance',
          note: 'There is a getter for `balance` but no setter, so assigning to it does nothing. The history getter returns a copy, so callers cannot add fake entries.',
          code: `class BankAccount {
  #balance = 0;
  #transactions = [];

  constructor(owner) {
    this.owner = owner;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error('Deposit must be positive');
    this.#balance += amount;
    this.#transactions.push('+' + amount);
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error('Insufficient funds');
    this.#balance -= amount;
    this.#transactions.push('-' + amount);
  }

  get balance() { return this.#balance; }
  get history() { return [...this.#transactions]; } // a copy
}

const account = new BankAccount('Sophea');
account.deposit(500);
account.withdraw(120);
console.log('Balance:', account.balance);
console.log('History:', account.history.join(', '));

account.balance = 1000000; // ignored: there is no setter
console.log('After hack attempt:', account.balance);

try {
  account.withdraw(9999);
} catch (error) {
  console.log('Blocked:', error.message);
}`,
          output: `Balance: 380
History: +500, -120
After hack attempt: 380
Blocked: Insufficient funds`,
        },
        {
          title: 'A setter that validates input',
          note: 'Every assignment to `email` goes through the setter, which rejects bad values and cleans up good ones.',
          code: `class UserProfile {
  #email = '';

  set email(value) {
    if (!value.includes('@')) throw new Error('Invalid email: ' + value);
    this.#email = value.trim().toLowerCase();
  }

  get email() {
    return this.#email;
  }
}

const profile = new UserProfile();
profile.email = '  Dara@Example.COM ';
console.log(profile.email);

try {
  profile.email = 'not-an-email';
} catch (error) {
  console.log(error.message);
}
console.log('Still:', profile.email);`,
          output: `dara@example.com
Invalid email: not-an-email
Still: dara@example.com`,
        },
        {
          title: 'Private methods hide the details',
          note: 'The password hash and the hashing method are both private. Even `JSON.stringify` cannot see them.',
          code: `class Account {
  #passwordHash;

  constructor(username, password) {
    this.username = username;
    this.#passwordHash = this.#hash(password);
  }

  checkPassword(attempt) {
    return this.#hash(attempt) === this.#passwordHash;
  }

  // Toy hash for learning only. Real apps use bcrypt or argon2.
  #hash(text) {
    let hash = 0;
    for (const char of text) {
      hash = (hash * 31 + char.charCodeAt(0)) % 1000003;
    }
    return hash;
  }
}

const user = new Account('nita', 'sunrise42');
console.log(user.checkPassword('guess'));
console.log(user.checkPassword('sunrise42'));
console.log(Object.keys(user));
console.log(JSON.stringify(user));`,
          output: `false
true
["username"]
{"username":"nita"}`,
        },
        {
          title: 'Stock that can never go negative',
          note: 'Because `#stock` is private, `remove()` is the only way to change it — and it always checks first.',
          code: `class InventoryItem {
  #stock;

  constructor(sku, stock) {
    this.sku = sku;
    this.#stock = stock;
  }

  get stock() {
    return this.#stock;
  }

  remove(quantity) {
    if (quantity > this.#stock) {
      return 'Only ' + this.#stock + ' left of ' + this.sku;
    }
    this.#stock -= quantity;
    return 'Shipped ' + quantity + ' x ' + this.sku;
  }
}

const shoes = new InventoryItem('SHOE-42', 5);
console.log(shoes.remove(3));
console.log(shoes.remove(4));
console.log('Stock now:', shoes.stock);`,
          output: `Shipped 3 x SHOE-42
Only 2 left of SHOE-42
Stock now: 2`,
        },
      ],
      mistakes: [
        {
          wrong: 'Naming a field `_balance` and treating it as private',
          why: 'The underscore is only a naming habit. Anyone can still write `account._balance = 999`.',
          fix: 'Use a real private field: `#balance`.',
        },
        {
          wrong: 'Returning the private array itself: `get history() { return this.#transactions; }`',
          why: 'Callers get a reference to your private array and can `push()` fake entries into it.',
          fix: 'Return a copy: `return [...this.#transactions];`',
        },
        {
          wrong: 'Adding a getter and a setter for every private field',
          why: 'A setter with no checks makes the field public again, just in disguise.',
          fix: 'Only expose the operations the outside world needs (`deposit`, `withdraw`), each with its own checks.',
        },
      ],
      keyPoints: [
        '`#field` is truly private; `_field` is only a convention.',
        'Change private data only through methods that check the rules.',
        'A getter without a setter gives read-only access.',
      ],
    },

    {
      id: 'abstraction',
      name: 'Abstraction',
      summary: 'Offer a simple interface for *what* an object does, and hide *how* it does it.',
      explanation: [
        'Abstraction is about **reducing how much the user of a class needs to know**. You call `payment.pay(25)`; you do not need to know about API keys, retries or currency conversion.',
        'Abstraction and encapsulation work together but they are not the same. **Encapsulation protects data** (it is the mechanism: private fields). **Abstraction simplifies usage** (it is the design goal: a small, clear set of public methods).',
        'A common pattern is an **abstract base class**: a parent that says which methods every subclass must have, but which cannot be used on its own. JavaScript has no `abstract` keyword, so we throw an error if someone tries.',
        'Good abstractions let you **swap one implementation for another** without changing the code that uses it. That is the heart of maintainable software.',
      ],
      analogy: {
        title: 'Driving a car',
        body: 'A steering wheel, two pedals and a gear stick. You do not need to understand fuel injection or the ABS computer to drive. And because the controls are the same, you can drive a petrol car or an electric car without learning anything new.',
      },
      realWorld: [
        '**Payments:** `pay(amount)` works the same whether the money goes by card, mobile wallet or bank transfer.',
        '**`fetch(url)`:** one function hides DNS lookups, TCP connections, TLS encryption and HTTP parsing.',
        '**Storage:** `save(key, value)` might write to localStorage, a database or the cloud — the caller does not care.',
        '**Array methods:** `filter`, `map` and `reduce` hide the loop, the index and the temporary array.',
      ],
      examples: [
        {
          title: 'A coffee machine with one button',
          note: 'The caller sees one public method. The steps behind it are private, so they cannot be called — or broken — from outside.',
          code: `class CoffeeMachine {
  #steps = [];

  makeCoffee(type) {
    this.#steps = [];
    this.#heatWater();
    this.#grindBeans();
    this.#brew(type);
    return 'Your ' + type + ' is ready (' + this.#steps.join(' > ') + ')';
  }

  #heatWater() { this.#steps.push('heat water'); }
  #grindBeans() { this.#steps.push('grind beans'); }
  #brew(type) { this.#steps.push('brew ' + type); }
}

const machine = new CoffeeMachine();
console.log(machine.makeCoffee('latte'));

// Only the simple interface is visible from outside:
console.log(typeof machine.makeCoffee);
console.log(typeof machine.heatWater);`,
          output: `Your latte is ready (heat water > grind beans > brew latte)
function
undefined`,
        },
        {
          title: 'Abstract base class for payments',
          note: '`checkout()` only knows about `pay()`. It works with any payment method — including ones written next year.',
          code: `class PaymentMethod {
  constructor() {
    if (new.target === PaymentMethod) {
      throw new Error('PaymentMethod is abstract - use a subclass');
    }
  }
  pay(amount) {
    if (amount <= 0) throw new Error('Amount must be positive');
    return this.process(amount);
  }
  process(amount) {
    throw new Error('Subclasses must implement process()');
  }
}

class CardPayment extends PaymentMethod {
  constructor(last4) { super(); this.last4 = last4; }
  process(amount) { return 'Charged $' + amount + ' to card ****' + this.last4; }
}

class WalletPayment extends PaymentMethod {
  constructor(phone) { super(); this.phone = phone; }
  process(amount) { return 'Sent $' + amount + ' request to wallet ' + this.phone; }
}

function checkout(total, method) {
  return method.pay(total); // does not care which kind it is
}

console.log(checkout(49.99, new CardPayment('4242')));
console.log(checkout(12, new WalletPayment('012 345 678')));

try {
  new PaymentMethod();
} catch (error) {
  console.log(error.message);
}`,
          output: `Charged $49.99 to card ****4242
Sent $12 request to wallet 012 345 678
PaymentMethod is abstract - use a subclass`,
        },
        {
          title: 'Hide where data is stored',
          note: '`Settings` only calls `save()` and `load()`. You could swap `MemoryStore` for a localStorage or cloud store and `Settings` would not change at all.',
          code: `class MemoryStore {
  #data = new Map();
  save(key, value) {
    this.#data.set(key, JSON.stringify(value));
  }
  load(key) {
    const raw = this.#data.get(key);
    return raw === undefined ? null : JSON.parse(raw);
  }
}

class Settings {
  constructor(store) {
    this.store = store;
  }
  setTheme(theme) {
    this.store.save('theme', theme);
  }
  getTheme() {
    return this.store.load('theme') ?? 'light';
  }
}

const settings = new Settings(new MemoryStore());
console.log(settings.getTheme());
settings.setTheme('dark');
console.log(settings.getTheme());`,
          output: `light
dark`,
        },
        {
          title: 'Abstraction you already use',
          note: 'Array methods describe *what* you want (paid orders, their total) and hide *how* (loops, counters, temporary arrays).',
          code: `const orders = [
  { id: 1, total: 20, paid: true },
  { id: 2, total: 75, paid: false },
  { id: 3, total: 42, paid: true },
];

const paidRevenue = orders
  .filter(order => order.paid)
  .reduce((sum, order) => sum + order.total, 0);
console.log('Paid revenue:', paidRevenue);

const biggestFirst = [...orders]
  .sort((a, b) => b.total - a.total)
  .map(order => order.id);
console.log('Biggest first:', biggestFirst.join(', '));`,
          output: `Paid revenue: 62
Biggest first: 2, 3, 1`,
        },
      ],
      mistakes: [
        {
          wrong: '`checkout()` checks `if (method instanceof CardPayment) ... else if (...)`',
          why: 'The abstraction has leaked: every new payment type now means editing `checkout()`.',
          fix: 'Call the shared method (`method.pay()`) and let each class handle its own details.',
        },
        {
          wrong: 'Making every helper method public',
          why: 'Other code starts relying on your internals, and then you can never change them.',
          fix: 'Make helpers private (`#helper()`) and keep the public interface small.',
        },
        {
          wrong: 'Building an abstraction for something that has only one version',
          why: 'Extra layers add complexity with no benefit yet.',
          fix: 'Start simple and concrete. Extract an abstraction when a second real case appears.',
        },
      ],
      keyPoints: [
        'Abstraction shows *what* an object does and hides *how*.',
        'Encapsulation protects data; abstraction simplifies use.',
        'Code that depends on an interface can work with any implementation of it.',
      ],
    },

    {
      id: 'inheritance',
      name: 'Inheritance',
      summary: 'A child class reuses a parent class\'s code and adds or changes only what is different.',
      explanation: [
        '`class Manager extends Employee` means a Manager **is an** Employee: it gets all of Employee\'s properties and methods automatically.',
        'In the child\'s constructor you must call `super(...)` **before** using `this`. That runs the parent\'s constructor so the inherited parts are set up first.',
        'A child can **override** a method by defining one with the same name. It can still reach the parent\'s version with `super.methodName()` — perfect for "do what the parent does, plus a bit more".',
        'Use inheritance when the "is-a" relationship is real and stable (a `SavingsAccount` *is a* `BankAccount`). If you only want to reuse some code, prefer **composition** (see the Composition tab).',
      ],
      analogy: {
        title: 'Job roles in a company',
        body: 'Every employee has a name and an ID, and gets paid. A manager is an employee who *also* leads a team and gets a bonus. HR does not re-describe what an employee is for every manager — they only write down what is extra.',
      },
      realWorld: [
        '**Custom errors:** `class ValidationError extends Error` gives you a message and stack trace for free.',
        '**Web Components:** `class MyButton extends HTMLElement` reuses everything the browser knows about elements.',
        '**Games:** `Warrior` and `Mage` both extend `Character` (health, position, `takeDamage()`).',
        '**Banking:** `SavingsAccount` and `CheckingAccount` extend `BankAccount` — try it in the bank demo below.',
      ],
      examples: [
        {
          title: 'Employees and managers',
          note: '`Manager` writes only what is new. `super.annualPay()` reuses the parent\'s calculation and adds a bonus on top.',
          code: `class Employee {
  constructor(name, salary) {
    this.name = name;
    this.salary = salary;
  }
  describe() {
    return this.name + ' earns $' + this.salary;
  }
  annualPay() {
    return this.salary * 12;
  }
}

class Manager extends Employee {
  constructor(name, salary, teamSize) {
    super(name, salary); // set up the Employee part first
    this.teamSize = teamSize;
  }
  annualPay() {
    const bonus = this.teamSize * 1000;
    return super.annualPay() + bonus;
  }
  describe() {
    return super.describe() + ' and leads ' + this.teamSize + ' people';
  }
}

const dev = new Employee('Sokha', 2000);
const lead = new Manager('Dara', 3000, 5);

console.log(dev.describe());
console.log(lead.describe());
console.log('Annual:', dev.annualPay(), lead.annualPay());
console.log(lead instanceof Manager, lead instanceof Employee);`,
          output: `Sokha earns $2000
Dara earns $3000 and leads 5 people
Annual: 24000 41000
true true`,
        },
        {
          title: 'Custom error types',
          note: 'Extending `Error` is how real web servers tell a "bad request" apart from a "not found" or a crash.',
          code: `class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class NotFoundError extends Error {
  constructor(resource) {
    super(resource + ' not found');
    this.name = 'NotFoundError';
  }
}

function toHttpResponse(error) {
  if (error instanceof ValidationError) return '400 Bad Request - check ' + error.field;
  if (error instanceof NotFoundError) return '404 - ' + error.message;
  return '500 Server Error';
}

console.log(toHttpResponse(new ValidationError('email', 'Email is required')));
console.log(toHttpResponse(new NotFoundError('Order #981')));
console.log(toHttpResponse(new Error('Database offline')));

const error = new ValidationError('age', 'Too young');
console.log(error instanceof Error, error.name, error.message);`,
          output: `400 Bad Request - check email
404 - Order #981 not found
500 Server Error
true ValidationError Too young`,
        },
        {
          title: 'Game characters',
          note: '`Warrior` changes how damage works (armour). `Mage` adds a brand-new ability. Both keep everything else from `Character`.',
          code: `class Character {
  constructor(name, health) {
    this.name = name;
    this.health = health;
  }
  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    return this.name + ' has ' + this.health + ' HP';
  }
}

class Warrior extends Character {
  constructor(name) {
    super(name, 150);
    this.armor = 10;
  }
  takeDamage(amount) {
    return super.takeDamage(Math.max(0, amount - this.armor));
  }
}

class Mage extends Character {
  constructor(name) {
    super(name, 80);
    this.mana = 100;
  }
  castFireball() {
    this.mana -= 30;
    return this.name + ' casts Fireball! Mana left: ' + this.mana;
  }
}

const kira = new Warrior('Kira');
const zed = new Mage('Zed');

console.log(kira.takeDamage(40));
console.log(zed.takeDamage(40));
console.log(zed.castFireball());
console.log(typeof kira.castFireball); // warriors cannot cast`,
          output: `Kira has 120 HP
Zed has 40 HP
Zed casts Fireball! Mana left: 70
undefined`,
        },
        {
          title: 'How JavaScript finds a method',
          note: 'Classes are built on prototypes. When `car.start()` is not on `Car`, JavaScript walks up the chain to `Vehicle` and finds it there.',
          code: `class Vehicle {
  start() { return 'Engine on'; }
}

class Car extends Vehicle {
  honk() { return 'Beep!'; }
}

const car = new Car();
console.log(car.honk());
console.log(car.start()); // found on Vehicle

console.log(Object.getPrototypeOf(car) === Car.prototype);
console.log(Object.getPrototypeOf(Car.prototype) === Vehicle.prototype);
console.log(Object.hasOwn(car, 'start'));`,
          output: `Beep!
Engine on
true
true
false`,
        },
      ],
      mistakes: [
        {
          wrong: 'Using `this` before calling `super()` in a child constructor',
          why: 'JavaScript throws `ReferenceError: Must call super constructor in derived class before accessing \'this\'`.',
          fix: 'Make `super(...)` the first line of the child constructor.',
        },
        {
          wrong: 'Deep chains like `Animal → Mammal → Dog → Puppy → ServiceDog`',
          why: 'A change at the top ripples through every level, and it gets hard to tell where a method comes from.',
          fix: 'Keep hierarchies shallow (one or two levels). Add extra abilities with composition.',
        },
        {
          wrong: '`class Car extends Engine` just to reuse engine code',
          why: 'A car *has* an engine; it is not one. Now `Car` exposes engine methods that make no sense on a car.',
          fix: 'Use composition: `this.engine = new Engine();`',
        },
      ],
      keyPoints: [
        '`extends` creates an "is-a" relationship; the child gets everything the parent has.',
        'Call `super(...)` first in a child constructor; use `super.method()` to reuse parent logic.',
        'Keep hierarchies shallow, and only inherit when "is-a" is really true.',
      ],
    },

    {
      id: 'polymorphism',
      name: 'Polymorphism',
      summary: 'Different objects respond to the same method call in their own way, so one piece of code works with all of them.',
      explanation: [
        '"Poly" means many and "morph" means forms. You call `shape.area()` and each shape works out its own area. The calling code does not need an `if` for every type.',
        'JavaScript has two common forms. **Subclass polymorphism:** child classes override a parent\'s method. **Duck typing:** "if it has a `speak()` method, I can call `speak()`" — no shared parent class needed.',
        'The real benefit is that you can **add new types without editing** the code that uses them — a new shape, a new notification channel, a new shipping option. This is called the **Open/Closed Principle**: open for extension, closed for modification.',
        'Watch for this sign: a long `switch (type)` or `if / else if` chain that checks what kind of thing you have. That is usually a place where polymorphism would make the code simpler.',
      ],
      analogy: {
        title: 'The play button',
        body: 'Press ▶ in a music app, a video player or a podcast app. Each one does something different, but you only need to know one button. The button is the shared method; each app is a different object.',
      },
      realWorld: [
        '**Notifications:** `channel.send(message)` works for email, SMS and push notifications.',
        '**Shipping:** `cost(weight)` is calculated differently for standard, express and pickup.',
        '**UI rendering:** every widget has its own `render()`; the page just loops through them all.',
        '**JavaScript itself:** `String(value)` calls each value\'s own `toString()` — arrays, numbers and your own classes all answer differently.',
      ],
      examples: [
        {
          title: 'Notifications across channels',
          note: '`notifyAll` loops through channels and calls `send()`. It has no idea which kind of channel it is talking to — and does not need one.',
          code: `class EmailNotifier {
  constructor(address) { this.address = address; }
  send(message) { return 'Email to ' + this.address + ': ' + message; }
}

class SmsNotifier {
  constructor(phone) { this.phone = phone; }
  send(message) {
    const short = message.length > 20 ? message.slice(0, 20) + '...' : message;
    return 'SMS to ' + this.phone + ': ' + short;
  }
}

class PushNotifier {
  constructor(device) { this.device = device; }
  send(message) { return 'Push to ' + this.device + ': ' + message; }
}

const channels = [
  new EmailNotifier('dara@example.com'),
  new SmsNotifier('+855 12 345 678'),
  new PushNotifier('Pixel 9'),
];

function notifyAll(message) {
  channels.forEach(channel => console.log(channel.send(message)));
}

notifyAll('Your order #1042 has shipped!');`,
          output: `Email to dara@example.com: Your order #1042 has shipped!
SMS to +855 12 345 678: Your order #1042 has...
Push to Pixel 9: Your order #1042 has shipped!`,
        },
        {
          title: 'Shapes that override area()',
          note: '`describe()` is written once in the parent but calls `this.area()` — which runs the child\'s version. The parent never needs to know which shape it is.',
          code: `class Shape {
  area() {
    return 0;
  }
  describe() {
    return this.constructor.name + ' with area ' + this.area().toFixed(2);
  }
}

class Circle extends Shape {
  constructor(radius) { super(); this.radius = radius; }
  area() { return Math.PI * this.radius ** 2; }
}

class Rectangle extends Shape {
  constructor(width, height) { super(); this.width = width; this.height = height; }
  area() { return this.width * this.height; }
}

class Triangle extends Shape {
  constructor(base, height) { super(); this.base = base; this.height = height; }
  area() { return 0.5 * this.base * this.height; }
}

const shapes = [new Circle(2), new Rectangle(3, 4), new Triangle(6, 2)];
shapes.forEach(shape => console.log(shape.describe()));

const total = shapes.reduce((sum, shape) => sum + shape.area(), 0);
console.log('Total area:', total.toFixed(2));`,
          output: `Circle with area 12.57
Rectangle with area 12.00
Triangle with area 6.00
Total area: 30.57`,
        },
        {
          title: 'Replacing a switch statement',
          note: 'With the switch, every new option means editing that function. With polymorphism, `SameDay` was added without touching anything else.',
          code: `// Before: every new option means editing this function
function shippingCostOld(type, weight) {
  switch (type) {
    case 'standard': return 5 + weight;
    case 'express': return 15 + weight * 2;
    case 'pickup': return 0;
  }
}

// After: each option knows its own price
class Standard { cost(weight) { return 5 + weight; } }
class Express  { cost(weight) { return 15 + weight * 2; } }
class Pickup   { cost() { return 0; } }
class SameDay  { cost(weight) { return 20 + weight * 3; } } // added later

const options = {
  standard: new Standard(),
  express: new Express(),
  pickup: new Pickup(),
  sameDay: new SameDay(),
};

const weight = 3;
for (const [name, option] of Object.entries(options)) {
  console.log(name + ': $' + option.cost(weight));
}
console.log('Old way (express):', shippingCostOld('express', weight));`,
          output: `standard: $8
express: $21
pickup: $0
sameDay: $29
Old way (express): 21`,
        },
        {
          title: 'Duck typing and toString()',
          note: 'No shared parent class here. `String()` calls each value\'s own `toString()`, and anything with a `speak()` method can join the loop.',
          code: `class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }
  toString() {
    return this.amount.toFixed(2) + ' ' + this.currency;
  }
}

const things = [42, [1, 2, 3], true, new Money(9.5, 'USD')];
things.forEach(thing => console.log(String(thing)));

// Duck typing: if it has speak(), we can call speak()
const robot = { speak: () => 'Beep boop' };
class Parrot { speak() { return 'Hello! Hello!'; } }

[robot, new Parrot()].forEach(speaker => console.log(speaker.speak()));`,
          output: `42
1,2,3
true
9.50 USD
Beep boop
Hello! Hello!`,
        },
      ],
      mistakes: [
        {
          wrong: '`if (n instanceof Email) { ... } else if (n instanceof Sms) { ... }`',
          why: 'Every new type means finding and editing every one of these chains.',
          fix: 'Give each class the same method (`send()`) and just call it.',
        },
        {
          wrong: 'The parent has `area()` returning a number, but one child has `area(units)` returning a string',
          why: 'Code written for the parent breaks on that child. (This breaks the Liskov Substitution Principle.)',
          fix: 'Overrides should accept the same arguments and return the same kind of value.',
        },
        {
          wrong: 'Forgetting to add the method to a new class',
          why: 'You only find out at runtime with `TypeError: channel.send is not a function`.',
          fix: 'Use an abstract base class that throws a clear error, or write a test that checks every type.',
        },
      ],
      keyPoints: [
        'Same method name, different behaviour per object.',
        'Add new types without editing the code that uses them.',
        'A long `switch` on "type" is a hint that polymorphism could help.',
      ],
    },

    {
      id: 'composition',
      name: 'Composition',
      summary: 'Build objects by combining smaller objects ("has-a") instead of inheriting from them ("is-a").',
      explanation: [
        'With composition, an object **holds other objects** and hands work to them. A `Car` *has an* `Engine`; a `ShoppingCart` *has* line items, and each line item *has a* `Product`.',
        'It is more flexible than inheritance: you can mix abilities freely, and even **swap parts while the program runs** (put a different engine in the car).',
        'The well-known guideline is **"favour composition over inheritance"**. Inheritance is not bad, but it locks a class into one family tree forever. Composition lets you assemble exactly what you need.',
        'Composition also makes testing easier: you can pass in a fake part (a fake payment gateway) instead of the real one. Passing parts in from outside is called **dependency injection**.',
      ],
      analogy: {
        title: 'LEGO vs a moulded toy',
        body: 'A moulded toy car is one solid piece — it is a car forever. A LEGO car is built from wheels, a body and an engine block. You can swap the wheels for bigger ones, or take the engine and build a boat with it.',
      },
      realWorld: [
        '**Shopping carts:** a cart has line items; each line item has a product and a quantity.',
        '**Game engines** like Unity and Godot build every entity from components: position, health, physics, sprite.',
        '**React and Vue:** pages are composed of smaller components, not inherited from them.',
        '**Backend services:** an `OrderService` is given a payment gateway, an email sender and a database when it is created.',
      ],
      examples: [
        {
          title: 'A cart that has products',
          note: 'Three small classes, each with one job. `ShoppingCart` does not extend `Product` — it holds products and asks them for their price.',
          code: `class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
}

class LineItem {
  constructor(product, quantity) {
    this.product = product;
    this.quantity = quantity;
  }
  get subtotal() {
    return this.product.price * this.quantity;
  }
}

class ShoppingCart {
  #items = [];

  add(product, quantity = 1) {
    const existing = this.#items.find(item => item.product === product);
    if (existing) existing.quantity += quantity;
    else this.#items.push(new LineItem(product, quantity));
  }

  get total() {
    return this.#items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  summary() {
    return this.#items
      .map(item => item.quantity + ' x ' + item.product.name + ' = $' + item.subtotal.toFixed(2))
      .join('\\n');
  }
}

const coffee = new Product('Coffee', 3);
const bagel = new Product('Bagel', 2.5);

const cart = new ShoppingCart();
cart.add(coffee, 2);
cart.add(bagel);
cart.add(coffee); // merges with the existing line

console.log(cart.summary());
console.log('Total: $' + cart.total.toFixed(2));`,
          output: `3 x Coffee = $9.00
1 x Bagel = $2.50
Total: $11.50`,
        },
        {
          title: 'Abilities as parts, not a family tree',
          note: 'With inheritance, a duck that walks, swims and flies needs an awkward class tree. With composition, you just hand it the abilities it has.',
          code: `class Walker  { move(name) { return name + ' walks on land'; } }
class Swimmer { move(name) { return name + ' swims in water'; } }
class Flyer   { move(name) { return name + ' flies through the air'; } }

class Animal {
  constructor(name, abilities) {
    this.name = name;
    this.abilities = abilities;
  }
  showMoves() {
    return this.abilities.map(ability => ability.move(this.name));
  }
}

const duck = new Animal('Duck', [new Walker(), new Swimmer(), new Flyer()]);
const fish = new Animal('Fish', [new Swimmer()]);

duck.showMoves().forEach(line => console.log(line));
fish.showMoves().forEach(line => console.log(line));`,
          output: `Duck walks on land
Duck swims in water
Duck flies through the air
Fish swims in water`,
        },
        {
          title: 'Swap parts for testing (dependency injection)',
          note: 'The same `CheckoutService` runs with a real gateway or a fake one. Tests can check behaviour without charging anyone real money.',
          code: `class RealPaymentGateway {
  charge(amount) { return 'Charged $' + amount + ' through the bank'; }
}

class FakePaymentGateway {
  calls = [];
  charge(amount) {
    this.calls.push(amount);
    return 'TEST MODE: pretend charge of $' + amount;
  }
}

class CheckoutService {
  constructor(gateway, mailer) {
    this.gateway = gateway; // parts are passed in, not created here
    this.mailer = mailer;
  }
  placeOrder(email, amount) {
    const receipt = this.gateway.charge(amount);
    this.mailer.send(email, receipt);
    return receipt;
  }
}

const printMailer = { send: (to, text) => console.log('  mail to ' + to + ': ' + text) };

const live = new CheckoutService(new RealPaymentGateway(), printMailer);
console.log(live.placeOrder('dara@example.com', 30));

const fake = new FakePaymentGateway();
const testCheckout = new CheckoutService(fake, { send() {} });
testCheckout.placeOrder('test@example.com', 99);
console.log('Fake gateway recorded:', fake.calls);`,
          output: `  mail to dara@example.com: Charged $30 through the bank
Charged $30 through the bank
Fake gateway recorded: [99]`,
        },
        {
          title: 'Upgrade a part at runtime',
          note: 'The car keeps the same model and methods; only its engine object changes. You cannot do this with inheritance.',
          code: `class PetrolEngine {
  start() { return 'Vroom (petrol)'; }
  get rangeKm() { return 600; }
}

class ElectricMotor {
  start() { return 'Whirr (electric)'; }
  get rangeKm() { return 450; }
}

class Car {
  constructor(model, engine) {
    this.model = model;
    this.engine = engine;
  }
  start() {
    return this.model + ': ' + this.engine.start();
  }
  swapEngine(engine) {
    this.engine = engine;
  }
}

const car = new Car('City Hatch', new PetrolEngine());
console.log(car.start(), '| range', car.engine.rangeKm + 'km');

car.swapEngine(new ElectricMotor());
console.log(car.start(), '| range', car.engine.rangeKm + 'km');`,
          output: `City Hatch: Vroom (petrol) | range 600km
City Hatch: Whirr (electric) | range 450km`,
        },
      ],
      mistakes: [
        {
          wrong: '`class Order extends Logger` just to get a `log()` method',
          why: 'An order is not a logger. You have used up the one parent class an `Order` can have.',
          fix: 'Hold a logger instead: `this.logger = logger;` then call `this.logger.log()`.',
        },
        {
          wrong: 'Creating parts inside the class: `this.gateway = new RealPaymentGateway();`',
          why: 'The class is hard-wired to one implementation. You cannot test it without charging real money.',
          fix: 'Pass parts into the constructor: `new CheckoutService(gateway, mailer)`.',
        },
        {
          wrong: 'Reaching deep inside: `cart.items[0].product.price = 0`',
          why: 'Outside code now depends on the cart\'s internal structure and can bypass its rules.',
          fix: 'Ask the object to do the job: `cart.applyDiscount(code)`.',
        },
      ],
      keyPoints: [
        'Composition = "has-a"; inheritance = "is-a".',
        'Small parts with one job each can be combined and swapped freely.',
        'Pass parts in through the constructor to make code easy to test.',
      ],
    },
  ];

  const together = {
    title: 'Food ordering app',
    intro: 'This small ordering system uses every idea from the concepts above. Read the comments, run it, then try to spot each pillar yourself.',
    code: `// ABSTRACTION: every discount promises an apply(total) method
class Discount {
  apply(total) { throw new Error('apply() not implemented'); }
  get label() { return 'no discount'; }
}

// INHERITANCE + POLYMORPHISM: each discount applies itself differently
class PercentOff extends Discount {
  constructor(percent) { super(); this.percent = percent; }
  apply(total) { return total * (1 - this.percent / 100); }
  get label() { return this.percent + '% off'; }
}

class FixedOff extends Discount {
  constructor(amount) { super(); this.amount = amount; }
  apply(total) { return Math.max(0, total - this.amount); }
  get label() { return '$' + this.amount + ' off'; }
}

class NoDiscount extends Discount {
  apply(total) { return total; }
}

// CLASS & OBJECT: a simple blueprint for menu items
class MenuItem {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
}

// ENCAPSULATION: items and status are private; only methods change them
// COMPOSITION: an Order HAS menu items and HAS a discount
class Order {
  #items = [];
  #status = 'cart';

  constructor(customer, discount = new NoDiscount()) {
    this.customer = customer;
    this.discount = discount;
  }

  add(item, quantity = 1) {
    if (this.#status !== 'cart') throw new Error('Order already placed');
    this.#items.push({ item, quantity });
    return this;
  }

  get subtotal() {
    return this.#items.reduce((sum, line) => sum + line.item.price * line.quantity, 0);
  }

  get total() {
    return this.discount.apply(this.subtotal); // polymorphic call
  }

  get status() { return this.#status; }

  place() {
    if (this.#items.length === 0) throw new Error('Cart is empty');
    this.#status = 'placed';
    return this.customer + ': $' + this.subtotal.toFixed(2) +
      ' -> $' + this.total.toFixed(2) + ' (' + this.discount.label + ')';
  }
}

const pizza = new MenuItem('Pizza', 12);
const soda = new MenuItem('Soda', 2);

const orders = [
  new Order('Dara', new PercentOff(10)).add(pizza, 2).add(soda, 2),
  new Order('Mealea', new FixedOff(5)).add(pizza),
  new Order('Sokha').add(soda, 3),
];

orders.forEach(order => console.log(order.place()));

try {
  orders[0].add(soda);
} catch (error) {
  console.log('Blocked:', error.message);
}
console.log('Status:', orders[0].status);`,
    output: `Dara: $28.00 -> $25.20 (10% off)
Mealea: $12.00 -> $7.00 ($5 off)
Sokha: $6.00 -> $6.00 (no discount)
Blocked: Order already placed
Status: placed`,
    map: [
      { pillar: 'Class & Object', where: '`MenuItem` is the blueprint; `pizza` and `soda` are objects made from it.' },
      { pillar: 'Encapsulation', where: '`#items` and `#status` are private. After `place()`, nothing can add items — not even by accident.' },
      { pillar: 'Abstraction', where: '`Order` only knows that a discount has `apply()` and `label`. How the discount is calculated is hidden.' },
      { pillar: 'Inheritance', where: '`PercentOff`, `FixedOff` and `NoDiscount` all extend `Discount` and reuse its default `label`.' },
      { pillar: 'Polymorphism', where: '`this.discount.apply(...)` runs a different calculation for each order, with no `if` statements.' },
      { pillar: 'Composition', where: 'An `Order` *has* items and *has* a discount. Adding a "buy one get one" discount needs no change to `Order`.' },
    ],
  };

  const whyOop = {
    procedural: `// Data and functions live apart.
// Nothing stops anyone from breaking the data.
const account = { owner: 'Dara', balance: 100 };

function withdraw(acc, amount) {
  if (amount > acc.balance) return 'Insufficient funds';
  acc.balance -= amount;
}

withdraw(account, 30);
account.balance = -5000; // oops, allowed`,
    oop: `// Data and its rules live together.
// The only way in is through the methods.
class Account {
  #balance = 100;
  constructor(owner) { this.owner = owner; }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error('Insufficient funds');
    this.#balance -= amount;
  }
  get balance() { return this.#balance; }
}`,
    helps: [
      'Your app models many **things with state and rules** — users, orders, accounts, game characters.',
      'Several people work on the same codebase and need clear boundaries between parts.',
      'You expect to **add new variations** later (new payment types, new shapes, new notification channels).',
      'You want to test parts separately by swapping in fakes.',
    ],
    overkill: [
      'A short script that transforms data once (read a file, clean it, save it).',
      'Pure calculations with no state — a plain function like `add(a, b)` is clearer than a class.',
      'Wrapping one function in a class "just because" — that adds ceremony, not clarity.',
    ],
  };

  const cheatSheet = [
    { concept: 'Class & Object', idea: 'Blueprint → instances', syntax: 'class X {}  new X()', example: 'Product, User, Date' },
    { concept: 'Constructor', idea: 'Set up each new object', syntax: 'constructor(a) { this.a = a; }', example: 'Validate an Order' },
    { concept: 'Encapsulation', idea: 'Hide data, protect rules', syntax: '#field  get x()  set x(v)', example: 'Bank balance' },
    { concept: 'Abstraction', idea: 'Show what, hide how', syntax: 'Small public API, #private helpers', example: 'pay(amount), fetch(url)' },
    { concept: 'Inheritance', idea: '"Is-a" reuse', syntax: 'class B extends A  super()', example: 'ValidationError extends Error' },
    { concept: 'Polymorphism', idea: 'Same call, different behaviour', syntax: 'Override a method / duck typing', example: 'Notifier.send()' },
    { concept: 'Composition', idea: '"Has-a" building blocks', syntax: 'this.engine = engine', example: 'Cart has LineItems' },
  ];

  const quiz = [
    {
      q: 'What is the relationship between a class and an object?',
      options: ['They are two names for the same thing', 'A class is a blueprint; an object is an instance built from it', 'An object is a blueprint; a class is built from it'],
      answer: 1,
      explain: 'The class describes the shape and behaviour; `new` creates objects (instances) from it.',
    },
    {
      q: "What happens if you write `const p = Product('Pen', 2)` without `new`?",
      options: ['It returns undefined', 'It creates a global variable', 'It throws a TypeError'],
      answer: 2,
      explain: "Classes must be called with `new`. Otherwise JavaScript throws `TypeError: Class constructor Product cannot be invoked without 'new'`.",
    },
    {
      q: 'Inside `cart.add(item)`, what does `this` refer to?',
      options: ['cart', 'item', 'The window object'],
      answer: 0,
      explain: '`this` is the object before the dot when the method is called.',
    },
    {
      q: 'Why use `#balance` instead of `_balance`?',
      options: ['`#` fields are faster', '`#` fields are truly private and enforced by JavaScript', 'There is no difference'],
      answer: 1,
      explain: '`_balance` is only a naming convention; outside code can still change it. `#balance` cannot be accessed outside the class at all.',
    },
    {
      q: 'A class has `get balance()` but no `set balance()`. What does `account.balance = 999` do?',
      options: ['Changes the balance to 999', 'Nothing — the balance stays the same (strict mode throws an error)', 'Deletes the balance'],
      answer: 1,
      explain: 'Without a setter, the property is read-only from outside. In normal scripts the assignment is ignored; in strict mode it throws a TypeError.',
    },
    {
      q: 'Which sentence best describes abstraction?',
      options: ['Show what an object does, hide how it does it', 'Copy code from a parent class', 'Make every property public'],
      answer: 0,
      explain: 'Abstraction gives users a simple interface (like `pay(amount)`) and hides the complicated details behind it.',
    },
    {
      q: 'In a child class constructor, what must happen before you use `this`?',
      options: ['Call `this.init()`', 'Call `super(...)`', 'Nothing special'],
      answer: 1,
      explain: '`super(...)` runs the parent constructor. Using `this` before it throws a ReferenceError.',
    },
    {
      q: "What does this print?\n\nclass A { hi() { return 'A'; } }\nclass B extends A { hi() { return super.hi() + 'B'; } }\nconsole.log(new B().hi());",
      options: ['B', 'BA', 'AB'],
      answer: 2,
      explain: "`super.hi()` returns 'A', and B adds 'B' after it, giving 'AB'.",
    },
    {
      q: 'You see a long `switch (type)` that picks different behaviour for each kind of object. What could replace it?',
      options: ['Polymorphism — give each class its own version of the method', 'More global variables', 'A longer switch'],
      answer: 0,
      explain: 'Each class implements the same method its own way, so adding a new type no longer means editing the switch.',
    },
    {
      q: 'How should a `Car` relate to an `Engine`?',
      options: ['`class Car extends Engine`', '`class Engine extends Car`', 'A Car has an Engine: `this.engine = engine`'],
      answer: 2,
      explain: 'A car is not an engine, it *has* one. That is composition, and it lets you swap the engine later.',
    },
    {
      q: "What is 'duck typing'?",
      options: ['Objects must extend a `Duck` class', 'If an object has the method you need, you can use it, whatever its class', 'A way to convert types'],
      answer: 1,
      explain: '"If it walks like a duck and quacks like a duck..." — JavaScript only cares that the method exists.',
    },
    {
      q: 'Which of these is NOT a benefit of OOP?',
      options: ['It makes every program run faster', 'It keeps data and its rules together', 'It lets you add new types without changing existing code'],
      answer: 0,
      explain: 'OOP is about organising code so it is easier to understand and change. It does not make programs faster by itself.',
    },
  ];

  // Turns any value into the text a learner would expect to see in a console.
  function formatValue(value) {
    if (typeof value === 'string') return value;
    if (value instanceof Error) return value.name + ': ' + value.message;
    if (value === null || typeof value !== 'object') return String(value);
    let json;
    try { json = JSON.stringify(value); } catch { json = '[object]'; }
    const name = value.constructor && value.constructor.name;
    return Array.isArray(value) || !name || name === 'Object' ? json : name + ' ' + json;
  }

  // Runs a lesson example with a console that collects output instead of printing it.
  // Only the hardcoded examples in this file are ever run.
  function runCode(code) {
    const lines = [];
    const log = (...args) => lines.push(args.map(formatValue).join(' '));
    const fakeConsole = { log, info: log, warn: log, error: log };
    try {
      new Function('console', code)(fakeConsole);
      return { ok: true, output: lines.join('\n') };
    } catch (error) {
      lines.push('Error: ' + formatValue(error));
      return { ok: false, output: lines.join('\n') };
    }
  }

  globalThis.OOP = { concepts, together, whyOop, cheatSheet, quiz, runCode, formatValue };
})();
