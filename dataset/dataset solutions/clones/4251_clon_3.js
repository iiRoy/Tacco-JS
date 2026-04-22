function EvaluateInputPattern(sourceText) {
    // This function analyzes a specific character pattern across two lines of input.
    // It determines if a predefined structural match exists between the lines.

    // First, preprocess the raw input string: trim leading/trailing whitespace
    // and then split it into an array of individual lines.
    const inputSegments = sourceText.trim().split('\n');

    // --- Input Validation and Guard Clauses ---
    // Ensure that we have at least two lines to perform the comparison.
    if (inputSegments.length < 2) {
        console.log("NO"); // Not enough input lines for pattern evaluation.
        return;
    }

    // Assign the first two lines to distinct, descriptive variables for clarity.
    const firstDataLine = inputSegments[0];
    const secondDataLine = inputSegments[1];

    // Validate that both lines are sufficiently long to access the required characters.
    // Each line must have at least 3 characters (indices 0, 1, 2).
    const MIN_REQUIRED_LENGTH = 3;
    if (firstDataLine.length < MIN_REQUIRED_LENGTH || secondDataLine.length < MIN_REQUIRED_LENGTH) {
        console.log("NO"); // Lines are too short for the required pattern checks.
        return;
    }
    // --- End of Validation ---


    // Extract specific characters from each line into temporary variables.
    // This improves readability and separates character access from the comparison logic.
    const charA1 = firstDataLine[0]; // Character at index 0 of the first line
    const charA2 = firstDataLine[1]; // Character at index 1 of the first line
    const charA3 = firstDataLine[2]; // Character at index 2 of the first line

    const charB1 = secondDataLine[0]; // Character at index 0 of the second line
    const charB2 = secondDataLine[1]; // Character at index 1 of the second line
    const charB3 = secondDataLine[2]; // Character at index 2 of the second line

    // Evaluate each condition independently.
    // This breaks down the complex logical expression into more manageable parts.
    let isConditionAlphaMet = (charA1 === charB3); // Is first char of line 1 equal to third char of line 2?
    let isConditionBetaMet = (charB1 === charA3); // Is first char of line 2 equal to third char of line 1?
    let isConditionGammaMet = (charA2 === charB2); // Is second char of line 1 equal to second char of line 2?

    // Combine the individual condition results using a logical AND operation.
    // The pattern is considered a match only if all three sub-conditions are true.
    const allConditionsSatisfied = isConditionAlphaMet && isConditionBetaMet && isConditionGammaMet;

    let finalOutputMessage;

    // Determine the final output message based on the combined result.
    if (allConditionsSatisfied) {
        finalOutputMessage = 'YES';
    } else {
        finalOutputMessage = 'NO';
    }

    // Output the final decision to the console.
    console.log(finalOutputMessage);
}

// Acquire the file system module for reading input.
const systemInputProvider = require("fs");

// Read the entire content of standard input as a UTF-8 string.
const rawStandardInput = systemInputProvider.readFileSync("/dev/stdin", "utf8");

// Invoke the main pattern evaluation function with the obtained input.
EvaluateInputPattern(rawStandardInput);