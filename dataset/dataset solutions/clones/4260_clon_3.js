const ioModule = require('readline');

let receivedInputLines = [];

const streamInterface = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * Parses a string of space-separated numbers into an array of integers.
 * Includes basic error handling for non-numeric values.
 * @param {string} inputString The string containing space-separated numbers.
 * @returns {number[]} An array of parsed numbers. Returns an empty array if input is invalid.
 */
const parseNumericArray = (inputString) => {
    if (typeof inputString !== 'string' || inputString.trim() === '') {
        // If input is not a string or is empty, return an empty array.
        return [];
    }
    return inputString.split(' ').map(strVal => {
        const num = Number(strVal);
        // If conversion results in NaN, default to 0 or throw an error based on requirements.
        // For competitive programming, usually assumes valid input, but this adds robustness.
        return isNaN(num) ? 0 : num;
    });
};

// Listener for each line of input received.
streamInterface.on('line', (currentInputLine) => {
    receivedInputLines.push(currentInputLine);
});

// Listener for when the input stream concludes.
streamInterface.on('close', () => {
    // Basic validation: ensure minimum required input lines are present.
    if (receivedInputLines.length < 4) {
        // In a real application, this might throw an error or log a detailed message.
        // For this context, simply exiting after an error message.
        console.error("Input error: Insufficient number of lines provided.");
        return;
    }

    // Parse the total count of elements from the first line.
    const totalElementCount = Number(receivedInputLines[0]);
    if (isNaN(totalElementCount) || totalElementCount <= 0) {
        console.error("Input error: Invalid or non-positive total element count.");
        return;
    }

    // Parse the three arrays from subsequent lines.
    const lowerParts = parseNumericArray(receivedInputLines[1]);
    const middleParts = parseNumericArray(receivedInputLines[2]);
    const upperParts = parseNumericArray(receivedInputLines[3]);

    // Further validation: ensure all parsed arrays match the expected size.
    if (lowerParts.length !== totalElementCount || 
        middleParts.length !== totalElementCount || 
        upperParts.length !== totalElementCount) {
        console.error("Input error: Discrepancy in array lengths versus declared element count.");
        return;
    }

    // Sort all three arrays in ascending numerical order.
    // This is a prerequisite for the binary search operations.
    lowerParts.sort((valA, valB) => valA - valB);
    middleParts.sort((valA, valB) => valA - valB);
    upperParts.sort((valA, valB) => valA - valB);

    // Initialize a variable to accumulate the final computed result.
    let cumulativeResult = 0;

    // Iterate through each element in the 'middleParts' array.
    for (let currentMiddleIndex = 0; currentMiddleIndex < totalElementCount; currentMiddleIndex++) {
        const currentMiddleValue = middleParts[currentMiddleIndex];

        // Determine the count of elements in 'lowerParts' that are strictly less than 'currentMiddleValue'.
        // This effectively finds the 'lower_bound' index, which is the count of elements smaller than the target.
        const countOfLowerMatches = findCountOfElementsLessThan(currentMiddleValue, lowerParts, totalElementCount);

        // Determine the index of the first element in 'upperParts' that is strictly greater than 'currentMiddleValue'.
        // This is equivalent to finding the 'upper_bound' index.
        const indexForFirstGreater = findIndexofFirstElementGreaterThan(currentMiddleValue, upperParts, totalElementCount);
        // The count of elements strictly greater is the total length minus this index.
        const countOfUpperMatches = totalElementCount - indexForFirstGreater;
        
        // Add the product of the two counts to the cumulative result.
        cumulativeResult += countOfLowerMatches * countOfUpperMatches;
    }

    // Print the final calculated answer to standard output.
    console.log(cumulativeResult);
});

/**
 * Executes a binary search on a sorted array to determine how many elements
 * are strictly smaller than a specified target value.
 * This is functionally equivalent to determining the 'lower_bound' index.
 * @param {number} searchTarget The value used for comparison.
 * @param {number[]} sortedDataCollection The array, assumed to be sorted ascending.
 * @param {number} collectionSize The number of active elements in the collection.
 * @returns {number} The count of elements in sortedDataCollection strictly less than searchTarget.
 */
function findCountOfElementsLessThan(searchTarget, sortedDataCollection, collectionSize) {
    let lowPointer = 0;
    let highPointer = collectionSize;

    // The loop continues as long as there is an unsearched range.
    while (lowPointer < highPointer) {
        const midPointIndex = Math.floor((lowPointer + highPointer) / 2);
        if (sortedDataCollection[midPointIndex] < searchTarget) {
            // If the element at midPointIndex is less than the target,
            // all elements up to this point are also less. We need to check further right.
            lowPointer = midPointIndex + 1;
        } else {
            // If the element at midPointIndex is not less than the target (i.e., >= target),
            // it could be our 'lower_bound' or it's too high. We need to check the left half.
            highPointer = midPointIndex;
        }
    }
    // 'lowPointer' will hold the index of the first element >= searchTarget,
    // which by definition is also the count of elements strictly less than searchTarget.
    return lowPointer;
}

/**
 * Performs a binary search on a sorted array to locate the index of the first element
 * that is strictly greater than a given target value.
 * This function effectively implements the 'upper_bound' concept.
 * @param {number} searchTarget The value to find elements greater than.
 * @param {number[]} sortedDataCollection The array, assumed to be sorted ascending.
 * @param {number} collectionSize The number of active elements in the collection.
 * @returns {number} The index of the first element strictly greater than searchTarget.
 *                   If no such element exists (all are <= searchTarget), returns collectionSize.
 */
function findIndexofFirstElementGreaterThan(searchTarget, sortedDataCollection, collectionSize) {
    let lowPointer = 0;
    let highPointer = collectionSize;

    // The loop continues as long as the search range is valid.
    while (lowPointer < highPointer) {
        const midPointIndex = Math.floor((lowPointer + highPointer) / 2);
        if (sortedDataCollection[midPointIndex] <= searchTarget) {
            // If the element at midPointIndex is less than or equal to the target,
            // it cannot be the first element strictly greater. We search in the right half.
            lowPointer = midPointIndex + 1;
        } else {
            // If the element at midPointIndex is strictly greater than the target,
            // this could be our answer, or an earlier element might also be strictly greater.
            // We record this and try to find an even earlier one by searching the left half.
            highPointer = midPointIndex;
        }
    }
    // 'lowPointer' will hold the index of the first element strictly greater than searchTarget.
    // If all elements are <= searchTarget, 'lowPointer' will be equal to 'collectionSize'.
    return lowPointer;
}