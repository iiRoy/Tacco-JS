function* numericSequence(sourceText) {
    const lines = sourceText.trim().split("\n");
    for (const line of lines) {
        yield parseInt(line, 10);
    }
}

function examineRange(desired, collection, startIndex, endIndex, tally) {
    const currentTally = tally + 1;

    if (startIndex >= endIndex) {
        return currentTally;
    }

    const pivotIndex = Math.floor((startIndex + endIndex) / 2);
    const pivotValue = collection[pivotIndex];

    if (pivotValue === desired) {
        return currentTally;
    } else if (desired < pivotValue) {
        return examineRange(desired, collection, startIndex, pivotIndex, currentTally);
    } else {
        return examineRange(desired, collection, pivotIndex + 1, endIndex, currentTally);
    }
}

const rawSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const numberProducer = numericSequence(rawSource);

let currentSize;
while ((currentSize = numberProducer.next().value) !== 0) {
    const currentCollection = [];
    for (let k = 0; k < currentSize; k++) {
        currentCollection.push(numberProducer.next().value);
    }
    const searchTarget = numberProducer.next().value;
    
    const resultSteps = examineRange(searchTarget, currentCollection, 0, currentCollection.length, 0);
    console.log(resultSteps);
}