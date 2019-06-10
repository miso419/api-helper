const { BuiltApiError, builtErrorCodes } = require('./errorHandler');

function throwErrorIfFieldNotProvided(field, fieldName) {
    if (field === null || field === undefined) {
        throw new BuiltApiError({ code: builtErrorCodes.ERROR_40001, fieldName });
    }
}

function throwErrorIfNoObjectExists(object, objectName) {
    if (!object) {
        throw new BuiltApiError({ code: builtErrorCodes.ERROR_40002, fieldName: objectName });
    }
}

function throwErrorIfObjectAleadyExists(object, objectName) {
    if (object) {
        throw new BuiltApiError({ code: builtErrorCodes.ERROR_40901, details: `${objectName} already exists`, objectName });
    }
}

function throwCustomErrorIfFalseCondition(condition, errorCode, fieldName, details) {
    if (!condition) {
        throw new BuiltApiError({ code: errorCode, fieldName, details });
    }
}

function throwIfJoiHasErrors(joiError, objectName) {
    if (!joiError) {
        return null;
    }

    const details = joiError.details.map(e => e.message).join('\r\n');
    throw new BuiltApiError({ code: builtErrorCodes.ERROR_40006, fieldName: objectName, details });
}

module.exports = {
    throwErrorIfFieldNotProvided,
    throwErrorIfNoObjectExists,
    throwErrorIfObjectAleadyExists,
    throwCustomErrorIfFalseCondition,
    throwIfJoiHasErrors
};
