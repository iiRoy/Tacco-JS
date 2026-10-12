'use strict';

function processInputAndSolve(inputString) {
    const TARGET_BUTTON_ID = 2;

    const rawLines = inputString.split('\n');
    const numericValues = rawLines.map(line => ~~line);

    const totalElementsCount = numericValues[0];
    const buttonSequence = numericValues;

    let currentPosition = 1;
    let operationCount = 1;

    while (operationCount < totalElementsCount) {
        const nextPositionCandidate = buttonSequence[currentPosition];
        if (nextPositionCandidate === TARGET_BUTTON_ID) {
            console.log(operationCount);
            return;
        }
        currentPosition = nextPositionCandidate;
        operationCount++;
    }

    console.log(-1);
}

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
