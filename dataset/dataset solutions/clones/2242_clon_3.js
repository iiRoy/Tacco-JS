// This module orchestrates the generation of a specific numeric sequence based on provided parameters.
// It reads raw string input, parses it, and then constructs a sequence where initial elements
// match a base value, and subsequent elements are derived from that base.
function processSequenceGeneration(inputString) {
    // Basic validation: Ensure the input is not empty or just whitespace.
    if (!inputString || inputString.trim().length === 0) {
        console.error("Error: Input string is empty or contains only whitespace.");
        return; // Exit early and log an error
    }

    // Prepare the input: Remove leading/trailing whitespace and split by one or more spaces.
    // Then, convert each resulting string part into a number. Using `Number` handles both integers and floats,
    // and also returns `NaN` for non-numeric strings, which will be caught by subsequent validation.
    const numericParts = inputString.trim().split(/\s+/).map(Number);

    // Destructure the required parameters from the parsed numeric array.
    // We expect at least three numerical values: sequence length, split point, and base value.
    const [totalElementsDesired, initialSegmentLength, baseNumericValue] = numericParts;

    // Further validation: Check if we successfully extracted the required number of parameters
    // and if they are indeed valid numbers.
    if (numericParts.length < 3 || isNaN(totalElementsDesired) || isNaN(initialSegmentLength) || isNaN(baseNumericValue)) {
        console.error("Error: Insufficient or invalid numeric parameters provided in input. Expected three numbers.");
        return; // Exit early
    }

    // Validate parameters to be positive for meaningful sequence generation.
    // `initialSegmentLength` can be zero, but `totalElementsDesired` should be positive.
    if (totalElementsDesired <= 0 || initialSegmentLength < 0) {
        console.error("Error: The total sequence length must be positive, and initial segment length cannot be negative.");
        return;
    }

    // Initialize an array to store the generated numeric sequence elements.
    // Building an array of elements and then joining them at the end is generally
    // more performant for many concatenations than repeated string additions.
    const generatedSequenceElements = [];

    // Define constants for the logic to improve readability and avoid magic numbers.
    const ONE_UNIT = 1;
    const ALTERNATIVE_VALUE_INCREMENT = baseNumericValue + ONE_UNIT;
    const ALTERNATIVE_VALUE_DECREMENT = baseNumericValue - ONE_UNIT;

    // Iterate `totalElementsDesired` times to construct the sequence.
    // The loop counter starts from zero, which is common for array-like indexing.
    for (let currentPosition = 0; currentPosition < totalElementsDesired; currentPosition++) {
        let valueForCurrentPosition; // This variable will hold the number to be added to the sequence for the current iteration.

        // Determine if the current element falls within the 'initialSegmentLength'.
        // Note: `currentPosition` is 0-indexed, `initialSegmentLength` is a count.
        if (currentPosition < initialSegmentLength) {
            // For elements within the initial segment, the value is simply the base numeric value.
            valueForCurrentPosition = baseNumericValue;
        } else {
            // For elements beyond the initial segment, a derived value is used.
            // If the base value is 1, use base + 1 (i.e., 2). Otherwise, use base - 1.
            // A ternary operator provides a concise way to express this conditional assignment.
            valueForCurrentPosition = (baseNumericValue === ONE_UNIT)
                                    ? ALTERNATIVE_VALUE_INCREMENT
                                    : ALTERNATIVE_VALUE_DECREMENT;
        }
        // Add the determined value to our sequence array.
        generatedSequenceElements.push(valueForCurrentPosition);
    }

    // Convert the array of numbers into a single space-separated string.
    // The `join(' ')` method inherently places the delimiter between elements
    // and does not add a trailing space, simplifying output formatting.
    const finalOutputString = generatedSequenceElements.join(' ');

    // Display the resulting sequence to the console as the final outcome of this process.
    console.log(finalOutputString);
}

// --- Standard input/output handling. Do not modify below this line. ---
// This section ensures the script can be run in a typical competitive programming environment
// by reading all data from standard input and passing it to our primary function.
processSequenceGeneration(require("fs").readFileSync("/dev/stdin", "utf8"));
// For local debugging or testing with a file, uncomment the line below and adjust the path:
// processSequenceGeneration(require('fs').readFileSync('./test_input.txt', 'utf-8'));