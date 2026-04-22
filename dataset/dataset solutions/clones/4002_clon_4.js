'use strict'

const performCalculation = (sourceInformation) => {
    const potentialNumericalMatch = sourceInformation.match(/^-?\d+/);
    if (!potentialNumericalMatch || potentialNumericalMatch.length === 0) {
        process.stdout.write(String(NaN) + '\n');
        return;
    }

    const valueToProcess = Number(potentialNumericalMatch[0]);
    const intermediateResult = valueToProcess / 3;

    let finalOutcome = parseInt(intermediateResult, 10);

    if (intermediateResult < 0 && intermediateResult !== finalOutcome) {
        finalOutcome--;
    }

    process.stdout.write(String(finalOutcome) + '\n');
};

performCalculation(require('node:fs').readFileSync('/dev/stdin', 'utf8'));