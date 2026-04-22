const inputAcquirer = () => {
    const systemOperations = require("fs");
    return systemOperations.readFileSync("/dev/stdin", "UTF-8");
};

const evaluateProgress = (
    currentSpot,
    nonTargetRunningTotal,
    targetRunningTotal,
    adjustmentCounter,
    characterArray,
    sequenceLength
) => {
    if (currentSpot === sequenceLength || targetRunningTotal === sequenceLength / 2) {
        return adjustmentCounter;
    }

    const currentSymbol = characterArray[currentSpot];

    if (currentSymbol === 'T') {
        const nextTargetRunningTotal = targetRunningTotal + 1;
        let nextAdjustmentCounter = adjustmentCounter;
        if (adjustmentCounter < nonTargetRunningTotal) {
            nextAdjustmentCounter++;
        }
        return evaluateProgress(
            currentSpot + 1,
            nonTargetRunningTotal,
            nextTargetRunningTotal,
            nextAdjustmentCounter,
            characterArray,
            sequenceLength
        );
    } else {
        const nextNonTargetRunningTotal = nonTargetRunningTotal + 1;
        return evaluateProgress(
            currentSpot + 1,
            nextNonTargetRunningTotal,
            targetRunningTotal,
            adjustmentCounter,
            characterArray,
            sequenceLength
        );
    }
};

const processSequence = (incomingData) => {
    const firstLine = incomingData.split("\n")[0];
    const characterList = Array.from(firstLine);
    const totalLength = characterList.length;

    const finalAdjustment = evaluateProgress(
        0,
        0,
        0,
        0,
        characterList,
        totalLength
    );

    const calculatedOutcome = totalLength - (2 * finalAdjustment);
    console.log(calculatedOutcome);
};

processSequence(inputAcquirer());