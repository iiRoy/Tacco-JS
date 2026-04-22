let dataElementCount; // Declaring a module-level variable to store the size of the dataset.

/**
 * Implements a stable counting sort algorithm.
 * This function sorts an array of non-negative integers within a specified range.
 *
 * @param {Array<number>} sourceInputArray - The array containing unsorted integer values.
 * @param {Array<number>} sortedOutputArray - The array where the sorted elements will be stored.
 * @param {number} maximumPermissibleValue - The upper bound for values in the sourceInputArray.
 * @param {number} actualElementCount - The number of elements currently in the sourceInputArray.
 */
function performCountingSort(sourceInputArray, sortedOutputArray, maximumPermissibleValue, actualElementCount) {
    // Initialize an array to hold the frequency count of each number.
    // Its size is `maximumPermissibleValue + 1` to accommodate all values from 0 up to `maximumPermissibleValue`.
    const valueFrequencies = Array.from({ length: maximumPermissibleValue + 1 }, () => 0);

    // First pass: Calculate the frequency of each number in the source array.
    for (let currentElementIndex = 0; currentElementIndex < actualElementCount; currentElementIndex++) {
        const val = sourceInputArray[currentElementIndex];
        // Defensive check: ensure values are within expected bounds.
        if (val < 0 || val > maximumPermissibleValue) {
            console.error(`Error: Value ${val} at index ${currentElementIndex} is outside the allowed range [0, ${maximumPermissibleValue}].`);
            return; // Abort sorting if invalid data is encountered.
        }
        valueFrequencies[val]++;
    }

    // Second pass: Convert frequency counts to cumulative counts.
    // `valueFrequencies[i]` will now store the number of elements less than or equal to `i`.
    for (let valueIterator = 1; valueIterator <= maximumPermissibleValue; valueIterator++) {
        valueFrequencies[valueIterator] += valueFrequencies[valueIterator - 1];
    }

    // Third pass: Place elements into the sorted output array.
    // Iterating from right to left ensures stability if duplicate elements exist.
    for (let currentElementIndex = actualElementCount - 1; currentElementIndex >= 0; currentElementIndex--) {
        const valueToPlace = sourceInputArray[currentElementIndex];
        // Decrement the cumulative count for the current value, then use it as the target index.
        const targetPosition = --valueFrequencies[valueToPlace];
        sortedOutputArray[targetPosition] = valueToPlace;
    }
}

/**
 * Processes the raw input string, calculates the minimum cost to sort the array
 * using swaps, and prints the total cost. This algorithm leverages cycle decomposition.
 *
 * @param {string} rawInputContent - The complete input string, typically from stdin.
 */
