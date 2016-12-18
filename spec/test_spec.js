var expect = require('chai').expect
var foo = 'bar'
var beverages = { tea: ['chai', 'matcha', 'oolong'] };

describe('sometest', () => {
    it('is a test', () => {
        expect(foo).to.be.a('string');
        expect(foo).to.equal('bar');
        expect(foo).to.have.length(3);
        expect(beverages).to.have.property('tea').with.length(3);
    })
})
