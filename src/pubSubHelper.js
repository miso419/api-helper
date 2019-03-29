const { PubSub } = require('@google-cloud/pubsub');

const pubsub = new PubSub();
let origin = null;
let topicPath = null;
let subscriptionPath = null;
let subscription = null;

const ATTR_TYPE = {
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    GET: 'GET'
};

const throwErrorIfFalse = (condition, errMsg) => {
    if (!condition) {
        throw new SyntaxError(errMsg);
    }
};

const setup = ({ appName, gcpProjectName, topicName, subscriptionName }) => {
    throwErrorIfFalse(appName, `'appName' is required`);
    throwErrorIfFalse(appName, `'gcpProjectName' is required`);

    origin = appName;
    topicPath = topicName && `projects/${gcpProjectName}/topics/${topicName}`;
    subscriptionPath = subscriptionName && `projects/${gcpProjectName}/subscriptions/${subscriptionName}`;
};

const validateAttributes = attrs => {
    throwErrorIfFalse(attrs, `'attributes' must not be empty`);
    throwErrorIfFalse(
        attrs.type && ATTR_TYPE[attrs.type],
        `'type' in 'attributes' is required and must be one of 'ATTR_TYPE'`);
    throwErrorIfFalse(attrs.requestId, `'requestId' in 'attributes' is required`);
    throwErrorIfFalse(attrs.key, `'key' in 'attributes' is required`);
};

const addGenericAttributes = sourceAttrs => ({ ...sourceAttrs, origin });

const publish = (jsonData, attributes) => {
    throwErrorIfFalse(topicPath, `'topicPath' has not been set up. Call the setup function first`);
    throwErrorIfFalse(jsonData, `'jsonData' is required`);
    validateAttributes(attributes);

    const dataBuffer = Buffer.from(JSON.stringify(jsonData));
    const newAttrs = addGenericAttributes(attributes);
    return pubsub.topic(topicPath).publish(dataBuffer, newAttrs);
};

const messageHandler = (message, callback) => {
    message.ack();
    const { data, attributes } = message;
    callback(JSON.parse(data), attributes);
};

const subscribe = (successCallback, errorCallback) => {
    throwErrorIfFalse(!subscription, `This funciton should be called only once`);
    throwErrorIfFalse(subscriptionPath, `'subscriptionPath' has not been set up. Call the setup function first.`);
    throwErrorIfFalse(successCallback, `'successCallback' is required`);
    throwErrorIfFalse(errorCallback, `'errorCallback' is required`);

    subscription = pubsub.subscription(subscriptionPath);
    subscription.on('message', msg => messageHandler(msg, successCallback));
    subscription.on('error', errorCallback);
};


// For generic topics ---------------------------------------

const publishEmail = (data, attribues) => {
    console.log(`data: ${data}, attributes: ${attribues}`);
    throw new Error('Not implemented yet');
};

const publishAuditLog = (data, attribues) => {
    console.log(`data: ${data}, attributes: ${attribues}`);
    throw new Error('Not implemented yet');
};

module.exports = {
    ATTR_TYPE,
    setup,
    publish,
    subscribe,
    publishEmail,
    publishAuditLog
};
