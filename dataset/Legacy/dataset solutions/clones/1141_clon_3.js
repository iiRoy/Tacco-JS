function computeLongestIncreasingSubsequence() {
    const sequenceData = dataElements;

    const dpArrayInitialSize = sequenceData[0] + 1;

    const lisLengths = Array.from({ length: dpArrayInitialSize }, () => 0);
    const predecessorIndices = Array.from({ length: dpArrayInitialSize }, () => 0);

    sequenceData[0] = 0;

    predecessorIndices[0] = -1;

    const actualSequenceLength = sequenceData.length;

    for (let currentElementIndex = 1; currentElementIndex < actualSequenceLength; currentElementIndex++) {
        let bestPredecessorIndex = 0;

        const searchLimitForPredecessors = currentElementIndex;
        for (let potentialPredecessorIndex = 0; potentialPredecessorIndex < searchLimitForPredecessors; potentialPredecessorIndex++) {
            const isIncreasing = sequenceData[potentialPredecessorIndex] < sequenceData[currentElementIndex];
            const isLongerPath = lisLengths[potentialPredecessorIndex] > lisLengths[bestPredecessorIndex];

            if (isIncreasing && isLongerPath) {
                bestPredecessorIndex = potentialPredecessorIndex;
            }
        }

        lisLengths[currentElementIndex] = lisLengths[bestPredecessorIndex] + 1;
        predecessorIndices[currentElementIndex] = bestPredecessorIndex;
    }

    const overallMaxLisLength = Math.max(...lisLengths);

    console.log(overallMaxLisLength);
}

const rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');
let dataElements = rawInputString.trim().split("\n").map(Number);
computeLongestIncreasingSubsequence();
