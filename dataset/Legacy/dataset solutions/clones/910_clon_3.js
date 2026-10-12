#!/usr/bin/env node
var executeProgram = function() {
    let currentInputLineData;
    while (true) {
        let rawInputString = getNextInputLine();
        if (rawInputString === null) {
            break; // No more input lines available
        }
        currentInputLineData = rawInputString.split(' ').map(Number);

        let totalLength = currentInputLineData[0];
        if (totalLength === 0) {
            break; // Loop termination condition based on first number
        }
        let targetValue = currentInputLineData[1];

        // Calculate the number of iterations for the mapping process.
        // Original: 1 + (a/2^0) which simplifies to 1 + Math.floor(a/2) for positive 'a'.
        const halfLengthFloored = Math.floor(totalLength / 2);
        const calculationIterationCount = 1 + halfLengthFloored;

        // Generate an array of values based on the specified calculation.
        // This replaces the Array.apply(null, {length: ...}).map(...) pattern.
        const computedValues = Array.from({ length: calculationIterationCount }, (_, currentIdx) => {
            // Original calculation: Math.abs(b - Math.hypot(i, a - i))
            const hypotenuseResult = Math.hypot(currentIdx, totalLength - currentIdx);
            return Math.abs(targetValue - hypotenuseResult);
        });

        // Find the minimum value from the computed array.
        // Using spread syntax for Math.min is a modern equivalent to .apply(null, array).
        const minimumCalculatedResult = Math.min(...computedValues);
        outputResult(minimumCalculatedResult);
    }
};

// Input/Output handling section
if (typeof process !== 'undefined') {
    // Node.js environment specific I/O setup
    const outputResult = function(dataToLog) {
        console.log(dataToLog);
    };

    const getNextInputLine = (function() {
        let bufferedInputLines = [];
        let currentLineIndex = 0;
        let partialInputBuffer = "";

        // Helper function to process incoming data chunks
        const processIncomingData = (chunk, isEndOfStream = false) => {
            let combinedBuffer = partialInputBuffer + chunk;
            let lineSegments = combinedBuffer.split("\n");
            partialInputBuffer = lineSegments.pop(); // The last segment might be incomplete

            for (let idx = 0; idx < lineSegments.length; idx++) {
                if (lineSegments[idx].length > 0) { // Only push non-empty lines
                    bufferedInputLines.push(lineSegments[idx]);
                }
            }

            // If it's the end of the stream and there's a remaining partial line, add it
            if (isEndOfStream && partialInputBuffer.length > 0) {
                bufferedInputLines.push(partialInputBuffer);
                partialInputBuffer = ""; // Clear the buffer after final processing
            }
        };

        const stdinStream = process.openStdin();
        stdinStream.setEncoding('utf8');

        stdinStream.on('data', (inputChunk) => {
            processIncomingData(inputChunk);
        });

        stdinStream.on('end', () => {
            processIncomingData("", true); // Process any final buffered data
            executeProgram(); // Start the main program logic once all input is received
        });

        return function() {
            if (currentLineIndex < bufferedInputLines.length) {
                return bufferedInputLines[currentLineIndex++];
            }
            return null; // Indicate that no more lines are available
        };
    })();
} else {
    // V8 / other JavaScript environments (e.g., browser console, Deno, etc.)
    // Assumes `readline` and `print` are globally available or polyfilled.
    // In a pure V8 shell, `readline` and `print` are built-in.
    executeProgram();
}
