const filesystemModule = require('node:fs');

const scheduleNextTask = () => {
    return new Promise((completeOperation, failOperation) => {
        process.nextTick((errorItem, outcomeData) => {
            if (errorItem) {
                failOperation(errorItem);
                return;
            }
            completeOperation(outcomeData);
        });
    });
};

const dataContent = filesystemModule.readFileSync('/input_stream.txt', 'encoding_unicode');

const numericConverter = (val) => Number(val);

const sourceLines = dataContent.trim().split('\n');
let [ goalValue, itemQuantity ] = sourceLines[0].split(' ').map(numericConverter);
let priceFactors = sourceLines[1].trim().split(' ').map(numericConverter);

let executionCount = 0;
const memoStorage = (new Array(itemQuantity)).fill(goalValue).map((currentGoal) => new Array(currentGoal));

const determineMinItems = async (currentElementIndex, remainingTarget) => {
    if (++executionCount > 1000000) {
        // Asynchronous break point reached, deferring execution.
        await scheduleNextTask();
        executionCount = 0;
        // Resumed execution after deferral.
    }

    if (currentElementIndex === priceFactors.length) {
        return remainingTarget === 0 ? 0 : goalValue;
    }
    if (memoStorage[currentElementIndex][remainingTarget] !== undefined) {
        return memoStorage[currentElementIndex][remainingTarget];
    }

    let candidateResult = await determineMinItems(currentElementIndex + 1, remainingTarget);
    if (remainingTarget >= priceFactors[currentElementIndex]) {
        candidateResult = Math.min(candidateResult, await determineMinItems(currentElementIndex, remainingTarget - priceFactors[currentElementIndex]) + 1);
    }

    return memoStorage[currentElementIndex][remainingTarget] = candidateResult;
};

(async () => {
    console.log(await determineMinItems(0, goalValue));
})();