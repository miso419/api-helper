const R = require('ramda');
const { builtErrorCodes } = require('./errorHandler');
const { throwErrorIfFieldNotProvided, throwCustomErrorIfFalseCondition } = require('./validationHelper');
const { createToken, verifyToken } = require('./jwtHelper');

const INTERNAL_SERVICE = 'internal_service';

const config = {
    appName: null,
    userSecretKey: null,
    internalServiceSecretKey: null,
};

const setup = ({ appName, userSecretKey, internalServiceSecretKey }) => {
    throwErrorIfFieldNotProvided(appName, 'appName');
    throwErrorIfFieldNotProvided(userSecretKey, 'userSecretKey');
    throwErrorIfFieldNotProvided(internalServiceSecretKey, 'internalServiceSecretKey');

    config.appName = appName;
    config.userSecretKey = userSecretKey;
    config.internalServiceSecretKey = internalServiceSecretKey;
};

const validateSetup = () => {
    throwCustomErrorIfFalseCondition(
        config && config.appName,
        builtErrorCodes.ERROR_40005,
        null,
        '\'setup\' function has to be called prior to this action',
    );
};

const getAppId = (userInfo) => {
    const app = R.pipe(
        R.pathOr([], ['registry', 'applications']),
        R.find(R.propEq('name', config.appName)),
    )(userInfo);

    return app && app.id;
};

const generateInternalServiceToken = () => createToken({}, config.internalServiceSecretKey, '1h');

const getInternalServiceRole = async (token) => {
    await verifyToken(token, config.internalServiceSecretKey);
    return { roles: [{ name: INTERNAL_SERVICE, entity: null, entityId: null }] };
};

const getUserRoles = async (token) => {
    const userInfo = await verifyToken(token, config.userSecretKey);
    const roles = R.pipe(
        R.pathOr([], ['registry', 'roles']),
        R.filter(R.propEq('applicationId', getAppId(userInfo))),
        R.map(i => ({ name: i.name, entity: i.entity, entityId: i.entityId })),
    )(userInfo);

    return {
        id: R.path(['id'])(userInfo),
        email: R.path(['registry', 'email'])(userInfo),
        roles,
    };
};

const getRoles = (req) => {
    const serviceToken = req.header('x-internal-service-jwt');
    const userToken = req.header('x-user-jwt');
    return serviceToken ? getInternalServiceRole(serviceToken) : getUserRoles(userToken);
};

const hasRole = (roleData, roleName, entity = null, entityId = null) => {
    validateSetup();
    return roleData && roleData.some(i => i.name === roleName
        && i.entity === entity
        && i.entityId === entityId);
};

const validateAuthResult = (authorised, next) => {
    throwCustomErrorIfFalseCondition(authorised, builtErrorCodes.ERROR_40301);
    return next();
};

const authorise = (authFunc) => {
    validateSetup();
    // eslint-disable-next-line consistent-return
    return async (req, res, next) => {
        let result = null;
        try {
            req.user = await getRoles(req);
            result = authFunc(req);
        } catch (error) {
            return next(error);
        }

        // Promise
        if (typeof result === 'object' && typeof result.then === 'function') {
            return result
                .then(authorised => validateAuthResult(authorised, next))
                .catch(next);
        }
        // Boolean
        try {
            validateAuthResult(result, next);
        } catch (error) {
            return next(error);
        }
    };
};

module.exports = {
    setup,
    hasRole,
    authorise,
    generateInternalServiceToken,
};
