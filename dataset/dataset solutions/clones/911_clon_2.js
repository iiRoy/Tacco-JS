// This script processes numerical input lines to find a specific minimum difference.
// It supports both Node.js and V8 environments for input/output operations.

var primaryExecution = function() {
    // Variable to hold parsed input data for the current line.
    var inputLineData;

    // Loop continues as long as the first number in the parsed line is non-zero.
    // The assignment happens within the condition, reading a line, splitting it by space,
    // converting parts to numbers, and then checking the first element.
    while ((inputLineData = readInputLine().split(' ').map(Number))[0]) {
        // Extract the two main numbers from the current input line.
        var firstValue = inputLineData[0];
        var secondValue = inputLineData[1];

        // Initialize the minimum difference with a very large number (2^30).
        // This ensures any calculated difference will be smaller.
        var minimumDifference = 1073741824; // Equivalent to 1 << 30

        // Iterate from 0 up to floor(firstValue / 2).
        // This loop explores possible partitions for 'firstValue' to find the optimal 'i'.
        for (var iteratorIndex = 0; iteratorIndex <= Math.floor(firstValue / 2); iteratorIndex++) {
            // Calculate the hypotenuse of a right triangle with sides 'iteratorIndex' and 'firstValue - iteratorIndex'.
            // Then, find the absolute difference between 'secondValue' and this hypotenuse.
            // Update 'minimumDifference' if the current calculated difference is smaller.
            minimumDifference = Math.min(minimumDifference, Math.abs(secondValue - Math.hypot(iteratorIndex, firstValue - iteratorIndex)));
        }
        // Output the calculated minimum difference for the current input line.
        outputResult(minimumDifference);
    }
};

// --- Input/Output Handling Section ---
// This part adapts the script to run in different JavaScript environments.

if (typeof process !== 'undefined') {
    // Node.js environment detected.
    // Define a custom output function that uses console.log.
    var outputResult = function(contentToLog) {
        console.log(contentToLog);
    };

    // Define a custom input function to read lines from standard input asynchronously.
    var readInputLine = (function() {
        // Buffer to store complete lines read from stdin.
        var inputBuffer = [];
        // Index to keep track of the next line to be returned from the buffer.
        var bufferIndex = 0;

        // Get the standard input stream.
        var standardInput = process.openStdin();
        // Set the encoding for the input stream to handle text data.
        standardInput.setEncoding('utf8');

        // A temporary string to hold incomplete lines or fragments received from stdin.
        var remainingInput = "";

        // Event listener for incoming data chunks from stdin.
        standardInput.on('data', function(incomingData) {
            // Concatenate the new data with any previously remaining fragment.
            var lineParts = (remainingInput + incomingData).split("\n");
            // The last part might be an incomplete line, store it for the next chunk.
            remainingInput = lineParts.pop();
            // Process all complete lines found in the current chunk.
            for (var currentPartIdx = 0; currentPartIdx < lineParts.length; currentPartIdx++) {
                // Skip empty lines that might result from consecutive newlines.
                if (lineParts[currentPartIdx] === '') continue;
                inputBuffer.push(lineParts[currentPartIdx]);
            }
        });

        // Event listener for the end of the input stream.
        standardInput.on('end', function(endEventData) {
            // If there's any remaining input fragment, treat it as a final line.
            if (remainingInput) {
                var finalLineParts = (remainingInput + "\n").split("\n");
                remainingInput = finalLineParts.pop(); // Should be empty after adding '\n'
                for (var finalPartIdx = 0; finalPartIdx < finalLineParts.length; finalPartIdx++) {
                    if (finalLineParts[finalPartIdx] === '') continue;
                    inputBuffer.push(finalLineParts[finalPartIdx]);
                }
            }
            // Once all input is processed and buffered, execute the main logic.
            primaryExecution();
        });

        // Return the function that provides lines from the buffer.
        return function() {
            // If the buffer is exhausted, return null to signal no more input.
            if (inputBuffer.length <= bufferIndex) return null;
            // Return the next line from the buffer and increment the index.
            return inputBuffer[bufferIndex++];
        };
    })(); // Immediately invoked function expression for readInputLine
} else {
    // V8 (e.g., d8 shell) environment detected.
    // In V8, 'print' and 'readline' are usually global functions provided by the shell.
    // The main execution can start immediately as input is typically synchronous.
    primaryExecution();
}
