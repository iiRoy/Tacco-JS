let countVal; // Stores the current input number for calculations
let dataArray = []; // An array to store precomputed sums

/**
 * Initializes the dataArray based on the current countVal.
 * Fills dataArray such that dataArray[i] = 0 + 1 + ... + i.
 */
function initializeData() {
    dataArray[0] = 0; // Base case: sum up to 0 is 0
    // Iterate from 1 up to countVal (inclusive)
    iterateRange(1, countVal + 1, function(idx) {
        dataArray[idx] = dataArray[idx - 1] + idx; // Calculate cumulative sum
    });
}

/**
 * Performs a binary search on the precomputed dataArray to check if a target value exists.
 * @param {number} targetVal The value to search for.
 * @returns {boolean} True if targetVal is found in dataArray, false otherwise.
 */
function findValue(targetVal) {
    let leftPtr = 0; // Left boundary of the search range
    let rightPtr = countVal; // Right boundary of the search range (exclusive)

    // Binary search loop
    while (rightPtr - leftPtr > 1) {
        let midPtr = (leftPtr + rightPtr) >>> 1; // Calculate middle index using unsigned right shift
        if (dataArray[midPtr] <= targetVal) {
            leftPtr = midPtr; // If value at mid is less than or equal, move left pointer to mid
        } else {
            rightPtr = midPtr; // Otherwise, move right pointer to mid
        }
    }
    // After loop, leftPtr points to the potential match or the largest element less than targetVal
    return dataArray[leftPtr] === targetVal; // Check if the element at leftPtr is the target
}

/**
 * The primary execution function of the program.
 * Reads numbers, performs calculations, and outputs results.
 */
function primaryExecution() {
    // Loop as long as a valid non-zero number is read from input
    while ((countVal = readInputNumber()) !== 0) {
        initializeData(); // Prepare the data array for the current countVal
        let resultCount = 0; // Counter for successful matches

        // Iterate from 0 up to countVal - 1
        iterateRange(0, countVal, function(idx) {
            // Check if the sum of dataArray[idx] and countVal exists in dataArray
            if (findValue(dataArray[idx] + countVal)) {
                ++resultCount; // Increment counter if found
            }
        });
        outputValue(resultCount); // Print the final count for the current input
    }
}

/**
 * A utility function for iterating over a range, similar to Python's range.
 * Supports optional start value (defaults to 0).
 * @param {number} startVal The starting index (inclusive).
 * @param {number} endVal The ending index (exclusive).
 * @param {function(number): boolean} callbackFn The function to call for each index.
 *                                              If it returns false, iteration stops.
 */
function iterateRange(startVal, endVal, callbackFn) {
    // Handle case where only two arguments are provided (start is 0)
    if (callbackFn === undefined) {
        callbackFn = endVal;
        endVal = startVal;
        startVal = 0;
    }
    // Loop through the specified range
    for (let loopIndex = startVal; loopIndex < endVal; ++loopIndex) {
        if (callbackFn(loopIndex) === false) {
            break; // Stop iteration if callback returns false
        }
    }
}

let rawInputBuffer = ''; // Buffer to store raw input from stdin

/**
 * Reads and returns the next number from the processed input buffer.
 * @returns {number} The next number from input.
 */
function readInputNumber() {
    return +rawInputBuffer.pop(); // Pop the last element and convert to number
}

/**
 * Reads and returns the next string from the processed input buffer.
 * (Not used in this specific problem, but kept for completeness based on original structure)
 * @returns {string} The next string from input.
 */
function readInputString() {
    return rawInputBuffer.pop(); // Pop the last element (as a string)
}

/**
 * Outputs a value to the console.
 * @param {*} valueToPrint The value to be printed.
 */
function outputValue(valueToPrint) {
    console.log(valueToPrint); // Use console.log for output
}

// Set up standard input processing
process.stdin.resume(); // Keep the process alive for input
process.stdin.setEncoding('utf8'); // Set input encoding

// Event listener for incoming data chunks
process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk; // Append new data to the buffer
});

// Event listener for end of input stream
process.stdin.on('end', function() {
    // Process the entire input: trim whitespace, split by any whitespace, and reverse
    // Reversing makes `pop()` retrieve elements in original order
    rawInputBuffer = rawInputBuffer.trim().split(/\s+/).reverse();
    primaryExecution(); // Start the main program logic
});
