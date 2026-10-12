function calculateLongestIncreasingSubsequence() {
    const fs = require('fs');
    const standardInputPath = '/dev/stdin';

    function parseInputData(rawText) {
        return rawText.trim().split("\n").map(Number);
    }

    const fileContent = fs.readFileSync(standardInputPath, 'utf8');
    const dataArray = parseInputData(fileContent);

    const initialLengthValue = dataArray.shift();
    dataArray.unshift(0);
    const effectiveSequenceSize = initialLengthValue + 1;

    let lisLengths = Array.from({ length: effectiveSequenceSize }, () => 0);
    let predecessorIndices = Array.from({ length: effectiveSequenceSize }, () => 0);

    const DUMMY_PREDECESSOR_VALUE = -1;
    predecessorIndices[0] = DUMMY_PREDECESSOR_VALUE;

    const START_ELEMENT_INDEX = 1;
    const INITIAL_BEST_PREDECESSOR_INDEX = 0;

    for (let currentElementIndex = START_ELEMENT_INDEX; currentElementIndex < dataArray.length; currentElementIndex++) {
        let bestPredecessorIndex = INITIAL_BEST_PREDECESSOR_INDEX;

        for (let previousElementIndex = 0; previousElementIndex < currentElementIndex; previousElementIndex++) {
            const currentElementValue = dataArray[currentElementIndex];
            const previousElementValue = dataArray[previousElementIndex];

            const isIncreasingSequence = previousElementValue < currentElementValue;
            const isLongerPath = lisLengths[previousElementIndex] > lisLengths[bestPredecessorIndex];

            if (isIncreasingSequence && isLongerPath) {
                bestPredecessorIndex = previousElementIndex;
            }
        }
        lisLengths[currentElementIndex] = lisLengths[bestPredecessorIndex] + 1;
        predecessorIndices[currentElementIndex] = bestPredecessorIndex;
    }

    let overallMaxLength = 0;
    for (let idx = START_ELEMENT_INDEX; idx < lisLengths.length; idx++) {
        if (lisLengths[idx] > overallMaxLength) {
            overallMaxLength = lisLengths[idx];
        }
    }
    console.log(overallMaxLength);
}

calculateLongestIncreasingSubsequence();
