const { expect } = require('chai');
const { ApiError, apiErrorCodes, detailsRequiredErrors } = require('../../src/errorHandler');

describe('ApiError', () => {

    it('should throw Error when no code is provided', () => {
        try {
            throw new ApiError({ fieldName: 'testField', details: 'test details' });
        } catch (e) {
            expect(e).not.to.be.an.instanceof(ApiError);
            expect(e.message).to.equal('ApiError: missing code');
        }
    });

    it('should throw Error when code is unknown', () => {
        try {
            throw new ApiError({ code: 'XXXXXX', fieldName: 'testField' });
        } catch (e) {
            expect(e).not.to.be.an.instanceof(ApiError);
            expect(e.message).to.equal('ApiError: unknown error code');
        }
    });

    [apiErrorCodes.ERROR_40001, apiErrorCodes.ERROR_40002, apiErrorCodes.ERROR_40003].forEach(err => {
        it(`should throw Error when no fieldName is provided for error: ${err}`, () => {
            try {
                throw new ApiError({ code: err, details: 'test details' });
            } catch (e) {
                expect(e).not.to.be.an.instanceof(ApiError);
                expect(e.message).to.equal('ApiError: missing fieldName');
            }
        });
    });

    detailsRequiredErrors.forEach(err => {
        it(`should throw Error when no details is provided for error: ${err}`, () => {
            try {
                throw new ApiError({ code: err, fieldName: 'test' });
            } catch (e) {
                expect(e).not.to.be.an.instanceof(ApiError);
                expect(e.message).to.equal('ApiError: missing details');
            }
        });
    });

    it('should have proper values when a ApiError is thrown', () => {
        const testFieldName = 'testField';
        const testDetails = 'this is details';
        try {
            throw new ApiError({ code: apiErrorCodes.ERROR_40001, fieldName: testFieldName, details: testDetails });
        } catch (e) {
            expect(e).to.be.an.instanceof(ApiError);
            const { status, code, message, field, details } = e.getError();
            expect(e.name).to.equal('ApiError');
            expect(status).to.equal(400);
            expect(code).to.equal(apiErrorCodes.ERROR_40001);
            expect(message).to.equal(`${testFieldName} is required`);
            expect(field).to.equal(testFieldName);
            expect(details).to.equal(testDetails);
        }
    });
});
