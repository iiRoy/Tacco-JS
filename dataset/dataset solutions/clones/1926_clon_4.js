function executeProgram(programInput) {
    const [factorA, divisorB, upperLimitN] = parseInputString(programInput);
    console.log(determineMaxRemainderValue(factorA, divisorB, upperLimitN));
}

function parseInputString(rawInputText) {
    const [valA, valB, valN] = rawInputText.split(' ').map(Number);
    return [valA, valB, valN];
}

function determineMaxRemainderValue(factorA, divisorB, upperLimitN) {
    const iterationLimitBase = (upperLimitN < divisorB) ? upperLimitN : Math.floor(upperLimitN / divisorB);
    const effectiveXUpperBound = iterationLimitBase + 1;
    const maxRelevantRemainder = Math.min(effectiveXUpperBound, divisorB - 1);
    return (factorA * maxRelevantRemainder / divisorB) | 0;
}

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
