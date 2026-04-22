// This function processes raw string input to compute the Nth Lucas number.
// It handles input parsing, validation, and iterative calculation for the sequence.
function processInputAndDetermineLucasValue(rawInputText) {
    // Extract the first non-empty line from the input string and attempt to parse it as an integer.
    const firstLineOfInput = rawInputText.trim().split('\n')[0];
    const targetSequencePosition = parseInt(firstLineOfInput, 10);

    // Perform basic validation on the parsed input.
    // The Lucas sequence is typically defined for non-negative integer indices.
    if (isNaN(targetSequencePosition) || targetSequencePosition < 0) {
        console.error("Input error: Please provide a valid non-negative integer for the sequence position.");
        return; // Exit the function if the input is invalid.
    }

    // Define constants for the initial values of the Lucas sequence: L(0) = 2, L(1) = 1.
    // Using BigInt literals (e.g., 2n, 1n) for direct BigInt type assignment,
    // which is necessary for potentially large numbers.
    const LUCAS_INITIAL_ZERO = 2n;
    const LUCAS_INITIAL_ONE = 1n;

    let finalComputedLucasValue; // This variable will store the ultimate result before logging.

    // Handle the base cases for the Lucas sequence explicitly using a switch statement
    // for clarity and efficient handling of small, known values.
    switch (targetSequencePosition) {
        case 0:
            finalComputedLucasValue = LUCAS_INITIAL_ZERO;
            break;
        case 1:
            finalComputedLucasValue = LUCAS_INITIAL_ONE;
            break;
        default:
            // For positions greater than 1, calculate the sequence iteratively.
            // Initialize working variables to hold the two preceding terms in the sequence.
            let termBeforeLast = LUCAS_INITIAL_ZERO; // Represents L(k-2)
            let lastCalculatedTerm = LUCAS_INITIAL_ONE;  // Represents L(k-1)
            let currentIterationResult;                  // Will temporarily hold L(k)

            // Iterate from the second position (index 2) up to the target position.
            // L(0) and L(1) are already handled by the switch statement.
            for (let currentStep = 2; currentStep <= targetSequencePosition; currentStep++) {
                // Calculate the next number in the Lucas sequence using the sum of the two preceding terms.
                currentIterationResult = termBeforeLast + lastCalculatedTerm;

                // Update the terms for the next iteration:
                // The value that was 'lastCalculatedTerm' now becomes the new 'termBeforeLast'.
                // The newly computed 'currentIterationResult' becomes the new 'lastCalculatedTerm'.
                termBeforeLast = lastCalculatedTerm;
                lastCalculatedTerm = currentIterationResult;
            }
            // After the loop completes, 'lastCalculatedTerm' will hold the Lucas number
            // corresponding to the 'targetSequencePosition'.
            finalComputedLucasValue = lastCalculatedTerm;
            break;
    }

    // Output the computed value to the console in a descriptive format.
    // Only log if a valid result was obtained (i.e., not undefined due to invalid input).
    if (finalComputedLucasValue !== undefined) {
        console.log(`The computed Lucas number for index ${targetSequencePosition} is: ${finalComputedLucasValue.toString()}`);
    }
}

// This is the program's entry point.
// It reads the entire content of standard input, decodes it as UTF-8,
// and then passes the raw string data to our processing function.
// The 'fs' module is required for file system operations, specifically reading from /dev/stdin.
processInputAndDetermineLucasValue(require("fs").readFileSync("/dev/stdin", "utf8"));