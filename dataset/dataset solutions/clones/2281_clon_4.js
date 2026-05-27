'use strict';

const computeFactorial = (numValue) => {
    let product = 1;
    for (let current = 2; current <= numValue; current++) {
        product *= current;
    }
    return product;
};

const ascertainLexicographicalRank = (targetSequence, referenceElements) => {
    let currentRank = 0;
    const sequenceLength = targetSequence.length;
    const availableDigits = [...referenceElements].sort((a, b) => a - b);

    for (let i = 0; i < sequenceLength; i++) {
        const digitToMatch = targetSequence[i];
        const remainingPositions = sequenceLength - 1 - i;
        let countOfSmaller = 0;

        for (let j = 0; j < availableDigits.length; j++) {
            if (availableDigits[j] === digitToMatch) {
                currentRank += countOfSmaller * computeFactorial(remainingPositions);
                availableDigits.splice(j, 1);
                break;
            }
            if (availableDigits[j] < digitToMatch) {
                countOfSmaller++;
            }
        }
    }
    return currentRank;
};

function* generatePermutationsWithLength(sourceItems, desiredLength, currentPrefix = []) {
    if (desiredLength === 0) {
        yield currentPrefix;
        return;
    }

    for (let i = 0; i < sourceItems.length; i++) {
        const selectedItem = sourceItems[i];
        const remainingItems = [...sourceItems.slice(0, i), ...sourceItems.slice(i + 1)];
        yield* generatePermutationsWithLength(remainingItems, desiredLength - 1, [...currentPrefix, selectedItem]);
    }
}

(function() {
    Object.defineProperty(Array.prototype, 'permutation', {
        value: function(selectionCount) {
            const effectiveCount = selectionCount == null ? this.length : selectionCount;
            const collectedResults = [];
            for (const p of generatePermutationsWithLength(this, effectiveCount)) {
                collectedResults.push(p);
            }
            return collectedResults;
        },
        writable: true,
        configurable: true
    });
})();

const processInputData = (inputLines) => {
    const elementCount = parseInt(inputLines[0]);
    const firstArray = inputLines[1].split(' ').map(val => parseInt(val));
    const secondArray = inputLines[2].split(' ').map(val => parseInt(val));

    const baseSetOfElements = Array.from({ length: elementCount }, (_, index) => index);

    const firstArrayRank = ascertainLexicographicalRank(firstArray, baseSetOfElements);
    const secondArrayRank = ascertainLexicographicalRank(secondArray, baseSetOfElements);

    console.log(Math.abs(firstArrayRank - secondArrayRank));
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
