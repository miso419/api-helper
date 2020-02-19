/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */

const R = require('ramda');
const { builtErrorCodes } = require('./errorHandler');
const { throwErrorIfFieldNotProvided, throwErrorIfNoObjectExists, throwCustomErrorIfFalseCondition } = require('./validationHelper');
const requestHelper = require('./requestHelper');
const { createToken, verifyToken } = require('./jwtHelper');

const ORG_ADMIN = 'Org Admin'; // Same across all apps

const config = {
    appName: null,
    userSecretKey: null,
    internalServiceSecretKey: null,
    conformIdRootUrl: null,
    masterDataRootUrl: null,
    useBffCerts: false,
};

const setup = ({
    appName, userSecretKey, internalServiceSecretKey, conformIdRootUrl,
    masterDataRootUrl, useBffCerts,
}) => {
    throwErrorIfFieldNotProvided(appName, 'appName');
    throwErrorIfFieldNotProvided(userSecretKey, 'userSecretKey');
    throwErrorIfFieldNotProvided(internalServiceSecretKey, 'internalServiceSecretKey');
    throwErrorIfFieldNotProvided(conformIdRootUrl, 'conformIdRootUrl');
    throwErrorIfFieldNotProvided(masterDataRootUrl, 'masterDataRootUrl');

    config.appName = appName;
    config.userSecretKey = userSecretKey;
    config.internalServiceSecretKey = internalServiceSecretKey;
    config.conformIdRootUrl = conformIdRootUrl;
    config.masterDataRootUrl = masterDataRootUrl;
    config.useBffCerts = useBffCerts;
};

const validateSetup = () => {
    throwCustomErrorIfFalseCondition(
        config && config.appName,
        builtErrorCodes.ERROR_40005,
        null,
        '\'setup\' function has to be called prior to this action',
    );
};

const generateInternalServiceToken = () => createToken({}, config.internalServiceSecretKey, '1h');

const getInternalServiceRole = async (token) => {
    await verifyToken(token, config.internalServiceSecretKey);
    return { isInternalService: true };
};

const getHeaders = () => ({
    'x-internal-service-jwt': generateInternalServiceToken(),
});

const getConformIdUserInfo = async (token) => {
    const decoded = await verifyToken(token, config.userSecretKey);
    const userInfo = decoded.userjwtstring ? JSON.parse(decoded.userjwtstring) : decoded;
    throwErrorIfNoObjectExists(userInfo, 'user');
    const email = userInfo.userEmailAddress;
    throwErrorIfNoObjectExists(email, 'user email');

    const endpoint = `${config.conformIdRootUrl}/users/${email}/roles`;
    const { data: conformIdData } = await requestHelper.get(endpoint, null, null,
        config.useBffCerts);
    const orgIds = conformIdData
        && conformIdData.userOrgs
        && conformIdData.userOrgs.map(i => i.organisationId).join(',');
    let orgHierarchies = null;
    if (orgIds) {
        const result = await requestHelper.get(
            `${config.masterDataRootUrl}/organisationHierarchies?orgIds=${orgIds}`,
            getHeaders(), false, config.useBffCerts,
        );
        orgHierarchies = result.data;
    }
    return { ...conformIdData, orgHierarchies };
};

const getUserInfo = async (req) => {
    const serviceToken = req.header('x-internal-service-jwt');
    const userToken = req.header('x-user-jwt');
    return serviceToken
        ? getInternalServiceRole(serviceToken)
        : getConformIdUserInfo(userToken);
};

const hasRole = ({
    userOrgs = [], appId, organisationId, roleName, entity = null, entityId = null,
}) => {
    validateSetup();

    const userOrg = userOrgs.find(i => i.organisationId === organisationId);
    if (!userOrg) { return false; }

    const checkEntity = (targetEntityId, entities) => {
        if (!targetEntityId) { return true; }
        return entities && entities.includes(targetEntityId);
    };

    return userOrg.roles && userOrg.roles.some(i => i.applicationId === appId
        && i.name === roleName
        && i.entityType === entity
        && checkEntity(entityId, i.entities));
};

