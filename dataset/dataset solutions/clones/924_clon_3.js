const fileSystem = require('fs'); // Utilizing the file system module for input operations

// Helper function to determine the result of a logical implication (A -> B)
// In boolean logic, (A -> B) is equivalent to (NOT A) OR B.
// This function takes two string operands ("T" for true, "F" for false)
// and returns the string result of their implication.
function resolveImplication(firstValue, secondValue) {
    // Defensive check: ensure valid string inputs for logical operations.
    // If inputs are unexpected, we might return an error state or default.
    // For this problem, we assume "T" or "F" are consistently provided.
    if (firstValue === undefined || secondValue === undefined) {
        // This scenario should ideally not occur if the main processing logic is sound.
        // It indicates an insufficient number of operands for an implication.
        return "ERROR_INSUFFICIENT_OPERANDS";
    }

    // Evaluate (NOT A) OR B:
    // If 'firstValue' (A) is "F" (False), then 'NOT A' is "T" (True).
    // In an OR operation, if one side is True, the entire expression is True.
    if (firstValue === "F") {
        return "T"; // (NOT F) OR B evaluates to T OR B, which is always T.
    } else { // If 'firstValue' (A) is "T" (True), then 'NOT A' is "F" (False).
        // In this case, the result of (NOT A) OR B depends entirely on B.
        // F OR B will be True if B is True, and False if B is False.
        if (secondValue === "T") {
            return "T"; // (NOT T) OR T evaluates to F OR T, which is T.
        } else { // secondValue must be "F"
            return "F"; // (NOT T) OR F evaluates to F OR F, which is F.
        }
    }
}

// Read all raw content from the standard input stream.
const rawDataString = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input: remove leading/trailing whitespace, then split into individual lines.
let inputLineSegments = rawDataString.trim().split("\n");

// The first line of input is typically a count or metadata, which is not used
// in the core logical evaluation process of this program. We discard it.
inputLineSegments.shift(); // Remove and ignore the initial line

// The second line is expected to contain the sequence of operands ('T' or 'F')
// separated by spaces. We parse this into a mutable array of string tokens.
let logicalExpressionTokens = inputLineSegments.shift().split(" ");

// This function orchestrates the iterative reduction of the token sequence.
// It applies the logical implication operation pair-wise until a single
// final result token remains.
function processLogicalSequence(currentWorkingSequence) {
    // Initial validation: Ensure the input sequence is an array and not empty.
    if (!Array.isArray(currentWorkingSequence) || currentWorkingSequence.length === 0) {
        console.error("Error: Input sequence is invalid or empty. Cannot process.");
        return;
    }

    // Base case: If the sequence starts with only one token, that token is the result.
    if (currentWorkingSequence.length === 1) {
        console.log(currentWorkingSequence[0]);
        return;
    }

    // The main processing loop: continues as long as there are at least two tokens
    // available to perform an implication operation.
    while (currentWorkingSequence.length > 1) {
        // Extract the first two operands from the beginning of the sequence.
        const operandOne = currentWorkingSequence.shift();
        const operandTwo = currentWorkingSequence.shift();

        // Compute the result of the implication between the two extracted operands.
        const calculatedIntermediateResult = resolveImplication(operandOne, operandTwo);

        // Re-insert the computed result back at the front of the sequence.
        // This effectively replaces the two consumed operands with their result,
        // allowing the process to continue with the reduced sequence.
        currentWorkingSequence.unshift(calculatedIntermediateResult);
    }

    // Once the loop terminates, only one token remains in the sequence.
    // This final token represents the overall evaluated result of the expression.
    console.log(currentWorkingSequence[0]);
}

// Begin the evaluation process with the prepared token sequence.
processLogicalSequence(logicalExpressionTokens);