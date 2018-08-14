import { BuiltApiError, builtErrorCodes } from './errorHandler';

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

export default {
    throwErrorIfFieldNotProvided,
    throwErrorIfNoObjectExists,
    throwErrorIfObjectAleadyExists,
    throwCustomErrorIfFalseCondition
};
