function processInputData(rawInputString) {
    // Stage 1: Normalize and filter raw input lines.
    const parsedInputLines = rawInputString
                                .split('\n')
                                .map(line => line.trim()) // Remove leading/trailing whitespace from each line
                                .filter(line => line.length > 0); // Discard completely empty lines

    // Stage 2: Initial validation of input presence.
    if (parsedInputLines.length === 0) {
        console.error("Input processing error: No valid data lines were provided.");
        return; // Terminate execution if no meaningful input.
    }

    // Stage 3: Parse the first line to extract global problem parameters.
    const headerSegments = parsedInputLines.shift().split(' ');
    const totalItemCount = parseInt(headerSegments[0], 10); // Number of items, potentially unused in DP calculation
    const knapsackCapacityLimit = parseInt(headerSegments[1], 10); // The maximum weight the knapsack can hold

    // Stage 4: Validate extracted parameters.
    if (isNaN(totalItemCount) || isNaN(knapsackCapacityLimit) || knapsackCapacityLimit < 0) {
        console.error("Input parsing error: Knapsack dimensions or item count are invalid.");
        return;
    }

    // Stage 5: Parse individual item details from remaining lines.
    const merchandiseCollection = parsedInputLines.map(itemDescriptor => {
        const itemProperties = itemDescriptor.split(' ').map(s => parseInt(s, 10));
        // Ensure each item has exactly two properties (value and weight) and they are non-negative numbers.
        if (itemProperties.length !== 2 || isNaN(itemProperties[0]) || isNaN(itemProperties[1]) || itemProperties[0] < 0 || itemProperties[1] < 0) {
            console.warn(`Input warning: Skipping malformed or invalid item entry: "${itemDescriptor}"`);
            return null; // Flag invalid entries for later filtering.
        }
        return itemProperties; // Return [value, weight] tuple.
    }).filter(item => item !== null); // Remove any items that failed validation.

    // Stage 6: Handle edge cases where no items or zero capacity exists.
    if (merchandiseCollection.length === 0 || knapsackCapacityLimit === 0) {
        console.log("0"); // If no items or no capacity, max value is 0.
        return;
    }

    // Stage 7: Invoke the core algorithm to determine the optimal knapsack state.
    const finalKnapsackState = computeOptimalKnapsackValue(merchandiseCollection, knapsackCapacityLimit);

    // Stage 8: Present the primary result (maximum achievable value).
    console.log(finalKnapsackState[0]);
}

/**
 * Compares two knapsack state tuples [value, actualWeight] and returns the superior one.
 * Superiority is determined first by higher value, then by lower actual weight if values are equal.
 * @param {Array<number>} currentState - The current best state [value, actualWeight].
 * @param {Array<number>} candidateState - A newly computed candidate state [value, actualWeight].
 * @returns {Array<number>} A new array representing the superior state.
 */
function selectSuperiorState(currentState, candidateState) {
    // If the candidate offers a strictly higher value, it's better.
    if (candidateState[0] > currentState[0]) {
        return candidateState.slice(); // Return a copy to prevent mutation issues.
    } 
    // If values are equal, but the candidate achieves it with less actual weight, it's better.
    else if (candidateState[0] === currentState[0] && candidateState[1] < currentState[1]) {
        return candidateState.slice();
    }
    // Otherwise, the current state is superior or equivalent, so keep it.
    return currentState.slice();
}

/**
 * Solves the 0/1 Knapsack problem using dynamic programming.
 * Tracks both the maximum value and the actual weight used for each capacity up to the limit.
 * @param {Array<Array<number>>} merchandiseCollection - An array of items, where each item is [value, weight].
 * @param {number} capacityConstraint - The maximum weight the knapsack can hold.
 * @returns {Array<number>} The optimal state [maxValue, actualWeight] for the given capacity constraint.
 */
function computeOptimalKnapsackValue(merchandiseCollection, capacityConstraint) {
    // Initialize the DP table (valueWeightMatrix).
    // `valueWeightMatrix[c]` stores `[maxValue, actualWeight]` for a knapsack with capacity `c`.
    // Using `Array.from` ensures each inner `[0, 0]` array is a unique instance, preventing shared references.
    let valueWeightMatrix = Array.from({ length: capacityConstraint + 1 }, () => [0, 0]);

    // This array will hold a snapshot of the `valueWeightMatrix` from the previous item's iteration.
    // It's essential for 0/1 knapsack to ensure each item is considered only once per capacity.
    let priorIterationData;

    // Iterate through each item available for selection.
    for (let currentItemIdx = 0; currentItemIdx < merchandiseCollection.length; currentItemIdx++) {
        // Before processing the current item, copy the DP table state from the previous iteration.
        priorIterationData = valueWeightMatrix.map(entry => entry.slice());

        const currentItem = merchandiseCollection[currentItemIdx];
        const itemValue = currentItem[0];
        const itemWeight = currentItem[1];

        // Iterate through all possible knapsack capacities, from 0 up to the maximum allowed constraint.
        for (let tempCapacity = 0; tempCapacity <= capacityConstraint; tempCapacity++) {
            // Option A: Do not include the current item.
            // The optimal state for `tempCapacity` is simply what it was before considering this item.
            let bestStateForCurrentCapacity = priorIterationData[tempCapacity].slice();

            // Option B: Consider including the current item, if it physically fits within `tempCapacity`.
            if (tempCapacity >= itemWeight) {
                // Calculate the remaining capacity if `currentItem` is placed in the knapsack.
                const remainingCapacityAfterItem = tempCapacity - itemWeight;
                // Retrieve the optimal state for this `remainingCapacity` from the `priorIterationData`.
                const stateFromRemainingCapacity = priorIterationData[remainingCapacityAfterItem];

                // Only proceed if the `stateFromRemainingCapacity` is valid (i.e., it holds some value,
                // or if the current item itself has a positive value to start a new combination).
                if (stateFromRemainingCapacity[0] > 0 || itemValue > 0) {
                    // Calculate the new total value and actual weight if `currentItem` is added.
                    const candidateCombinedValue = stateFromRemainingCapacity[0] + itemValue;
                    const candidateCombinedWeight = stateFromRemainingCapacity[1] + itemWeight;

                    // If this combined state respects the current `tempCapacity` (actual weight doesn't exceed it)
                    // then compare it against the `bestStateForCurrentCapacity` (Option A).
                    if (candidateCombinedWeight <= tempCapacity) {
                        bestStateForCurrentCapacity = selectSuperiorState(
                            bestStateForCurrentCapacity,
                            [candidateCombinedValue, candidateCombinedWeight]
                        );
                    }
                }
            }
            // Update the main DP table for `tempCapacity` with the best choice found (either Option A or B).
            valueWeightMatrix[tempCapacity] = bestStateForCurrentCapacity;
        }
    }

    // After all items have been processed, the entry corresponding to the full `capacityConstraint`
    // holds the maximum value and the actual weight used to achieve it.
    return valueWeightMatrix[capacityConstraint];
}

// Define the path to the standard input file.
const SYSTEM_STANDARD_INPUT_PATH = '/dev/stdin';

// Execute the input processing and knapsack solving workflow.
// Includes error handling for file system operations.
try {
    const rawFileContents = require('fs').readFileSync(SYSTEM_STANDARD_INPUT_PATH, 'utf8');
    processInputData(rawFileContents);
} catch (fileError) {
    console.error(`Execution halted: Unable to read input from ${SYSTEM_STANDARD_INPUT_PATH}. Error details: ${fileError.message}`);
    // Exit with a non-zero code to indicate an error to the operating system.
    process.exit(1);
}