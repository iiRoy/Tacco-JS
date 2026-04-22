const fileSystemModule = require('fs');

const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';

let rawContent = fileSystemModule.readFileSync(standardInputPath, textEncoding);

let contentLines = rawContent
    .trim()
    .split("\n");

const terminationSignal = 0;

while (contentLines.shift() !== terminationSignal) {

    let currentNumberSet = contentLines
        .shift()
        .split(" ")
        .map(Number);

    currentNumberSet.sort((valA, valB) => valA - valB);

    let smallestGap = Number.POSITIVE_INFINITY;

    currentNumberSet.reduce((previousNumericValue, currentNumericValue) => {
        smallestGap = Math.min(smallestGap, Math.abs(previousNumericValue - currentNumericValue));
        return currentNumericValue;
    });

    console.log(smallestGap);
}