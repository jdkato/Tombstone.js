/* global describe, it */
var statement = require('../lib/statement')
var assert = require('assert')

describe('Statement', function () {
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
  })
})
