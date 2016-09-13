import {describe, it} from 'mocha'
import {assert, expect} from 'chai'
import Statement from '../src/statement'

describe('Statement', function () {
  describe('#checkWellFormed', function () {
    it('(P -> Q => unbalanced parentheses', function () {
      let statement = function () { new Statement('(P -> Q') }
      expect(statement).to.throw('unbalanced parentheses!')
    })

    it('P -> & => missing operand', function () {
      let statement = function () { new Statement('P -> &') }
      expect(statement).to.throw('double operators!')
    })

    it('&& => double operators', function () {
      let statement = function () { new Statement('&&') }
      expect(statement).to.throw('double operators!')
    })

    it('A | (~A & B) => unknown symbol!', function () {
      let statement = function () { new Statement('A | (~A & B)') }
      expect(statement).to.throw('unknown symbol!')
    })

    it('(A || (~ & B) => unbalanced parentheses', function () {
      let statement = function () { new Statement('(A || (~ & B)') }
      expect(statement).to.throw('unbalanced parentheses!')
    })

    it('() => no symbols', function () {
      let statement = function () { new Statement('()') }
      expect(statement).to.throw('no symbols!')
    })
  })

  describe('#evaluate', function () {
    it('(P <-> Q) <-> ((P || R) -> (~Q -> R))', function () {
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

    it('(P <-> ~Q) <-> (~P <-> ~Q)', function () {
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

    it('~(P & Q) || P', function () {
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

    it('~(P -> Q) -> P', function () {
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

    it('(P || Q) || (~P & Q)', function () {
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

    it('Q & ~Q', function () {
      let out = false
      let statement = new Statement('Q & ~Q')

      out = statement.evaluate({'Q': true})
      assert.equal(out, false)

      out = statement.evaluate({'Q': false})
      assert.equal(out, false)
    })

    it('(Q)', function () {
      // TODO: detect this case as malformed
      let out = false
      let statement = new Statement('(Q)')

      out = statement.evaluate({'Q': true})
      assert.equal(out, true)

      out = statement.evaluate({'Q': false})
      assert.equal(out, false)
    })

    it('(P) -> Q', function () {
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

    it('(P -> Q) || (~Q & R)', function () {
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

    it('P || Q -> R || ~P', function () {
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

    it('R <-> ~P || (R & Q)', function () {
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

    it('(P & Q <-> Q) -> (Q -> P)', function () {
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

    it('P <-> Q', function () {
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

    it('~P || ~Q', function () {
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

    it('P & (Q || R)', function () {
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

    it('~(~R & P)', function () {
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

    it('(P & Q) || (R -> Q)', function () {
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
