const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

const rawFileContent = fileSystemModule.readFileSync(standardInputPath, encodingType);
const sourceLines = rawFileContent.split('\n');

const firstLineContent = sourceLines[0];
const arrayLength = parseInt(firstLineContent, 10);

const occurrenceTally = new Array(arrayLength).fill(0);

const dataLineContent = sourceLines[1];
const stringRepresentations = dataLineContent.split(' ');

function processNumericValues(strArr, targetTally) {
    for (let i = 0; i < strArr.length; i++) {
        const itemValue = Number(strArr[i]);
        const targetIndex = itemValue - 1;
        if (targetIndex >= 0 && targetIndex < targetTally.length) {
            targetTally[targetIndex] = targetTally[targetIndex] + 1;
        }
    }
}

processNumericValues(stringRepresentations, occurrenceTally);

function displayResults(resultsArray) {
    resultsArray.forEach(tallyEntry => {
        console.log(tallyEntry);
    });
}

displayResults(occurrenceTally);
