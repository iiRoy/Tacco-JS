const queryReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let collectedQueries = [];

queryReader.on('line', (lineContent) => {
    collectedQueries.push(Number(lineContent));
});

queryReader.on('close', () => {
    initiateProcessing();
});

function initiateProcessing() {
    const maximumQueryValue = 50000;
    const fundamentalNumbers = generatePrimesUpTo(maximumQueryValue);
    const sumOccurrenceRegistry = new Array(maximumQueryValue + 1).fill(0);

    const firstValidFundamentalIndex = 1;
    const lastValidFundamentalIndexForOuterLoop = fundamentalNumbers.length - 1; // Corresponds to the last prime (49999) if max is 49999.
                                                                                // The original code uses i < 5133, which means up to index 5132.
                                                                                // The 5133rd prime (49999) is at index 5133. So we need to go up to index 5132.

    fundamentalNumbers.slice(firstValidFundamentalIndex, lastValidFundamentalIndexForOuterLoop).forEach((firstOperand, outerLoopRelativeIndex) => {
        const actualFirstOperandIndex = outerLoopRelativeIndex + firstValidFundamentalIndex;

        fundamentalNumbers.slice(firstValidFundamentalIndex, actualFirstOperandIndex + 1).forEach(secondOperand => {
            const currentPairSum = firstOperand + secondOperand;
            if (currentPairSum <= maximumQueryValue) {
                sumOccurrenceRegistry[currentPairSum]++;
            }
        });
    });

    for (const queryValue of collectedQueries) {
        if (queryValue === 0) {
            break;
        }
        console.log(sumOccurrenceRegistry[queryValue]);
    }
}

function generatePrimesUpTo(ceilingValue) {
    const compositeMarkers = new Array(ceilingValue + 1).fill(false);
    compositeMarkers[0] = compositeMarkers[1] = true;

    for (let currentNumberCheck = 2; currentNumberCheck * currentNumberCheck <= ceilingValue; currentNumberCheck++) {
        if (compositeMarkers[currentNumberCheck]) {
            continue;
        }
        for (let multipleMark = currentNumberCheck * currentNumberCheck; multipleMark <= ceilingValue; multipleMark += currentNumberCheck) {
            compositeMarkers[multipleMark] = true;
        }
    }

    const discoveredPrimes = [0]; // Placeholder at index 0 to align with original's 1-based prime indexing
    for (let numberIter = 1; numberIter <= ceilingValue; numberIter++) {
        if (!compositeMarkers[numberIter]) {
            discoveredPrimes.push(numberIter);
        }
    }
    return discoveredPrimes;
}