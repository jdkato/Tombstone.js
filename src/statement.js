import table from './table.js'

/**
 * Logical constants. Unlike a sentence variable these have a fixed truth value,
 * so they are operands but never variables: they take no column in a truth
 * table and do not double its rows.
 */
const CONSTANTS = { '\u22a5': false, '\u22a4': true }

/** Anything that can stand where a proposition stands. */
function isOperand (symbol) {
  return /^[a-z]$/i.test(symbol) || symbol in CONSTANTS
}

class Statement {
  constructor (statement) {
    this.symbols = extractSymbols(statement)
    const error = checkWellFormed(this.symbols)
    if (error) {
      throw new Error(error)
    }
    this.statement = statement
    this.variables = extractvariables(this.statement)
    this.symbolsRPN = convertToRPN(this.symbols)
    this.tree = RPNToTree(this.symbolsRPN)
  }

  evaluate (values) {
    const evalReady = performSubstitution(this.symbolsRPN, values)
    const outStack = []
    let operands = []

    for (const symbol of evalReady) {
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

  table () {
    return table(this, 'Markdown')
  }
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
  let closingParen = false
  const outQueue = []
  const opStack = []

  for (const symbol of symbols) {
    if (isOperand(symbol)) {
      outQueue.push(symbol)
    } else if (symbol === ')') {
      closingParen = false
      // The stack-empty test is a backstop. checkWellFormed rejects mismatched
      // nesting before this runs, but without it a bad input that ever slipped
      // through would spin here instead of failing.
      while (!closingParen && opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
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
 * Verify that the symbols array is valid.
 *
 * @param  {Array} symbols - The list of symbols to be checked.
 *
 * @return {String|null} - A message if an error is found and null otherwise.
 */
function checkWellFormed (symbols) {
  // Parentheses count as operands here only so the neighbour checks below can
  // treat "(P" and "P)" as well-formed.
  const operandLike = function (symbol) {
    return isOperand(symbol) || symbol === '(' || symbol === ')'
  }

  // A formula ends with a variable, a constant or a closing paren, and starts
  // with one of those or an opening paren. Two of those meeting with nothing
  // between them means an operator is missing: "P Q" was accepted and quietly
  // evaluated to P.
  const endsFormula = function (symbol) {
    return isOperand(symbol) || symbol === ')'
  }
  const startsFormula = function (symbol) {
    return isOperand(symbol) || symbol === '('
  }
  let opening = 0
  let closing = 0
  let symbol = null
  let prev = null
  let next = null
  let isOperator = false
  let wasOperator = false
  let error = null

  if (symbols.length === 0) {
    return 'no symbols!'
  }

  for (let i = 0; i < symbols.length; ++i) {
    symbol = symbols[i]
    next = symbols[i + 1] === undefined ? '' : symbols[i + 1]
    prev = symbols[i - 1] === undefined ? '' : symbols[i - 1]
    isOperator = ['~', '&', '||', '->', '<->'].includes(symbol)
    if (!isOperator && !operandLike(symbol)) {
      error = 'unknown symbol!'
    } else if (prev !== '' && endsFormula(prev) && startsFormula(symbol)) {
      error = 'missing operator!'
    }
    if (symbol === '(') {
      opening += 1
    } else if (symbol === ')') {
      closing += 1
      // Comparing totals at the end is not enough: ")))" can balance an earlier
      // "((" by count while closing more than is actually open here. Left
      // unchecked that reaches convertToRPN, which then pops an empty stack
      // forever and dies on array length rather than reporting bad input.
      if (closing > opening) {
        error = 'unbalanced parentheses!'
      }
    } else if (isOperator && wasOperator && symbol !== '~') {
      error = 'double operators!'
    } else if (isOperator && symbol !== '~') {
      if (!operandLike(prev) || (next !== '~' && !operandLike(next))) {
        error = 'missing operand!'
      }
    } else if (symbol === '~') {
      // Negation is unary, so what follows it either starts a formula or is
      // another negation: double negation is well-formed and was rejected.
      if (!startsFormula(next) && next !== '~') {
        error = 'missing operand!'
      }
    }
    wasOperator = isOperator
  }

  if (opening !== closing) {
    error = 'unbalanced parentheses!'
  } else if (symbols.length === (opening + closing)) {
    error = 'no symbols!'
  }
  return error
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
  const accepted = ['(', ')', '->', '&', '||', '~', '<->']
  const symbols = statement.split(' ')
  let idx = 0
  let cond = null
  let bicond = null
  const extracted = []

  for (const symbol of symbols) {
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
function extractvariables (statement) {
  const symbols = extractSymbols(statement)
  const variables = []

  for (const symbol of symbols) {
    // Distinct variables, in order of first appearance. Without the
    // membership check a formula that mentions a variable twice — which any
    // interesting one does — gets a duplicate column in its truth table and
    // 2^occurrences rows instead of 2^variables.
    if (symbol.match(/^[a-z]+$/i) && variables.indexOf(symbol) === -1) {
      variables.push(symbol)
    }
  }

  return variables
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
  const operators = ['~', '&', '||', '->', '<->']
  if (op2 === undefined || op2 === '(') {
    return false
  }
  return operators.indexOf(op1) > operators.indexOf(op2)
}

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
  const prepared = []

  for (const symbol of symbols) {
    if (['(', ')', '->', '&', '||', '<->', '~'].includes(symbol)) {
      prepared.push(symbol)
    } else if (symbol in CONSTANTS) {
      prepared.push(CONSTANTS[symbol])
    } else {
      prepared.push(values[symbol])
    }
  }

  return prepared
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

function RPNToTree (symbols) {
  const outStack = []
  let right = null
  let size = 0

  for (const symbol of symbols) {
    if (isOperand(symbol)) {
      outStack.push({ name: symbol })
    } else {
      right = outStack.pop()
      if (symbol === '~') {
        outStack.push({ name: symbol, children: [right] })
      } else {
        // The stack pops right-hand operand first, so the left must be put back
        // in front of it. Emitting them in pop order reversed every binary
        // node: `P -> Q` came out as a tree reading `Q -> P`, which is a
        // different formula for every connective that isn't commutative.
        outStack.push({ name: symbol, children: [outStack.pop(), right] })
      }
    }
    size += 1
  }

  return { tree: outStack, size }
}

export default Statement
