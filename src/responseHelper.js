function set(req, result) {
    const requestId =
        req.header['X-Session-Token'] ||
        req.header.requestId ||
        req.body.requestId ||
        req.query.requestId;

    const userToken =
        req.header.userToken ||
        req.body.userToken ||
        req.query.userToken;

    return {
        requestId,
        userToken,
        data: result
    };
}

export default {
    set
};
