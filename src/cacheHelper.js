const redis = require('redis');
const logger = require('@builtlabs/logger');
const { builtErrorCodes } = require('./errorHandler');
const validationHelper = require('./validationHelper');

let client = null;

function setup(endpoint) {
    client = redis.createClient(6379, endpoint);

    client.on('connect', () => {
        logger.info(`Connected to Redis! endpoint: ${endpoint}`);
    });

    //NOTE: Must listen the error event to keep running the app
    client.on('error', (err) => {
        logger.error('Redis Client error ' + err);
    });
}

function getRedisClient() {
    return client;
}

function hasNoConnection() {
    return !client || !client.connected;
}

function getWithPromise(key) {
    return new Promise((resolve, reject) => {
        client.get(key, (err, result) => err ? reject(err) : resolve(result));
    });
}

function get(key) {
    if (hasNoConnection()) {
        //NOTE: client.connected must be checked always before call any method otherwise nothing returned
        return Promise.resolve(null);
    }

    return getWithPromise(key)
        .then(stringResult => JSON.parse(stringResult))
        .catch(error => {
            logger.error(`Redis get call error: ${error}`);
            return null; //NOTE: If error ignore Redis
        });
}

function getExpirySeconds(expiryIn) {
    if (!expiryIn) {
        return null;
    }

    const type = expiryIn.slice(-1);
    const avaiableTypes = ['d', 'h', 'm'];
    validationHelper.throwCustomErrorIfFalseCondition(avaiableTypes.includes(type), builtErrorCodes.ERROR_40003, 'expiryIn', 'The last character of expiryIn must be "d", "h", or "m"');

    const value = expiryIn.slice(0, -1);
    //Use stricter parse rule
    const numberPart = (/^(\-|\+)?([0-9]+)$/.test(value)) ? Number(value) : NaN; // eslint-disable-line
    validationHelper.throwCustomErrorIfFalseCondition(!isNaN(numberPart), builtErrorCodes.ERROR_40003, 'expiryIn');

    let seconds = null;
    if (type === 'd') {
        seconds = numberPart * 24 * 60 * 60;
    } else if (type === 'h') {
        seconds = numberPart * 60 * 60;
    } else if (type === 'm') {
        seconds = numberPart * 60;
    }
    return seconds;
}

function set(key, jsonObject, expiryIn) {
    return new Promise((resolve, reject) => {
        try {
            //NOTE: client.connected must be checked always before call any method otherwise nothing returned
            if (hasNoConnection()) {
                logger.error('Redis Client is not connected for SET ');
                return resolve(null);
            }

            const jsonString = JSON.stringify(jsonObject);
            client.set(key, jsonString);
            const expiryInSec = getExpirySeconds(expiryIn);
            if (expiryInSec) {
                client.set(key, jsonString, 'EX', expiryInSec);
            } else {
                client.set(key, jsonString);
            }
            return resolve(null);
        } catch (e) {
            logger.error('Redis Client SET error ' + e);
            return reject(e);
        }
    });
}

function flushAll() {
    validationHelper.throwCustomErrorIfFalseCondition(!hasNoConnection(), builtErrorCodes.ERROR_40005, null, 'Redis is not connected');

    return new Promise((resolve, reject) => {
        return client.flushall((err, succeeded) => err ? reject(err) : resolve(succeeded));
    });
}

function deleteWithPromise(key) {
    return new Promise((resolve, reject) => {
        client.del(key, (err, results) => err ? reject(err) : resolve(results));
    });
}

function deleteByKey(key) {
    if (hasNoConnection()) {
        //NOTE: should not block other actions.
        logger.error('Redis Client is not connected for deleteByKey');
        return Promise.resolve(null);
    }
    return deleteWithPromise(key);
}

function reset(key, jsonObject, expiryIn) {
    return deleteWithPromise(key)
        .then(() => set(key, jsonObject, expiryIn));
}

function searchKeys(keyword) {
    return new Promise((resolve, reject) => {
        /*eslint-disable */
        client.KEYS(`*${keyword}*`, (err, results) => err ? reject(err) : resolve(results));
        /*eslint-enable */
    });
}

function getBlackListKey(organisationId, userId) {
    return `blacklist-org:${organisationId}/blacklist_user:${userId}`;
}

function addInBlacklist(key, jwt, expiryIn) {
    //key e.g. user_roles/org_id:12/user_id:200
    const sections = key.split('/').map(section => {
        const s = section.split(':');
        return { key: s[0], value: s[1] };
    });
    const organisationId = sections.filter(s => s.key === 'org_id')[0].value;
    const userId = sections.filter(s => s.key === 'user_id')[0].value;
    const blackListKey = getBlackListKey(organisationId, userId);
    return get(blackListKey)
        .then(result => {
            if (result) {
                //If already exists, reset with the JWT
                return reset(blackListKey, { jwt }, expiryIn);
            }
            return set(blackListKey, { jwt }, expiryIn);
        });
}

function isInBlacklist(organisationId, userId, jwt, blackListExpiryIn) {
    const blacklistKey = getBlackListKey(organisationId, userId);
    return get(blacklistKey)
        .then(value => {
            if (value) {
                if (value.jwt) {
                    return value.jwt === jwt;
                }
                return reset(blacklistKey, { jwt }, blackListExpiryIn).then(() => true);
            }
            return false;
        });
}

function deleteByKeyAndBlacklist(key, blackListExpiryIn = '24h') {
    if (hasNoConnection()) {
        //NOTE: should not block other actions.
        logger.error('Redis Client is not connected for deleteByKey');
        return Promise.resolve(null);
    }
    return addInBlacklist(key, null, blackListExpiryIn).then(
        () => deleteWithPromise(key)
    );
}

function deleteByKeyword(keyword) {
    return searchKeys(keyword)
        .then(keys => Promise.all(keys.map(k => deleteWithPromise(k))));
}

module.exports = {
    setup,
    getRedisClient,
    set,
    get,
    getExpirySeconds,
    flushAll,
    searchKeys,
    deleteByKey,
    deleteByKeyword,
    isInBlacklist,
    deleteByKeyAndBlacklist
};
