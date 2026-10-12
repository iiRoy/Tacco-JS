function countSetBits(value) {
    let tally = 0;
    while (value > 0) {
        value &= (value - 1);
        tally++;
    }
    return tally;
}

const MAX_DIGIT_COUNT = 10;
const MAX_WEIGHTED_SUM = 330;
const ALL_DIGITS_MASK = 1 << MAX_DIGIT_COUNT;

const intermediateState = Array.from({ length: ALL_DIGITS_MASK }, () => Array(MAX_WEIGHTED_SUM + 1).fill(0));

intermediateState[0][0] = 1;

for (let currentDigitCount = 0; currentDigitCount < MAX_DIGIT_COUNT; currentDigitCount++) {
    for (let currentMask = 0; currentMask < ALL_DIGITS_MASK; currentMask++) {
        if (countSetBits(currentMask) !== currentDigitCount) {
            continue;
        }

        for (let currentSum = 0; currentSum <= MAX_WEIGHTED_SUM; currentSum++) {
            if (intermediateState[currentMask][currentSum] === 0) {
                continue;
            }

            for (let nextDigitValue = 0; nextDigitValue <= 9; nextDigitValue++) {
                if ((currentMask & (1 << nextDigitValue)) !== 0) {
                    continue;
                }

                const updatedMask = currentMask | (1 << nextDigitValue);
                const nextPositionMultiplier = currentDigitCount + 1;
                const updatedSum = currentSum + nextDigitValue * nextPositionMultiplier;

                if (updatedSum <= MAX_WEIGHTED_SUM) {
                    intermediateState[updatedMask][updatedSum] += intermediateState[currentMask][currentSum];
                }
            }
        }
    }
}

const finalResultMatrix = Array.from({ length: MAX_DIGIT_COUNT + 1 }, () => Array(MAX_WEIGHTED_SUM + 1).fill(0));

for (let maskIterator = 0; maskIterator < ALL_DIGITS_MASK; maskIterator++) {
    const digitCountFromMask = countSetBits(maskIterator);
    for (let sumIterator = 0; sumIterator <= MAX_WEIGHTED_SUM; sumIterator++) {
        finalResultMatrix[digitCountFromMask][sumIterator] += intermediateState[maskIterator][sumIterator];
    }
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = fileContent.trim().split("\n");

lines.forEach(function(singleLine) {
    const numericValues = singleLine.split(" ").map(Number);
    const requestedN = numericValues[0];
    const requestedS = numericValues[1];

    const outputValue = (finalResultMatrix[requestedN] === undefined || finalResultMatrix[requestedN][requestedS] === undefined)
        ? 0
        : finalResultMatrix[requestedN][requestedS];
    console.log(outputValue);
});
