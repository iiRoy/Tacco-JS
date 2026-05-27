const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const utf8Encoding = 'utf8';

const rawInputBuffer = fileSystemModule.readFileSync(standardInputPath, utf8Encoding);
const inputLinesArray = rawInputBuffer.split('\n');

const firstLineString = inputLinesArray.shift();
const numericValueK = Number(firstLineString);

let finalComputedValue;
const halfOfK = numericValueK / 2;

if (numericValueK % 2 !== 0) {
    const floorHalfK = Math.floor(halfOfK);
    const ceilHalfK = Math.ceil(halfOfK);
    finalComputedValue = floorHalfK * ceilHalfK;
} else {
    finalComputedValue = Math.pow(halfOfK, 2);
}

console.log(finalComputedValue);
