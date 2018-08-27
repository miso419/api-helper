import request from 'request';

function call(method, url, jsonBody, headers, isJsonResult = false, formData) {
    return new Promise((resolve, reject) => {
        request({
            method,
            url,
            headers,
            json: jsonBody,
            formData
        }, (error, response, body) => {
            if (error) {
                return reject(error);
            }
            return resolve(isJsonResult ? body : JSON.parse(body));
        });
    });
}

function post(url, jsonBody, headers, isJsonResult = false, formData) {
    return call('POST', url, jsonBody, headers, isJsonResult, formData);
}

function put(url, jsonBody, headers, isJsonResult = false) {
    return call('PUT', url, jsonBody, headers, isJsonResult);
}

function del(url, jsonBody, headers, isJsonResult = false) {
    return call('DELETE', url, jsonBody, headers, isJsonResult);
}

function get(url, headers, isJsonResult = false) {
    return call('GET', url, null, headers, isJsonResult);
}

export default {
    post,
    put,
    del,
    get
};
