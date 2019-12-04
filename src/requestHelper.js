const request = require('request');


const throwErrorIfFalse = (condition, errMsg) => {
    if (!condition) {
        throw new SyntaxError(errMsg);
    }
};

const config = {
    // BFF to Backend MTLS certs
    mtlscert: process.env.MTLS_CERT,
    mtlskey: process.env.MTLS_KEY,
};

const setup = ({
    mtlscert,
    mtlskey,
}) => {
    throwErrorIfFalse(mtlscert, 'mtlscert is required');
    throwErrorIfFalse(mtlskey, 'mtlskey is required');
    config.mtlscert = mtlscert;
    config.mtlskey = mtlskey;
};

const validateCerts = () => {
    throwErrorIfFalse(config.mtlscert, 'mtlscert is required, setup must be called with certs or process.env.MTLS_CERT must have a value');
    throwErrorIfFalse(config.mtlskey, 'mtlskey is required, setup must be called with certs or process.env.MTLS_KEY must have a value');
};

function call(method, url, jsonBody, headers, isJsonResult = false, formData, useBffCerts) {
    if (useBffCerts) {
        validateCerts();
    }
    const getBffCerts = () => {
        return useBffCerts ? { cert: config.mtlscert, key: config.mtlskey } : null;
    };

    return new Promise((resolve, reject) => {
        request({
            method,
            url,
            headers,
            json: jsonBody,
            formData,
            ...getBffCerts(),
        }, (error, response, body) => {
            if (error) {
                return reject(error);
            }
            return resolve(isJsonResult ? body : JSON.parse(body));
        });
    });
}

function post(url, jsonBody, headers, isJsonResult = false, formData, useBffCerts = false) {
    return call('POST', url, jsonBody, headers, isJsonResult, formData, useBffCerts);
}

function put(url, jsonBody, headers, isJsonResult = false, useBffCerts = false) {
    return call('PUT', url, jsonBody, headers, isJsonResult, null, useBffCerts);
}

function del(url, jsonBody, headers, isJsonResult = false, useBffCerts = false) {
    return call('DELETE', url, jsonBody, headers, isJsonResult, null, useBffCerts);
}

function get(url, headers, isJsonResult = false, useBffCerts = false) {
    return call('GET', url, null, headers, isJsonResult, null, useBffCerts);
}

module.exports = {
    post,
    put,
    del,
    get,
    setup,
};
