const { expect } = require('chai');
const validationHelper = require('../../src/validationHelper');
const { BuiltApiError, builtErrorCodes } = require('../../src/errorHandler');

describe('validationHelper', () => {
    describe('throwErrorIfFieldNotProvided', () => {
        it('should throw BuiltApiError when the filed is not provided', () => {
            const test = null;
            const fieldName = 'test';
            try {
                validationHelper.throwErrorIfFieldNotProvided(test, fieldName);
            } catch (e) {
                expect(e).to.be.an.instanceof(BuiltApiError);
                const { status, code, message, field } = e.getError();
                expect(e.name).to.equal('BuiltApiError');
                expect(status).to.equal(400);
                expect(code).to.equal(builtErrorCodes.ERROR_40001);
                expect(message).to.equal(`${fieldName} is required`);
                expect(field).to.equal(fieldName);
            }
        });

        it('should not throw BuiltApiError when the filed is provided', () => {
            const test = 'something';
            const fieldName = 'test';
            try {
                validationHelper.throwErrorIfFieldNotProvided(test, fieldName);
            } catch (e) {
                expect.fail('Must not throw an error');
            }
        });
    });

    describe('throwErrorIfNoObjectExists', () => {
        it('should throw BuiltApiError when the object does not exist', () => {
            const testObject = null;
            const testObjectName = 'test';
            try {
                validationHelper.throwErrorIfNoObjectExists(testObject, testObjectName);
            } catch (e) {
                expect(e).to.be.an.instanceof(BuiltApiError);
                const { status, code, message } = e.getError();
                expect(e.name).to.equal('BuiltApiError');
                expect(status).to.equal(400);
                expect(code).to.equal(builtErrorCodes.ERROR_40002);
                expect(message).to.equal(`${testObjectName} is unknown`);
            }
        });

        it('should not throw BuiltApiError when the object already exist', () => {
            const testObject = { id: 1 };
            const testObjectName = 'test';
            try {
                validationHelper.throwErrorIfNoObjectExists(testObject, testObjectName);
            } catch (e) {
                expect.fail('Must not throw an error');
            }
        });
    });

    describe('throwErrorIfObjectAleadyExists', () => {
        it('should throw BuiltApiError when the object already exists', () => {
            const testObject = { id: 1 };
            const testObjectName = 'test';
            try {
                validationHelper.throwErrorIfObjectAleadyExists(testObject, testObjectName);
            } catch (e) {
                expect(e).to.be.an.instanceof(BuiltApiError);
                const { status, code, message, details } = e.getError();
                expect(e.name).to.equal('BuiltApiError');
                expect(status).to.equal(409);
                expect(code).to.equal(builtErrorCodes.ERROR_40901);
                expect(message).to.equal(`Conflict`);
                expect(details).to.equal(`${testObjectName} already exists`);
            }
        });

        it('should not throw BuiltApiError when the object does not exist', () => {
            const testObject = null;
            const testObjectName = 'test';
            try {
                validationHelper.throwErrorIfObjectAleadyExists(testObject, testObjectName);
            } catch (e) {
                expect.fail('Must not throw an error');
            }
        });
    });

    describe('throwCustomErrorIfFalseCondition', () => {
        it('should throw BuiltApiError when condition is false', () => {
            const testCondition = 1 > 2;
            const testErrorStatus = 400;
            const testErrorCode = builtErrorCodes.ERROR_40005;
            const testFieldName = null;
            const testDetails = 'This is test';
            try {
                validationHelper.throwCustomErrorIfFalseCondition(testCondition, testErrorCode, testFieldName, testDetails);
            } catch (e) {
                expect(e).to.be.an.instanceof(BuiltApiError);
                const { status, code, message, details } = e.getError();
                expect(e.name).to.equal('BuiltApiError');
                expect(status).to.equal(testErrorStatus);
                expect(code).to.equal(builtErrorCodes.ERROR_40005);
                expect(message).to.equal(`Other error`);
                expect(details).to.equal(testDetails);
            }
        });

        it('should not throw BuiltApiError when the object does not exist', () => {
            const testCondition = 1 < 2;
            const testErrorCode = builtErrorCodes.ERROR_40005;
            const testFieldName = null;
            const testDetails = 'This is test';
            try {
                validationHelper.throwCustomErrorIfFalseCondition(testCondition, testErrorCode, testFieldName, testDetails);
            } catch (e) {
                expect.fail('Must not throw an error');
            }
        });
    });
});
