// Global variable to store the total count for operations.
let totalCount;

// Global array to hold the calculated sequence of numbers.
let dataCollection = new Array();

/**
 * Initializes the dataCollection array based on the current totalCount.
 * The first element is set to 0, and subsequent elements are cumulative sums.
 */
function initializeCollection() {
    // Set the initial value of the collection's first element.
    dataCollection[0] = 0;

    // Iterate from 1 up to (but not including) totalCount.
    // Each element is the sum of the previous element and its index.
    iterateRange(1, totalCount, function(index) {
        dataCollection[index] = dataCollection[index - 1] + index;
    });
}

/**
 * Searches for a target value within the dataCollection array using binary search.
 * @param {number} targetValue - The value to search for.
 * @returns {boolean} True if the targetValue is found, false otherwise.
 */
function locateValue(targetValue) {
    // Define the lower and upper bounds for the binary search.
    let lowerBound = 0;
    let upperBound = totalCount;

    // Continue searching while there's more than one element in the current range.
    while (upperBound - lowerBound > 1) {
        // Calculate the middle point of the current range.
        const midPoint = Math.floor((lowerBound + upperBound) / 2);

        // If the value at the midpoint is less than or equal to the target,
        // move the lower bound to the midpoint.
        if (dataCollection[midPoint] <= targetValue) {
            lowerBound = midPoint;
        }
        // Otherwise, move the upper bound to the midpoint.
        else {
            upperBound = midPoint;
        }
    }
    // After the loop, check if the value at the lower bound matches the target.
    return dataCollection[lowerBound] === targetValue;
}

/**
 * The primary execution function of the program.
 * Reads input, performs calculations, and displays results.
 */
function executeProgram() {
    // Loop as long as valid numerical input is provided for totalCount.
    while ((totalCount = retrieveInputNumber())) {
        // Prepare the data collection for the current totalCount.
        initializeCollection();

        // Initialize a counter for the final result.
        let finalResult = 0;

        // Iterate through the dataCollection from index 0 up to totalCount - 1.
        iterateRange(0, totalCount - 1, function(idx) {
            // Check if the sum of the current collection element and totalCount
            // can be found in the collection.
            if (locateValue(dataCollection[idx] + totalCount)) {
                // If found, increment the result counter.
                finalResult++;
            }
        });
        // Display the calculated final result.
        displayOutput(finalResult);
    }
}

/**
 * A utility function to iterate through a range and apply a callback.
 * Can be called with (start, end, callback) or (end, callback) where start defaults to 0.
 * @param {number} startVal - The starting value of the loop counter.
 * @param {number} endVal - The exclusive upper bound of the loop counter.
 * @param {Function} callbackFn - The function to call for each iteration.
 */
function iterateRange(startVal, endVal, callbackFn) {
    // If the callback function is undefined, it means the (end, callback) signature was used.
    if (callbackFn === undefined) {
        // Adjust parameters: endVal becomes callbackFn, startVal becomes endVal, startVal defaults to 0.
        callbackFn = endVal;
        endVal = startVal;
        startVal = 0;
    }

    // Loop from startVal up to (but not including) endVal.
    for (let loopCounter = startVal; loopCounter < endVal; ++loopCounter) {
        // If the callback function returns false, break the loop prematurely.
        if (callbackFn(loopCounter) === false) {
            break;
        }
    }
}

// Buffer to accumulate raw input from stdin.
let rawInputBuffer = '';

/**
 * Retrieves and converts the next number from the processed input buffer.
 * @returns {number} The next number from the input.
 */
function retrieveInputNumber() {
    // Pop the last element from the reversed input buffer and convert it to a number.
    return Number(rawInputBuffer.pop());
}

/**
 * Retrieves the next string from the processed input buffer.
 * @returns {string} The next string from the input.
 */
function retrieveInputString() {
    // Pop the last element from the reversed input buffer.
    return rawInputBuffer.pop();
}

/**
 * Displays a value to the console.
 * @param {*} outputValue - The value to be printed.
 */
function displayOutput(outputValue) {
    // Use the standard console.log for output.
    console.log(outputValue);
}

// Resume standard input stream.
process.stdin.resume();
// Set the encoding for the input stream.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks from stdin.
process.stdin.on('data', function(inputChunk) {
    // Append the received chunk to the raw input buffer.
    rawInputBuffer += inputChunk;
});

// Event listener for the end of the input stream.
process.stdin.on('end', function() {
    // Process the accumulated raw input: trim whitespace, split by any whitespace, and reverse the array.
    // Reversing allows efficient popping from the end.
    rawInputBuffer = rawInputBuffer.trim().split(/\s+/).reverse();
    // Start the main program execution.
    executeProgram();
});