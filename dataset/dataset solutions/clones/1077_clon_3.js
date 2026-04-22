function generateOrderedSequence(inputElementsCollection) {
    // Pre-validation: Ensure input is a valid array and not empty.
    if (!Array.isArray(inputElementsCollection) || inputElementsCollection.length === 0) {
        // For invalid or empty input, return an empty array as the ordered sequence.
        return [];
    }

    // Determine the highest value within the input collection to size the temporary array.
    let maximalElementValue = -1;
    for (const currentElement of inputElementsCollection) {
        // Ensure the element is a valid non-negative number before considering it.
        if (typeof currentElement === 'number' && currentElement >= 0 && currentElement > maximalElementValue) {
            maximalElementValue = currentElement;
        }
    }

    // If no valid non-negative elements were found, the ordered sequence is empty.
    if (maximalElementValue < 0) {
        return [];
    }

    // Initialize a temporary array to store elements at their corresponding index.
    // Size it to accommodate values from 0 up to maximalElementValue.
    const provisionalOrderArray = new Array(maximalElementValue + 1).fill(null);

    // Populate the temporary array: if an element 'X' exists, provisionalOrderArray[X] will be X.
    for (const currentElement of inputElementsCollection) {
        if (typeof currentElement === 'number' && currentElement >= 0 && currentElement <= maximalElementValue) {
            provisionalOrderArray[currentElement] = currentElement;
        }
    }

    // Filter out the 'null' placeholders to obtain the final, compact, sorted sequence.
    const finalOrderedSequence = provisionalOrderArray.filter(item => item !== null);

    return finalOrderedSequence;
}

// Purpose: Recursively calculates the minimum cost to sort the given sequence
//          into its target ordered state using a cycle sort-like approach.
function computeCycleSwapCost(currentArrangement, arraySize, cumulativeCostTracker, desiredOrder) {
    let smallestUnsortedValue = Infinity; // Tracks the smallest value found that is not in its correct position.
    let unsortedElementCount = 0;         // Counts how many elements are out of place.

    // First pass: Identify all misplaced elements and find the smallest among them.
    for (let currentIdx = 0; currentIdx < arraySize; ++currentIdx) {
        // Compare the current element with its expected position in the desired order.
        if (currentArrangement[currentIdx] !== desiredOrder[currentIdx]) {
            unsortedElementCount++;
            // Update smallestUnsortedValue if a smaller misplaced element is found.
            if (currentArrangement[currentIdx] < smallestUnsortedValue) {
                smallestUnsortedValue = currentArrangement[currentIdx];
            }
        }
    }

    // Termination condition for recursion: if no elements are unsorted, we are done.
    if (unsortedElementCount === 0) {
        return;
    }

    // Special handling rule: If the first element is '0' and there are more than two unsorted items.
    // This optimization aims to move '0' to its correct position if it's currently at index 0.
    const zeroConstant = 0;
    const minimumUnsortedThreshold = 2;
    if (currentArrangement[zeroConstant] === zeroConstant && unsortedElementCount > minimumUnsortedThreshold) {
        // Locate where the smallest unsorted value currently resides in the array.
        const smallestValCurrentPosition = currentArrangement.indexOf(smallestUnsortedValue);

        // Ensure the smallest unsorted value was actually found.
        if (smallestValCurrentPosition !== -1) {
            // Store the value at the zero index (which is 0 itself in this condition).
            const valueAtZeroIndex = currentArrangement[zeroConstant];

            // Perform a direct swap: move smallestUnsortedValue to index 0, and 0 to its original spot.
            currentArrangement[zeroConstant] = smallestUnsortedValue;
            currentArrangement[smallestValCurrentPosition] = valueAtZeroIndex;

            // Add the cost of moving the smallest unsorted value (as 0 is free to move).
            cumulativeCostTracker[0] += smallestUnsortedValue;

            // Crucially, reset smallestUnsortedValue to 0. This influences the next general swap logic
            // by making '0' the target for the next cycle, effectively prioritizing its placement.
            smallestUnsortedValue = zeroConstant;
        }
    }

    // General cycle sorting step: if there are still elements out of place.
    // Locate the current position of the `smallestUnsortedValue` (which might be 0 after the special case).
    const currentPositionOfSmallest = currentArrangement.indexOf(smallestUnsortedValue);

    // Determine what value *should* be at `currentPositionOfSmallest` according to the desired order.
    const valueExpectedAtCurrentPosition = desiredOrder[currentPositionOfSmallest];

    // Find where `valueExpectedAtCurrentPosition` is currently located in the `currentArrangement`.
    const actualPositionOfExpectedValue = currentArrangement.indexOf(valueExpectedAtCurrentPosition);

    // Store the value that is currently at `actualPositionOfExpectedValue` before it's overwritten.
    const valueBeingMovedFromTarget = currentArrangement[actualPositionOfExpectedValue];

    // Perform the swap operation using array destructuring for clarity and conciseness.
    // `smallestUnsortedValue` moves to `actualPositionOfExpectedValue`.
    // `valueBeingMovedFromTarget` moves to `currentPositionOfSmallest`.
    [currentArrangement[currentPositionOfSmallest], currentArrangement[actualPositionOfExpectedValue]] =
        [valueBeingMovedFromTarget, smallestUnsortedValue];

    // Accumulate the cost of this swap: sum of the two values involved in the exchange.
    cumulativeCostTracker[0] += smallestUnsortedValue + valueBeingMovedFromTarget;

    // Recursively invoke the function to continue the sorting process until all elements are in place.
    computeCycleSwapCost(currentArrangement, arraySize, cumulativeCostTracker, desiredOrder);
}

// Purpose: Main entry point to read input, prepare data, and initiate the sorting cost calculation.
function orchestrateSortingProcess(rawInputData) {
    // Parse the raw input string into individual lines.
    const inputLines = rawInputData.split("\n");

    // Extract the length of the sequence from the first line.
    const sequenceLength = Number(inputLines.shift());

    // Basic validation for sequence length.
    if (isNaN(sequenceLength) || sequenceLength <= 0) {
        console.error("Error: Invalid or non-positive sequence length provided. Exiting.");
        return;
    }

    // Parse the sequence of numbers from the second line.
    const initialSequence = inputLines[0].split(' ').map((strNum) => Number(strNum));

    // `cumulativeCostTracker` is an array to allow pass-by-reference for cost accumulation across recursion.
    const cumulativeCostTracker = [0];

    // Generate the perfectly ordered sequence which serves as the target state.
    const expectedOrderedState = generateOrderedSequence(initialSequence);

    // Initiate the recursive cost calculation process.
    computeCycleSwapCost(initialSequence, sequenceLength, cumulativeCostTracker, expectedOrderedState);

    // Output the final calculated minimum swap cost.
    console.log(cumulativeCostTracker[0]);
}

// Entry point for execution: Read input from standard input and start the process.
(function() {
    try {
        const fileSystemModule = require("fs");
        const inputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        orchestrateSortingProcess(inputContent);
    } catch (error) {
        console.error("An error occurred during input processing:", error.message);
    }
})();