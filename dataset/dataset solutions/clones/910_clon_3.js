//usr/bin/env node $0 $@;exit
// This script processes numerical input pairs to find a specific minimum geometric distance.
// It supports execution in both Node.js and V8 environments.

// --- Core Processing Logic ---
// This function encapsulates the main algorithm for calculating the minimum distance.
var processNumericalInputs = function() {
    let currentInputPair; // Stores the parsed numerical values from a line
    // Helper function to parse a string line into an array of numbers
    const parseLineIntoNumbers = (lineString) => lineString.split(' ').map(Number);

    // Loop indefinitely until a specific termination condition is met
    while (true) {
        // Attempt to retrieve the next line of input
        let rawInputLine = retrieveNextInputLine(); // Renamed 'readline' to 'retrieveNextInputLine'
        
        // Guard clause: if no more input lines are available, exit the loop
        if (rawInputLine === null) {
            break;
        }

        // Parse the raw input line into its numerical components
        currentInputPair = parseLineIntoNumbers(rawInputLine);

        const firstComponent = currentInputPair[0]; // Represents 'a' from the original code
        const secondTarget = currentInputPair[1];   // Represents 'b' from the original code

        // Termination condition: if the first number in the pair is zero, stop processing
        if (firstComponent === 0) {
            break;
        }

        // Calculate the upper bound for the iteration loop.
        // Original: 1 + (a / 2 ^ 0) which simplifies to 1 + floor(a / 2).
        const iterationUpperBound = 1 + Math.floor(firstComponent / 2);

        let minimumCalculatedDistance = Infinity; // Initialize with a very large value to find the true minimum

        // Iterate from 0 up to (but not including) iterationUpperBound
        // This loop replaces the original Array.map and Math.min.apply pattern
        for (let currentIterationIndex = 0; currentIterationIndex < iterationUpperBound; ++currentIterationIndex) { // Renamed 'i'
            // Calculate the complementary part for the hypotenuse calculation
            const complementaryCoordinate = firstComponent - currentIterationIndex;

            // Calculate the hypotenuse (distance from origin to point (currentIterationIndex, complementaryCoordinate))
            // This is equivalent to Math.hypot(currentIterationIndex, complementaryCoordinate)
            const calculatedHypotenuse = Math.sqrt(
                currentIterationIndex * currentIterationIndex +
                complementaryCoordinate * complementaryCoordinate
            );

            // Determine the absolute difference between the target value and the calculated hypotenuse
            const currentGeometricDistance = Math.abs(secondTarget - calculatedHypotenuse);

            // Update the minimum distance found so far if the current one is smaller
            if (currentGeometricDistance < minimumCalculatedDistance) {
                minimumCalculatedDistance = currentGeometricDistance;
            }
        }

        // Output the smallest distance found for the current input pair
        outputToConsole(minimumCalculatedDistance); // Renamed 'print' to 'outputToConsole'
    }
};

// --- Input/Output Management Section ---
// This section dynamically sets up I/O functions based on the execution environment (Node.js or V8/browser).

let outputToConsole;        // Function to handle output (e.g., console.log or global print)
let retrieveNextInputLine;  // Function to retrieve the next line of input (e.g., buffered stdin or global readline)

// Check for Node.js environment by verifying the 'process' object and its 'versions.node' property
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    // --- Node.js specific I/O setup ---

    // Map our internal output function to Node.js's console.log
    outputToConsole = function(dataToLog) {
        console.log(dataToLog);
    };

    // Implement 'retrieveNextInputLine' for Node.js using stdin event listeners
    retrieveNextInputLine = (function() {
        let bufferedInputLines = [];    // Array to store fully received input lines
        let readPointer = 0;            // Index of the next line to be read from the buffer
        let incompleteLineFragment = '';// Stores partial lines received from 'data' events

        // Access the standard input stream
        const standardInputHandle = process.stdin;
        standardInputHandle.setEncoding('utf8'); // Ensure input is treated as UTF-8 text

        // Event listener for incoming data chunks from stdin
        standardInputHandle.on('data', function(incomingDataChunk) {
            // Concatenate any previous incomplete line with the new chunk
            const combinedData = incompleteLineFragment + incomingDataChunk;
            // Split the combined data by newline characters
            const segments = combinedData.split('\n');

            // The last segment might be an incomplete line, store it for the next chunk
            incompleteLineFragment = segments.pop();

            // Process all complete segments, adding non-empty, trimmed lines to the buffer
            segments.forEach(lineSegment => {
                const processedLine = lineSegment.trim(); // Remove leading/trailing whitespace
                if (processedLine.length > 0) { // Only add non-empty lines
                    bufferedInputLines.push(processedLine);
                }
            });
        });

        // Event listener for the end of the input stream
        standardInputHandle.on('end', function() {
            // After all data is received, process any remaining incomplete line fragment
            if (incompleteLineFragment.length > 0) {
                const finalProcessedLine = incompleteLineFragment.trim();
                if (finalProcessedLine.length > 0) {
                    bufferedInputLines.push(finalProcessedLine);
                }
            }
            // Once all input is buffered, initiate the main processing logic
            processNumericalInputs();
        });

        // The actual function returned by the IIFE, called by 'retrieveNextInputLine'
        return function() {
            // If there are lines in the buffer, return the next one and advance the pointer
            if (readPointer < bufferedInputLines.length) {
                return bufferedInputLines[readPointer++];
            }
            // If the buffer is exhausted, return null to signal end of input
            return null;
        };
    })(); // Immediately invoked function expression
} else {
    // --- V8 (e.g., d8 shell) or other non-Node.js environment setup ---
    // In these environments, 'readline()' and 'print()' are typically global functions.

    // Map our internal output function to the global 'print'
    outputToConsole = function(dataToLog) {
        // Assuming 'print' is globally available
        print(dataToLog);
    };

    // Map our internal input function to the global 'readline'
    retrieveNextInputLine = function() {
        // Assuming 'readline' is globally available
        return readline();
    };

    // In V8, input is typically synchronous, so we can call the main logic directly.
    processNumericalInputs();
}