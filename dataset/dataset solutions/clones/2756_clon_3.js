/**
 * Executes a specialized array reduction algorithm.
 * It iteratively identifies a "pivot" element (minimum value with tie-breaking rules),
 * merges it into its immediate neighbors, and reduces the array size by one
 * in each step until only two elements remain. The sum of these final two
 * elements is then printed.
 *
 * This process involves:
 * 1. Parsing input to get an array of numbers.
 * 2. Looping until the array has only two elements.
 * 3. In each loop:
 *    a. Finding a pivot index: the minimum element between index 1 and length-2.
 *       Tie-breaking favors elements whose neighbors sum to a smaller value.
 *    b. Adjusting the pivot index based on specific conditions involving
 *       the second and second-to-last elements of the array.
 *    c. Constructing a new array where the pivot's value is added to its
 *       neighbors, and the pivot itself is removed.
 * 4. Summing the final two elements.
 *
 * @param {string} rawInputContent - The raw string content read from standard input.
 *                                   Expected format:
 *                                   Line 1: An integer (N, initial count, currently unused by this function)
 *                                   Line 2: Space-separated integers representing the sequence.
 */
function processNumericalSequence(rawInputContent) {
    // Split the raw input into individual lines for processing.
    const parsedInputLines = rawInputContent.split("\n");

    // The first line often contains the total count (N), but it is not utilized in this algorithm's logic,
    // hence it is intentionally omitted from processing here.
    // const initialSequenceLength = parseInt(parsedInputLines[0], 10);

    // Convert the second line of space-separated numbers into an array of integers.
    // Filter out any potential non-numeric or empty string values that might result from splitting.
    let activeNumberSet = parsedInputLines[1].split(" ").map(numStr => parseInt(numStr, 10)).filter(num => !isNaN(num));

    // Guard clause: Ensure the initial sequence has enough elements to perform the reduction.
    // The algorithm requires at least 2 elements for the final sum, and more for the iterative loop.
    if (activeNumberSet.length < 2) {
        console.error("Error: Input sequence must contain at least two valid numbers for processing.");
        return; // Exit if input is insufficient.
    }

    let reductionOperationCounter = 0; // Tracks how many merge operations have occurred during the process.

    // Main loop: Continue reducing the set until only two elements remain.
    // The loop body executes as long as there are more than two elements to process.
    while (activeNumberSet.length > 2) {
        reductionOperationCounter++; // Increment the counter for each completed reduction step.

        // Initialize the pivot search to the second element (index 1).
        // This ensures that `designatedPivotIndex - 1` and `designatedPivotIndex + 1` are always valid
        // within the bounds of the array during the initial search phase.
        let designatedPivotIndex = 1;

        // First pass: Iterate through the inner elements (from index 2 up to `length - 2`)
        // to find the element that will be designated as the pivot for merging.
        // The pivot is chosen based on the minimum value, with a specific tie-breaking rule.
        for (let currentElementIdx = 2; currentElementIdx < activeNumberSet.length - 1; currentElementIdx++) {
            const currentElementValue = activeNumberSet[currentElementIdx];
            const currentDesignatedPivotValue = activeNumberSet[designatedPivotIndex];

            if (currentElementValue < currentDesignatedPivotValue) {
                // If a new, strictly smaller value is found, update the designated pivot.
                designatedPivotIndex = currentElementIdx;
            } else if (currentElementValue === currentDesignatedPivotValue) {
                // If the current element's value is equal to the current designated pivot's value,
                // apply a tie-breaking rule: choose the element whose neighbors sum to a smaller value.
                const currentElementNeighborSum = activeNumberSet[currentElementIdx - 1] + activeNumberSet[currentElementIdx + 1];
                const designatedPivotNeighborSum = activeNumberSet[designatedPivotIndex - 1] + activeNumberSet[designatedPivotIndex + 1];

                if (currentElementNeighborSum < designatedPivotNeighborSum) {
                    designatedPivotIndex = currentElementIdx; // Update pivot based on the tie-breaker.
                }
            }
        }

        // --- Second pass: Apply specific adjustment rules to the `designatedPivotIndex` ---
        // These rules can override the pivot selection from the first pass,
        // potentially forcing the pivot to be at index 1 or `length - 2` under certain conditions.
        const valueOfPivotBeforeAdjustments = activeNumberSet[designatedPivotIndex];
        const valueAtSecondPosition = activeNumberSet[1];
        const valueAtSecondToLastPosition = activeNumberSet[activeNumberSet.length - 2];

        // Condition A: If twice the pivot's value (before adjustments) is greater than the second element.
        if (valueOfPivotBeforeAdjustments * 2 > valueAtSecondPosition) {
            designatedPivotIndex = 1; // Force the pivot to be the element at index 1.

            // Sub-condition: If this newly designated pivot (which is `activeNumberSet[1]`)
            // is greater than the value at the second-to-last position,
            // then force the pivot to be the element at the second-to-last position.
            if (activeNumberSet[designatedPivotIndex] > valueAtSecondToLastPosition) {
                designatedPivotIndex = activeNumberSet.length - 2;
            }
        }
        // Condition B: If Condition A was false, but twice the original pivot's value
        // is greater than the value at the second-to-last position.
        else if (valueOfPivotBeforeAdjustments * 2 > valueAtSecondToLastPosition) {
            designatedPivotIndex = activeNumberSet.length - 2; // Force the pivot to be the element at the second-to-last position.
        }

        // --- Construct the new array for the next iteration by merging the chosen pivot ---
        const nextWorkingSet = [];
        const finalChosenPivotValue = activeNumberSet[designatedPivotIndex]; // The value of the pivot after all adjustments.

        for (let currentIdx = 0; currentIdx < activeNumberSet.length; currentIdx++) {
            // A flag to indicate if the current element has been processed and pushed into `nextWorkingSet`.
            let elementHasBeenHandled = false;

            if (currentIdx === designatedPivotIndex - 1) {
                // If the current index is the left neighbor of the pivot, merge the pivot's value into it.
                const mergedNeighborValue = activeNumberSet[currentIdx] + finalChosenPivotValue;
                nextWorkingSet.push(mergedNeighborValue);
                elementHasBeenHandled = true;
            } else if (currentIdx === designatedPivotIndex) {
                // The pivot element itself is "removed" from the set, as its value is distributed to neighbors.
                elementHasBeenHandled = true; // Mark as handled, but nothing is pushed.
            } else if (currentIdx === designatedPivotIndex + 1) {
                // If the current index is the right neighbor of the pivot, merge the pivot's value into it.
                const mergedNeighborValue = activeNumberSet[currentIdx] + finalChosenPivotValue;
                nextWorkingSet.push(mergedNeighborValue);
                elementHasBeenHandled = true;
            }

            // If the element was not a neighbor of the pivot and not the pivot itself,
            // it is added to the `nextWorkingSet` unchanged.
            if (!elementHasBeenHandled) {
                nextWorkingSet.push(activeNumberSet[currentIdx]);
            }
        }

        // Update the `activeNumberSet` with the newly constructed set for the next iteration.
        activeNumberSet = nextWorkingSet;
    }

    // After the `while` loop terminates, `activeNumberSet` will contain exactly two elements.
    // Calculate their sum as the final result of the reduction process.
    const finalSumResult = activeNumberSet[0] + activeNumberSet[1];

    // Output the final computed sum to the console.
    console.log(finalSumResult);
}