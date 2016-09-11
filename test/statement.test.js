/* global describe, it */
var statement = require('../lib/statement')
var assert = require('assert')

describe('Statement', function () {
  describe('#checkWellFormed', function () {
    it('(P -> Q => unbalanced parentheses', function () {
      var error = statement.checkWellFormed('(P -> Q')
      assert.equal(error, 'unbalanced parentheses!')
    })

    it('P -> & => missing operand', function () {
      var error = statement.checkWellFormed('P -> &')
      assert.equal(error, 'missing operand!')
    })

    it('&& => double operators', function () {
      var error = statement.checkWellFormed('&&')
      assert.equal(error, 'double operators!')
    })

    it('A | (~A & B) => unknown symbol!', function () {
      var error = statement.checkWellFormed('A | (~A & B)')
      assert.equal(error, 'unknown symbol!')
    })

    it('(A || (~ & B) => unbalanced parentheses', function () {
      var error = statement.checkWellFormed('(A || (~ & B)')
      assert.equal(error, 'unbalanced parentheses!')
    })
  })

  describe('#evaluate', function () {
    it('(P <-> Q) <-> ((P || R) -> (~Q -> R))', function () {
      var out = false
      var str = '(P <-> Q) <-> ((P || R) -> (~Q -> R))'

      out = statement.evaluate(str, {'P': true, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': false, 'R': true})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': true, 'Q': false, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': true, 'R': true})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'Q': true, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'Q': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': false, 'R': false})
      assert.equal(out, true)
    })

    it('(P <-> ~Q) <-> (~P <-> ~Q)', function () {
      var out = false
      var str = '(P <-> ~Q) <-> (~P <-> ~Q)'

      out = statement.evaluate(str, {'P': true, 'Q': true})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': true, 'Q': false})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'Q': true})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'Q': false})
      assert.equal(out, false)
    })

    it('~(P & Q) || P', function () {
      var out = false
      var str = '~(P & Q) || P'

      out = statement.evaluate(str, {'P': true, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': false})
      assert.equal(out, true)
    })

    it('~(P -> Q) -> P', function () {
      var out = false
      var str = '~(P -> Q) -> P'

      out = statement.evaluate(str, {'P': true, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': false})
      assert.equal(out, true)
    })

    it('(P || Q) || (~P & Q)', function () {
      var out = false
      var str = '(P || Q) || (~P & Q)'

      out = statement.evaluate(str, {'P': true, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': false})
      assert.equal(out, false)
    })

    it('Q & ~Q', function () {
      var out = false
      var str = 'Q & ~Q'

      out = statement.evaluate(str, {'Q': true})
      assert.equal(out, false)

      out = statement.evaluate(str, {'Q': false})
      assert.equal(out, false)
    })

    it('(P -> Q) || (~Q & R)', function () {
      var out = false
      var str = '(P -> Q) || (~Q & R)'

      out = statement.evaluate(str, {'P': true, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': false, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': false, 'R': false})
      assert.equal(out, true)
    })

    it('P || Q -> R || ~P', function () {
      var out = false
      var str = 'P || Q -> R || ~P'

      out = statement.evaluate(str, {'P': true, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': true, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': true, 'Q': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': false, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': false, 'R': false})
      assert.equal(out, true)
    })

    it('R <-> ~P || (R & Q)', function () {
      var out = false
      var str = 'R <-> ~P || (R & Q)'

      out = statement.evaluate(str, {'P': true, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': false, 'R': true})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': true, 'Q': false, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': true, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'Q': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': false, 'R': false})
      assert.equal(out, false)
    })

    it('(P & Q <-> Q) -> (Q -> P)', function () {
      var out = false
      var str = '(P & Q <-> Q) -> (Q -> P)'

      out = statement.evaluate(str, {'P': true, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': false})
      assert.equal(out, true)
    })

    it('P <-> Q', function () {
      var out = false
      var str = 'P <-> Q'

      out = statement.evaluate(str, {'P': true, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': false})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'Q': true})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'Q': false})
      assert.equal(out, true)
    })

    it('~P || ~Q', function () {
      var out = false
      var str = '~P || ~Q'

      out = statement.evaluate(str, {'P': true, 'Q': true})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': true, 'Q': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': false})
      assert.equal(out, true)
    })

    it('P & (Q || R)', function () {
      var out = false
      var str = 'P & (Q || R)'

      out = statement.evaluate(str, {'P': true, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': false, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'Q': true, 'R': true})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'Q': true, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'Q': false, 'R': true})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'Q': false, 'R': false})
      assert.equal(out, false)
    })

    it('~(~R & P)', function () {
      var out = false
      var str = '~(~R & P)'

      out = statement.evaluate(str, {'P': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'R': false})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'R': false})
      assert.equal(out, true)
    })

    it('(P & Q) || (R -> Q)', function () {
      var out = false
      var str = '(P & Q) || (R -> Q)'

      out = statement.evaluate(str, {'P': true, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': true, 'Q': false, 'R': true})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': true, 'Q': false, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': true, 'R': true})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': true, 'R': false})
      assert.equal(out, true)

      out = statement.evaluate(str, {'P': false, 'Q': false, 'R': true})
      assert.equal(out, false)

      out = statement.evaluate(str, {'P': false, 'Q': false, 'R': false})
      assert.equal(out, true)
    })
  })
})
