'use strict';
function processInput(rawData) {
    const lineStrings = rawData.split('\n');
    const parsedNumbers = lineStrings.map((numStr) => parseInt(numStr, 10));
    parsedNumbers.shift();
    const uniqueNumbersSet = new Set(parsedNumbers);
    const uniqueNumbersArray = Array.from(uniqueNumbersSet);
    uniqueNumbersArray.sort((valA, valB) => valA - valB);
    const finalCount = uniqueNumbersArray.length;
    console.log(finalCount);
}
const fileSystemModule = require('fs');
const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
processInput(standardInputContent);
