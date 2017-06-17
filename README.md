# Tombstone.js

[![Build Status](https://travis-ci.org/jdkato/Tombstone.js.svg?branch=master)](https://travis-ci.org/jdkato/Tombstone.js) [![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/) [![codebeat badge](https://codebeat.co/badges/53242506-6b71-485b-9688-93d78d8e9ca2)](https://codebeat.co/projects/github-com-jdkato-tombstone-js-master) [![Packagist](https://img.shields.io/packagist/l/doctrine/orm.svg?maxAge=2592000)](https://github.com/jdkato/Tombstone.js/blob/master/LICENSE.txt)

Tombstone.js is a JavaScript propositional logic library. See my [blog post](https://jdkato.github.io/2016/09/09/tombstonejs-a-propositional-logic-library.html) for more information.

## Usage

Download Tombstone.js from the [releases page](https://github.com/jdkato/Tombstone.js/releases) and include it:

```html
<script type="text/javascript" src="tombstone.min.js"></script>
```

Create a new `Statement`:

```js
var statement = new tombstone.Statement('P & Q');

// pass arguments
var ret1 = statement.evaluate({'P': true, 'Q': false}); // false
var ret2 = statement.evaluate({'P': true, 'Q': true}); // true

// make a Markdown-formatted truth table
var truth = statement.table();

// |   P   |   Q   | P & Q |
// | :---: | :---: | :---: |
// |  true |  true |  true |
// |  true | false | false |
// | false |  true | false |
// | false | false | false |
```



