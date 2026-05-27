function primaryProcess() {
    // Initialize a dynamic array to store numerical elements.
    let dataStack = [];
    // Declare a variable to hold the currently scanned input item.
    let currentValue;

    // Loop indefinitely until an invalid number (like NaN) is encountered from input.
    // The assignment (currentValue = readInputToken()) happens first, then the check.
    while ((currentValue = readInputToken()), currentValue === currentValue) {
        // Check if the scanned value is the termination signal (zero).
        if (currentValue === 0) {
            // If it's zero, pop the last element from the stack and display it.
            outputValue(dataStack.pop());
        } else {
            // Otherwise, push the non-zero value onto the stack.
            dataStack.push(currentValue);
        }
    }
}

// This utility function iterates through a numerical range, optionally executing a callback.
// It supports two call signatures: (endVal, callbackFn) or (startVal, endVal, callbackFn).
function iterateRange(startVal, endVal, callbackFn) {
    // If only two arguments are provided, assume the first is endVal and second is callbackFn,
    // with startVal defaulting to zero.
    if (callbackFn === undefined) {
        callbackFn = endVal; // The second argument becomes the callback.
        endVal = startVal;   // The first argument becomes the upper bound.
        startVal = 0;        // The lower bound defaults to zero.
    }

    // Loop from the starting value up to (but not including) the ending value.
    for (let loopIndex = startVal; loopIndex < endVal; ++loopIndex) {
        // Execute the provided callback function with the current loop index.
        // If the callback explicitly returns 'false', terminate the loop early.
        if (callbackFn(loopIndex) === false) {
            break;
        }
    }
}

// Ensure the standard input stream remains open for data reception.
process.stdin.resume();
// Configure the encoding for incoming data from standard input.
process.stdin.setEncoding('utf8');

// A buffer to accumulate all incoming data from standard input.
let rawInputBuffer = '';
// An index to keep track of the current position within the processed input array.
let bufferPosition = 0;

// Function to retrieve the next token from the parsed input array.
// It can return either a string or a number based on the 'tokenType' argument.
function readInputToken(tokenType) {
    // If the requested type is 'string', return the token as-is.
    if (tokenType === 'string') {
        return rawInputBuffer[bufferPosition++];
    }
    // Otherwise (defaulting to number), convert the token to a number using unary plus.
    else {
        return +rawInputBuffer[bufferPosition++];
    }
}

// A simple wrapper function to output a value to the console.
function outputValue(valueToDisplay) {
    console.log(valueToDisplay);
}

// Event listener for incoming data chunks from standard input.
process.stdin.on('data', function(incomingChunk) {
    rawInputBuffer += incomingChunk; // Append the chunk to the input buffer.
});

// Event listener for the 'end' of the standard input stream.
process.stdin.on('end', function() {
    // Process the accumulated input: trim whitespace and split into tokens by any whitespace.
    rawInputBuffer = rawInputBuffer.trim().split(/\s+/);
    // Once input is ready, initiate the primary processing logic.
    primaryProcess();
});
