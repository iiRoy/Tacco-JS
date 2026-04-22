// A utility function to convert a string to an integer with a specified radix.
// It uses parseInt for standard base-10 conversion, ensuring consistent number interpretation.
function parseInteger(inputStringValue) {
    // The original code had a commented-out BigInt option, but parseInt is sufficient
    // for the problem's typical constraints (numbers fitting into standard JS Number type).
    const STANDARD_RADIX = 10; // Explicitly set radix for decimal numbers to avoid unexpected behavior.
    return parseInt(inputStringValue, STANDARD_RADIX);
}

// This function serves as the primary entry point for processing the problem's input data.
// It orchestrates reading configuration, initializing a sequence, and executing a series of operations.
function ProcessInputData(rawInputString) {
    // Define a constant for the modulo operation value.
    // Using a named constant improves readability and maintainability.
    const MODULUS_CONSTANT = 998244353;
    // Define the default character used to initialize the sequence.
    // This makes the code more configurable and self-documenting.
    const INITIAL_SEQUENCE_DIGIT = '1';

    // First, parse the entire raw input string.
    // It's split by newlines into individual lines, and then each line is split by spaces into tokens.
    const inputLines = rawInputString.split("\n").map(lineContent => lineContent.split(" "));

    // Perform initial validation on the input structure.
    // Ensure there's at least one line for parameters and that it contains enough elements.
    if (!inputLines || inputLines.length === 0 || inputLines[0].length < 2) {
        console.error("Error: The provided input data is insufficient or malformed for initial parameters.");
        return; // Terminate execution if essential input is missing.
    }

    // Extract the length of the initial numeric sequence from the first line's first token.
    const sequenceLength = parseInteger(inputLines[0][0]);
    // The number of query operations is read from the first line's second token.
    // While read, this variable (`queryCount`) is not directly used in the loop's condition,
    // as the loop iterates over the actual number of query lines available.
    const queryCount = parseInteger(inputLines[0][1]); // Stored for potential future use or debugging.

    // Validate the extracted sequence length to prevent issues with array initialization.
    if (sequenceLength <= 0) {
        console.error("Error: The initial sequence length must be a positive integer. Received: " + sequenceLength);
        return; // Exit if the sequence length is invalid.
    }

    // Initialize the base character sequence.
    // This array will contain 'sequenceLength' number of 'INITIAL_SEQUENCE_DIGIT' characters.
    // This base sequence remains unchanged throughout all queries; each query operates on its own copy.
    const immutableBaseSequence = Array(sequenceLength).fill(INITIAL_SEQUENCE_DIGIT);

    // Now, iterate through each operation (query) specified in the input.
    // Queries start from the second line (index 1) of the `inputLines` array.
    for (let operationIndex = 1; operationIndex < inputLines.length; ++operationIndex) {
        const currentOperationTokens = inputLines[operationIndex];

        // Validate that the current operation line has the expected number of parameters (L, R, D).
        if (currentOperationTokens.length < 3) {
            console.error(`Error: Operation at line ${operationIndex + 1} has insufficient parameters. Skipping.`);
            continue; // Skip this malformed operation and proceed to the next.
        }

        // Extract and convert the operation parameters.
        // Adjust L and R to be 0-based indices for array compatibility.
        const rangeStartIdx = parseInteger(currentOperationTokens[0]) - 1;
        const rangeEndIdx = parseInteger(currentOperationTokens[1]) - 1;
        const replacementCharacter = currentOperationTokens[2];

        // Perform boundary checks for the operation's range.
        // Ensure that L and R are within the valid bounds of the sequence and L <= R.
        if (rangeStartIdx < 0 || rangeEndIdx >= sequenceLength || rangeStartIdx > rangeEndIdx) {
            console.warn(`Warning: Operation at line ${operationIndex + 1} specifies an invalid range ` +
                         `[${rangeStartIdx + 1}, ${rangeEndIdx + 1}]. Skipping this operation.`);
            continue; // Skip operations with invalid ranges.
        }

        // Create a mutable copy of the `immutableBaseSequence` for the current operation.
        // This ensures that each operation starts from the same initial state, as per original logic.
        const currentWorkingSequence = [...immutableBaseSequence]; // Using spread syntax for shallow copy.

        // Apply the replacement operation: iterate through the working sequence and
        // replace characters within the specified range [rangeStartIdx, rangeEndIdx].
        for (let charPosition = 0; charPosition < currentWorkingSequence.length; ++charPosition) {
            if (charPosition >= rangeStartIdx && charPosition <= rangeEndIdx) {
                currentWorkingSequence[charPosition] = replacementCharacter;
            }
        }

        // Join the modified character array back into a single string.
        const constructedNumericString = currentWorkingSequence.join('');

        // Convert the resulting string back into a numerical value.
        const computedNumericValue = parseInteger(constructedNumericString);

        // Output the result of the operation, modulo the predefined constant.
        console.log(computedNumericValue % MODULUS_CONSTANT);
    }
}

// This is the standard competitive programming boilerplate for reading input from stdin.
// The `require("fs").readFileSync("/dev/stdin", "utf8")` call reads the entire input
// file as a string, which is then passed to the `ProcessInputData` function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));