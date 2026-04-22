const process = require('process');

let incomingData = '';
process.stdin.on('data', fragment => {
    incomingData += fragment;
});

process.stdin.on('end', () => {
    const dataLines = incomingData.trim().split('\n');
    const elementCount = parseInt(dataLines[0], 10);
    const initialValues = dataLines[1].split(' ').map(Number);

    const totalOperationCost = determineMinimumSwapCost(initialValues, elementCount);
    console.log(totalOperationCost);
});

function determineMinimumSwapCost(sourceArray, arrayLength) {
    // Create a sorted version of the input array to find target positions
    const orderedValues = [...sourceArray].sort((valA, valB) => valA - valB);

    // Identify the smallest value across the entire array
    const absoluteMinimum = orderedValues[0];

    // Build a mapping from a value to its correct index in the sorted array
    const valuePositionMap = new Map();
    for (let i = 0; i < arrayLength; ++i) {
        valuePositionMap.set(orderedValues[i], i);
    }

    // Keep track of which indices in the sourceArray have been processed
    const processedIndices = new Array(arrayLength).fill(false);

    let cumulativeCost = 0;

    // Iterate through each position in the sourceArray
    for (let currentPosition = 0; currentPosition < arrayLength; ++currentPosition) {
        // If this position has already been part of a completed cycle, skip it
        if (processedIndices[currentPosition]) {
            continue;
        }

        // Initialize variables for the current cycle being traced
        let cycleSmallestValue = Infinity;
        let cycleSummation = 0;
        let cycleSize = 0;

        let traversalIndex = currentPosition;
        // Follow the cycle until we return to an already processed index
        while (!processedIndices[traversalIndex]) {
            processedIndices[traversalIndex] = true; // Mark current index as visited
            const valueAtCurrentSpot = sourceArray[traversalIndex];

            cycleSmallestValue = Math.min(cycleSmallestValue, valueAtCurrentSpot);
            cycleSummation += valueAtCurrentSpot;
            cycleSize++;

            // Determine the next index in the cycle: where the current value *should* be
            const targetSortedLocation = valuePositionMap.get(valueAtCurrentSpot);
            traversalIndex = targetSortedLocation;
        }

        // Calculate the cost for this specific cycle using two strategies
        // Strategy 1: Swapping within the cycle using its own minimum element
        const optionA_cost = cycleSummation + (cycleSize - 2) * cycleSmallestValue;

        // Strategy 2: Swapping using the overall minimum element as an intermediary
        const optionB_cost = cycleSummation + cycleSmallestValue + (cycleSize + 1) * absoluteMinimum;

        // Add the minimum of the two strategies to the total cumulative cost
        cumulativeCost += Math.min(optionA_cost, optionB_cost);
    }

    return cumulativeCost;
}