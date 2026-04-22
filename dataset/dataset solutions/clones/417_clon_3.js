const INPUT_FILE_SOURCE = '/dev/stdin';
const MAX_POSSIBLE_SOLUTION_VALUE = 1500000; // Represents a common upper bound in competitive programming for such problems.

/**
 * Utility function to read all lines from the standard input file synchronously.
 * This abstracts the file system interaction and prepares data for processing.
 *
 * @returns {string[]} An array of strings, where each string is a line from the input.
 */
function acquireInputDataLines() {
    try {
        const fileContentBuffer = require('fs').readFileSync(INPUT_FILE_SOURCE, 'utf8');
        return fileContentBuffer.trim().split('\n');
    } catch (error) {
        console.error("Failed to read input from source:", error.message);
        return []; // Return an empty array to indicate no data or an error.
    }
}

/**
 * Evaluates if a given numerical sequence can be divided into a specified
 * maximum number of contiguous segments, such that no segment's sum exceeds
 * a predefined maximum allowed sum. This function employs a greedy strategy.
 *
 * @param {number} maximumSegmentSumAllowed - The upper limit for the sum of elements in any single segment.
 * @param {number[]} numericDataSequence - The array of numbers to be partitioned.
 * @param {number} maximumAllowedSegmentCount - The highest number of segments permitted.
 * @returns {boolean} True if a valid partitioning is achievable under the constraints, false otherwise.
 */
function verifyPartitioningFeasibility(maximumSegmentSumAllowed, numericDataSequence, maximumAllowedSegmentCount) {
    // --- Initial validation and edge case handling ---
    if (!Array.isArray(numericDataSequence) || numericDataSequence.length === 0) {
        // An empty sequence requires zero segments, which is always feasible.
        return true;
    }

    // If the maximum allowed sum is non-positive, it's impossible to sum positive numbers.
    // Assuming positive numbers in `numericDataSequence` based on problem context.
    if (maximumSegmentSumAllowed <= 0) {
        for (const dataValue of numericDataSequence) {
            if (dataValue > 0) return false; // Cannot fit a positive value into a non-positive sum.
        }
        return true; // All values are zero or negative, and 0 sum is allowed.
    }

    // If no segments are allowed but the sequence contains positive values, it's impossible.
    if (maximumAllowedSegmentCount <= 0) {
        for (const dataValue of numericDataSequence) {
            if (dataValue > 0) return false;
        }
        return true; // Only zeros, and 0 segments allowed.
    }

    // --- Core partitioning logic ---
    let currentSegmentAccumulator = 0;
    let segmentsFormedCounter = 1; // Start with one segment for a non-empty sequence.

    for (const elementValue of numericDataSequence) {
        // Critical check: If any single element is larger than the allowed maximum sum,
        // it's inherently impossible to partition.
        if (elementValue > maximumSegmentSumAllowed) {
            return false; // This element alone violates the sum constraint.
        }

        // Determine if the current element can be added to the ongoing segment.
        if (currentSegmentAccumulator + elementValue > maximumSegmentSumAllowed) {
            // If adding the element exceeds the limit, a new segment must begin.
            segmentsFormedCounter++;
            currentSegmentAccumulator = elementValue; // The new segment starts with this element.
        } else {
            // Otherwise, the element fits, so add it to the current segment's sum.
            currentSegmentAccumulator += elementValue;
        }

        // Immediately check if the number of segments formed has exceeded the maximum allowed.
        if (segmentsFormedCounter > maximumAllowedSegmentCount) {
            return false; // Too many segments required, so this `maximumSegmentSumAllowed` is not feasible.
        }
    }

    // If the loop completes without returning false, it means a valid partitioning
    // was successfully achieved within the given constraints.
    return true;
}