function processInputAndCalculateCost(rawInputContent) {
    // Split the input content into individual lines.
    const inputLines = rawInputContent.trim().split("\n");

    // Parse the total number of elements from the first line.
    dataElementCount = Number.parseInt(inputLines[0], 10);

    // Basic input validation for the element count.
    if (isNaN(dataElementCount) || dataElementCount <= 0) {
        console.error("Input error: The number of elements is invalid or non-positive.");
        return; // Terminate execution for invalid input.
    }

    // Define the maximum expected value in the array, crucial for counting sort.
    const MAXIMUM_EXPECTED_VALUE = 10000;

    // Initialize arrays to hold the original permutation and the sorted version.
    const currentPermutationValues = new Array(dataElementCount);
    const perfectSortedOrderValues = new Array(dataElementCount);

    // Parse the array elements from the second line of input.
    const numericalStrings = inputLines[1].trim().split(" ");
    for (let idx = 0; idx < dataElementCount; idx++) {
        const parsedValue = Number.parseInt(numericalStrings[idx], 10);
        if (isNaN(parsedValue)) {
            console.error(`Input error: Non-numeric value found at index ${idx}.`);
            return;
        }
        currentPermutationValues[idx] = parsedValue;
    }

    // Sort the `currentPermutationValues` into `perfectSortedOrderValues` using counting sort.
    performCountingSort(currentPermutationValues, perfectSortedOrderValues, MAXIMUM_EXPECTED_VALUE, dataElementCount);

    // `currentPositionToTargetIndexMap`: Maps an element's current index `i` to its correct sorted index `j`.
    const currentPositionToTargetIndexMap = new Array(dataElementCount);
    // `targetIndexToCurrentPositionMap`: Maps a target sorted index `j` back to the current index `i`
    // of the element that currently occupies (or should occupy) that target position.
    const targetIndexToCurrentPositionMap = new Array(dataElementCount);

    // To handle duplicate values correctly and establish a bijective mapping,
    // we first create a temporary map from value to a list of its sorted indices.
    const valueToAvailableSortedPositions = new Map();
    for (let k = 0; k < dataElementCount; ++k) {
        const valueInSorted = perfectSortedOrderValues[k];
        if (!valueToAvailableSortedPositions.has(valueInSorted)) {
            valueToAvailableSortedPositions.set(valueInSorted, []);
        }
        valueToAvailableSortedPositions.get(valueInSorted).push(k);
    }

    // Now, populate the `currentPositionToTargetIndexMap` and `targetIndexToCurrentPositionMap`.
    // For each element in the current permutation, assign it the next available target index from the sorted list.
    for (let k = 0; k < dataElementCount; ++k) {
        const valueFromCurrentPermutation = currentPermutationValues[k];
        const assignedTargetIndex = valueToAvailableSortedPositions.get(valueFromCurrentPermutation).shift(); // Get and remove the first available target index
        currentPositionToTargetIndexMap[k] = assignedTargetIndex;
        targetIndexToCurrentPositionMap[assignedTargetIndex] = k;
    }

    let elementsAlreadyInPlace = 0;
    let totalMinimumSwapCost = 0;

    // Phase 1: Process 1-cycles (elements already in place) and 2-cycles (elements that can be sorted with one swap).
    for (let i = 0; i < dataElementCount; i++) {
        // If the element at index `i` is already in its correct sorted position.
        if (currentPositionToTargetIndexMap[i] === i) {
            elementsAlreadyInPlace++;
            continue; // No swap needed, move to the next element.
        }

        // Check for a 2-cycle: `i` wants to go to `j`, and `j` wants to go to `i`.
        const destinationForCurrentElement = currentPositionToTargetIndexMap[i];
        if (currentPositionToTargetIndexMap[destinationForCurrentElement] === i) {
            // A 2-cycle is found. Perform a single swap.
            totalMinimumSwapCost += currentPermutationValues[i] + currentPermutationValues[destinationForCurrentElement];

            // Swap the actual values in the array.
            [currentPermutationValues[i], currentPermutationValues[destinationForCurrentElement]] =
            [currentPermutationValues[destinationForCurrentElement], currentPermutationValues[i]];

            // Update the mapping arrays to reflect that these two elements are now correctly placed.
            currentPositionToTargetIndexMap[i] = i;
            currentPositionToTargetIndexMap[destinationForCurrentElement] = destinationForCurrentElement;
            targetIndexToCurrentPositionMap[i] = i;
            targetIndexToCurrentPositionMap[destinationForCurrentElement] = destinationForCurrentElement;

            elementsAlreadyInPlace += 2; // Two elements are now in their final positions.
        }
    }

    // Phase 2: Process all remaining cycles (longer than 2 elements).
    // Continue until all elements are in their correct sorted positions.
    while (elementsAlreadyInPlace < dataElementCount) {
        let smallestValueInCycle = Number.MAX_SAFE_INTEGER;
        let cycleStartElementIndex = -1;

        // Find the smallest element that is part of an unsorted cycle.
        // This element will serve as the starting point for traversing and sorting the cycle.
        for (let k = 0; k < dataElementCount; k++) {
            if (currentPositionToTargetIndexMap[k] !== k && currentPermutationValues[k] < smallestValueInCycle) {
                smallestValueInCycle = currentPermutationValues[k];
                cycleStartElementIndex = k;
            }
        }

        // If no unsorted elements are found, but `elementsAlreadyInPlace < dataElementCount` is false,
        // this loop condition would handle it. A `break` here acts as a safeguard.
        if (cycleStartElementIndex === -1) {
            break;
        }

        // Traverse and sort the identified cycle starting from `cycleStartElementIndex`.
        // This involves repeatedly swapping elements until the cycle is resolved.
        let currentCycleTraversalIndex = cycleStartElementIndex;
        while (currentPositionToTargetIndexMap[currentCycleTraversalIndex] !== currentCycleTraversalIndex) {
            // Identify the target index for the element at `currentCycleTraversalIndex`.
            const targetIndexForCurrentValue = currentPositionToTargetIndexMap[currentCycleTraversalIndex];
            // Identify the index of the element that *should* be at `currentCycleTraversalIndex`.
            const originalIndexForTargetValue = targetIndexToCurrentPositionMap[currentCycleTraversalIndex];

            // Add the cost of swapping these two elements.
            totalMinimumSwapCost += currentPermutationValues[currentCycleTraversalIndex] + currentPermutationValues[originalIndexForTargetValue];

            // Perform the actual swap of values in the `currentPermutationValues` array.
            [currentPermutationValues[currentCycleTraversalIndex], currentPermutationValues[originalIndexForTargetValue]] =
            [currentPermutationValues[originalIndexForTargetValue], currentPermutationValues[currentCycleTraversalIndex]];

            // Update the mapping arrays (`currentPositionToTargetIndexMap` and `targetIndexToCurrentPositionMap`)
            // to reflect the new positions of the swapped values.
            const previousTargetOfCurrent = currentPositionToTargetIndexMap[currentCycleTraversalIndex];
            const previousTargetOfOther = currentPositionToTargetIndexMap[originalIndexForTargetValue];

            currentPositionToTargetIndexMap[currentCycleTraversalIndex] = previousTargetOfOther;
            currentPositionToTargetIndexMap[originalIndexForTargetValue] = previousTargetOfCurrent;

            targetIndexToCurrentPositionMap[previousTargetOfCurrent] = originalIndexForTargetValue;
            targetIndexToCurrentPositionMap[previousTargetOfOther] = currentCycleTraversalIndex;

            // Move the `currentCycleTraversalIndex` to the position of the element that was just swapped into it.
            currentCycleTraversalIndex = originalIndexForTargetValue;

            // Increment the count of elements that are now in their correct positions.
            elementsAlreadyInPlace++;
        }
    }

    // Output the final calculated minimum total cost.
    console.log(totalMinimumSwapCost);
}

// Entry point: Read input from standard input and initiate the processing.
processInputAndCalculateCost(require("fs").readFileSync("/dev/stdin", "utf8"));