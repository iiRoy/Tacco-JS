"use strict";

const inputBuffer = [];
process.stdin.on('data', dataFragment => inputBuffer.push(dataFragment));
process.stdin.on('end', () => {
    const completeInput = Buffer.concat(inputBuffer).toString().trim();
    const inputTokens = completeInput.split(/\s+/);
    let currentTokenPosition = 0;

    const retrieveNextInteger = () => parseInt(inputTokens[currentTokenPosition++], 10);

    const calculatedResult = performCostAggregation(retrieveNextInteger, retrieveNextInteger, inputTokens, currentTokenPosition);

    if (calculatedResult !== undefined) {
        process.stdout.write(String(calculatedResult) + '\n');
    }
});

function performCostAggregation(getWidthMeasure, getHeightMeasure, rawTokens, tokenStartPoint) {
    const totalWidthCuts = getWidthMeasure();
    const totalHeightCuts = getHeightMeasure();

    const allCuttingOperations = [];
    let processingIndex = tokenStartPoint;

    for (let i = 0; i < totalWidthCuts; ++i) {
        allCuttingOperations.push({
            operationValue: parseInt(rawTokens[processingIndex++], 10),
            operationKind: 0 // 0 for width-related cut
        });
    }

    for (let i = 0; i < totalHeightCuts; ++i) {
        allCuttingOperations.push({
            operationValue: parseInt(rawTokens[processingIndex++], 10),
            operationKind: 1 // 1 for height-related cut
        });
    }

    allCuttingOperations.sort((first, second) => first.operationValue - second.operationValue);

    const finalAccumulation = allCuttingOperations.reduce((currentAccumulator, currentOperation) => {
        const operationCost = BigInt(currentOperation.operationValue);
        let runningTotal = currentAccumulator.finalSum;

        if (currentOperation.operationKind === 0) { // Width-related cut
            const verticalDivisionsCount = BigInt(totalHeightCuts - currentAccumulator.heightCutsApplied + 1);
            runningTotal += operationCost * verticalDivisionsCount;
            return {
                finalSum: runningTotal,
                widthCutsApplied: currentAccumulator.widthCutsApplied + 1,
                heightCutsApplied: currentAccumulator.heightCutsApplied
            };
        } else { // Height-related cut
            const horizontalDivisionsCount = BigInt(totalWidthCuts - currentAccumulator.widthCutsApplied + 1);
            runningTotal += operationCost * horizontalDivisionsCount;
            return {
                finalSum: runningTotal,
                widthCutsApplied: currentAccumulator.widthCutsApplied,
                heightCutsApplied: currentAccumulator.heightCutsApplied + 1
            };
        }
    }, { finalSum: 0n, widthCutsApplied: 0, heightCutsApplied: 0 });

    return finalAccumulation.finalSum;
}