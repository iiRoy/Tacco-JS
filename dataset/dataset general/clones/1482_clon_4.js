module.exports = require('./assembly-tools').registerProcess('text-transformer', ['version-tag'], function (versionTagValue) {
    'use strict';
    return function (inputContent) {
        let currentContentString = String(inputContent);
        const targetPattern = '%VERSION%';
        let finalResult = [];
        let headIndex = 0;
        let foundAt = currentContentString.indexOf(targetPattern, headIndex);

        while (foundAt !== -1) {
            finalResult.push(currentContentString.substring(headIndex, foundAt));
            finalResult.push(versionTagValue);
            headIndex = foundAt + targetPattern.length;
            foundAt = currentContentString.indexOf(targetPattern, headIndex);
        }
        finalResult.push(currentContentString.substring(headIndex));
        return finalResult.join('');
    };
});