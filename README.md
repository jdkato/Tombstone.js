# Tombstone.js

[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![codebeat badge](https://codebeat.co/badges/53242506-6b71-485b-9688-93d78d8e9ca2)](https://codebeat.co/projects/github-com-jdkato-tombstone-js-master) [![Packagist](https://img.shields.io/packagist/l/doctrine/orm.svg?maxAge=2592000)](https://github.com/jdkato/Tombstone.js/blob/master/LICENSE.txt)

Tombstone.js is a JavaScript propositional logic library. See the [write-up](https://jdkato.io/stories/tombstone) for more information.

## Usage

Tombstone.js is an ES module with no runtime dependencies.

```js
import { Statement } from 'tombstone'
```

Create a new `Statement`:

```js
const statement = new Statement('P & Q')

// pass arguments
statement.evaluate({ P: true, Q: false }) // false
statement.evaluate({ P: true, Q: true }) // true

// the variables it found, in order of appearance
statement.variables // ['P', 'Q']

// a Markdown-formatted truth table
statement.table()

// |   P   |   Q   | P & Q |
// | :---: | :---: | :---: |
// |  true |  true |  true |
// |  true | false | false |
// | false |  true | false |
// | false | false | false |
```



