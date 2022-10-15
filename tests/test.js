import Ł from '../index.js';
import chai from 'chai';

const expect = chai.expect;

Ł.s('Logging initialized no meta');
Ł.s('Logging initialized', 'silly', 4, 11);
Ł.d('Debug an object', { make: 'Ford', model: 'Mustang', year: 1969 });
Ł.v('Returned value', { value: 'aa' });
Ł.i('Information', ['Lorem ipsum', 'dolor sit amet']);
Ł.h('Http', [
	{ options: ['Lorem ipsum', 'dolor sit amet'] },
	{ values: ['Donec augue eros, ultrices.'] },
]);
Ł.w('Warning', { node: 'data' });
Ł.e(new Error('Unexpected error'));
Ł.e('text sdf f sdf stext sdf f', new Error('Unexpected error'));
Ł.e('text sdf f sdf stext sdf f', new Error('Unexpected error'), {
	options: ['Lorem ipsum', 'dolor sit amet'],
	values: ['Donec augue eros, ultrices.'],
});

describe('Logger console', function () {
	it('should be greather than or equal 85 ', function (done) {
		expect(process.stdout.columns).to.be.greaterThanOrEqual(85);
		done();
	});
});
