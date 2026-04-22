function processNumericalSequence(initialValuesString) {
    // Define symbolic constants to improve readability and maintainability.
    const MAX_TRANSFORMATION_CYCLES = 1000;
    const SEQUENCE_NON_TERMINATING_CODE = -1;
    const INPUT_VALUE_DELIMITER = " ";
    const HALF_FACTOR = 0.5; // Represents division by 2

    // Step 1: Parse the input string into a collection of numerical values.
    // This involves trimming any leading/trailing whitespace from the entire string,
    // splitting it by the defined delimiter, filtering out any empty string tokens
    // that might result from multiple delimiters or leading/trailing delimiters,
    // and then converting each token into a floating-point number.
    let currentNumericalSequence = initialValuesString
                                    .trim()
                                    .split(INPUT_VALUE_DELIMITER)
                                    .filter(token => token.length > 0) // Ensures no empty strings are mapped to numbers
                                    .map(stringValue => parseFloat(stringValue)); // Robustly converts to number

    // Initialize a counter to track the number of successful transformation cycles.
    let completedCycleCount = 0;

    // Helper function to ascertain if all elements within a given array are even.
    // This adds a layer of abstraction and improves code modularity.
    const checkAllElementsForEvenness = (numberArray) => {
        // A basic validation to ensure we are working with an array of numbers.
        // If any element is not a finite number (e.g., NaN, Infinity), it's considered not "even".
        if (!Array.isArray(numberArray) || numberArray.some(val => !Number.isFinite(val))) {
            return false;
        }
        return numberArray.every(value => value % 2 === 0);
    };

    // Step 2: Execute the core transformation loop.
    // The loop continues as long as two conditions are met:
    // 1. All numbers in the sequence are even.
    // 2. The maximum allowed number of transformation cycles has not been reached.
    while (checkAllElementsForEvenness(currentNumericalSequence) && completedCycleCount < MAX_TRANSFORMATION_CYCLES) {
        // Before modifying the sequence, capture its current state.
        // This is crucial because all calculations for the new sequence state
        // must be based on the values from the *beginning* of the current cycle.
        // The spread syntax `...` creates a shallow copy of the array.
        let valuesFromPreviousState = [...currentNumericalSequence];

        // Extract individual values for clarity in the transformation logic.
        // This avoids repetitive indexing and makes the formulas easier to read.
        let firstElementValue = valuesFromPreviousState[0];
        let secondElementValue = valuesFromPreviousState[1];
        let thirdElementValue = valuesFromPreviousState[2];

        // Apply the specific transformation rules to update the sequence.
        // Multiplication by HALF_FACTOR (0.5) is used as an alternative to division by 2.
        currentNumericalSequence[0] = (secondElementValue * HALF_FACTOR) + (thirdElementValue * HALF_FACTOR);
        currentNumericalSequence[1] = (firstElementValue * HALF_FACTOR) + (thirdElementValue * HALF_FACTOR);
        // Note: The third element's transformation rule `input[2] = mem[1]/2+mem[2]/2;`
        // from the original code is replicated precisely here.
        currentNumericalSequence[2] = (secondElementValue * HALF_FACTOR) + (thirdElementValue * HALF_FACTOR);

        // Increment the cycle counter after a successful transformation.
        completedCycleCount++;
    }

    // Step 3: Determine and output the final result code.
    // If the loop terminated because the maximum cycle limit was reached,
    // it implies the sequence did not converge or terminate naturally within the limit.
    let finalOutputCode;
    if (completedCycleCount === MAX_TRANSFORMATION_CYCLES) {
        finalOutputCode = SEQUENCE_NON_TERMINATING_CODE;
    } else {
        // Otherwise, the loop terminated because the "all even" condition failed,
        // meaning the sequence stabilized or became odd.
        // The `completedCycleCount` holds the number of transformations performed.
        finalOutputCode = completedCycleCount;
    }

    // Print the final calculated result to standard output.
    console.log(finalOutputCode);
}

// The following code block handles reading input from the environment.
// This is typically for competitive programming setups where input comes from stdin.
try {
    const fileSystemModule = require("fs");
    const standardInputFilePath = "/dev/stdin";
    const characterEncoding = "utf8";

    // Read the entire content of the standard input file.
    const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, characterEncoding);

    // Prepare the input by trimming any extraneous whitespace.
    const processedInputForFunction = rawInputContent.trim();

    // Invoke the primary sequence processing function with the prepared input.
    processNumericalSequence(processedInputForFunction);
} catch (error) {
    // Basic error handling for environments where fs module or /dev/stdin might not be available.
    // In a typical competitive programming setup, this block might be omitted.
    console.error("An error occurred during input processing:", error.message);
}