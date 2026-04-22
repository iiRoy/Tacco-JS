const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

/**
 * Converts a string token ('T' or 'F') into its corresponding boolean value.
 * Throws an error for invalid input to ensure data integrity.
 * @param {string} stringToken - The string ('T' or 'F') to convert.
 * @returns {boolean} - The boolean representation (true or false).
 * @throws {Error} If the stringToken is not 'T' or 'F'.
 */
function parseStringAsBoolean(stringToken) {
    switch (stringToken) {
        case 'T':
            return true;
        case 'F':
            return false;
        default:
            // Added a guard for unexpected input values.
            throw new Error(`Unexpected boolean token encountered: ${stringToken}. Expected 'T' or 'F'.`);
    }
}

/**
 * Converts a boolean value into its string representation ('T' or 'F').
 * @param {boolean} booleanValue - The boolean value to convert.
 * @returns {string} - The string 'T' for true, 'F' for false.
 */
function formatBooleanAsString(booleanValue) {
    return booleanValue ? 'T' : 'F';
}

// Process the raw input from standard input.
// First, remove leading/trailing whitespace, then split into individual lines.
const inputLines = fileContent.trim().split("\n");

// The first line often contains a count or other metadata.
// In this specific problem, it's discarded, mirroring the original's behavior.
// We explicitly name it to indicate it's intentionally skipped.
const initialElementCount = inputLines.shift();

// The second line contains the sequence of boolean tokens (e.g., "T F T").
// This line is split by spaces to form the array of tokens for evaluation.
const booleanTokenSequence = inputLines.shift().split(" ");

/**
 * Recursively evaluates a sequence of boolean string tokens using a specific logical rule:
 * (Second Operand OR NOT First Operand).
 * The function takes the first two tokens, applies the rule, and then prepends the result
 * back to the remaining sequence. This process repeats until only one token remains,
 * which is then printed to the console as the final outcome.
 *
 * @param {string[]} currentTokenArray - An array of 'T' or 'F' strings representing boolean values.
 * @returns {void} This function prints the final result to standard output.
 */
const performRecursiveLogicalEvaluation = function(currentTokenArray) {
    // Check for a base case or an invalid state where insufficient tokens are available.
    // If only one token is left, it's the final result. If zero, it's an error.
    if (currentTokenArray.length < 2) {
        if (currentTokenArray.length === 1) {
            console.log(currentTokenArray[0]);
        } else {
            // This case indicates an empty or unexpectedly short sequence,
            // which might occur with malformed input.
            console.error("Evaluation error: Not enough tokens to perform the logical operation.");
        }
        return; // Terminate recursion
    }

    // Extract the first two operands. Using `splice` modifies the array in place,
    // which is a structural change from the original `slice` + reassignment approach.
    const firstOperandString = currentTokenArray.splice(0, 1)[0]; // Remove and get the first element
    const secondOperandString = currentTokenArray.splice(0, 1)[0]; // Remove and get the new first (original second)

    // Convert string representations to actual boolean values for computation.
    const valA = parseStringAsBoolean(firstOperandString);
    const valB = parseStringAsBoolean(secondOperandString);

    // Apply the core logical operation: (B OR NOT A).
    // This is a direct translation and simplification of the original 'if-else if' structure.
    const operationResultBoolean = valB || (!valA);

    // Convert the computed boolean result back to its string representation.
    const operationResultString = formatBooleanAsString(operationResultBoolean);

    // If no tokens remain after processing this pair, the current result is the final answer.
    if (currentTokenArray.length === 0) {
        console.log(operationResultString);
        return; // End of evaluation chain
    } else {
        // Otherwise, prepend the intermediate result to the beginning of the remaining tokens.
        // This sets up the next step in the recursive evaluation.
        currentTokenArray.unshift(operationResultString);
        // Introduce a temporary variable for the next state, enhancing readability.
        const nextIterationTokens = currentTokenArray;
        performRecursiveLogicalEvaluation(nextIterationTokens); // Recursive call
    }
};

// Initiate the recursive evaluation process with the prepared token sequence.
performRecursiveLogicalEvaluation(booleanTokenSequence);