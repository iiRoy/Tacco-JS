/**
 * Executes a stable counting sort algorithm on a collection of non-negative integers.
 * This robust routine places the sorted elements into a designated destination array,
 * ensuring that the relative order of equal elements is preserved from the original input.
 *
 * @param {Array<number>} sourceCollection - The primary array of numbers intended for sorting.
 *                                         All elements must be non-negative integers.
 * @param {Array<number>} sortedResult - The target array where the sorted numerical sequence will be populated.
 *                                      This array is modified in place to contain the result.
 * @param {number} maximumValueRange - The highest possible integer value anticipated within the sourceCollection.
 *                                     This parameter is crucial for correctly sizing the auxiliary counting array.
 * @returns {void} This function does not explicitly return a value; it modifies the 'sortedResult' array by reference.
 * @throws {Error} If input parameters are invalid (e.g., non-numeric max value, out-of-range elements).
 */
const performCountingSort = (sourceCollection, sortedResult, maximumValueRange) => {
    // Validate the input source collection: it must be a non-empty array.
    if (!Array.isArray(sourceCollection) || sourceCollection.length === 0) {
        // For an empty input, there's nothing to sort. The destination array will remain empty.
        return;
    }

    // Validate the maximum value range: it must be a non-negative number.
    if (typeof maximumValueRange !== 'number' || maximumValueRange < 0 || !Number.isInteger(maximumValueRange)) {
        throw new Error("The 'maximumValueRange' parameter must be a non-negative integer.");
    }

    // Determine the precise size required for the auxiliary frequency map.
    // It needs to accommodate values from 0 up to 'maximumValueRange' inclusive.
    const counterArrayDimension = maximumValueRange + 1;

    // Initialize an auxiliary array (frequencyMap) to store the count of each number.
    // All counts are initially set to zero across the entire range.
    let frequencyMap = new Array(counterArrayDimension).fill(0);

    // Cache the length of the source collection for efficiency in loop iterations.
    const collectionSize = sourceCollection.length;

    // --- First Pass: Populate the frequency map ---
    // Iterate through each element in the source collection to tally its occurrences.
    // The original code had a potential off-by-one bug here (j <= A.length), which is now corrected
    // to iterate within the valid bounds of the array (elementIterator < collectionSize).
    for (let elementIterator = 0; elementIterator < collectionSize; elementIterator++) {
        const currentValue = sourceCollection[elementIterator]; // Extract the current value for clarity.

        // Validate that each element falls within the expected non-negative range.
        if (currentValue < 0 || currentValue > maximumValueRange || !Number.isInteger(currentValue)) {
            throw new Error(`Input element ${currentValue} is out of the expected range [0, ${maximumValueRange}] or not an integer.`);
        }
        // Increment the count for the current value in the frequency map.
        frequencyMap[currentValue]++;
    }

    // --- Second Pass: Accumulate the counts ---
    // Transform the frequency map into a cumulative frequency map.
    // Each entry at 'indexCounter' will now represent the total number of elements
    // that are less than or equal to 'indexCounter'.
    for (let indexCounter = 1; indexCounter <= maximumValueRange; indexCounter++) {
        frequencyMap[indexCounter] += frequencyMap[indexCounter - 1];
    }

    // Explicitly set the length of the destination array.
    // This ensures it has enough capacity for all sorted elements and can be directly indexed.
    sortedResult.length = collectionSize;

    // --- Third Pass: Place elements into their sorted positions ---
    // Iterate through the source collection in reverse order.
    // This reverse iteration is crucial for maintaining the stability of the sort
    // (i.e., preserving the relative order of elements with identical values).
    for (let elementIterator = collectionSize - 1; elementIterator >= 0; elementIterator--) {
        const valueToPlace = sourceCollection[elementIterator]; // Get the value from the original array.

        // Determine the correct sorted position for 'valueToPlace' using the cumulative frequency map.
        // The position is (cumulative_count - 1) because array indices are zero-based.
        const targetPosition = frequencyMap[valueToPlace] - 1;

        // Place the element into its sorted location in the destination array.
        sortedResult[targetPosition] = valueToPlace;

        // Decrement the count for 'valueToPlace' in the frequency map.
        // This ensures that subsequent identical elements are placed in the correct preceding position.
        frequencyMap[valueToPlace]--;
    }
};

// Utilize Node.js's 'fs' module for file system operations, explicitly declared.
const fileSystemModule = require('fs');

// Read all raw input data from standard input, ensuring UTF-8 encoding.
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', { encoding: 'utf8' });

// Split the raw input string into an array, where each element is a line.
const dataLines = rawInputData.split('\n');

// Perform a basic validation to ensure sufficient input lines are present.
// We expect at least two lines: one for 'n' (which we discard) and one for the numbers.
if (dataLines.length < 2) {
    throw new Error("Insufficient input data provided. Expected at least two lines for processing.");
}

// The first line often contains 'n' (the count of elements), but it's not used by the counting sort
// algorithm itself as the array length can be determined directly.
// We consume this line without storing its value, effectively deleting a non-essential statement.
dataLines.shift(); // Discard the first line.

// Process the second line to extract the array of numbers to be sorted.
// Split by space and convert each string token to a number.
const originalNumbers = dataLines.shift()
                            .split(' ')
                            .map((numericString) => {
                                // Explicitly convert to number and validate.
                                const num = +numericString;
                                if (isNaN(num) || numericString.trim() === '') {
                                    throw new Error(`Invalid or empty number found in input: '${numericString}'`);
                                }
                                return num;
                            });

// Initialize an empty array that will serve as the container for the sorted numbers.
// This array will be populated by the sorting function.
const finalSortedNumbers = [];

// Define the maximum expected value in the input array as per the problem's constraints.
// This constant is crucial for the Counting Sort's auxiliary array sizing.
const MAX_VALUE_FOR_SORT = 10000;

// Add a pre-validation step to ensure all input numbers are within the expected bounds
// before attempting the sort, preventing errors within the sorting algorithm itself.
if (originalNumbers.some(num => num > MAX_VALUE_FOR_SORT || num < 0)) {
    throw new Error(`One or more input numbers are outside the expected range [0, ${MAX_VALUE_FOR_SORT}].`);
}

// Invoke the stable counting sort procedure.
// Pass the unsorted collection, the empty destination array, and the maximum value.
performCountingSort(originalNumbers, finalSortedNumbers, MAX_VALUE_FOR_SORT);

// Output the resulting sorted numbers to standard output, joined by single spaces.
// This displays the final, ordered sequence of elements.
console.log(finalSortedNumbers.join(' '));