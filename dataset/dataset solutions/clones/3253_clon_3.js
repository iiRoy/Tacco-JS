"use strict"; // Enforce strict parsing and error handling for robust code execution

/**
 * Processes a raw input string to determine the number of steps
 * required for a given integer to reach 1 following the Collatz conjecture rules,
 * with specific handling for initial values of 1 and 2.
 * @param {string} rawInputContent - The complete input as a single string, typically from standard input.
 * @returns {string} A string containing the computed result, formatted for standard output.
 */
function CollatzSequenceProcessor(rawInputContent) {
    // Pre-process the input: split into individual lines and prepare for sequential access.
    // It is assumed that the first line of the input contains the primary number for computation.
    const availableInputLines = rawInputContent.trim().split('\n');
    let currentLineIndex = 0; // Pointer to track the next line to be read.

    /**
     * Retrieves the next sequential line from the prepared input array.
     * Includes a basic check to prevent reading beyond the available lines.
     * @returns {string} The next line of input, or an empty string if no more lines are available.
     */
    const retrieveNextInputLine = () => {
        // Guard against out-of-bounds access if more input is requested than provided.
        if (currentLineIndex >= availableInputLines.length) {
            return ""; // Return an empty string or throw an error in a production system.
        }
        return availableInputLines[currentLineIndex++];
    };

    // Initialize a dynamic array to accumulate all output strings before final assembly.
    const collectedOutputLines = [];

    /**
     * Adds a given value to the output collection, ensuring it's stored as a string.
     * This function serves as the primary method for generating output.
     * @param {any} valueToEmit - The data point to be added to the output buffer.
     */
    const appendResultToOutput = (valueToEmit) => {
        collectedOutputLines.push(String(valueToEmit)); // Explicitly convert to string.
    };

    // --- Core Algorithm: Collatz Sequence Step Calculation ---

    // Extract the initial numeric value from the first input line.
    const initialNumberString = retrieveNextInputLine();
    let currentProcessingValue = parseInt(initialNumberString, 10); // Parse as base-10 integer.

    // Implement robust input validation: ensure the number is a valid positive integer.
    // This is an added guard clause (Type III change) for increased reliability.
    if (isNaN(currentProcessingValue) || currentProcessingValue < 1) {
        appendResultToOutput("Error: Input must be a positive integer.");
        // Immediately return if input is invalid, preventing further computation.
        const errorOutput = collectedOutputLines.join('\n');
        console.log(errorOutput);
        return errorOutput;
    }

    // Address specific edge cases as per the problem's unique requirements.
    // For N=1 or N=2, the output is directly specified as 4 steps,
    // which deviates from a standard Collatz sequence count but matches the original logic.
    if (currentProcessingValue === 1 || currentProcessingValue === 2) {
        const fixedStepResult = 4; // Special predefined result for these inputs.
        appendResultToOutput(fixedStepResult);
    } else {
        // For numbers greater than 2, begin the Collatz sequence calculation.
        // The step counter is initialized to 2, consistent with the original problem's logic.
        let totalStepsAccumulated = 2; // Starting step count for N > 2.

        // Loop until the sequence reaches the value 1, following the Collatz conjecture.
        while (currentProcessingValue !== 1) {
            // Determine if the current number is odd or even using a bitwise AND operation.
            // This is an optimized check for oddness (Type III update).
            const isCurrentValueOdd = (currentProcessingValue & 1) === 1;

            if (isCurrentValueOdd) {
                // If the number is odd, apply the 3n + 1 rule.
                // An intermediate variable is used for clarity (Type III addition).
                const nextValueAfterOddRule = (3 * currentProcessingValue) + 1;
                currentProcessingValue = nextValueAfterOddRule;
            } else {
                // If the number is even, apply the n / 2 rule.
                // An intermediate variable is used for clarity (Type III addition).
                const nextValueAfterEvenRule = currentProcessingValue / 2;
                currentProcessingValue = nextValueAfterEvenRule;
            }
            // Increment the step counter for each transformation in the sequence.
            totalStepsAccumulated++;
        }
        // Once the sequence reaches 1, record the final count of steps.
        appendResultToOutput(totalStepsAccumulated);
    }

    // Finalize the output by joining all collected lines with newline characters.
    const finalRenderedOutput = collectedOutputLines.join('\n');
    console.log(finalRenderedOutput); // Print the result to the console (standard output).
    return finalRenderedOutput; // Also return the result string for programmatic use.
}

// Standard entry point for competitive programming environments:
// Reads all content from /dev/stdin and passes it to the main processing function.
CollatzSequenceProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));