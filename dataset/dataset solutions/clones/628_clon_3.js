// This module processes a sequence of numerical data to find a maximum segment sum.
// It analyzes partitions of a circular array to identify optimal segment arrangements.

/**
 * Initiates the analysis of a given numerical sequence.
 * This function reads input, processes it into a cyclic prefix sum array,
 * and then searches for a specific maximum sum partition.
 * @param {string[]} inputData - An array of string-encoded numbers.
 *                               The first element is the count of primary values,
 *                               followed by the actual numerical values.
 */
function processSequenceData(inputData) {
    // Perform initial validation of the input array to ensure it's not empty or null.
    if (!inputData || inputData.length === 0) {
        console.error("Error: Input data array is empty or undefined. Cannot proceed with analysis.");
        return; // Exit if input is invalid.
    }

    // Extract and parse the primary count of segments from the input.
    // Using `parseInt` with radix 10 for explicit integer conversion.
    const segmentBaseCount = parseInt(inputData.shift(), 10);
    if (isNaN(segmentBaseCount) || segmentBaseCount <= 0) {
        console.error("Error: Invalid or non-positive segment count provided. Analysis aborted.");
        return; // Exit if the count is invalid.
    }

    // Populate an array with the numerical values from the input.
    // This loop ensures all primary values are correctly parsed and stored.
    const numericSequence = [];
    let dataFetchIndex = 0;
    while (dataFetchIndex < segmentBaseCount) {
        const parsedValue = parseInt(inputData.shift(), 10);
        if (isNaN(parsedValue)) {
            console.error(`Error: Non-numeric value encountered at input index ${dataFetchIndex}.`);
            return; // Exit if a value is not a number.
        }
        numericSequence.push(parsedValue);
        dataFetchIndex++;
    }

    // Construct an array of accumulated (prefix) sums.
    // This array is extended to twice the original sequence length
    // to facilitate easy calculation of sums that wrap around the original array.
    const accumulatedSums = [0]; // The first element is always zero to simplify sum calculations.
    let currentRunningTotal = 0;
    const totalExtendedElements = segmentBaseCount * 2; // The effective length for cyclic sums.
    let sumAggregationIndex = 0;

    // Iterate to build the accumulated sums array.
    while (sumAggregationIndex < totalExtendedElements) {
        // The modulo operator (%) handles the cyclic access of `numericSequence`.
        currentRunningTotal += numericSequence[sumAggregationIndex % segmentBaseCount];
        accumulatedSums.push(currentRunningTotal);
        sumAggregationIndex++;
    }

    // Define the three primary pointers that delineate segments within the `accumulatedSums` array.
    // These pointers (`segmentStart`, `segmentMiddle`, `segmentEnd`) will be adjusted during the search.
    let segmentStart = 0;
    let segmentMiddle = 0;
    let segmentEnd = 0;

    /**
     * Calculates the sum of a specific segment based on the current pointer positions.
     * This function abstracts the sum calculation logic, making the main loop cleaner.
     * @param {number} partitionIndex - An identifier (0, 1, or 2) specifying which segment to sum.
     * @returns {number} The calculated sum of the specified segment.
     */
    const retrieveSegmentSum = (partitionIndex) => {
        let computedSum = 0;
        switch (partitionIndex) {
            case 0: // Sum of the first segment: from segmentStart up to (but not including) segmentMiddle.
                computedSum = accumulatedSums[segmentMiddle] - accumulatedSums[segmentStart];
                break;
            case 1: // Sum of the second segment: from segmentMiddle up to (but not including) segmentEnd.
                computedSum = accumulatedSums[segmentEnd] - accumulatedSums[segmentMiddle];
                break;
            case 2: // Sum of the third (wrapping) segment: from segmentEnd up to (but not including) segmentStart + segmentBaseCount.
                computedSum = accumulatedSums[segmentStart + segmentBaseCount] - accumulatedSums[segmentEnd];
                break;
            default:
                // Log a warning if an unexpected partition index is requested.
                console.warn(`Warning: Attempted to retrieve sum for unknown partition identifier: ${partitionIndex}. Returning 0.`);
                computedSum = 0;
        }
        return computedSum;
    };

    // Initialize the variable to track the maximum segment sum found during the process.
    let maximumAchievedSum = 0;

    // Main algorithm loop: Iterates through all possible starting points for the first segment.
    while (segmentStart < segmentBaseCount) {
        let continueInnerSearch = true; // Control flag for the inner loop.

        // Inner loop: Adjust `segmentMiddle` and `segmentEnd` pointers to find optimal partitions
        // for the current `segmentStart`. This loop continues until a specific condition is met.
        while (continueInnerSearch) {
            segmentMiddle++; // Increment `segmentMiddle` to expand the first segment.

            const priorSegmentEnd = segmentEnd; // Save `segmentEnd` for potential rollback.

            let keepAdjustingEndPointer = true; // Control flag for the innermost loop.
            // Innermost loop: Adjust `segmentEnd` while the conditions for balancing segments are met.
            while (keepAdjustingEndPointer) {
                // Fetch current segment sums to evaluate the conditions.
                const currentFirstSegmentVal = retrieveSegmentSum(0);
                const currentSecondSegmentVal = retrieveSegmentSum(1);
                const currentThirdSegmentVal = retrieveSegmentSum(2);

                // Condition check: If the first segment is larger than the second,
                // AND the third segment is at least as large as the first,
                // then we can potentially extend the second segment by incrementing `segmentEnd`.
                if (currentFirstSegmentVal > currentSecondSegmentVal && currentThirdSegmentVal >= currentFirstSegmentVal) {
                    segmentEnd++;
                } else {
                    keepAdjustingEndPointer = false; // Stop adjusting `segmentEnd`.
                }
            }

            // After the innermost loop, re-evaluate the third segment.
            // If the third segment's sum has become smaller than the first segment's sum,
            // it means the current `segmentMiddle` choice was not optimal.
            if (retrieveSegmentSum(2) < retrieveSegmentSum(0)) {
                segmentMiddle--;                 // Rollback `segmentMiddle`.
                segmentEnd = priorSegmentEnd;    // Restore `segmentEnd` to its state before the innermost loop.
                continueInnerSearch = false;     // Exit the inner loop to try a new `segmentStart`.
            }
        }

        // Once the inner loops complete for a given `segmentStart`,
        // update `maximumAchievedSum` with the larger of its current value
        // and the sum of the first segment found for this `segmentStart`.
        maximumAchievedSum = Math.max(retrieveSegmentSum(0), maximumAchievedSum);

        segmentStart++; // Move to the next possible starting point for the first segment.
    }

    // Output the final maximum segment sum identified.
    console.log(maximumAchievedSum);
}