const inputConfiguration = {
    sourcePath: '/dev/stdin',
    lineSeparator: '\n'
};

const fileContents = require('fs').readFileSync(inputConfiguration.sourcePath, 'utf-8');
const rawDataLines = fileContents.split(inputConfiguration.lineSeparator);

let inversionTally = 0;

function uniteSubarrays(leftSegment, rightSegment) {
    let mergedCollection = [];
    let leftPointer = 0;
    let rightPointer = 0;

    while (leftPointer < leftSegment.length && rightPointer < rightSegment.length) {
        if (leftSegment[leftPointer] <= rightSegment[rightPointer]) {
            mergedCollection.push(leftSegment[leftPointer]);
            leftPointer++;
        } else {
            inversionTally += (leftSegment.length - leftPointer);
            mergedCollection.push(rightSegment[rightPointer]);
            rightPointer++;
        }
    }

    while (leftPointer < leftSegment.length) {
        mergedCollection.push(leftSegment[leftPointer]);
        leftPointer++;
    }
    while (rightPointer < rightSegment.length) {
        mergedCollection.push(rightSegment[rightPointer]);
        rightPointer++;
    }

    return mergedCollection;
}

function combineAndSort(numericSequence) {
    if (numericSequence.length <= 1) {
        return numericSequence;
    }

    const divisionPoint = Math.floor(numericSequence.length / 2);
    const firstHalf = numericSequence.slice(0, divisionPoint);
    const secondHalf = numericSequence.slice(divisionPoint);

    const sortedFirst = combineAndSort(firstHalf);
    const sortedSecond = combineAndSort(secondHalf);

    return uniteSubarrays(sortedFirst, sortedSecond);
}

const numericInputString = rawDataLines[1];
const parsedNumbers = numericInputString.split(' ').map(str => parseInt(str, 10));

const finalSortedArray = combineAndSort(parsedNumbers);

console.log(finalSortedArray.join(' '));
console.log(inversionTally);
