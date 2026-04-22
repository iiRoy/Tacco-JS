'use strict'

const processText = sourceContent => {
    const processedString = sourceContent.trim();

    let firstAIndex = -1;
    let charPointer = 0;
    while (charPointer < processedString.length) {
        if (processedString.charCodeAt(charPointer) === 65) { // ASCII for 'A'
            firstAIndex = charPointer;
            break;
        }
        charPointer++;
    }

    let lastZIndex = -1;
    charPointer = processedString.length - 1;
    while (charPointer >= 0) {
        if (processedString.charCodeAt(charPointer) === 90) { // ASCII for 'Z'
            lastZIndex = charPointer;
            break;
        }
        charPointer--;
    }

    let resultingSpan = 0;
    if (firstAIndex !== -1 && lastZIndex !== -1 && firstAIndex <= lastZIndex) {
        resultingSpan = lastZIndex - firstAIndex + 1;
    }

    console.log(resultingSpan);
};

const externalModuleLoader = require;
const fileSystemAccess = externalModuleLoader('fs');
const standardInputLocation = '/dev/stdin';
const textEncoding = 'utf8';

processText(fileSystemAccess.readFileSync(standardInputLocation, textEncoding));