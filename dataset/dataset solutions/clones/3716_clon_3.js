// Function to process input data, analyze partitions, and find the minimum range difference.
function analyzeDataPartitions(inputRawContent) {
    // Extensive comments are added, and whitespace is reformatted for improved readability.

    // 1. Input Parsing and Initial Validation
    // Split the entire input string into individual lines.
    const inputLines = inputRawContent.split("\n");

    // The first line contains N, the total count of numbers.
    // We derive the zero-based index of the last element, which is N-1.
    const lastDataIndex = parseInt(inputLines[0].trim(), 10) - 1;

    // Guard clause: Ensure there are enough data points to create four non-empty partitions.
    // To have four partitions (S1, S2, S3, S4), we need at least 4 elements.
    // This means the last valid index must be at least 3 (0, 1, 2, 3).
    if (isNaN(lastDataIndex) || lastDataIndex < 3) {
        console.error("Error: Insufficient data. At least 4 numeric values are required for partitioning.");
        // Depending on requirements, could throw an error or return a specific code.
        return;
    }

    // Parse the second line, which contains the space-separated numeric sequence.
    // Each string element is converted to a number.
    const numericSequence = inputLines[1].split(" ").map(Number);

    // Additional validation: Check if the actual sequence length matches the declared count (N).
    if (numericSequence.length !== lastDataIndex + 1) {
        console.error("Error: Mismatch between the declared number of elements and the actual sequence length.");
        return;
    }

    // 2. Cumulative Sums Calculation (Prefix Sum Array)
    // Create an array to store cumulative sums. `cumulativeTotals[k]` will hold the sum
    // of `numericSequence[0]` through `numericSequence[k]`.
    const cumulativeTotals = new Array(lastDataIndex + 1);
    let runningTotal = 0; // Helper variable for accumulation

    // Iterate through the numeric sequence to build the cumulative sums array.
    for (let currentIdx = 0; currentIdx <= lastDataIndex; currentIdx++) {
        runningTotal += numericSequence[currentIdx];
        cumulativeTotals[currentIdx] = runningTotal;
    }

    // The total sum of all elements in the sequence is the last element of cumulativeTotals.
    const overallSequenceSum = cumulativeTotals[lastDataIndex];

    // 3. Main Logic: Finding Optimal Partition Points

    // Initialize the variable to store the minimum difference between the maximum and minimum
    // segment sums found. Start with the largest possible safe integer value.
    let optimalRangeDifference = Number.MAX_SAFE_INTEGER;

    /**
     * Helper function to calculate segment sums based on three partition indices
     * and update the global optimalRangeDifference. This reduces code repetition.
     * @param {number} partitionOneEndIndex - The index where the first segment ends (S1).
     * @param {number} partitionTwoEndIndex - The index where the second segment ends (S1+S2).
     * @param {number} partitionThreeEndIndex - The index where the third segment ends (S1+S2+S3).
     */
    const updateOptimalDifference = (partitionOneEndIndex, partitionTwoEndIndex, partitionThreeEndIndex) => {
        // Validation of partition indices:
        // S1: [0, p1], S2: [p1+1, p2], S3: [p2+1, p3], S4: [p3+1, lastDataIndex]
        // All segments must contain at least one element.
        if (partitionOneEndIndex < 0 || // S1 cannot be empty (p1 must be at least 0)
            partitionOneEndIndex >= partitionTwoEndIndex || // S2 cannot be empty (p2 must be > p1)
            partitionTwoEndIndex >= partitionThreeEndIndex || // S3 cannot be empty (p3 must be > p2)
            partitionThreeEndIndex >= lastDataIndex) { // S4 cannot be empty (lastDataIndex must be > p3)
            return; // This configuration is invalid, so skip it.
        }

        // Calculate the sum of each of the four segments using the cumulative totals.
        const segmentOneSum = cumulativeTotals[partitionOneEndIndex];
        const segmentTwoSum = cumulativeTotals[partitionTwoEndIndex] - cumulativeTotals[partitionOneEndIndex];
        const segmentThreeSum = cumulativeTotals[partitionThreeEndIndex] - cumulativeTotals[partitionTwoEndIndex];
        const segmentFourSum = overallSequenceSum - cumulativeTotals[partitionThreeEndIndex];

        // Place the calculated sums into an array and sort them in ascending order.
        const currentSegmentSums = [segmentOneSum, segmentTwoSum, segmentThreeSum, segmentFourSum];
        currentSegmentSums.sort((valA, valB) => valA - valB);

        // The difference between the maximum and minimum segment sum is `currentSegmentSums[3] - currentSegmentSums[0]`.
        // Update the global optimalRangeDifference if this configuration yields a smaller difference.
        optimalRangeDifference = Math.min(optimalRangeDifference, currentSegmentSums[3] - currentSegmentSums[0]);
    };

    // The main loop iterates through all possible positions for the second cut point (partitionTwoEndIndex).
    // This index must allow at least one element for S1, S3, and S4.
    // Minimum `partitionTwoEndIndex` is 1 (S1=0, S2=1). Maximum `partitionTwoEndIndex` is `lastDataIndex - 2`
    // (S3=lastDataIndex-1, S4=lastDataIndex).
    for (let pivotIndexTwo = 1; pivotIndexTwo < lastDataIndex - 1; pivotIndexTwo++) {
        // Calculate the ideal target sums for the first and third cut points.
        // For the first cut (partitionOneEndIndex), we want S1 and S2 to be as close as possible.
        // S1 + S2 = cumulativeTotals[pivotIndexTwo]. We aim for S1 ≈ (S1+S2)/2.
        const targetForFirstCut = Math.ceil(cumulativeTotals[pivotIndexTwo] / 2);

        // For the third cut (partitionThreeEndIndex), we want S3 and S4 to be as close as possible.
        // S3 + S4 = overallSequenceSum - cumulativeTotals[pivotIndexTwo].
        // We aim for S3 ≈ (S3+S4)/2. So cumulativeTotals[partitionThreeEndIndex] should be close to
        // cumulativeTotals[pivotIndexTwo] + (overallSequenceSum - cumulativeTotals[pivotIndexTwo]) / 2.
        const targetForThirdCut = Math.ceil((overallSequenceSum + cumulativeTotals[pivotIndexTwo]) / 2);

        // Use binary search to find the best candidate for the first cut point.
        // Search range: indices from 0 up to `pivotIndexTwo - 1`.
        const partitionOneCandidate = findMinimalIndex(cumulativeTotals, 0, pivotIndexTwo, targetForFirstCut);

        // Use binary search to find the best candidate for the third cut point.
        // Search range: indices from `pivotIndexTwo + 1` up to `lastDataIndex - 1`.
        const partitionThreeCandidate = findMinimalIndex(cumulativeTotals, pivotIndexTwo + 1, lastDataIndex, targetForThirdCut);

        // Evaluate the configuration using the primary candidates found by binary search.
        updateOptimalDifference(partitionOneCandidate, pivotIndexTwo, partitionThreeCandidate);

        // Explore configurations by adjusting the first cut point:
        // If `partitionOneCandidate` is not the very first element (index 0),
        // also check the element immediately preceding it.
        if (partitionOneCandidate > 0) {
            updateOptimalDifference(partitionOneCandidate - 1, pivotIndexTwo, partitionThreeCandidate);

            // Additionally, if the third cut point can also be moved one step back
            // (i.e., it's not immediately adjacent to `pivotIndexTwo`),
            // check the combination of both `partitionOneCandidate - 1` and `partitionThreeCandidate - 1`.
            if (partitionThreeCandidate > pivotIndexTwo + 1) {
                updateOptimalDifference(partitionOneCandidate - 1, pivotIndexTwo, partitionThreeCandidate - 1);
            }
        }

        // Explore configurations by adjusting the third cut point (if not already covered above):
        // If `partitionThreeCandidate` is not immediately adjacent to `pivotIndexTwo` (meaning there's
        // at least one element for S3 before `partitionThreeCandidate`), check the element before it.
        if (partitionThreeCandidate > pivotIndexTwo + 1) {
            updateOptimalDifference(partitionOneCandidate, pivotIndexTwo, partitionThreeCandidate - 1);
        }
    }

    // Output the final calculated minimum range difference.
    console.log(optimalRangeDifference);
}

