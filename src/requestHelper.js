import _ from 'lodash';
import request from 'request';

function call(method, url, requestId, jsonBody) {
    return new Promise((resolve, reject) => {
        request({
            method,
            url,
            headers: { requestId },
            json: jsonBody
        }, (error, response, body) => {
            if (error) {
                return reject(error);
            }

            if (response.statusCode === 200) {
                return resolve(body);
            }

            const errorMessage = _.isString(body) ? body : JSON.stringify(body);
            return reject(new SyntaxError(errorMessage));
        });
    });
}

function post(url, requestId, jsonBody) {
    return call('POST', url, requestId, jsonBody);
}

function get(url, requestId) {
    return call('GET', url, requestId);
}

export default {
    post,
    get
};
