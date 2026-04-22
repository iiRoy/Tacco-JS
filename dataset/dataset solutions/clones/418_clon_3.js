/**
 * Determines if a given maximum segment sum (`segmentSumLimit`) is achievable
 * when partitioning a sequence of numbers (`sourceNumericalElements`) into
 * no more than a specified count of segments (`maxPermittedSegments`).
 * This function serves as the predicate for a binary search algorithm
 * aiming to find the minimum possible maximum segment sum.
 *
 * @param {number} segmentSumLimit The upper bound for the sum of elements within any single segment.
 * @param {number[]} sourceNumericalElements An array containing the numerical values to be partitioned.
 * @param {number} maxPermittedSegments The maximum number of segments allowed for the partition.
 * @returns {boolean} Returns `true` if the partitioning is possible under the given constraints; otherwise, `false`.
 */
function evaluatePartitionFeasibility(segmentSumLimit, sourceNumericalElements, maxPermittedSegments) {
    // Guard clause: If the input array is empty, it can always be considered partitioned
    // (into zero segments), which is implicitly less than or equal to `maxPermittedSegments`.
    if (!Array.isArray(sourceNumericalElements) || sourceNumericalElements.length === 0) {
        return true;
    }

    let partitionsFormed = 1; // Start counting with the first partition.
    let currentPartitionAccumulator = 0; // Tracks the sum of elements in the current partition.

    // Iterate through each numerical value in the source array.
    for (const itemValue of sourceNumericalElements) {
        // Immediate failure condition: If any single element is greater than the
        // allowed `segmentSumLimit`, it's impossible to form a valid partition.
        if (itemValue > segmentSumLimit) {
            return false;
        }

        // Attempt to add the current element to the current partition.
        if (currentPartitionAccumulator + itemValue <= segmentSumLimit) {
            currentPartitionAccumulator += itemValue;
        } else {
            // If adding the current element would exceed the `segmentSumLimit`,
            // a new partition must be initiated.
            partitionsFormed++;
            currentPartitionAccumulator = itemValue; // The current element starts this new partition.

            // If, by starting a new partition, we have exceeded the
            // `maxPermittedSegments` limit, then this `segmentSumLimit` is not feasible.
            if (partitionsFormed > maxPermittedSegments) {
                return false;
            }
        }
    }

    // If the loop completes without returning `false`, it signifies that
    // all elements were successfully partitioned within the `maxPermittedSegments`
    // limit and `segmentSumLimit`.
    return true;
}

// Main program execution block.
// Reads all input from standard input synchronously using Node.js 'fs' module.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Processes the raw input string: removes leading/trailing whitespace and splits it into an array of lines.
const processedInputLines = rawInputContent.trim().split('\n');

// Helper function to parse a string containing space-separated numbers into an array of integers.
const parseSpaceSeparatedNumbers = (lineString) => lineString.split(' ').map(val => parseInt(val.trim(), 10));

// Loop indefinitely to handle multiple test cases until a specific termination condition is met.
while (true) {
    // Extract the first line which contains configuration parameters (max parts, total items).
    const configurationParametersLine = processedInputLines.shift();

    // Termination condition: A line "0 0" signals the end of input.
    if (configurationParametersLine === '0 0') {
        break;
    }

    // Parse the configuration line to extract the maximum allowed parts and the total number of items.
    const [maximumParts, totalItems] = parseSpaceSeparatedNumbers(configurationParametersLine);

    // Initialize an array to store the numerical values for the current test case.
    const itemNumericalValues = [];
    // Populate the array by reading the specified number of item values from subsequent input lines.
    for (let counter = 0; counter < totalItems; counter++) {
        itemNumericalValues.push(parseInt(processedInputLines.shift(), 10));
    }

    // --- Binary Search Algorithm to Determine the Minimum Maximum Segment Sum ---

    // Define the search space for the `segmentSumLimit`.
    // The absolute minimum possible `segmentSumLimit` must be at least the largest individual element,
    // as no segment sum can be smaller than its largest constituent.
    // Initialize with 0 for an empty array, or the maximum element for a non-empty array.
    const lowerBoundForSearch = itemNumericalValues.reduce((maxVal, currentVal) => Math.max(maxVal, currentVal), 0);

    // The absolute maximum possible `segmentSumLimit` is the sum of all elements,
    // which corresponds to partitioning the entire array into a single segment.
    const upperBoundForSearch = itemNumericalValues.reduce((totalSum, currentVal) => totalSum + currentVal, 0);

    let searchRangeLow = lowerBoundForSearch;
    let searchRangeHigh = upperBoundForSearch;
    let resultOfOptimalSum = upperBoundForSearch; // Initialize with a valid (though not necessarily minimal) sum.

    // Execute the binary search. The loop continues as long as the search range is valid.
    while (searchRangeLow <= searchRangeHigh) {
        // Calculate the midpoint of the current search range. Using `Math.floor` ensures an integer result.
        const currentMidpointSum = Math.floor((searchRangeLow + searchRangeHigh) / 2);

        // Use the feasibility function to check if the `currentMidpointSum` allows for a valid partition.
        if (evaluatePartitionFeasibility(currentMidpointSum, itemNumericalValues, maximumParts)) {
            // If `currentMidpointSum` is feasible, it means we can potentially achieve this sum
            // or even a smaller one. We record `currentMidpointSum` as a possible optimal result
            // and attempt to find a smaller sum by searching in the lower half of the range.
            resultOfOptimalSum = currentMidpointSum;
            searchRangeHigh = currentMidpointSum - 1;
        } else {
            // If `currentMidpointSum` is not feasible, it means the sum is too small.
            // We need a larger sum, so we adjust the search to the upper half of the range.
            searchRangeLow = currentMidpointSum + 1;
        }
    }

    // After the binary search concludes, `resultOfOptimalSum` will hold
    // the smallest possible maximum segment sum that satisfies all conditions.
    console.log(resultOfOptimalSum);
}