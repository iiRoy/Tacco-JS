"use strict"

const computeFactorial = (function() {
    const memoizedValues = [1]; // 0! = 1
    return function(n) {
        if (memoizedValues[n] !== undefined) {
            return memoizedValues[n];
        }
        for (let i = memoizedValues.length; i <= n; i++) {
            memoizedValues[i] = memoizedValues[i - 1] * i;
        }
        return memoizedValues[n];
    };
})();

function determinePermutationRank(targetSequence, referenceElements) {
    let currentRank = 0;
    const mutableElements = [...referenceElements];

    for (let i = 0; i < targetSequence.length; i++) {
        const elementToFind = targetSequence[i];
        const positionInAvailable = mutableElements.indexOf(elementToFind);

        currentRank += positionInAvailable * computeFactorial(mutableElements.length - 1);

        mutableElements.splice(positionInAvailable, 1);
    }
    return currentRank;
}

function main(inputContent) {
    const contentLines = inputContent.trim().split("\n");
    const firstPermutationElements = contentLines[1].split(" ");
    const secondPermutationElements = contentLines[2].split(" ");

    const orderedBaseElements = [...firstPermutationElements].sort();

    const firstPermutationRank = determinePermutationRank(firstPermutationElements, orderedBaseElements);
    const secondPermutationRank = determinePermutationRank(secondPermutationElements, orderedBaseElements);

    console.log(Math.abs(firstPermutationRank - secondPermutationRank));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
