/* eslint-disable class-methods-use-this */
const fieldNamePlaceholder = '{fieldName}';

const apiErrorCodes = {
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
    ERROR_40304: '40304',
    ERROR_40901: '40901',
    ERROR_42901: '42901',
};

const detailsRequiredErrors = [
    apiErrorCodes.ERROR_40005,
    apiErrorCodes.ERROR_40006,
    apiErrorCodes.ERROR_40304,
    apiErrorCodes.ERROR_40901,
];

const apiErrorList = [
    {
        status: 400, code: apiErrorCodes.ERROR_40001, message: `${fieldNamePlaceholder} is required`, moreInfo: null,
    },
    {
        status: 400, code: apiErrorCodes.ERROR_40002, message: `${fieldNamePlaceholder} is unknown`, moreInfo: null,
    },
    {
        status: 400, code: apiErrorCodes.ERROR_40003, message: `${fieldNamePlaceholder} is invalid`, moreInfo: null,
    },
    {
        status: 400, code: apiErrorCodes.ERROR_40004, message: 'Malformed request.', moreInfo: null,
    },
    {
        status: 400, code: apiErrorCodes.ERROR_40005, message: 'Other error', moreInfo: null,
    },
    {
        status: 400, code: apiErrorCodes.ERROR_40006, message: `${fieldNamePlaceholder} is invalid`, moreInfo: null,
    },
    {
        status: 400, code: apiErrorCodes.ERROR_40099, message: 'Unknown error', moreInfo: null,
    },
    {
        status: 401, code: apiErrorCodes.ERROR_40101, message: 'Authentication failed', moreInfo: null,
    },
    {
        status: 403, code: apiErrorCodes.ERROR_40301, message: 'Authorisation failed - Specific action', moreInfo: null,
    },
    {
        status: 403, code: apiErrorCodes.ERROR_40302, message: 'Invalid subscription', moreInfo: null,
    },
    {
        status: 403, code: apiErrorCodes.ERROR_40303, message: 'Authorisation failed - No roles', moreInfo: null,
    },
    {
        status: 403, code: apiErrorCodes.ERROR_40304, message: 'Subscription limit exeeded', moreInfo: null,
    },
    {
        status: 409, code: apiErrorCodes.ERROR_40901, message: 'Conflict', moreInfo: null,
    },
    {
        status: 429, code: apiErrorCodes.ERROR_42901, message: 'Request exeeded limit', moreInfo: null,
    },
];

class ApiError extends Error {
    constructor(params) {
        super(''); // We don't need the message from Error
        Error.captureStackTrace(this, this.constructor);
        const errorDefinition = this.getErrorDefinition(params.code);
        this.validateParams(errorDefinition, params);
        this.name = 'ApiError';
        this.error = this.generateError(errorDefinition, params);
    }

    getErrorDefinition(code) {
        if (!code) {
            throw new Error('ApiError: missing code');
        }

        const error = apiErrorList.filter(e => e.code === code)[0];
        if (!error) {
            throw new Error('ApiError: unknown error code');
        }
        return error;
    }

    validateParams(error, params) {
        if (error.message.includes(fieldNamePlaceholder) && !params.fieldName) {
            throw new Error('ApiError: missing fieldName');
        }
        if (detailsRequiredErrors.includes(error.code) && !params.details) {
            throw new Error('ApiError: missing details');
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
    ApiError,
    apiErrorCodes,
    detailsRequiredErrors,
};
