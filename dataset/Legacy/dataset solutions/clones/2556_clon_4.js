'use strict';

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const processedString = sourceData[0];

const isInvalidSequencePresent = processedString.split('').some((charVal, posIdx) => {
    const isOddIndex = (posIdx % 2 !== 0);

    return (isOddIndex && charVal === 'R') || (!isOddIndex && charVal === 'L');
});

const finalVerdict = isInvalidSequencePresent ? "No" : "Yes";

console.log(finalVerdict);
