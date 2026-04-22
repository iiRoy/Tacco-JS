const systemInterface = require('node:fs');

const verifyConsecutiveQuad = (collectionOfValues, startingPosition, totalElements) => {
    if (startingPosition + 3 >= totalElements) {
        return false;
    }
    const valA = collectionOfValues[startingPosition];
    const valB = collectionOfValues[startingPosition + 1];
    const valC = collectionOfValues[startingPosition + 2];
    const valD = collectionOfValues[startingPosition + 3];
    return valA === valB && valB === valC && valC === valD;
};

const processInputData = (rawData) => {
    return rawData
        .trim()
        .split('\n')
        .filter(Boolean)
        .map((singleLine) => {
            const numericSequence = singleLine
                .trim()
                .split(',')
                .map(Number);

            const orderedSequence = [...numericSequence].sort((firstValue, secondValue) => secondValue - firstValue);

            const isSpecialArrangement = [0, 1].some(offset =>
                verifyConsecutiveQuad(orderedSequence, offset, orderedSequence.length)
            );

            return isSpecialArrangement ? 'four card' : 'null';
        });
};

const rawTerminalInput = systemInterface.readFileSync('/dev/stdin', 'utf8');

const computedOutcomes = processInputData(rawTerminalInput);

computedOutcomes.forEach(outcome => console.log(outcome));