const hasInternalServiceRole = userInfo => userInfo && userInfo.isInternalService;

const internalOnly = req => hasInternalServiceRole(req.userInfo);

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

const getAppId = apps => apps && apps[config.appName] && apps[config.appName].id;

const getParentOrgId = (userInfo, organisationId) => {
    const { orgHierarchies } = userInfo;

    let parentOrgId = null;
    for (const key in orgHierarchies) {
        if (orgHierarchies.hasOwnProperty(key)) {
            const { childOrgs } = orgHierarchies[key];
            if (childOrgs.some(c => c.id === organisationId)) {
                parentOrgId = key;
                break;
            }
        }
    }

    return parentOrgId;
};

const getChildOrgIds = (userInfo, organisationId) => {
    const { orgHierarchies } = userInfo;

    const childOrgs = R.path([organisationId, 'childOrgs'], orgHierarchies);
    return childOrgs ? childOrgs.map(i => i.id) : [];
};

const getUserOrg = (userInfo, organisationId) => {
    const { applications, userOrgs } = userInfo || {};
    const appId = getAppId(applications);

    return (userOrgs || [])
        .find(i => i.organisationId === organisationId
            && i.roles.some(r => r.applicationId === appId));
};

// Obsolete: Use getUserOrgId instead
const getId = (userInfo, organisationId) => {
    const userOrg = getUserOrg(userInfo, organisationId);
    return R.path(['id'], userOrg)
        || R.path(['user', 'id'], userInfo)
        || R.path(['extUser', 'id'], userInfo);
};

// TODO: Consider renaming as getId
const getUserOrgId = (userInfo, organisationId) => {
    throwErrorIfFieldNotProvided(userInfo, 'userInfo');
    throwErrorIfFieldNotProvided(organisationId, 'organisationId');

    const userOrg = getUserOrg(userInfo, organisationId);
    return R.path(['id'], userOrg)
        || R.path(['user', 'id'], userInfo)
        || R.path(['extUser', 'id'], userInfo);
};

const getEmail = userInfo => R.path(['user', 'userEmailAddress'], userInfo);

const getDisplayName = (userInfo, organisationId) => {
    const userOrg = getUserOrg(userInfo, organisationId);
    const { firstName, lastName } = userOrg || R.path(['user'], userInfo) || R.path(['extUser'], userInfo);
    return firstName ? `${firstName} ${lastName}` : null;
};

const isParentOrgAdmin = (userInfo, organisationId) => {
    const { applications, userOrgs } = userInfo;
    const appId = getAppId(applications);

    const parentOrgId = getParentOrgId(userInfo, organisationId);
    if (!parentOrgId) { return false; }

    const userOrg = userOrgs.find(i => i.organisationId === parentOrgId);
    return userOrg && userOrg.roles.some(i => i.applicationId === appId
        && i.name === ORG_ADMIN);
};

const isOrgAdmin = (userInfo, organisationId) => {
    const { applications, userOrgs } = userInfo;
    const appId = getAppId(applications);

    const isOrgAdminOfTarget = hasRole({
        userOrgs, appId, organisationId, roleName: ORG_ADMIN,
    });

    return isOrgAdminOfTarget || isParentOrgAdmin(userInfo, organisationId);
};

const isUserMatched = (userInfo, organisationId, targetUserId) => {
    throwErrorIfFieldNotProvided(userInfo, 'userInfo');
    throwErrorIfFieldNotProvided(targetUserId, 'targetUserId');

    const userOrg = getUserOrg(userInfo, organisationId);
    return R.path(['id'], userOrg) === targetUserId
        || R.path(['user', 'id'], userInfo) === targetUserId
        || R.path(['extUser', 'id'], userInfo) === targetUserId;
};

module.exports = {
    setup,
    hasRole,
    hasInternalServiceRole,
    authorise,
    generateInternalServiceToken,
    getAppId,
    getParentOrgId,
    getChildOrgIds,
    getId,
    getUserOrgId,
    getEmail,
    getDisplayName,
    internalOnly,
    isParentOrgAdmin,
    isOrgAdmin,
    isUserMatched,
};
