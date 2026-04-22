const fileHandler = require('node:fs');

function determineOverflowAccumulation(
    currentPositionIndex,
    itemVolumeArray,
    accumulatedOverflowTotal,
    maximumAllowedCapacity
) {
    if (currentPositionIndex >= itemVolumeArray.length) {
        return accumulatedOverflowTotal;
    }

    let currentItemQuantity = itemVolumeArray[currentPositionIndex];
    let nextIterationState = [...itemVolumeArray]; // Create a new array for the next recursive call

    let currentStepExcess = 0;

    // Condition 1: If an individual item's quantity exceeds the maximum allowed capacity
    if (currentItemQuantity > maximumAllowedCapacity) {
        currentStepExcess += currentItemQuantity - maximumAllowedCapacity;
        nextIterationState[currentPositionIndex] = maximumAllowedCapacity; // Cap the current item for subsequent checks within this step
        currentItemQuantity = maximumAllowedCapacity; // Use the capped value for the next condition
    }

    // Condition 2: If the current item and the subsequent item combined exceed the maximum allowed capacity
    if (currentPositionIndex < itemVolumeArray.length - 1) {
        let subsequentItemQuantity = nextIterationState[currentPositionIndex + 1]; // Use the quantity from the potentially modified state
        if (currentItemQuantity + subsequentItemQuantity > maximumAllowedCapacity) {
            let combinedExceedance = currentItemQuantity + subsequentItemQuantity - maximumAllowedCapacity;
            currentStepExcess += combinedExceedance;
            nextIterationState[currentPositionIndex + 1] -= combinedExceedance; // Reduce the subsequent item's quantity in the new state
        }
    }

    return determineOverflowAccumulation(
        currentPositionIndex + 1,
        nextIterationState,
        accumulatedOverflowTotal + currentStepExcess,
        maximumAllowedCapacity
    );
}

const inputDataBuffer = fileHandler.readFileSync('/dev/stdin', 'UTF-8');
const dataLinesParsed = inputDataBuffer.split('\n');

const configurationData = dataLinesParsed[0].split(' ').map(Number);
const numberOfItems = configurationData[0];
const allowedContainerCapacity = configurationData[1];

const initialItemQuantities = dataLinesParsed[1].split(' ').map(Number);

const finalAccumulatedLoss = determineOverflowAccumulation(0, initialItemQuantities, 0, allowedContainerCapacity);

process.stdout.write(String(finalAccumulatedLoss) + '\n');