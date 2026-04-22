function probeSequenceLength(orderedSet, itemToLocate, lowerBound, upperBound, comparisonTally) {
    if (lowerBound >= upperBound) {
        return comparisonTally;
    }

    const pivotIndex = (lowerBound + upperBound) >> 1; 
    const currentTally = comparisonTally + 1; 

    if (orderedSet[pivotIndex] === itemToLocate) {
        return currentTally;
    } else if (itemToLocate < orderedSet[pivotIndex]) {
        return probeSequenceLength(orderedSet, itemToLocate, lowerBound, pivotIndex, currentTally);
    } else {
        return probeSequenceLength(orderedSet, itemToLocate, pivotIndex + 1, upperBound, currentTally);
    }
}

function* inputReader(lines) {
    let i = 0;
    while (i < lines.length) {
        yield parseInt(lines[i++], 10);
    }
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = fileContent.trim().split("\n");
const dataStream = inputReader(processedLines);

while (true) {
    const elementCount = dataStream.next().value;
    if (elementCount === 0) {
        break;
    }

    const numericSequence = [];
    for (let idx = 0; idx < elementCount; idx++) {
        numericSequence.push(dataStream.next().value);
    }

    const itemToLocate = dataStream.next().value;
    console.log(probeSequenceLength(numericSequence, itemToLocate, 0, numericSequence.length, 0));
}