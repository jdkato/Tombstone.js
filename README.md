# Tombstone.js

[![CI](https://github.com/jdkato/Tombstone.js/actions/workflows/ci.yml/badge.svg)](https://github.com/jdkato/Tombstone.js/actions/workflows/ci.yml)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://standardjs.com/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A propositional logic library for JavaScript: parse a well-formed formula,
evaluate it, and build its truth table. No runtime dependencies.

There's a [write-up](https://jdkato.io/stories/tombstone) with live demos and
more on how it works.

## Install

Requires Node 18 or later. Tombstone.js is an ES module.

```sh
npm install jdkato/Tombstone.js
```

## Usage

```js
import { Statement } from 'tombstone'

const statement = new Statement('P & Q')

statement.evaluate({ P: true, Q: false }) // false
statement.evaluate({ P: true, Q: true }) // true
```

An invalid formula throws when constructed, so a `Statement` is always
well-formed once you hold one:

```js
new Statement('(P -> Q') // Error: unbalanced parentheses!
new Statement('P -> &') // Error: double operators!
new Statement('A | (~A & B)') // Error: unknown symbol!
```

### Connectives

In descending order of precedence:

| Symbol | Name        | Example  | Reads as                  |
| ------ | ----------- | -------- | ------------------------- |
| `~`    | negation    | `~P`     | not P                     |
| `&`    | conjunction | `P & Q`  | P and Q                   |
| `\|\|` | disjunction | `P \|\| Q` | P or Q                  |
| `->`   | implication | `P -> Q` | if P, then Q              |
| `<->`  | equivalence | `P <-> Q`| P if and only if Q        |

Sentence variables are single letters, `A` through `Z`.

### What a Statement gives you

```js
const s = new Statement('(P -> Q) <-> (~Q -> ~P)')

s.statement // the source formula, unchanged
s.variables // ['P', 'Q'] — in order of appearance
s.symbols // the formula tokenised
s.symbolsRPN // the same tokens in Reverse Polish notation
s.tree // the parse tree, as { tree: [root], size }
```

Parsing goes through the [shunting-yard algorithm][sy] to Reverse Polish
notation, which is what both the evaluator and the tree are built from. So
`P & Q` becomes `P Q &`, and the tree is:

```js
{ name: '&', children: [{ name: 'P' }, { name: 'Q' }] }
```

### Truth tables

`table()` evaluates the formula at every combination of its variables and
returns Markdown:

```js
new Statement('P & Q').table()
```

```
|   P   |   Q   | P & Q |
| :---: | :---: | :---: |
|  true |  true |  true |
|  true | false | false |
| false |  true | false |
| false | false | false |
```

## Development

```sh
npm install
npm test   # node:test, no test framework needed
npm run lint
```

## License

[MIT](LICENSE)

[sy]: https://en.wikipedia.org/wiki/Shunting_yard_algorithm
