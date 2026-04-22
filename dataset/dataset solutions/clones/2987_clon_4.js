const entryHandler = require('readline');

async function extractValue() {
    const sourceStream = entryHandler.createInterface({
        input: process.stdin,
        output: process.stdout,
        crlfDelay: Infinity
    });

    let dataSegments = [];
    for await (const segment of sourceStream) {
        dataSegments.push(segment);
    }
    return dataSegments[0];
}

async function primaryExecution() {
    const inputString = await extractValue();
    const processedNumeric = Number(inputString);

    const squareRootApprox = Math.sqrt(processedNumeric);
    const upperBoundary = Number.isInteger(squareRootApprox) ? squareRootApprox - 1 : Math.floor(squareRootApprox);

    const numericalSequence = Array.from({ length: Math.max(0, upperBoundary) }, (_, idx) => idx + 1);

    const finalAccumulation = numericalSequence.reduce((totalCurrent, currentIteration) => {
        const isFactor = processedNumeric % currentIteration === 0;
        const distinctCondition = currentIteration !== (processedNumeric / currentIteration) - 1;

        if (isFactor && distinctCondition) {
            return totalCurrent + (processedNumeric / currentIteration - 1);
        }
        return totalCurrent;
    }, 0);

    console.log(finalAccumulation);
}

primaryExecution();