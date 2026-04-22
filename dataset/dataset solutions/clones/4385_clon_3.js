'use strict';

/**
 * Utility function to obtain input data from the standard input stream.
 * This abstracts the file system interaction for cleaner separation of concerns.
 * @returns {string} The raw string content read from stdin.
 */
const acquireSystemInput = () => {
    // Ensuring UTF-8 encoding for reliable text processing.
    // This function mimics the original script's input source.
    return require("fs").readFileSync("/dev/stdin", "utf8");
};

/**
 * Processes a given string input to perform specific array manipulations
 * and counts the number of operations executed.
 *
 * @param {string} rawInputString - The complete raw input as a string,
 *                                  expected to contain multiple lines.
 */
function orchestrateArrayTransform(rawInputString) {
    // Type III: Initial validation for input data integrity.
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Input processing aborted: Received an invalid or empty input string.");
        return;
    }

    // Type II: Renamed variables and added more descriptive comments.
    // Type III: Enhanced input parsing with filtering and explicit radix for robustness.
    const allInputLines = rawInputString.split('\n');

    // Type III: Guard clause to ensure sufficient input lines are present.
    if (allInputLines.length < 2) {
        console.warn("Insufficient data lines detected. Expected at least two lines for processing.");
        return;
    }

    // Extracting the numeric sequence from the second line of input.
    // Filtering out any empty strings that might result from multiple spaces.
    const numericalElements = allInputLines[1]
                                            .split(' ')
                                            .filter(str => str.trim() !== '') // Ensure no empty strings from multiple spaces
                                            .map(numStr => parseInt(numStr, 10)); // Explicitly parse as base-10 integers

    let totalSwapCount = 0; // Type II: Renamed 'count' to 'totalSwapCount'.

    /**
     * Helper function to safely swap two elements within an array.
     * @param {Array<number>} targetArray - The array on which to perform the swap.
     * @param {number} indexA - The index of the first element.
     * @param {number} indexB - The index of the second element.
     * @returns {boolean} True if the swap was successful, false otherwise (e.g., invalid indices).
     */
    const performElementSwap = (targetArray, indexA, indexB) => {
        // Type III: Added boundary checks within the helper function for safety.
        if (indexA < 0 || indexA >= targetArray.length ||
            indexB < 0 || indexB >= targetArray.length) {
            // console.warn(`Attempted swap with out-of-bounds indices: ${indexA}, ${indexB}. Swap skipped.`); // For debugging
            return false;
        }
        // Type II: Renamed 'tmp' to 'tempStore'.
        let tempStore = targetArray[indexA];
        targetArray[indexA] = targetArray[indexB];
        targetArray[indexB] = tempStore;
        return true;
    };

    // Type II: Renamed loop variable 'i' to 'currentElementIndex'.
    // Iterating through each element of the numeric sequence.
    for (let currentElementIndex = 0; currentElementIndex < numericalElements.length; currentElementIndex++) {
        // Type III: Introduce an intermediate variable for clarity on the expected value.
        const oneBasedExpectedValue = currentElementIndex + 1;

        // The core condition: if the current element's value matches its 1-based index.
        if (numericalElements[currentElementIndex] === oneBasedExpectedValue) {
            // Type III: Define indices for potential swap targets.
            const nextElementIndex = currentElementIndex + 1;
            const previousElementIndex = currentElementIndex - 1;

            // Retrieve the value of the next element, which might be undefined if out of bounds.
            const valueAtNextPosition = numericalElements[nextElementIndex];

            // Type III: Rewriting the original `if(tmp)` logic more explicitly.
            // Original `if(tmp)` evaluated true if `nums[i+1]` was not 0, undefined, null, etc.
            // Here, we check if `nextElementIndex` is within bounds AND `valueAtNextPosition` is not 0.
            if (nextElementIndex < numericalElements.length && valueAtNextPosition !== 0) {
                // This branch corresponds to the original `if (tmp)` where `tmp` was truthy.
                if (performElementSwap(numericalElements, currentElementIndex, nextElementIndex)) {
                    totalSwapCount++;
                }
            } else {
                // This branch corresponds to the original `else` where `tmp` was falsy (e.g., next element is 0 or out of bounds).
                // In this case, the original code attempts to swap with the previous element.
                // Type III: Explicitly check if the previous index is valid.
                if (previousElementIndex >= 0) {
                    if (performElementSwap(numericalElements, currentElementIndex, previousElementIndex)) {
                        totalSwapCount++;
                    }
                }
                // Type III: Could add a comment here about no swap if previousElementIndex is also invalid.
            }
        }
    }

    // Type II: Renamed variable and used a template literal for output.
    // Type III: Added a descriptive prefix to the final output message.
    console.log(`Final tally of necessary swaps: ${totalSwapCount}`);
}

// Type III: Encapsulate the application's entry point within an Immediately Invoked Function Expression (IIFE).
// This pattern helps to manage scope and clearly define the execution flow.
(function initializeAndExecute() {
    // Type III: A common Node.js pattern to ensure code only runs when directly executed as a script.
    if (typeof require !== 'undefined' && require.main === module) {
        try {
            const applicationInput = acquireSystemInput(); // Type III: Using the helper function for input.
            orchestrateArrayTransform(applicationInput); // Type II: Calling the renamed main function.
        } catch (executionError) {
            // Type III: Basic error handling for robustness.
            console.error("An unhandled error occurred during script execution:", executionError.message);
            // Optionally, log the full stack trace for debugging purposes.
            // console.error(executionError.stack);
        }
    } else {
        // Type III: Informative message if the script is imported as a module rather than run directly.
        console.log("This script is designed to be run directly and was loaded as a module. Main logic skipped.");
    }
})();