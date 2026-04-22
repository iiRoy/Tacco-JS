const processInputData = function() {
    let currentInputData; // Renamed 'arg' from original
    let firstParsedValue; // To hold the value used for the loop condition
    let fetchedLineContent; // To store the raw line read from input

    // Main processing loop: continues until a specific termination condition is met.
    while (true) {
        fetchedLineContent = retrieveInputLine(); // Renamed 'readline'

        // Check if there are no more lines to read from the input stream.
        if (fetchedLineContent === null) {
            // This condition signifies the end of available input.
            break;
        }

        // Parse the fetched line: split by space and convert parts to numbers.
        currentInputData = fetchedLineContent.split(' ').map(Number);

        // Extract the first value to check the loop termination condition.
        firstParsedValue = currentInputData[0];

        // The original logic terminates if the first number on the line is zero.
        if (firstParsedValue === 0) {
            break; // Exit the loop as per the original problem's end-of-input signal.
        }

        // --- Type III Addition: Input Validation and Guard Clause ---
        // Ensure that we have at least two numbers and they are valid numerical values.
        if (currentInputData.length < 2 || isNaN(firstParsedValue) || isNaN(currentInputData[1])) {
            reportError("Detected an invalid or incomplete input line. Skipping processing for this line.");
            continue; // Skip to the next line of input.
        }

        // Rename variables for better clarity, corresponding to 'a' and 'b' in the original.
        const primarySegmentLength = firstParsedValue;       // Corresponds to 'a'
        const targetHypotenuseValue = currentInputData[1]; // Corresponds to 'b'

        // Calculate the effective upper bound for our iteration.
        // Original: 1 + (a/2^0) which is equivalent to 1 + Math.floor(a/2)
        const iterationMaximum = Math.floor(primarySegmentLength / 2);
        // The number of values to generate in the array (e.g., for a=5, max=2, values for i=0,1,2 -> count=3)
        const numberOfValuesToGenerate = 1 + iterationMaximum;

        // --- Type III Structural Change: Explicit Array Construction ---
        // Instead of a single-line Array.apply().map() expression, build the array step-by-step for clarity.
        const calculatedAbsoluteDifferences = [];
        calculatedAbsoluteDifferences.length = numberOfValuesToGenerate; // Pre-allocate array size for efficiency (optional)

        // Iterate from 0 up to the calculated maximum split point.
        for (let currentSplitPoint = 0; currentSplitPoint <= iterationMaximum; ++currentSplitPoint) {
            // Calculate the length of the second segment.
            const complementarySegmentLength = primarySegmentLength - currentSplitPoint;

            // Compute the hypotenuse formed by these two segments using Pythagorean theorem.
            const resultingHypotenuse = Math.hypot(currentSplitPoint, complementarySegmentLength);

            // Calculate the difference between the target value and the computed hypotenuse.
            const differenceFromTarget = targetHypotenuseValue - resultingHypotenuse;

            // Store the absolute difference to our collection at the correct index.
            calculatedAbsoluteDifferences[currentSplitPoint] = Math.abs(differenceFromTarget);
        }

        // Find the minimum value among all calculated absolute differences.
        // Using the spread operator for Math.min is a modern and cleaner equivalent to .apply().
        const minimumCalculatedDifference = Math.min(...calculatedAbsoluteDifferences);

        // Display the final result for the current input set.
        outputResult(minimumCalculatedDifference);
    }
};

/// --- Input/Output Management Module ---
// This section handles the environment-specific I/O operations.

// Check if we are running in a Node.js environment using process object availability.
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    // --- Output Function for Node.js ---
    /**
     * Displays output to the console. Can optionally flag output as an error.
     * @param {any} messageContent - The content to be displayed.
     * @param {boolean} [isErrorMessage=false] - True if this message should be treated as an error.
     */
    const outputResult = function(messageContent, isErrorMessage = false) { // Renamed 'print'
        if (isErrorMessage) {
            console.error("[APPLICATION_ERROR]:", String(messageContent)); // Using console.error for errors
        } else {
            console.log(String(messageContent)); // Ensuring output is stringified
        }
    };

    /**
     * Reports an error message to the console. A specialized wrapper for outputResult.
     * @param {string} errorText - The error message string.
     */
    const reportError = function(errorText) {
        outputResult(errorText, true);
    };

    // --- Input Reading Mechanism for Node.js ---
    const retrieveInputLine = (function() { // Renamed 'readline'
        const storedInputLines = []; // Renamed 'T' for line storage
        let currentReadIndex = 0; // Renamed 'cnt' for tracking read position
        let uncompletedInputFragment = ""; // Renamed 'input_fragment' for partial lines

        // Helper function to process raw data chunks from stdin.
        const processRawInput = (incomingDataChunk) => {
            const combinedData = uncompletedInputFragment + incomingDataChunk;
            const currentLineParts = combinedData.split("\n"); // Renamed 'ref'

            uncompletedInputFragment = currentLineParts.pop(); // Store the last potentially incomplete line.

            for (let partIdx = 0; partIdx < currentLineParts.length; ++partIdx) { // Renamed 'i'
                const lineContent = currentLineParts[partIdx].trim(); // Trim leading/trailing whitespace.
                if (lineContent.length > 0) { // Only store non-empty lines after trimming.
                    storedInputLines.push(lineContent);
                }
            }
        };

        const standardInputSource = process.stdin; // Renamed 'stdin'
        standardInputSource.setEncoding('utf8'); // Ensure proper character encoding for input.

        // Event listener for incoming data chunks.
        standardInputSource.on('data', processRawInput);

        // Event handler for when the input stream ends.
        standardInputSource.on('end', () => {
            // Process any remaining data in the buffer as a final line.
            if (uncompletedInputFragment.length > 0) {
                processRawInput(uncompletedInputFragment + "\n"); // Append newline to ensure processing as a full line.
                uncompletedInputFragment = ""; // Clear the buffer.
            }
            // Once all input is received and processed, initiate the main application logic.
            processInputData();
        });

        // --- Type III Addition: Input Stream Error Handling ---
        standardInputSource.on('error', (err) => {
            reportError(`An unexpected error occurred with the input stream: ${err.message}`);
            // In a production application, more robust error recovery or process termination might be needed.
            process.exit(1); // Terminate the process on critical I/O error.
        });

        // The public API function for reading a single line.
        return function() {
            if (currentReadIndex >= storedInputLines.length) {
                return null; // Signal that no more lines are available for reading.
            }
            // Return the next available line and advance the read pointer.
            return storedInputLines[currentReadIndex++];
        };
    })();

} else {
    // --- Fallback for Non-Node.js Environments (e.g., V8 shell, browser console) ---
    // In environments like the V8 shell, 'readline' and 'print' are often globally available.
    // For a Type III clone, we'll define wrappers to match our chosen function names,
    // assuming these globals exist or providing a basic fallback.

    const outputResult = typeof print === 'function' ? print : console.log; // Use global print or console.log
    const retrieveInputLine = typeof readline === 'function' ? readline : () => {
        outputResult("Warning: readline function not found in this environment. Input will be unavailable.", true);
        return null; // Indicate no input can be read
    };
    const reportError = (msg) => outputResult(msg, true); // Simple error reporter for this branch

    // Directly call the main processing logic as input is assumed to be synchronous or pre-loaded
    // in such environments. This branch is simplified as the Node.js implementation is the primary focus.
    processInputData();
}