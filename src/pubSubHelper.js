const { PubSub } = require('@google-cloud/pubsub');

const pubsub = new PubSub();
let origin = null;
let topicPath = null;
let projectName = null;
const subscriptions = [];

const ATTR_TYPE = {
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    GET: 'GET',
};

const EMAILTEMPLATE_TOPIC = 'emailNotification';
const SMS_TOPIC = 'smsNotification';
const SIGN_UP_TOPIC = 'simpliBuildSubscription';

const throwErrorIfFalse = (condition, errMsg) => {
    if (!condition) {
        throw new SyntaxError(errMsg);
    }
};

const setup = ({ appName, gcpProjectName, topicName }) => {
    throwErrorIfFalse(appName, '\'appName\' is required');
    throwErrorIfFalse(appName, '\'gcpProjectName\' is required');

    origin = appName;
    topicPath = topicName && `projects/${gcpProjectName}/topics/${topicName}`;
    projectName = gcpProjectName;
};

const validateAttributes = (attrs) => {
    throwErrorIfFalse(attrs, '\'attributes\' must not be empty');
    throwErrorIfFalse(
        attrs.type && ATTR_TYPE[attrs.type],
        '\'type\' in \'attributes\' is required and must be one of \'ATTR_TYPE\'',
    );
    throwErrorIfFalse(attrs.requestId, '\'requestId\' in \'attributes\' is required');
    throwErrorIfFalse(attrs.key, '\'key\' in \'attributes\' is required');
};

const addGenericAttributes = sourceAttrs => ({ ...sourceAttrs, origin });

const publish = (jsonData, attributes) => {
    throwErrorIfFalse(topicPath, '\'topicPath\' has not been set up. Call the setup function first');
    throwErrorIfFalse(jsonData, '\'jsonData\' is required');
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

const subscribe = (subscriptionName, successCallback, errorCallback) => {
    throwErrorIfFalse(subscriptionName, '\'subscriptionName\' is required');
    throwErrorIfFalse(successCallback, '\'successCallback\' is required');

    const path = subscriptionName && `projects/${projectName}/subscriptions/${subscriptionName}`;
    const subscription = pubsub.subscription(path);
    subscription.on('message', msg => messageHandler(msg, successCallback));
    subscription.on('error', (err) => {
        console.error('PubSub subscription ERROR: ', err);
        if (errorCallback) { errorCallback(); }
    });
    // Register a close handler in case the subscriber closes unexpectedly
    subscription.on('close', () => { console.error('PubSub subscription closed'); });
    subscriptions.push(subscription);
    console.info(`PubSub: ${subscriptionName} has been subscribed`);
};

// For generic topics ---------------------------------------

const publishEmail = ({
    gcpProjectName,
    requestId,
    from,
    to,
    cc,
    bcc,
    organisationId,
    emailTemplateId,
    cloudFileId,
    htmlString,
    subject,
    values,
    domainName,
    attachmentArray,
}) => {
    throwErrorIfFalse(projectName || gcpProjectName, "If 'setup' function has not been invoked, 'gcpProjectName' is required");
    throwErrorIfFalse(requestId, "'requestId' is required");
    throwErrorIfFalse(from, "'from' is required");
    throwErrorIfFalse(to, "'to' is required");
    throwErrorIfFalse(organisationId, "'organisationId' is required");
    throwErrorIfFalse(emailTemplateId || cloudFileId || htmlString, "'emailTemplateId', 'cloudFileId', or 'htmlString' is required");
    throwErrorIfFalse(subject, "'subject' is required");
    throwErrorIfFalse(domainName, "'domainName' is required");

    const data = {
        cloudFileId,
        emailTemplateId,
        htmlString,
        values,
        subject,
        from,
        to,
        cc,
        bcc,
        domainName,
        attachmentArray,
    };

    const attr = {
        requestId,
        type: ATTR_TYPE.POST,
        key: 'send.an.email',
    };

    const path = `projects/${projectName || gcpProjectName}/topics/${EMAILTEMPLATE_TOPIC}`;
    const dataBuffer = Buffer.from(JSON.stringify(data));
    const newAttrs = addGenericAttributes(attr);
    return pubsub.topic(path).publish(dataBuffer, newAttrs);
};

const publishAuditLog = (data, attributes) => {
    console.log(`data: ${data}, attributes: ${attributes}`);
    throw new Error('Not implemented yet');
};

const sendSMS = ({
    gcpProjectName,
    requestId,
    from,
    to,
    message,
    values,
    cloudFileId,
}) => {
    throwErrorIfFalse(projectName || gcpProjectName, 'If \'setup\' function has not been invoked, \'gcpProjectName\' is required');
    throwErrorIfFalse(from, '\'from\' is required');
    throwErrorIfFalse(to, '\'to\' is required');
    throwErrorIfFalse(message || cloudFileId, '\'message or cloudFileId \' is required');

    const attr = {
        requestId,
        type: ATTR_TYPE.POST,
        key: 'send.a.sms',
    };
    const data = {
        From: from,
        To: to,
        Body: message,
        values,
        cloudFileId,
    };
    const path = `projects/${projectName || gcpProjectName}/topics/${SMS_TOPIC}`;
    const dataBuffer = Buffer.from(JSON.stringify(data));
    const newAttrs = addGenericAttributes(attr);
    return pubsub.topic(path).publish(dataBuffer, newAttrs);
};

const publishSignUp = ({
    entity, action, message, requestId, metadata, gcpProjectName,
}) => {
    // Topic used for various sign ups - subcontract in subbie db / or swms organisation
    // / conformid user could be any entity - will send notification only
    // if the entity has a subscriber

    throwErrorIfFalse(projectName || gcpProjectName, 'If \'setup\' function has not been invoked, \'gcpProjectName\' is required');
    throwErrorIfFalse(entity, '\'entity\' is required');
    throwErrorIfFalse(action, '\'action\' is required');
    throwErrorIfFalse(message, '\'message\' is required');
    throwErrorIfFalse(requestId, "'requestId' is required");
    throwErrorIfFalse(metadata, "'metadata' is required");

    const attr = {
        requestId,
        type: ATTR_TYPE.POST,
        key: 'send.a.signupnotification',
    };
    const newAttrs = addGenericAttributes(attr);
    const data = {
        entity, action, message, metadata,
    };
    const path = `projects/${projectName || gcpProjectName}/topics/${SIGN_UP_TOPIC}`;
    const dataBuffer = Buffer.from(JSON.stringify(data));
    return pubsub.topic(path).publish(dataBuffer, newAttrs);
};

module.exports = {
    ATTR_TYPE,
    setup,
    publish,
    subscribe,
    publishEmail,
    publishAuditLog,
    sendSMS,
    publishSignUp,
};
