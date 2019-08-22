const R = require('ramda');
const { builtErrorCodes } = require('./errorHandler');
const { throwErrorIfFieldNotProvided, throwErrorIfNoObjectExists, throwCustomErrorIfFalseCondition } = require('./validationHelper');
const requestHelper = require('./requestHelper');
const { createToken, verifyToken } = require('./jwtHelper');

const config = {
    appName: null,
    userSecretKey: null,
    internalServiceSecretKey: null,
    conformIdRootUrl: null,
};

const setup = ({
    appName, userSecretKey, internalServiceSecretKey, conformIdRootUrl,
}) => {
    throwErrorIfFieldNotProvided(appName, 'appName');
    throwErrorIfFieldNotProvided(userSecretKey, 'userSecretKey');
    throwErrorIfFieldNotProvided(internalServiceSecretKey, 'internalServiceSecretKey');
    throwErrorIfFieldNotProvided(conformIdRootUrl, 'conformIdRootUrl');

    config.appName = appName;
    config.userSecretKey = userSecretKey;
    config.internalServiceSecretKey = internalServiceSecretKey;
    config.conformIdRootUrl = conformIdRootUrl;
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
    return { isInternalService: true };
};

const getUserRoles = async (token) => {
    const decoded = await verifyToken(token, config.userSecretKey);
    const userInfo = decoded.userjwtstring ? JSON.parse(decoded.userjwtstring) : decoded;

    const roles = R.pipe(
        R.pathOr([], ['registry', 'roles']),
        R.filter(R.propEq('applicationId', getAppId(userInfo))),
        R.map(i => ({ name: i.name, entity: i.entity, entityId: i.entityId })),
    )(userInfo);

    return {
        id: R.path(['id'])(userInfo),
        firstName: R.path(['firstName'])(userInfo),
        lastName: R.path(['lastName'])(userInfo),
        email: R.path(['registry', 'email'])(userInfo),
        roles,
    };
};

// Obsolete
// TODO: Remove
const getRoles = (req) => {
    const serviceToken = req.header('x-internal-service-jwt');
    const userToken = req.header('x-user-jwt');
    return serviceToken ? getInternalServiceRole(serviceToken) : getUserRoles(userToken);
};

const getConformIdUserInfo = async (token) => {
    const decoded = await verifyToken(token, config.userSecretKey);
    const userInfo = decoded.userjwtstring ? JSON.parse(decoded.userjwtstring) : decoded;
    throwErrorIfNoObjectExists(userInfo, 'user');
    // TODO: Update the path as per Apigee change
    const email = R.path(['registry', 'email'])(userInfo);
    throwErrorIfNoObjectExists(email, 'user email');

    const endpoint = `${config.conformIdRootUrl}/users/${email}/roles`;
    const { error, data } = await requestHelper.get(endpoint, null, null, true);
    if (error) {
        throwCustomErrorIfFalseCondition(false, error.code, error.field, error.details);
    }
    return data;
};

const getUserInfo = async (req) => {
    const serviceToken = req.header('x-internal-service-jwt');
    const userToken = req.header('x-user-jwt');
    return serviceToken
        ? getInternalServiceRole(serviceToken)
        : getConformIdUserInfo(userToken);
};

// Obsolete
// TODO: Remove
const hasRole = (roleData, roleName, entity = null, entityId = null) => {
    validateSetup();
    return roleData && roleData.some(i => i.name === roleName
        && i.entity === entity
        && i.entityId === entityId);
};

const hasRoleNew = ({
    userOrgs, appId, organisationId, roleName, entity = null, entityId = null,
}) => {
    validateSetup();

    const userOrg = userOrgs.find(i => i.organisationId === organisationId);
    if (!userOrg) { return false; }

    const checkEntity = (targetEntityId, entities) => {
        if (!targetEntityId) { return true; }
        return entities && entities.include(targetEntityId);
    };

    return userOrg.roles && userOrg.roles.some(i => i.applicationId === appId
        && i.name === roleName
        && i.entityType === entity
        && checkEntity(entityId, i.entities));
};

const hasInternalServiceRole = userInfo => userInfo && userInfo.isInternalService;

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
            req.user = await getRoles(req); // TODO: Obsolete
            req.userInfo = await getUserInfo(req);
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
    hasRoleNew,
    hasInternalServiceRole,
    authorise,
    generateInternalServiceToken,
};
