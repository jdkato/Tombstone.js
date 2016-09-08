/**
 * Substitute values for symbols where possible.
 *
 * @example
 * // [ 'true', '&', '~', 'false' ]
 * performSubstitution(['P', '&', '~', 'Q'], {'P': true, 'Q': false})
 *
 * @param   {Array} symbols - The symbols to be considered.
 * @param   {Object} values - An object mapping symbols to their intended
 *  values.
 *
 * @returns {Array} - An array with symbols replaced by their values.
 */
function performSubstitution (symbols, values) {
  var symbol = null
  var prepared = []

  for (var i = 0; i < symbols.length; ++i) {
    symbol = symbols[i]
    if (['(', ')', '->', '&', '||', '<->', '~'].indexOf(symbol) >= 0) {
      prepared.push(symbol)
    } else {
      prepared.push(values[symbol])
    }
  }

  return prepared
}

/**
 * Extract all symbols from statement.
 *
 * @example
 * // [ 'P', '&', '~', 'Q' ]
 * extractSymbols('P & ~Q')
 *
 * @example
 * // [ '(', 'P', '<->', 'Q', ')', '&', '(', 'R', '|', 'Q', ')', '->', 'S' ]
 * extractSymbols('(P<-> Q) & (R|Q) ->S')
 *
 * @param   {String} statement - The statement to be parsed.
 *
 * @returns {Array} - An array containing each symbol.
 */
function extractSymbols (statement, values) {
  var accepted = ['(', ')', '->', '&', '||', '~', '<->']
  var symbols = statement.split(' ')
  var idx = 0
  var symbol = null
  var cond = null
  var bicond = null
  var extracted = []

  for (var i = 0; i < symbols.length; ++i) {
    symbol = symbols[i]
    if (!symbol.match(/^[a-z]+$/i) && accepted.indexOf(symbol) < 0) {
      idx = 0
      while (idx < symbol.length) {
        cond = symbol.slice(idx, idx + 2)
        bicond = symbol.slice(idx, idx + 3)
        if (bicond === '<->') {
          extracted.push(bicond)
          idx += 3
        } else if (cond === '->' || cond === '||') {
          extracted.push(cond)
          idx += 2
        } else {
          extracted.push(symbol.charAt(idx))
          idx += 1
        }
      }
    } else {
      extracted.push(symbol)
    }
  }

  return performSubstitution(extracted, values)
}

/**
 * Compare the precedence of two operators.
 *
 * @param   {String} op1 - The first operator.
 * @param   {String} op2 - The second operator.
 *
 * @returns {Boolean} - true if op1 has lower precedence than op2 and false
 *  otherwise.
 */
function compareOperators (op1, op2) {
  var operators = ['~', '&', '||', '->', '<->']
  if (op2 === undefined || op2 === '(') {
    return false
  }
  return operators.indexOf(op1) > operators.indexOf(op2)
}

/**
 * Uses the Shunting-Yard algorithm to convert a propositional logic statement
 * to Reverse Polish notation (RPN).
 *
 * @example
 * // [ 'P', 'Q', '<->', 'R', 'Q', '|', '&', 'S', '->' ]
 * convertToRPN('(P <-> Q) & (R | Q) -> S')
 *
 * @param   {String} statement - The statement to be converted.
 *
 * @returns {Array} - The statement in RPN.
 */
function convertToRPN (symbols) {
  var symbol = null
  var closingParen = false
  var outQueue = []
  var opStack = []

  for (var i = 0; i < symbols.length; ++i) {
    symbol = symbols[i]
    if (typeof symbol === 'boolean') {
      outQueue.push(symbol)
    } else if (symbol === ')') {
      closingParen = false
      while (!closingParen) {
        outQueue.push(opStack.pop())
        closingParen = opStack[opStack.length - 1] === '('
      }
      opStack.pop()
    } else {
      while (compareOperators(symbol, opStack[opStack.length - 1])) {
        outQueue.push(opStack.pop())
      }
      opStack.push(symbol)
    }
  }

  outQueue.push.apply(outQueue, opStack.reverse())
  return outQueue
}

/**
 * Evaluate the given operator with its operand(s).
 *
 * @param   {String} operator - The operator to be used.
 * @param   {Array} operands - The operands to be used.
 *
 * @returns {Boolean} - The result of the evaluation.
 */
function evaluate (operator, operands) {
  switch (operator) {
    case '~':
      return !operands[0]
    case '&':
      return operands[0] && operands[1]
    case '||':
      return operands[0] || operands[1]
    case '->':
      return !operands[1] || operands[0]
    case '<->':
      return operands[0] === operands[1]
  }
}

/**
 * Evaluate the given propositional logic statement in RPN.
 *
 * @param   {Array} symbols - The statement's symbols.
 *
 * @returns  {Boolean} - The evaluation result.
 */
function evaluateRPN (symbols) {
  var outStack = []
  var operands = []
  var symbol = null

  for (var i = 0; i < symbols.length; ++i) {
    symbol = symbols[i]
    if (typeof symbol === 'boolean') {
      outStack.push(symbol)
    } else {
      operands.push(outStack.pop())
      if (symbol !== '~') {
        operands.push(outStack.pop())
      }
      outStack.push(evaluate(symbol, operands))
      operands = []
    }
  }

  return outStack[0]
}

/**
 * Evaluate the given propositional logic statement.
 *
 * @param   {String} statement - The statement to be evaluated.
 * @param   {Object} values - The boolean values for each variable.
 *
 * @returns {Boolean} - The evaluation result.
 */
function evaluateStatement (statement, values) {
  return evaluateRPN(convertToRPN(extractSymbols(statement, values)))
}

module.exports.evaluate = evaluateStatement
