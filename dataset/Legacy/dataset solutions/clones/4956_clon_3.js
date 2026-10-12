const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';

const rawFileContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
const cleanedInputLines = rawFileContent.trim().split('\n');

const totalElementsCount = Number(cleanedInputLines.shift());
const stringElementsArray = cleanedInputLines.shift().split(' ');

const valuePositionMap = {};
let matchedPairCounter = 0;

for (let currentIdx = 0; currentIdx < totalElementsCount; currentIdx++) {
    const elementNumericValue = Number(stringElementsArray[currentIdx]);
    const oneBasedIndex = currentIdx + 1;

    const storedValueForCurrentElement = valuePositionMap[elementNumericValue];

    if (storedValueForCurrentElement !== undefined) {
        if (storedValueForCurrentElement === oneBasedIndex) {
            matchedPairCounter++;
        }
    } else {
        valuePositionMap[oneBasedIndex] = elementNumericValue;
    }
}

console.log(matchedPairCounter);
