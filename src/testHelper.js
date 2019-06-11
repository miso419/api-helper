const { expect } = require('chai');
const { BuiltApiError, builtErrorCodes } = require('./errorHandler');

const assertValidationErrorObj = (e, expectedErrorCode = builtErrorCodes.ERROR_40001) => {
    expect(e).to.be.an.instanceof(BuiltApiError);
    const { status, code } = e.getError();
    switch (expectedErrorCode) {
        case builtErrorCodes.ERROR_40101:
            expect(status).to.equal(401);
            break;
        case builtErrorCodes.ERROR_40301:
        case builtErrorCodes.ERROR_40302:
        case builtErrorCodes.ERROR_40303:
            expect(status).to.equal(403);
            break;
        case builtErrorCodes.ERROR_40901:
            expect(status).to.equal(409);
            break;
        case builtErrorCodes.ERROR_42901:
            expect(status).to.equal(429);
            break;
        default:
            expect(status).to.equal(400);
            break;
    }
    expect(e.name).to.equal('BuiltApiError');
    expect(code).to.equal(expectedErrorCode);
};

module.exports = {
    assertValidationErrorObj,
};
