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
function extractSymbols (statement) {
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

  return extracted
}

/**
 * Extract the variables from a given statement.
 *
 * @param   {String} statement - The statement to be considered.
 *
 * @returns {Array} - All of the variables in the given statement.
 */
function extractVariables (statement) {
  var symbols = extractSymbols(statement)
  var symbol = null
  var variables = []

  for (var i = 0; i < symbols.length; ++i) {
    symbol = symbols[i]
    if (symbol.match(/^[a-z]+$/i)) {
      variables.push(symbol)
    }
  }

  return variables
}

/**
 * Verify that the symbols array is valid.
 *
 * @param  {Array} symbols - The list of symbols to be checked.
 *
 * @return {String|null} - A message if an error is found and null otherwise.
 */
function checkWellFormed (symbols) {
  var isOperand = /^[a-z()]{1}$/i
  var opening = 0
  var closing = 0
  var symbol = null
  var prev = null
  var next = null
  var isOperator = false
  var wasOperator = false
  var error = null

  if (symbols.length === 0) {
    return 'no symbols!'
  }

  for (var i = 0; i < symbols.length; ++i) {
    symbol = symbols[i]
    next = symbols[i + 1] === undefined ? '' : symbols[i + 1]
    prev = symbols[i - 1] === undefined ? '' : symbols[i - 1]
    isOperator = ['~', '&', '||', '->', '<->'].indexOf(symbol) >= 0
    if (!isOperator && !symbol.match(isOperand)) {
      error = 'unknown symbol!'
    }
    if (symbol === '(') {
      opening += 1
    } else if (symbol === ')') {
      closing += 1
    } else if (isOperator && wasOperator && symbol !== '~') {
      error = 'double operators!'
    } else if (isOperator && symbol !== '~') {
      if (!prev.match(isOperand) || (next !== '~' && !next.match(isOperand))) {
        error = 'missing operand!'
      }
    } else if (symbol === '~') {
      if (!next.match(isOperand)) {
        error = 'missing operand!'
      }
    }
    wasOperator = isOperator
  }

  if (opening !== closing) {
    error = 'unbalanced parentheses!'
  }
  return error
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
    if (symbol.match(/^[a-z]{1}$/i)) {
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
 * @returns {Boolean} - The evaluation result.
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

function RPNToTree (symbols) {
  var outStack = []
  var right = null
  var symbol = null
  var size = 0

  for (var i = 0; i < symbols.length; ++i) {
    symbol = symbols[i]
    if (symbol.match(/^[a-z]{1}$/i)) {
      outStack.push({'name': symbol})
    } else {
      right = outStack.pop()
      if (symbol === '~') {
        outStack.push({'name': symbol, 'children': [right]})
      } else {
        outStack.push({'name': symbol, 'children': [right, outStack.pop()]})
      }
    }
    size += 1
  }

  return {'tree': outStack, 'size': size}
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
  var symbols = extractSymbols(statement)
  var error = checkWellFormed(symbols)
  if (error) {
    throw new Error(error)
  }
  var converted = convertToRPN(symbols)
  return evaluateRPN(performSubstitution(converted, values))
}

/**
 * Generate a tree structure from the RPN-formatted statement.
 *
 * @param   {String} statement - The statement to be evaluated.
 *
 * @returns {Object} - An object representing a tree.
 */
function makeTree (statement) {
  var symbols = extractSymbols(statement)
  var error = checkWellFormed(symbols)
  if (error) {
    throw new Error(error)
  }
  return RPNToTree(convertToRPN(symbols))
}

module.exports.evaluate = evaluateStatement
module.exports.variables = extractVariables
module.exports.checkWellFormed = checkWellFormed
module.exports.tree = makeTree
