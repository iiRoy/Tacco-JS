const computeTribonacciLikeSequence = (upperBound) => {
    const calculatedValues = [1, 2, 4];
    const minIndexForRecurrence = 3;
    for (let currentIdx = minIndexForRecurrence; currentIdx <= upperBound; currentIdx++) {
        const termBeforeOne = calculatedValues[currentIdx - 1];
        const termBeforeTwo = calculatedValues[currentIdx - 2];
        const termBeforeThree = calculatedValues[currentIdx - 3];
        calculatedValues[currentIdx] = termBeforeOne + termBeforeTwo + termBeforeThree;
    }
    return calculatedValues;
};

const rawFileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedContent = rawFileContent.trim();
const inputDataLines = processedContent.split('\n');

const SEQUENCE_MAX_LIMIT = 31;
const precomputedSequence = computeTribonacciLikeSequence(SEQUENCE_MAX_LIMIT);

const FIXED_DIVISOR_VALUE = 3650;

while (true) {
    const nextInputLine = inputDataLines.shift();
    const parsedNumericValue = Number(nextInputLine);

    if (parsedNumericValue === 0) {
        break;
    }

    const sequenceLookupIndex = parsedNumericValue - 1;
    const retrievedSequenceTerm = precomputedSequence[sequenceLookupIndex];

    const divisionResult = retrievedSequenceTerm / FIXED_DIVISOR_VALUE;
    const finalOutputValue = Math.ceil(divisionResult);

    console.log(finalOutputValue);
}
