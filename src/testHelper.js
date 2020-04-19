const { expect } = require('chai');
const { ApiError, apiErrorCodes } = require('./errorHandler');

const assertValidationErrorObj = (e, expectedErrorCode = apiErrorCodes.ERROR_40001) => {
    expect(e).to.be.an.instanceof(ApiError);
    const { status, code } = e.getError();
    switch (expectedErrorCode) {
        case apiErrorCodes.ERROR_40101:
            expect(status).to.equal(401);
            break;
        case apiErrorCodes.ERROR_40301:
        case apiErrorCodes.ERROR_40302:
        case apiErrorCodes.ERROR_40303:
            expect(status).to.equal(403);
            break;
        case apiErrorCodes.ERROR_40901:
            expect(status).to.equal(409);
            break;
        case apiErrorCodes.ERROR_42901:
            expect(status).to.equal(429);
            break;
        default:
            expect(status).to.equal(400);
            break;
    }
    expect(e.name).to.equal('ApiError');
    expect(code).to.equal(expectedErrorCode);
};

module.exports = {
    assertValidationErrorObj,
};
