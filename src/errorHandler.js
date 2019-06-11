/* eslint-disable class-methods-use-this */
const fieldNamePlaceholder = '{fieldName}';

const builtErrorCodes = {
    ERROR_40001: '40001',
    ERROR_40002: '40002',
    ERROR_40003: '40003',
    ERROR_40004: '40004',
    ERROR_40005: '40005',
    ERROR_40006: '40006', // Joi validation error
    ERROR_40099: '40099',
    ERROR_40101: '40101',
    ERROR_40301: '40301',
    ERROR_40302: '40302',
    ERROR_40303: '40303',
    ERROR_40901: '40901',
    ERROR_42901: '42901',
};

const detailsRequiredErrors = [
    builtErrorCodes.ERROR_40005,
    builtErrorCodes.ERROR_40006,
    builtErrorCodes.ERROR_40901,
];

const builtErrorList = [
    {
        status: 400, code: builtErrorCodes.ERROR_40001, message: `${fieldNamePlaceholder} is required`, moreInfo: null,
    },
    {
        status: 400, code: builtErrorCodes.ERROR_40002, message: `${fieldNamePlaceholder} is unknown`, moreInfo: null,
    },
    {
        status: 400, code: builtErrorCodes.ERROR_40003, message: `${fieldNamePlaceholder} is invalid`, moreInfo: null,
    },
    {
        status: 400, code: builtErrorCodes.ERROR_40004, message: 'Malformed request.', moreInfo: null,
    },
    {
        status: 400, code: builtErrorCodes.ERROR_40005, message: 'Other error', moreInfo: null,
    },
    {
        status: 400, code: builtErrorCodes.ERROR_40006, message: `${fieldNamePlaceholder} is invalid`, moreInfo: null,
    },
    {
        status: 400, code: builtErrorCodes.ERROR_40099, message: 'Unknown error', moreInfo: null,
    },
    {
        status: 401, code: builtErrorCodes.ERROR_40101, message: 'Authentication failed', moreInfo: null,
    },
    {
        status: 403, code: builtErrorCodes.ERROR_40301, message: 'Authorisation failed - Specific action', moreInfo: null,
    },
    {
        status: 403, code: builtErrorCodes.ERROR_40302, message: 'Invalid subscription', moreInfo: null,
    },
    {
        status: 403, code: builtErrorCodes.ERROR_40303, message: 'Authorisation failed - No roles', moreInfo: null,
    },
    {
        status: 409, code: builtErrorCodes.ERROR_40901, message: 'Conflict', moreInfo: null,
    },
    {
        status: 429, code: builtErrorCodes.ERROR_42901, message: 'Request exeeded limit', moreInfo: null,
    },
];

class BuiltApiError extends Error {
    constructor(params) {
        super(''); // We don't need the message from Error
        Error.captureStackTrace(this, this.constructor);
        const errorDefinition = this.getErrorDefinition(params.code);
        this.validateParams(errorDefinition, params);
        this.name = 'BuiltApiError';
        this.error = this.generateError(errorDefinition, params);
    }

    getErrorDefinition(code) {
        if (!code) {
            throw new Error('BuiltApiError: missing code');
        }

        const error = builtErrorList.filter(e => e.code === code)[0];
        if (!error) {
            throw new Error('BuiltApiError: unknown error code');
        }
        return error;
    }

    validateParams(error, params) {
        if (error.message.includes(fieldNamePlaceholder) && !params.fieldName) {
            throw new Error('BuiltApiError: missing fieldName');
        }
        if (detailsRequiredErrors.includes(error.code) && !params.details) {
            throw new Error('BuiltApiError: missing details');
        }
    }

    generateError(error, params) {
        return {
            status: error.status,
            code: error.code,
            message: error.message.replace(fieldNamePlaceholder, params.fieldName),
            field: params.fieldName,
            details: params.details,
            moreInfo: params.moreInfo,
        };
    }

    getError() {
        return this.error;
    }
}

module.exports = {
    BuiltApiError,
    builtErrorCodes,
    detailsRequiredErrors,
};
