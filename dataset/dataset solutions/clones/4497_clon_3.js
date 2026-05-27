'use strict';

function processInput(rawData) {
    const lineDelimiter = '\n';
    const tokenDelimiter = ' ';

    const inputLines = rawData.split(lineDelimiter);
    const parsedTokens = inputLines.map(lineContent => lineContent.split(tokenDelimiter));

    const elementCountString = parsedTokens[0][0];
    const totalElements = parseInt(elementCountString, 10);
    const dataItems = parsedTokens[1];

    let finalResultString = dataItems[0];

    const isTotalElementsEven = (totalElements % 2 === 0);

    for (let currentIterationIndex = 1; currentIterationIndex < totalElements; currentIterationIndex++) {
        const currentDataItem = dataItems[currentIterationIndex];
        const isCurrentIndexEven = (currentIterationIndex % 2 === 0);

        // The condition (currentIterationIndex % 2 == totalElements % 2)
        // is equivalent to checking if both are even or both are odd.
        // This can be expressed as (isCurrentIndexEven === isTotalElementsEven).
        if (isCurrentIndexEven === isTotalElementsEven) {
            finalResultString = finalResultString + tokenDelimiter + currentDataItem;
        } else {
            finalResultString = currentDataItem + tokenDelimiter + finalResultString;
        }
    }

    console.log(finalResultString);
}

const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const fileEncoding = 'utf8';

processInput(fileSystemModule.readFileSync(standardInputFilePath, fileEncoding));
