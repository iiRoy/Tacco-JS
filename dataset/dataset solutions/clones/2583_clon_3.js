const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = rawData.split('\n');

const firstLineParts = dataLines.shift().split(' ');
const totalElements = Number(firstLineParts[0]);
const maxChanges = Number(firstLineParts[1]);

const sequenceString = dataLines.shift();

let diffCount = 0;
let currentElement = sequenceString[0];

for (let idx = 1; idx < totalElements; idx++) {
    const nextElement = sequenceString[idx];
    if (currentElement !== nextElement) {
        diffCount++;
        currentElement = nextElement;
    }
}

const allowedModifications = 2 * maxChanges;
let reductionValue = diffCount - allowedModifications;

reductionValue = Math.max(0, reductionValue);

const initialHappySegments = totalElements - 1;
const finalResult = initialHappySegments - reductionValue;

console.log(finalResult);