// --- Main Program Execution Block ---
(function executeSolutionLogic() {
    let allInputLines = acquireInputDataLines();
    if (allInputLines.length === 0) {
        console.error("No input data available to process.");
        return; // Exit if no input was read.
    }

    // Process data sets one by one until a termination signal is encountered.
    while (true) {
        const currentDataSetHeader = allInputLines.shift();

        // Check for termination condition or end of input.
        if (currentDataSetHeader === undefined || currentDataSetHeader === "0 0") {
            break;
        }

        // Parse the header line to extract the segment limit (m) and total numbers (n).
        const parsedHeaderValues = currentDataSetHeader.split(' ').map(Number);
        const maxSegmentsAllowed = parsedHeaderValues[0];
        const countOfNumbersInSequence = parsedHeaderValues[1];

        // Robustness check for parsed header values.
        if (isNaN(maxSegmentsAllowed) || isNaN(countOfNumbersInSequence) || maxSegmentsAllowed < 0 || countOfNumbersInSequence < 0) {
            console.error("Invalid or malformed header line encountered:", currentDataSetHeader);
            // In a real application, one might skip this data set or throw an error.
            // For cloning, we'll mimic original's implicit assumption of valid input or break.
            break;
        }

        // Read the actual numerical sequence for the current data set.
        const currentNumericSequence = [];
        for (let i = 0; i < countOfNumbersInSequence; i++) {
            if (allInputLines.length === 0) {
                console.error("Input data exhausted prematurely. Expected more numbers.");
                // Handle incomplete input by breaking or signaling an error.
                break;
            }
            const numString = allInputLines.shift();
            const numberValue = Number(numString);
            if (isNaN(numberValue)) {
                console.error("Invalid number value found in sequence:", numString);
                break;
            }
            currentNumericSequence.push(numberValue);
        }
        // If the sequence is incomplete due to malformed input, skip this data set.
        if (currentNumericSequence.length !== countOfNumbersInSequence) {
            continue;
        }

        // --- Binary Search Algorithm to find the minimum `maximumSegmentSumAllowed` ---
        let searchRangeLowerBound = 0;
        // The smallest possible maximum segment sum must be at least the largest individual element.
        if (currentNumericSequence.length > 0) {
            searchRangeLowerBound = Math.max(...currentNumericSequence);
        }

        let searchRangeUpperBound = MAX_POSSIBLE_SOLUTION_VALUE;
        // Optionally, a tighter upper bound could be the sum of all elements.
        const sumOfAllElements = currentNumericSequence.reduce((acc, val) => acc + val, 0);
        if (sumOfAllElements < searchRangeUpperBound) {
            searchRangeUpperBound = sumOfAllElements;
        }
        // Ensure the lower bound does not exceed the upper bound initially.
        if (searchRangeLowerBound > searchRangeUpperBound) {
            searchRangeUpperBound = searchRangeLowerBound; // Adjust for edge cases like single element or all zeros.
        }

        let finalOptimalSegmentSum = -1; // Stores the minimum feasible maximum segment sum.

        // Standard binary search loop: continues as long as the lower bound is not past the upper bound.
        while (searchRangeLowerBound <= searchRangeUpperBound) {
            const currentMidpointCandidate = Math.floor((searchRangeLowerBound + searchRangeUpperBound) / 2);

            // Test if partitioning is possible with the current `currentMidpointCandidate` as the max sum.
            const isFeasibleWithMidpoint = verifyPartitioningFeasibility(
                currentMidpointCandidate,
                currentNumericSequence,
                maxSegmentsAllowed
            );

            if (isFeasibleWithMidpoint) {
                // If it's feasible, this midpoint is a potential answer. We record it
                // and try to find an even smaller sum by searching in the lower half.
                finalOptimalSegmentSum = currentMidpointCandidate;
                searchRangeUpperBound = currentMidpointCandidate - 1;
            } else {
                // If it's not feasible, the midpoint is too small. We need a larger sum,
                // so we search in the upper half.
                searchRangeLowerBound = currentMidpointCandidate + 1;
            }
        }

        // Output the result for the current data set.
        // `finalOptimalSegmentSum` will hold the smallest value that satisfied `verifyPartitioningFeasibility`.
        console.log(finalOptimalSegmentSum);
    }
})(); // An Immediately Invoked Function Expression (IIFE) to encapsulate the main logic.