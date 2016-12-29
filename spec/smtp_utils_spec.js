const expect = require('chai').expect
const smtpUtils = require('../src/smtp_utils');
const InvalidEmailException = require('../src/exceptions').InvalidEmailException;

describe('sometest', () => {
    context('#extractEmail', () => {
        context('with invalid email', () => {
            it('throws InvalidEmail exception',  () => {
                expect(smtpUtils.extractEmail.bind('aaa')).to.throw(InvalidEmailException);
                expect(smtpUtils.extractEmail.bind('aaa@asdasda')).to.throw(InvalidEmailException);
                expect(smtpUtils.extractEmail.bind('<aaa@asdasda>')).to.throw(InvalidEmailException);
                expect(smtpUtils.extractEmail.bind('@asdasda.com')).to.throw(InvalidEmailException);
            });
        });

        context('with valid email', () => {
            it('returns correct email',  () => {
                expect(smtpUtils.extractEmail('aaa@bbb.com')).to.equal('aaa@bbb.com');
                expect(smtpUtils.extractEmail('<aaa@bbb.com>')).to.equal('aaa@bbb.com')
                expect(smtpUtils.extractEmail(' <ze@uol.com.br>')).to.equal('ze@uol.com.br')
            });
        });
    });
});
