const { Storage } = require('@google-cloud/storage');
const validationHelper = require('./validationHelper');

const storage = new Storage();

const getSignedUrl = async ({ bucket, options, fileId }) => {
    validationHelper.throwErrorIfNoObjectExists(options, 'options');
    validationHelper.throwErrorIfFieldNotProvided(bucket, 'bucket');
    validationHelper.throwErrorIfFieldNotProvided(fileId, 'fileId');
    const { action, expires } = options;
    validationHelper.throwErrorIfFieldNotProvided(action, 'options.action');
    validationHelper.throwErrorIfFieldNotProvided(expires, 'options.expires');
    const mergedOptions = {
        ...options,
        version: options.version || 'v4',
    };
    const [url] = await storage
        .bucket(bucket)
        .file(fileId)
        .getSignedUrl(mergedOptions);
    return url;
};

const getSignedUrlForUpload = ({ bucket, options, fileId }) => {
    const mergedOptions = {
        ...options,
        action: 'write',
    };
    return getSignedUrl({ bucket, options: mergedOptions, fileId });
};

// TODO Future use
const getSignedUrlForResumableUpload = ({ bucket, options, fileId }) => {
    const mergedOptions = {
        ...options,
        action: 'resumable',
    };
    return getSignedUrl({ bucket, options: mergedOptions, fileId });
};

const getSignedUrlForDownload = ({ bucket, options, fileId }) => {
    const mergedOptions = {
        ...options,
        action: 'read',
    };
    return getSignedUrl({ bucket, options: mergedOptions, fileId });
};

module.exports = {
    getSignedUrl,
    getSignedUrlForUpload,
    getSignedUrlForResumableUpload,
    getSignedUrlForDownload,
};
