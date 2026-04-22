const obtainInteger = (strValue, radixBase = 10) => {
    // Provide a default value or handle non-string/non-numeric inputs gracefully.
    if (typeof strValue !== 'string' && typeof strValue !== 'number') {
        return 0;
    }
    // Explicitly convert to string and trim whitespace before parsing.
    return Number.parseInt(String(strValue).trim(), radixBase);
};

const transformStringsToNumbers = (stringInputArray) => {
    // Guard against invalid or empty input arrays.
    if (!Array.isArray(stringInputArray) || stringInputArray.length === 0) {
        return [];
    }
    // Map each string element to its integer representation.
    return stringInputArray.map(item => obtainInteger(item));
};

const computeAbsoluteValue = (numericInput) => {
    // Leverage the built-in Math.abs for accuracy and efficiency.
    return Math.abs(numericInput);
};

const findMinimumValue = (...elements) => {
    // Handle cases where no elements are provided.
    if (elements.length === 0) {
        return Infinity; // Consistent with Math.min() behavior for no arguments
    }
    // Use the spread operator with Math.min for a concise solution.
    return Math.min(...elements);
};

const findMaximumValue = (...elements) => {
    // Handle cases where no elements are provided.
    if (elements.length === 0) {
        return -Infinity; // Consistent with Math.max() behavior for no arguments
    }
    // Use the spread operator with Math.max for a concise solution.
    return Math.max(...elements);
};

// Define a constant for the highest bit position to check, typically 29 for 30-bit integers.
const TOPMOST_BIT_INDEX = 29;

/**
 * Executes the primary logic for identifying the largest possible bitwise AND result
 * among a set of contiguous subarray sums, where at least 'requiredCount' sums
 * must contribute to the AND operation.
 * @param {string} rawInputData - The raw string content read from the standard input.
 */
function processNumericalSequenceAnalysis(rawInputData) {
    // Initial validation for the input data.
    if (typeof rawInputData !== 'string' || rawInputData.trim() === '') {
        console.log(0); // Output 0 for empty or invalid input.
        return;
    }

    // Split the entire input content into an array of lines.
    const dataLines = rawInputData.trim().split('\n');

    // Parse the first line to extract the sequence length and the required count.
    const firstLineValues = dataLines[0].split(' ');
    const [sequenceLength, requiredCount] = transformStringsToNumbers(firstLineValues);

    // Further validation on the parsed input parameters.
    if (sequenceLength < 1 || requiredCount < 1 || dataLines.length < 2) {
        console.log(0);
        return;
    }

    // Parse the second line to get the initial array of numbers.
    const initialValuesArray = transformStringsToNumbers(dataLines[1].split(' '));

    // Compute cumulative sums (prefix sums) to efficiently calculate subarray sums.
    // An extra element is added at the beginning (index 0) with value 0 to simplify
    // calculations for subarrays starting at index 0.
    const prefixSumArray = new Array(sequenceLength + 1).fill(0);
    for (let idx = 0; idx < sequenceLength; ++idx) {
        prefixSumArray[idx + 1] = prefixSumArray[idx] + initialValuesArray[idx];
    }

    // Generate all possible contiguous subarray sums from the initial sequence.
    const allSubarraySumsCollection = [];
    for (let startPointer = 0; startPointer < sequenceLength; ++startPointer) {
        for (let endPointer = startPointer; endPointer < sequenceLength; ++endPointer) {
            // The sum of elements from startPointer to endPointer (inclusive)
            // is (prefixSumArray[endPointer + 1] - prefixSumArray[startPointer]).
            allSubarraySumsCollection.push(prefixSumArray[endPointer + 1] - prefixSumArray[startPointer]);
        }
    }

    // If no subarray sums were generated or if the required count is too high, exit early.
    if (allSubarraySumsCollection.length === 0 || allSubarraySumsCollection.length < requiredCount) {
        console.log(0);
        return;
    }

    // Initialize a data structure to store indices of subarray sums that have a specific bit set.
    // `indicesPerBitPosition[b]` will contain an array of indices `i` where `allSubarraySumsCollection[i]`
    // has the `b`-th bit set.
    const indicesPerBitPosition = Array.from({ length: TOPMOST_BIT_INDEX + 1 }, () => []);
    const totalSubarraySumsCount = allSubarraySumsCollection.length;

    // Populate the `indicesPerBitPosition` array.
    for (let currentBit = 0; currentBit <= TOPMOST_BIT_INDEX; ++currentBit) {
        const bitMaskValue = 1 << currentBit; // Calculate 2^currentBit
        for (let sumElementIndex = 0; sumElementIndex < totalSubarraySumsCount; ++sumElementIndex) {
            // Check if the `currentBit`-th bit is set in the current subarray sum.
            if ((allSubarraySumsCollection[sumElementIndex] & bitMaskValue) !== 0) {
                indicesPerBitPosition[currentBit].push(sumElementIndex);
            }
        }
    }

    // Variable to accumulate the final bitwise AND result.
    let finalAggregateAndResult = 0;

    // Iterate from the highest significant bit down to the lowest.
    for (let currentBitIndex = TOPMOST_BIT_INDEX; currentBitIndex >= 0; --currentBitIndex) {
        const valueOfCurrentBit = 1 << currentBitIndex; // The numerical value this bit represents (e.g., 2^29).

        // Check if there are at least `requiredCount` subarray sums that currently have this bit set.
        if (indicesPerBitPosition[currentBitIndex].length >= requiredCount) {
            // If yes, this bit can be part of our final answer.
            finalAggregateAndResult += valueOfCurrentBit;

            // To maintain the condition for lower bits, we must now restrict the pool of
            // eligible subarray sums. Only those sums that had the `currentBitIndex` set
            // are considered for subsequent (lower) bit positions.
            // Using a Set for efficient `has` lookups during the filtering process.
            const currentlyValidIndicesSet = new Set(indicesPerBitPosition[currentBitIndex]);

            // Iterate through all bit positions below the current one.
            for (let lowerBitIndex = currentBitIndex - 1; lowerBitIndex >= 0; --lowerBitIndex) {
                // Filter the list of indices for `lowerBitIndex` to keep only those
                // that are also present in `currentlyValidIndicesSet`.
                indicesPerBitPosition[lowerBitIndex] = indicesPerBitPosition[lowerBitIndex].filter(
                    idx => currentlyValidIndicesSet.has(idx)
                );
            }
        }
    }

    // Output the final computed result.
    console.log(finalAggregateAndResult);
}

// Entry point: Read data from standard input and initiate the processing.
const standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
processNumericalSequenceAnalysis(standardInputContent);