"use strict";

const processInputAndFormat = (sourceData) => {
    const globallyCleanedData = sourceData.replace(/^\s+|\s+$/g, '');

    const newlinePosition = globallyCleanedData.indexOf('\n');
    const relevantSegment = (newlinePosition === -1)
        ? globallyCleanedData
        : globallyCleanedData.substring(0, newlinePosition);

    const formattedOutput = Array.from(relevantSegment).reduce((accumulator, character) => {
        return accumulator + (character === ',' ? ' ' : character);
    }, '');

    console.log(formattedOutput);
};

processInputAndFormat(require('fs').readFileSync('/dev/stdin', 'utf8'));
