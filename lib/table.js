var statement = require('./statement')

console.log(statement.evaluate(
  'P || Q -> R || ~P', {'P': true, 'Q': true, 'R': false}
))
