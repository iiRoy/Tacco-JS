const inputLines = [];
const lineProcessor = require('readline');

const streamConfig = {
    input: process.stdin,
    output: process.stdout,
};

const inputHandler = lineProcessor.createInterface(streamConfig);

inputHandler.on('line', (currentInput) => {
    inputLines.push(currentInput);
});

inputHandler.on('close', () => {
    const numericValue = Number(inputLines[0]);

    function* generateDivisorCandidates(upperBoundExclusive) {
        let candidate = 1;
        while (candidate < upperBoundExclusive) {
            yield candidate;
            candidate++;
        }
    }

    let accumulatedResult = 0;

    for (const currentFactor of generateDivisorCandidates(Math.sqrt(numericValue))) {
        const divisionResult = numericValue / currentFactor;
        const isExactDivision = Number.isInteger(divisionResult);
        const specificCondition = currentFactor !== divisionResult - 1;

        if (isExactDivision && specificCondition) {
            accumulatedResult += (divisionResult - 1);
        }
    }

    console.log(accumulatedResult);
});
