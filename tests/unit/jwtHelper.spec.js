const { expect } = require('chai');
const { builtErrorCodes } = require('../../src/errorHandler');
const jwtHelper = require('../../src/jwtHelper');
const { assertValidationErrorObj } = require('../../src/testHelper');

describe('jwtHelper', () => {
    const testPayload = { test: '111e0a39-9f95-4227-a8dd-8acad09ffb26' };
    const testSecretKey = 'sief7eWswfusQqDseF';

    describe('createToken', () => {
        it('should return a valid token', () => {
            const token = jwtHelper.createToken(testPayload, testSecretKey, '1m');

            expect(token.length).to.be.above(100); // HACK: Just check if long enough
            expect(token).to.not.have.string(testPayload);
        });
    });

    describe('verifyToken', () => {
        it('should return decoded values when token is valid', (done) => {
            const token = jwtHelper.createToken(testPayload, testSecretKey, '1m');

            jwtHelper.verifyToken(token, testSecretKey)
                .then((decodedValues) => {
                    expect(decodedValues.test).to.equal(testPayload.test);
                })
                .then(done, done);
        });

        it('should throw an BuiltApiError when token is invalid', (done) => {
            const token = 'sefijslgjsfljslefsflsjfslaef';

            jwtHelper.verifyToken(token, testSecretKey)
                .then(() => {
                    throw new Error('Must not called');
                })
                .catch((e) => {
                    assertValidationErrorObj(e, builtErrorCodes.ERROR_40101);
                })
                .then(done, done);
        });

        it('should throw an BuiltApiError when token is expired', (done) => {
            const expiresIn = '0.1s';
            const timeout = 300; // 0.3s
            const token = jwtHelper.createToken(testPayload, testSecretKey, expiresIn);

            setTimeout(() => {
                jwtHelper.verifyToken(token, testSecretKey)
                    .then(() => {
                        throw new Error('Must not called');
                    })
                    .catch((e) => {
                        assertValidationErrorObj(e, builtErrorCodes.ERROR_40101);
                    })
                    .then(done, done);
            }, timeout);
        });
    });
});
