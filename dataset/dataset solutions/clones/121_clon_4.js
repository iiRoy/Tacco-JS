const MAX_DIGITS_TO_PICK = 10;
const MAX_POSSIBLE_SUM = 45; // 0 + 1 + ... + 9

let combinationCounts = Array(MAX_DIGITS_TO_PICK + 1).fill(null).map(() =>
    Array(MAX_POSSIBLE_SUM + 1).fill(0)
);

combinationCounts[0][0] = 1;

for (let currentDigitValue = 0; currentDigitValue <= 9; currentDigitValue++) {
    for (let numElementsChosen = MAX_DIGITS_TO_PICK; numElementsChosen >= 1; numElementsChosen--) {
        for (let currentAccumulatedSum = MAX_POSSIBLE_SUM; currentAccumulatedSum >= currentDigitValue; currentAccumulatedSum--) {
            combinationCounts[numElementsChosen][currentAccumulatedSum] +=
                combinationCounts[numElementsChosen - 1][currentAccumulatedSum - currentDigitValue];
        }
    }
}

function deriveOutcome(numElements, targetSum) {
    if (numElements > MAX_DIGITS_TO_PICK || targetSum > MAX_POSSIBLE_SUM || numElements < 0 || targetSum < 0) {
        return 0;
    }
    return combinationCounts[numElements][targetSum];
}

(function(rawContent) {
    const dataChunks = rawContent.trim().split('\n');
    const computedValues = [];

    function processNextChunk(idx) {
        if (idx >= dataChunks.length) {
            return;
        }

        const currentChunk = dataChunks[idx];
        const numericalValues = currentChunk.split(' ').map(Number);
        const countNeeded = numericalValues[0];
        const targetValue = numericalValues[1];

        if (countNeeded === 0 && targetValue === 0) {
            return;
        }

        computedValues.push(deriveOutcome(countNeeded, targetValue));
        processNextChunk(idx + 1);
    }

    processNextChunk(0);

    computedValues.forEach(val => console.log(val));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));