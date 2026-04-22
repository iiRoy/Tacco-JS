'use strict';

function processInput(dataSource) {
    const allNumerals = dataSource.match(/\d+/g).map(Number);
    const sequenceToEvaluate = allNumerals.slice(1);

    console.log(determineSortability(sequenceToEvaluate));
}

function determineSortability(initialArrangement) {
    const originalCopy = Array.from(initialArrangement);
    const sortedCopy = Array.from(initialArrangement).sort((valA, valB) => valA - valB);

    console.log(originalCopy);
    console.log(sortedCopy);

    const differingElements = originalCopy.filter((element, index) => {
        return element !== sortedCopy[index];
    });

    const mismatchTally = differingElements.length;

    if (mismatchTally === 0 || mismatchTally === 2) {
        return 'YES';
    } else {
        return 'NO';
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));