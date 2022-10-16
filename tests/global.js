import '../global.js'
import chai from 'chai'

const expect = chai.expect

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
