// This script processes numerical input lines to find an optimal difference.
// It supports both Node.js and V8 (e.g., d8 shell) environments for I/O.

// --- Global I/O Functions (Type II: Renamed & Restructured) ---
let displayValue;
let retrieveLine;

// Determine the execution environment and set up I/O accordingly.
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    // Node.js specific implementation for output.
    displayValue = function(valueToOutput) {
        console.log(valueToOutput);
    };

    let bufferedInputLines = []; // Stores complete lines read from stdin.
    let currentReadIndex = 0;    // Pointer for reading lines from bufferedInputLines.
    let pendingInputFragment = ""; // Stores partial lines when data chunks arrive.
    let isInputCollectionComplete = false; // Flag indicating if all stdin data has been received.

    // A Promise to manage asynchronous input collection.
    const inputPreparationPromise = new Promise((resolve) => {
        const standardInputSource = process.openStdin();
        standardInputSource.setEncoding('utf8');

        // Event listener for incoming data chunks.
        standardInputSource.on('data', (inputChunk) => {
            const combinedChunk = pendingInputFragment + inputChunk;
            const lineSegments = combinedChunk.split("\n");
            // The last segment might be incomplete; store it for the next chunk.
            pendingInputFragment = lineSegments.pop();

            // Process all complete lines.
            for (const segment of lineSegments) {
                const trimmedSegment = segment.trim();
                // Only buffer non-empty lines after trimming whitespace.
                if (trimmedSegment.length > 0) {
                    bufferedInputLines.push(trimmedSegment);
                }
            }
        });

        // Event listener for the end of the input stream.
        standardInputSource.on('end', () => {
            // Process any remaining fragment as a final line.
            if (pendingInputFragment.length > 0) {
                const finalSegments = pendingInputFragment.split("\n");
                for (const segment of finalSegments) {
                    const trimmedSegment = segment.trim();
                    if (trimmedSegment.length > 0) {
                        bufferedInputLines.push(trimmedSegment);
                    }
                }
            }
            isInputCollectionComplete = true; // Mark input as fully collected.
            resolve(); // Resolve the promise, signaling that core logic can begin.
        });

        // Basic error handling for the input stream.
        standardInputSource.on('error', (err) => {
            console.error("An error occurred during input stream processing:", err);
            isInputCollectionComplete = true; // Attempt to prevent indefinite waiting.
            resolve(); // Resolve even on error to allow program to continue or terminate gracefully.
        });
    });

    // Node.js specific implementation for reading lines.
    retrieveLine = function() {
        if (currentReadIndex < bufferedInputLines.length) {
            return bufferedInputLines[currentReadIndex++];
        }
        // If all buffered lines are read and input collection is complete, return null.
        if (isInputCollectionComplete) {
            return null;
        }
        // This state should ideally not be reached if `executeCoreLogic` waits for `inputPreparationPromise`.
        return null;
    };

    // For Node.js, defer the execution of the core logic until all input is ready.
    inputPreparationPromise.then(() => {
        executeCoreLogic();
    });

} else {
    // V8 (e.g., d8 shell) environment or other non-Node.js environments.
    // Assumes global 'print' and 'readline' functions are available.
    displayValue = typeof print !== 'undefined' ? print : console.log;
    retrieveLine = typeof readline !== 'undefined' ? readline : () => null;

    // In V8, input is typically synchronous, so execute core logic immediately.
    executeCoreLogic();
}

/**
 * Main function containing the core computational logic.
 * It reads input lines, processes numerical pairs, and calculates a minimum difference.
 *
 * @function
 * @returns {void}
 */
const executeCoreLogic = function() {
    let currentInputLine;

    // Loop indefinitely until a termination condition is met (no more input or specific input value).
    while (true) {
        currentInputLine = retrieveLine(); // Attempt to fetch the next line of input.

        // If no more input lines are available, terminate the processing loop.
        if (currentInputLine === null) {
            break;
        }

        // Parse the line: split by space and convert parts to numbers.
        const numericalComponents = currentInputLine.split(' ').map(Number);

        // Termination condition: If the line is empty, or the first number is zero.
        // The original logic implicitly handles cases where `numericalComponents[0]` is falsy (like 0 or NaN).
        if (numericalComponents.length === 0 || numericalComponents[0] === 0) {
            break;
        }

        // Extract the two primary numerical values for the current problem instance.
        const primaryValue = numericalComponents[0];    // Corresponds to 'a' in original.
        const secondaryValue = numericalComponents[1];  // Corresponds to 'b' in original.

        // Initialize the minimum difference to positive infinity to ensure any valid difference will be smaller.
        let minimumDifferenceFound = Number.POSITIVE_INFINITY;

        // The inner loop iterates through possible integer values for one leg of a right triangle.
        // The loop limit is half of the primaryValue, as (i, primaryValue - i) covers all unique pairs.
        const iterationLimit = Math.floor(primaryValue / 2);

        // If primaryValue is negative, iterationLimit will be negative, and the loop will not execute.
        // In this case, minimumDifferenceFound will remain Number.POSITIVE_INFINITY,
        // which is a reasonable outcome for input outside the expected positive range.

        for (let legA = 0; legA <= iterationLimit; legA++) {
            const legB = primaryValue - legA; // Calculate the length of the second leg.

            // Calculate the hypotenuse using the Pythagorean theorem.
            const calculatedHypotenuse = Math.hypot(legA, legB);

            // Determine the absolute difference between the target secondaryValue and the calculated hypotenuse.
            const currentAbsoluteDelta = Math.abs(secondaryValue - calculatedHypotenuse);

            // Update the overall minimum difference if the current delta is smaller.
            minimumDifferenceFound = Math.min(minimumDifferenceFound, currentAbsoluteDelta);
        }
        // Output the smallest difference found for the current set of input values.
        displayValue(minimumDifferenceFound);
    }
};