/**
 * Performs a binary search to find the "lower bound" of a target value within a sorted array segment.
 * It identifies the index of the first element in `dataArray` (within the specified range)
 * that is greater than or equal to `targetValue`.
 *
 * @param {number[]} dataArray - The sorted array to search within (e.g., cumulative sums).
 * @param {number} startIndex - The inclusive starting index of the search range.
 * @param {number} upperLimit - The exclusive upper bound of the search range.
 *                              The search is performed in `[startIndex, upperLimit - 1]`.
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index of the first element >= `targetValue`, or `upperLimit`
 *                   if all elements in the range are less than `targetValue`.
 *                   If the search range is empty (e.g., `startIndex >= upperLimit`),
 *                   it returns `startIndex` (which might be `upperLimit` if `startIndex == upperLimit`).
 */
function findMinimalIndex(dataArray, startIndex, upperLimit, targetValue) {
    let lowPointer = startIndex;
    let highPointer = upperLimit; // This pointer is an exclusive upper bound.

    // Handle cases where the search range is empty or invalid.
    // If startIndex is equal to or greater than upperLimit, the range `[startIndex, upperLimit-1]` is empty.
    // In such a scenario, the original code would effectively return `startIndex`.
    if (startIndex >= upperLimit) {
        return startIndex;
    }

    // The loop continues as long as there are at least two elements left to consider
    // in the effective range `[lowPointer, highPointer - 1]`.
    while (lowPointer < highPointer - 1) {
        // Calculate the middle index using `Math.floor` for integer division.
        // This method also helps prevent potential integer overflow for very large `lowPointer` and `highPointer`.
        const midPoint = Math.floor(lowPointer + (highPointer - lowPointer) / 2);

        // If the element at the `midPoint` is less than the `targetValue`,
        // it means the lower bound must be in the right half of the current search space.
        // We update `lowPointer` to `midPoint`.
        if (dataArray[midPoint] < targetValue) {
            lowPointer = midPoint;
        } else {
            // If the element at `midPoint` is greater than or equal to the `targetValue`,
            // it means `midPoint` could be our lower bound, or the lower bound is in the left half.
            // We update `highPointer` to `midPoint`.
            highPointer = midPoint;
        }
    }

    // After the loop terminates, `lowPointer` and `highPointer` will be adjacent indices,
    // where `highPointer` is `lowPointer + 1`.
    // We now check `dataArray[lowPointer]` to determine the final result.
    // If `dataArray[lowPointer]` is still less than `targetValue`, then `highPointer`
    // must point to the first element that is `>= targetValue` (or is `upperLimit` if no such element exists).
    // Otherwise, `lowPointer` itself points to the first element that is `>= targetValue`.
    return dataArray[lowPointer] < targetValue ? highPointer : lowPointer;
}

// Entry point for executing the program.
// This block reads input from standard input (typically /dev/stdin in competitive programming environments)
// and passes it to the `analyzeDataPartitions` function.
try {
    // Node.js specific: Use 'fs' module to read synchronous file content.
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    analyzeDataPartitions(fileContent);
} catch (executionError) {
    // Log any errors that occur during file reading or execution.
    console.error("An error occurred during program execution:", executionError.message);
    // Optionally, exit with a non-zero status code to indicate failure.
    // process.exit(1);
}