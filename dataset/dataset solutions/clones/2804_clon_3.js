"use strict"; // Enforces stricter parsing and error handling for cleaner code.

/**
 * Orchestrates the processing of numerical input to derive a specific sum.
 * This function reads configuration, generates a sequence, identifies an outlier,
 * removes it, and then calculates the total of the remaining elements.
 *
 * @param {string} inputPayload - The raw string input from the system, expected to contain
 *                                 numerical parameters on its first line.
 * @returns {void} The final computed sum is printed to the standard output.
 */
const processNumericalSequence = (inputPayload) => {
    // --- Phase 1: Input Data Acquisition and Robust Parsing ---
    // Validate the initial input for existence and type.
    if (typeof inputPayload !== 'string' || inputPayload.trim().length === 0) {
        console.error("Error: Received an empty or invalid input payload. Cannot proceed.");
        return; // Terminate execution gracefully.
    }

    // Split the input into lines, handling various newline characters.
    const inputLines = inputPayload.trim().split(/\r?\n/);

    // Ensure there's at least one line of configuration data.
    if (inputLines.length === 0) {
        console.error("Error: No configuration lines found in the provided input.");
        return;
    }

    // Parse the first line for critical parameters.
    // Use `Number` constructor for parsing to handle potential non-numeric strings more explicitly.
    const initialParameters = inputLines[0].split(/\s+/).map(Number);

    // Validate the parsed numerical parameters.
    if (initialParameters.length < 2 || initialParameters.some(isNaN)) {
        console.error("Error: The first line of input must contain exactly two valid numbers.");
        return;
    }

    // Destructure the parameters for clarity.
    const [elementCount, baseValue] = initialParameters; // N and L from the original problem

    // --- Phase 2: Sequence Generation with Guard Conditions ---
    // Guard against non-positive element counts, as a sum of zero elements is zero.
    if (elementCount <= 0) {
        console.log(0); // If no elements are to be generated, their sum is 0.
        return;
    }

    // Generate the sequence of values.
    // Original: (L + (i + 1)) - 1 simplifies to L + i.
    // Using `Array.from` for a functional, declarative approach to sequence creation.
    const generatedNumericSequence = Array.from({ length: elementCount }, (_, currentIterationIndex) => {
        const calculatedMagnitude = baseValue + currentIterationIndex;
        return calculatedMagnitude;
    });

    // --- Phase 3: Identifying the Element for Exclusion ---
    // Define a helper function for summing array elements.
    const sumArrayElements = (numericArray) => {
        // Use `reduce` for efficient summation, starting with an accumulator of 0.
        return numericArray.reduce((accumulatedSum, currentValue) => accumulatedSum + currentValue, 0);
    };

    let smallestAbsoluteMagnitudeFound = Infinity; // Tracks the smallest absolute value.
    let exclusionCandidateIndex = -1;             // Stores the index of the element to be removed.

    // Iterate through the generated sequence to find the element with the smallest absolute value.
    // Using `forEach` loop as an alternative iteration style.
    generatedNumericSequence.forEach((currentElementValue, currentIndex) => {
        const absoluteValueOfCurrentElement = Math.abs(currentElementValue);

        // If a smaller absolute value is found, update the tracker.
        if (absoluteValueOfCurrentElement < smallestAbsoluteMagnitudeFound) {
            smallestAbsoluteMagnitudeFound = absoluteValueOfCurrentElement;
            exclusionCandidateIndex = currentIndex;
        }
        // In case of ties (equal absolute values), the first encountered element is chosen,
        // mirroring the original code's behavior due to the '<' comparison.
    });

    // --- Phase 4: Final Calculation and Output ---
    // If no suitable element was found (e.g., due to an empty sequence, though guarded earlier),
    // sum all elements without exclusion.
    if (exclusionCandidateIndex === -1) {
        console.log(sumArrayElements(generatedNumericSequence));
        return;
    }

    // Create a new array to perform the removal, preserving the original sequence if needed elsewhere.
    const postExclusionSequence = [...generatedNumericSequence]; // Spreading creates a shallow copy.

    // Remove the identified element using its index.
    postExclusionSequence.splice(exclusionCandidateIndex, 1);

    // Calculate the sum of the remaining elements.
    const finalResultingSum = sumArrayElements(postExclusionSequence);

    // Output the computed sum.
    console.log(finalResultingSum);
};

// --- Entry Point for Script Execution ---
// This block handles reading input from stdin and invoking the main processing function.
try {
    // Utilize `node:fs` for explicit module referencing, common in modern Node.js.
    // Specify encoding and flag for clarity and robustness.
    const systemStandardInput = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });
    processNumericalSequence(systemStandardInput);
} catch (runtimeError) {
    // Catch any errors during file reading or processing and report them.
    console.error("An unexpected error occurred during script execution:", runtimeError.message);
    // For debugging, `console.error(runtimeError.stack);` could be added.
}