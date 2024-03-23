import '../global.js'
import { expect } from 'chai'

describe('Logger global access', function () {
	describe('Ł global access', function () {
		it('should be true', function (done) {
			expect(!!Ł).to.be.true
			done()
		})
	})

	describe('$l global access', function () {
		it('should be true', function (done) {
			expect(!!$l).to.be.true
			done()
		})
	})
})
