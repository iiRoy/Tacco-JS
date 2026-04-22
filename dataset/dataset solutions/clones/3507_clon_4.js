"use strict";

const numericalDivisor = 111;

let collectedInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
    collectedInput += dataChunk;
});

process.stdin.on('end', () => {
    const determineCeilingMultiple = (valueToProcess) => {
        const intermediateResult = Math.floor((valueToProcess - 1) / numericalDivisor);
        return (intermediateResult + 1) * numericalDivisor;
    };

    const parsedTokens = collectedInput.trim().split(/\s+/);

    const initialNumber = parseInt(parsedTokens[0], 10);

    const finalOutcome = determineCeilingMultiple(initialNumber);

    console.log(finalOutcome);
});