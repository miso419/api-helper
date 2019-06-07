const { expect } = require('chai');
const { BuiltApiError, builtErrorCodes, detailsRequiredErrors } = require('../../src/errorHandler');

describe('BuiltApiError', () => {

    it('should throw Error when no code is provided', () => {
        try {
            throw new BuiltApiError({ fieldName: 'testField', details: 'test details' });
        } catch (e) {
            expect(e).not.to.be.an.instanceof(BuiltApiError);
            expect(e.message).to.equal('BuiltApiError: missing code');
        }
    });

    it('should throw Error when code is unknown', () => {
        try {
            throw new BuiltApiError({ code: 'XXXXXX', fieldName: 'testField' });
        } catch (e) {
            expect(e).not.to.be.an.instanceof(BuiltApiError);
            expect(e.message).to.equal('BuiltApiError: unknown error code');
        }
    });

    [builtErrorCodes.ERROR_40001, builtErrorCodes.ERROR_40002, builtErrorCodes.ERROR_40003].forEach(err => {
        it(`should throw Error when no fieldName is provided for error: ${err}`, () => {
            try {
                throw new BuiltApiError({ code: err, details: 'test details' });
            } catch (e) {
                expect(e).not.to.be.an.instanceof(BuiltApiError);
                expect(e.message).to.equal('BuiltApiError: missing fieldName');
            }
        });
    });

    detailsRequiredErrors.forEach(err => {
        it(`should throw Error when no details is provided for error: ${err}`, () => {
            try {
                throw new BuiltApiError({ code: err, fieldName: 'test' });
            } catch (e) {
                expect(e).not.to.be.an.instanceof(BuiltApiError);
                expect(e.message).to.equal('BuiltApiError: missing details');
            }
        });
    });

    it('should have proper values when a BuiltApiError is thrown', () => {
        const testFieldName = 'testField';
        const testDetails = 'this is details';
        try {
            throw new BuiltApiError({ code: builtErrorCodes.ERROR_40001, fieldName: testFieldName, details: testDetails });
        } catch (e) {
            expect(e).to.be.an.instanceof(BuiltApiError);
            const { status, code, message, field, details } = e.getError();
            expect(e.name).to.equal('BuiltApiError');
            expect(status).to.equal(400);
            expect(code).to.equal(builtErrorCodes.ERROR_40001);
            expect(message).to.equal(`${testFieldName} is required`);
            expect(field).to.equal(testFieldName);
            expect(details).to.equal(testDetails);
        }
    });
});
