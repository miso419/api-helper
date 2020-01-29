const hasItems = data => data && Array.isArray(data) && !!data.length;

module.exports = {
    hasItems,
};
