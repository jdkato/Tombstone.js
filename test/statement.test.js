import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import Statement from '../src/statement.js'

describe('Statement', function () {
  describe('#checkWellFormed', function () {
    it('should throw an "unbalanced parentheses" exception', function () {
      let statement = function () { new Statement('(P -> Q') }
      assert.throws(statement, /unbalanced\ parentheses!/)
    })

    it('should throw a "missing operand" exception', function () {
      let statement = function () { new Statement('P -> &') }
      assert.throws(statement, /double\ operators!/)
    })

    it('should throw a "double operators" exception', function () {
      let statement = function () { new Statement('&&') }
      assert.throws(statement, /double\ operators!/)
    })

    it('should throw an "unknown symbol" exception', function () {
      let statement = function () { new Statement('A | (~A & B)') }
      assert.throws(statement, /unknown\ symbol!/)
    })

    it('should throw an "unbalanced parentheses" exception', function () {
      let statement = function () { new Statement('(A || (~ & B)') }
      assert.throws(statement, /unbalanced\ parentheses!/)
    })

    it('should throw a "no symbols" exception', function () {
      let statement = function () { new Statement('()') }
      assert.throws(statement, /no\ symbols!/)
    })
  })

  describe('#evaluate', function () {
    it('should evaluate (P <-> Q) <-> ((P || R) -> (~Q -> R))', function () {
      let out = false
      let statement = new Statement('(P <-> Q) <-> ((P || R) -> (~Q -> R))')

      out = statement.evaluate({'P': true, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': false, 'R': true})
      assert.equal(out, false)

      out = statement.evaluate({'P': true, 'Q': false, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': true, 'R': true})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': true, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': false, 'R': false})
      assert.equal(out, true)
    })

    it('should evaluate (P <-> ~Q) <-> (~P <-> ~Q)', function () {
      let out = false
      let statement = new Statement('(P <-> ~Q) <-> (~P <-> ~Q)')

      out = statement.evaluate({'P': true, 'Q': true})
      assert.equal(out, false)

      out = statement.evaluate({'P': true, 'Q': false})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': true})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': false})
      assert.equal(out, false)
    })

    it('should evaluate ~(P & Q) || P', function () {
      let out = false
      let statement = new Statement('~(P & Q) || P')

      out = statement.evaluate({'P': true, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': false})
      assert.equal(out, true)
    })

    it('should evaluate ~(P -> Q) -> P', function () {
      let out = false
      let statement = new Statement('~(P -> Q) -> P')

      out = statement.evaluate({'P': true, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': false})
      assert.equal(out, true)
    })

    it('should evaluate (P || Q) || (~P & Q)', function () {
      let out = false
      let statement = new Statement('(P || Q) || (~P & Q)')

      out = statement.evaluate({'P': true, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': false})
      assert.equal(out, false)
    })

    it('should evaluate Q & ~Q', function () {
      let out = false
      let statement = new Statement('Q & ~Q')

      out = statement.evaluate({'Q': true})
      assert.equal(out, false)

      out = statement.evaluate({'Q': false})
      assert.equal(out, false)
    })

    it('should evaluate (Q)', function () {
      // TODO: detect this case as malformed
      let out = false
      let statement = new Statement('(Q)')

      out = statement.evaluate({'Q': true})
      assert.equal(out, true)

      out = statement.evaluate({'Q': false})
      assert.equal(out, false)
    })

    it('should evaluate (P) -> Q', function () {
      // TODO: detect this case as malformed
      let out = false
      let statement = new Statement('(P) -> Q')

      out = statement.evaluate({'P': true, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': false})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': false})
      assert.equal(out, true)
    })

    it('should evaluate (P -> Q) || (~Q & R)', function () {
      let out = false
      let statement = new Statement('(P -> Q) || (~Q & R)')

      out = statement.evaluate({'P': true, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': false, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': false, 'R': false})
      assert.equal(out, true)
    })

    it('should evaluate P || Q -> R || ~P', function () {
      let out = false
      let statement = new Statement('P || Q -> R || ~P')

      out = statement.evaluate({'P': true, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': true, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate({'P': true, 'Q': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': false, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': false, 'R': false})
      assert.equal(out, true)
    })

    it('should evaluate R <-> ~P || (R & Q)', function () {
      let out = false
      let statement = new Statement('R <-> ~P || (R & Q)')

      out = statement.evaluate({'P': true, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': false, 'R': true})
      assert.equal(out, false)

      out = statement.evaluate({'P': true, 'Q': false, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': true, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': false, 'R': false})
      assert.equal(out, false)
    })

    it('should evaluate (P & Q <-> Q) -> (Q -> P)', function () {
      let out = false
      let statement = new Statement('(P & Q <-> Q) -> (Q -> P)')

      out = statement.evaluate({'P': true, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': false})
      assert.equal(out, true)
    })

    it('should evaluate P <-> Q', function () {
      let out = false
      let statement = new Statement('P <-> Q')

      out = statement.evaluate({'P': true, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': false})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': true})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': false})
      assert.equal(out, true)
    })

    it('should evaluate ~P || ~Q', function () {
      let out = false
      let statement = new Statement('~P || ~Q')

      out = statement.evaluate({'P': true, 'Q': true})
      assert.equal(out, false)

      out = statement.evaluate({'P': true, 'Q': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': false})
      assert.equal(out, true)
    })

    it('should evaluate P & (Q || R)', function () {
      let out = false
      let statement = new Statement('P & (Q || R)')

      out = statement.evaluate({'P': true, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': false, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': true, 'R': true})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': true, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': false, 'R': true})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': false, 'R': false})
      assert.equal(out, false)
    })

    it('should evaluate ~(~R & P)', function () {
      let out = false
      let statement = new Statement('~(~R & P)')

      out = statement.evaluate({'P': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'R': false})
      assert.equal(out, true)
    })

    it('should evaluate (P & Q) || (R -> Q)', function () {
      let out = false
      let statement = new Statement('(P & Q) || (R -> Q)')

      out = statement.evaluate({'P': true, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': true, 'Q': false, 'R': true})
      assert.equal(out, false)

      out = statement.evaluate({'P': true, 'Q': false, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate({'P': false, 'Q': false, 'R': true})
      assert.equal(out, false)

      out = statement.evaluate({'P': false, 'Q': false, 'R': false})
      assert.equal(out, true)
    })
  })

  describe('#tree', function () {
    it('should order binary operands left-to-right', function () {
      // The RPN stack pops the right operand first. Emitting children in pop
      // order reversed every binary node, so `P -> Q` built a tree reading
      // `Q -> P` — a different formula for any connective that isn't
      // commutative.
      const root = new Statement('P -> Q').tree.tree[0]
      assert.equal(root.name, '->')
      assert.deepEqual(root.children.map(function (c) { return c.name }), ['P', 'Q'])
    })

    it('should nest correctly for a compound statement', function () {
      const root = new Statement('(P -> Q) <-> (~Q -> ~P)').tree.tree[0]
      assert.equal(root.name, '<->')
      assert.deepEqual(root.children[0].children.map(function (c) { return c.name }), ['P', 'Q'])
      assert.equal(root.children[1].children[0].name, '~')
    })
  })

  describe('#variables', function () {
    it('should list each variable once, in order of first appearance', function () {
      // Without a membership check a repeated variable got its own column and
      // doubled the row count: the contrapositive came out at 16 rows.
      assert.deepEqual(new Statement('(P -> Q) <-> (~Q -> ~P)').variables, ['P', 'Q'])
      assert.deepEqual(new Statement('Q & P').variables, ['Q', 'P'])
    })

    it('should give a truth table 2^variables rows', function () {
      const rows = new Statement('(P -> Q) <-> (~Q -> ~P)').table().split('\n')
      assert.equal(rows.length - 2, 4)
      // …and it is a tautology, so the result column is true throughout. Only
      // the last column: the variable columns are false half the time by
      // definition.
      const results = rows.slice(2).map(function (r) {
        const cells = r.split('|').map(function (c) { return c.trim() }).filter(Boolean)
        return cells[cells.length - 1]
      })
      assert.deepEqual(results, ['true', 'true', 'true', 'true'])
    })
  })

  describe('constants', function () {
    it('should evaluate falsum as false and verum as true', function () {
      assert.equal(new Statement('A & \u22a5').evaluate({ A: true }), false)
      assert.equal(new Statement('A & \u22a5').evaluate({ A: false }), false)
      assert.equal(new Statement('A || \u22a4').evaluate({ A: false }), true)
      assert.equal(new Statement('~\u22a5').evaluate({}), true)
    })

    it('should not count a constant as a variable', function () {
      // A constant has a fixed truth value, so it takes no column in a truth
      // table and must not double the row count.
      const s = new Statement('A & \u22a5')
      assert.deepEqual(s.variables, ['A'])
      assert.equal(s.table().split('\n').length - 2, 2)
    })

    it('should handle a formula made only of constants', function () {
      const s = new Statement('\u22a5 || \u22a4')
      assert.deepEqual(s.variables, [])
      assert.equal(s.evaluate({}), true)
    })

    it('should still reject unknown symbols', function () {
      assert.throws(function () { new Statement('A | B') }, /unknown symbol/)
    })
  })

  describe('malformed input', function () {
    it('should reject parens that balance by count but not by nesting', function () {
      // Reported in #3. Four opens and four closes, so a totals-only check
      // passes it, but ")))" closes one more than is open at that point. That
      // used to reach convertToRPN, which popped an empty stack forever and
      // died with "Invalid array length" instead of reporting bad input.
      assert.throws(
        function () { new Statement('(P->(Q->R)))->((P&Q)->R') },
        /unbalanced parentheses/
      )
      assert.throws(function () { new Statement(')P(') }, /unbalanced parentheses/)
    })

    it('should accept the same formula once its parens are fixed', function () {
      const s = new Statement('(P->(Q->R))->((P&Q)->R)')
      assert.deepEqual(s.variables, ['P', 'Q', 'R'])
      // Exportation: true for every assignment.
      assert.ok(s.table().split('\n').slice(2).every(function (row) {
        const cells = row.split('|').map(function (c) { return c.trim() }).filter(Boolean)
        return cells[cells.length - 1] === 'true'
      }))
    })

    it('should always throw an Error rather than crash', function () {
      const bad = ['P)', '(', ')', '()', 'P &', '& P', '~', '', '   ', 'P -> -> Q', 'A | B']
      for (const formula of bad) {
        assert.throws(function () { new Statement(formula) }, Error, formula)
      }
    })
  })
})
