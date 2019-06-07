const { expect } = require('chai');
const cacheHelper = require('../../src/cacheHelper');
const { BuiltApiError, builtErrorCodes } = require('../../src/errorHandler');

function assertSyntaxErrorObj(e, expectedErrorCode = builtErrorCodes.ERROR_40003) {
    expect(e).to.be.an.instanceof(BuiltApiError);
    const { status, code } = e.getError();
    switch (expectedErrorCode) {
        case builtErrorCodes.ERROR_40101:
            expect(status).to.equal(401);
            break;
        case builtErrorCodes.ERROR_40301:
            expect(status).to.equal(403);
            break;
        case builtErrorCodes.ERROR_40901:
            expect(status).to.equal(409);
            break;
        default:
            expect(status).to.equal(400);
            break;
    }
    expect(e.name).to.equal('BuiltApiError');
    expect(code).to.equal(expectedErrorCode);
}

describe('cacheHelper', () => {

    describe('getExpirySeconds', () => {

        const invalidCases = ['100', '224v', '12hh', 'qwm'];
        invalidCases.forEach(expiryIn => {
            it(`should throw SyntaxError when expiryIn "${expiryIn}" is invalid format.`, () => {
                try {
                    cacheHelper.getExpirySeconds(expiryIn);
                    throw new Error('should not reach here!');
                } catch (e) {
                    assertSyntaxErrorObj(e);
                }
            });
        })

        it('should return expiry seconds when expiryIn is valid days format.', () => {
            const testValue = '3d';
            const result = cacheHelper.getExpirySeconds(testValue);
            expect(result).to.equal(3 * 24 * 60 * 60);
        });

        it('should return expiry seconds when expiryIn is valid hours format.', () => {
            const testValue = '15h';
            const result = cacheHelper.getExpirySeconds(testValue);
            expect(result).to.equal(15 * 60 * 60);
        });

        it('should return expiry seconds when expiryIn is valid minutes format.', () => {
            const testValue = '40m';
            const result = cacheHelper.getExpirySeconds(testValue);
            expect(result).to.equal(40 * 60);
        });
    });
});
