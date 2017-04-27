import {describe, it} from 'mocha'
import {assert, expect} from 'chai'
import Statement from '../src/statement'

describe('Statement', function () {
  describe('#checkWellFormed', function () {
    it('should throw an "unbalanced parentheses" exception', function () {
      let statement = function () { new Statement('(P -> Q') }
      expect(statement).to.throw('unbalanced parentheses!')
    })

    it('should throw a "missing operand" exception', function () {
      let statement = function () { new Statement('P -> &') }
      expect(statement).to.throw('double operators!')
    })

    it('should throw a "double operators" exception', function () {
      let statement = function () { new Statement('&&') }
      expect(statement).to.throw('double operators!')
    })

    it('should throw an "unknown symbol" exception', function () {
      let statement = function () { new Statement('A | (~A & B)') }
      expect(statement).to.throw('unknown symbol!')
    })

    it('should throw an "unbalanced parentheses" exception', function () {
      let statement = function () { new Statement('(A || (~ & B)') }
      expect(statement).to.throw('unbalanced parentheses!')
    })

    it('should throw a "no symbols" exception', function () {
      let statement = function () { new Statement('()') }
      expect(statement).to.throw('no symbols!')
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
})
