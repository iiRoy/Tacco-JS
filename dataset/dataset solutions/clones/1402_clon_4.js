const fileOps = require('node:fs');
const fullContent = fileOps.readFileSync('/dev/stdin', 'utf8');

const allLines = fullContent.trim().split('\n');
const relevantLine = allLines.slice(1, 2)[0];

const digitSequences = relevantLine.match(/-?\d+/g);
const numericCollection = [];
for (let seq of digitSequences) {
    numericCollection.push(parseInt(seq, 10));
}

function sortCollectionAscending(dataArray) {
    const numElements = dataArray.length;
    for (let currentIdx = 1; currentIdx < numElements; currentIdx++) {
        let valueToInsert = dataArray[currentIdx];
        let comparisonIdx = currentIdx - 1;
        while (comparisonIdx >= 0 && dataArray[comparisonIdx] > valueToInsert) {
            dataArray[comparisonIdx + 1] = dataArray[comparisonIdx];
            comparisonIdx--;
        }
        dataArray[comparisonIdx + 1] = valueToInsert;
    }
    return dataArray;
}

const orderedValues = sortCollectionAscending(numericCollection);

let resultString = '';
for (let i = 0; i < orderedValues.length; i++) {
    resultString += orderedValues[i];
    if (i < orderedValues.length - 1) {
        resultString += ' ';
    }
}

console.info(resultString);