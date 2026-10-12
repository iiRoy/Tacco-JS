function primaryRoutine() {
    // This is the main execution routine for processing multiple test cases.
    while (true) { // An infinite loop that continues until a specific break condition is met.
        let countVal = readInput(); // Read the total number of elements for the current test case.

        // If the input count is zero, it signifies the end of input, so we terminate.
        if (countVal === 0) {
            break; // Exit the processing loop.
        }

        let windowSize = readInput(); // Read the size of the sliding window.
        let dataArray = []; // Initialize an empty array to store the input numbers.

        // Populate the 'dataArray' with 'countVal' numbers read from the input.
        iterateRange(countVal, function(idx) {
            dataArray[idx] = readInput(); // Assign each read number to its position in the array.
        });

        let currentSum = 0; // Variable to hold the sum of elements within the current window.

        // Calculate the initial sum for the very first window of 'windowSize' elements.
        iterateRange(windowSize, function(idx) {
            currentSum += dataArray[idx]; // Add each element in the initial window to 'currentSum'.
        });

        let maxSum = currentSum; // Initialize 'maxSum' with the sum of the first window.

        // Iterate through the remaining elements, sliding the window one position at a time.
        // This loop runs 'countVal - windowSize' times.
        iterateRange(countVal - windowSize, function(idx) {
            currentSum -= dataArray[idx]; // Subtract the element that is leaving the window from the left.
            currentSum += dataArray[windowSize + idx]; // Add the new element entering the window from the right.
            maxSum = Math.max(currentSum, maxSum); // Update 'maxSum' if the 'currentSum' is greater.
        });

        outputValue(maxSum); // Print the maximum sum found for the current test case.
    }
}

// A utility function for iterating over a range, similar to a 'for' loop.
// It supports two call signatures: (end, callback) or (start, end, callback).
function iterateRange(startVal, endVal, callbackFn) {
    // Check if the 'callbackFn' argument is missing, implying the (end, callback) signature.
    if (callbackFn == null) {
        callbackFn = endVal; // The second argument is actually the callback.
        endVal = startVal; // The first argument is the end value.
        startVal = 0; // Default the starting value to zero.
    }

    // Loop from 'startVal' up to (but not including) 'endVal'.
    for (let idx = startVal; idx < endVal; ++idx) {
        // Execute the provided callback function with the current index.
        // If the callback explicitly returns 'false', break out of the loop early.
        if (callbackFn(idx) === false) {
            break;
        }
    }
}

// Standard input stream setup.
process.stdin.resume(); // Ensures the standard input stream remains open.
process.stdin.setEncoding('utf8'); // Sets the character encoding for incoming data.

let rawData = ''; // A string buffer to accumulate all incoming data from stdin.
let dataPointer = 0; // An index to keep track of the current position in the processed input array.

// Function to read a single token from the pre-processed input array.
function readInput(dataType) {
    // If 'string' type is specified, return the token as a string.
    if (dataType === 'string') {
        return rawData[dataPointer++]; // Return the string and advance the pointer.
    }
    // Otherwise, assume numeric type and convert the token to a number.
    else {
        return +rawData[dataPointer++]; // Convert to number and advance the pointer.
    }
}

// Function to output a value to the console.
function outputValue(resultVal) {
    console.log(resultVal); // Prints the given value followed by a newline.
}

// Event listener for when data chunks are received from stdin.
process.stdin.on('data', function(dataChunk) {
    rawData += dataChunk; // Append each incoming data chunk to the 'rawData' buffer.
});

// Event listener for when the entire input stream has ended.
process.stdin.on('end', function() {
    // Once all data is received, split the 'rawData' string by any whitespace
    // characters into an array of individual tokens (numbers or strings).
    rawData = rawData.split(/\s+/);
    primaryRoutine(); // Initiate the main program logic.
});
