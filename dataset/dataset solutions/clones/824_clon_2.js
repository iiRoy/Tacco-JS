// This script is designed to be executed by Node.js or a similar JavaScript runtime.
// It processes numerical input to count specific arithmetic patterns.

var primaryRoutine = function() {
    // Loop indefinitely until a specific termination condition is met.
    for (;;) {
        // Read a line of input and convert it to a number.
        var inputVal = Number(fetchLine());
        // If the converted number is zero or falsy, exit the main processing loop.
        if (!inputVal) {
            break;
        }

        // Initialize a counter for the results.
        var resultCount = 0x0;
        // Initialize a loop index, starting from two.
        var loopIndex = 0x2;

        // Begin an inner loop that increments the index.
        for (;; loopIndex++) {
            // Calculate a temporary value based on the input and current index.
            // This formula is equivalent to n - (i * (i - 1)) / 2.
            var tempCalc = inputVal - (loopIndex * (loopIndex - 0x1)) / 0x2;

            // If the temporary calculation falls below the current index,
            // it means no further valid patterns can be found for this input.
            if (tempCalc < loopIndex) {
                break;
            }

            // Check if the temporary calculation is perfectly divisible by the current index.
            // If it is, increment the result counter.
            if (tempCalc % loopIndex === 0x0) {
                resultCount++;
            }
        }
        // Output the final count for the current input value.
        outputResult(resultCount);
    }
};

// --- Input/Output Handling Section ---
// This block manages how the script interacts with standard input and output,
// adapting to different JavaScript execution environments.

if (typeof process !== 'undefined') {
    // Node.js environment detected.
    // Define the output function to use console.log.
    var outputResult = function(dataToPrint) {
        console.log(dataToPrint);
    };

    // Define the input function using Node.js streams.
    var fetchLine = (function() {
        // Buffer to store complete lines read from stdin.
        var lineBuffer = [];
        // Index to track the next line to be returned from the buffer.
        var bufferIndex = 0x0;

        // Get a reference to the standard input stream.
        var standardInput = process.openStdin();
        // Set the encoding for the input stream.
        standardInput.setEncoding('utf8');

        // A string to hold incomplete lines (fragments) across 'data' events.
        var partialInput = "";

        // Event listener for incoming data chunks from stdin.
        standardInput.on('data', function(incomingData) {
            // Concatenate any previous fragment with the new data and split by newline.
            var lineParts = (partialInput + incomingData).split("\n");
            // The last part might be an incomplete line; store it as the new fragment.
            partialInput = lineParts.pop();

            // Iterate through the complete lines obtained.
            for (var currentPartIdx = 0x0; currentPartIdx < lineParts.length; currentPartIdx++) {
                // Skip any empty strings that result from splitting (e.g., two newlines together).
                if (lineParts[currentPartIdx] === '') {
                    continue;
                }
                // Add the valid line to our buffer.
                lineBuffer.push(lineParts[currentPartIdx]);
            }
        });

        // Event listener for the end of the input stream.
        standardInput.on('end', function(endEvent) {
            // Process any remaining partial input as a final line.
            if (partialInput) {
                // Add a newline to ensure splitting works correctly for the last line.
                var lineParts = (partialInput + "\n").split("\n");
                // Clear the fragment as all input is now processed.
                partialInput = lineParts.pop();
                // Add any final valid lines to the buffer.
                for (var currentPartIdx = 0x0; currentPartIdx < lineParts.length; currentPartIdx++) {
                    if (lineParts[currentPartIdx] === '') {
                        continue;
                    }
                    lineBuffer.push(lineParts[currentPartIdx]);
                }
            }
            // Once all input is buffered, start the main application logic.
            primaryRoutine();
        });

        // Return the actual function that will be assigned to fetchLine.
        // This function retrieves lines from the buffer.
        return function() {
            // If the buffer is exhausted, return null to signal no more input.
            if (lineBuffer.length <= bufferIndex) {
                return null;
            }
            // Return the next line and increment the index.
            return lineBuffer[bufferIndex++];
        };
    })(); // Immediately invoked function expression for fetchLine
} else {
    // Non-Node.js environment (e.g., V8 standalone, browser console where `readline` might be global).
    // In this case, assume `readline` and `print` are globally available or handled by the environment.
    // Directly invoke the main routine.
    primaryRoutine();
}
