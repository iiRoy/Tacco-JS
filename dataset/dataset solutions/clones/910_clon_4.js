const fileSystem = require('fs');

const inputBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputSequence = inputBuffer.trim().split('\n');
let sequencePointer = 0;

const retrieveNextEntry = () => {
    if (sequencePointer >= inputSequence.length) {
        return null;
    }
    return inputSequence[sequencePointer++];
};

const displayOutcome = (resultValue) => {
    console.log(resultValue);
};

const ascertainMinimumDeviation = (
    firstComponent,
    secondComponent,
    iterationIndex,
    iterationLimit,
    currentMinimum
) => {
    if (iterationIndex > iterationLimit) {
        return currentMinimum;
    }

    const sideOne = iterationIndex;
    const sideTwo = firstComponent - iterationIndex;

    const hypotenuseLength = Math.sqrt(sideOne * sideOne + sideTwo * sideTwo);

    const deviationValue = Math.abs(secondComponent - hypotenuseLength);

    return ascertainMinimumDeviation(
        firstComponent,
        secondComponent,
        iterationIndex + 1,
        iterationLimit,
        Math.min(currentMinimum, deviationValue)
    );
};

const commenceOperation = () => {
    let currentInputLine;
    while ((currentInputLine = retrieveNextEntry()) !== null) {
        const numericValues = currentInputLine.split(' ').map(Number);
        const primaryValue = numericValues[0];

        if (primaryValue === 0) {
            break;
        }

        const secondaryValue = numericValues[1];

        const iterationUpperBound = Math.floor(primaryValue / 2);

        const calculatedResult = ascertainMinimumDeviation(
            primaryValue,
            secondaryValue,
            0,
            iterationUpperBound,
            Infinity
        );

        displayOutcome(calculatedResult);
    }
};

commenceOperation();