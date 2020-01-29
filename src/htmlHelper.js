const fs = require('fs');
const path = require('path');
const S = require('string');

let htmlTemplates = {};

const getHtml = (fileName) => {
    if (htmlTemplates[fileName]) {
        return htmlTemplates[fileName];
    }

    htmlTemplates = {
        ...htmlTemplates,
        [fileName]: fs.readFileSync(path.resolve(`src/assets/${fileName}.html`), 'utf8'),
    };
    return htmlTemplates[fileName];
};

const getHtmlSegment = (html, data) => S(html).template(data).s;

module.exports = {
    getHtml,
    getHtmlSegment,
};
