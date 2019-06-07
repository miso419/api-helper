function set(req, result) {
    const requestId =
        req.get('X-Session-Token') ||
        req.get('requestId') ||
        req.body.requestId ||
        req.query.requestId;

    const userToken =
        req.get('userToken') ||
        req.body.userToken ||
        req.query.userToken;

    return {
        requestId,
        userToken,
        data: result
    };
}

module.exports = {
    set
};
