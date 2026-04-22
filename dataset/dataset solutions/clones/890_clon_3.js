"use strict";

// This module provides a JavaScript implementation for evaluating custom mathematical expressions.
// It parses expressions containing numbers, '<' (square modulo), '>' (right shift), and '>>' (double right shift) operators.
// The original problem context is from: http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=2570
// Initial author reference: Shipura

// A simple utility to output results to the standard console.
const outputResult = console.log;

// --- Node.js Environment Input Handling ---
// This block sets up asynchronous input processing when the script is executed in a Node.js environment.
if (typeof process !== "undefined" && process.stdin && process.stdout) {
    let pendingInputData = ""; // Buffer to accumulate incoming data chunks.

    // Configure the input stream to use UTF-8 encoding.
    process.stdin.setEncoding('utf8');

    // Register a listener for 'data' events to collect all input.
    process.stdin.on('data', (dataChunk) => {
        pendingInputData += dataChunk;
    });

    // Register a listener for the 'end' event, triggered when input stream closes.
    process.stdin.on('end', () => {
        // Split the accumulated data into individual lines, filtering out any empty lines.
        const parsedInputStatements = pendingInputData.split("\n")
                                                    .map(line => line.trim()) // Trim whitespace from each line (Type III)
                                                    .filter(line => line !== ''); // Remove entirely empty lines (Type III)

        // Proceed only if there are valid statements to process.
        if (parsedInputStatements.length > 0) {
            executeProgram(parsedInputStatements);
        } else {
            outputResult("No valid input statements were provided for processing.");
        }
    });

    // Implement robust error handling for the input stream (Type III enhancement).
    process.stdin.on('error', (inputError) => {
        console.error("An error occurred during input stream processing:", inputError);
        process.exit(1); // Exit the process with an error code.
    });
}
// --- End Node.js Input Handling ---


/**
 * Orchestrates the overall execution by processing a collection of input statements.
 * Each statement is treated as an independent expression.
 * @param {string[]} inputStatementLines An array of raw strings, each representing an expression.
 */
function executeProgram(inputStatementLines) {
    // Validate the input array to ensure it's an array and not empty (Type III guard clause).
    if (!Array.isArray(inputStatementLines) || inputStatementLines.length === 0) {
        console.warn("Received an empty or invalid list of statements to execute.");
        return;
    }

    // Iterate through each statement, processing it individually.
    for (const currentStatement of inputStatementLines) {
        // Skip lines designated as comments or those that are empty after trimming.
        if (currentStatement === "#") {
            continue; // Move to the next statement.
        }
        processSingleExpression(currentStatement);
    }
}

/**
 * Computes the square of a given number, then applies a modulo operation with a large prime.
 * Includes an optimization to reduce the number before squaring if it exceeds half the modulus.
 * @param {number} inputNumber The value to be squared.
 * @returns {number} The result of (inputNumber * inputNumber) % primeMod.
 */
function computeSquaredModulus(inputNumber) {
    const primeModulus = 1000000007; // The large prime modulus.

    // Optimization: If the input number is greater than half the modulus, subtracting the modulus
    // maintains the same result after squaring and taking modulo, but works with a smaller number,
    // potentially avoiding intermediate overflow for very large inputNumbers.
    let workingValue = inputNumber;
    if (workingValue > primeModulus / 2) {
        workingValue -= primeModulus;
    }

    const squaredResult = workingValue * workingValue;
    return squaredResult % primeModulus;
}

/**
 * Performs a right-shift-like operation by dividing a base value by 2 raised to a specified power.
 * The result is always floored to the nearest integer.
 * @param {number} baseValue The number to be divided.
 * @param {number} exponent The power to which 2 is raised (the shift amount).
 * @returns {number} The floored result of baseValue / (2^exponent).
 */
function computeRightShift(baseValue, exponent) {
    // Validate the exponent to ensure it's a non-negative integer (Type III validation).
    if (typeof exponent !== 'number' || exponent < 0 || !Number.isInteger(exponent)) {
        console.warn(`Invalid exponent "${exponent}" provided for right shift. Defaulting to 0.`);
        exponent = 0; // Use a safe default.
    }

    // Use bitwise left shift for efficient calculation of 2^exponent (Type III code rewrite).
    const divisor = 1 << exponent;
    return Math.floor(baseValue / divisor);
}

/**
 * Cleans an input expression string by removing all whitespace characters and any 'S' characters (case-insensitive).
 * This prepares the string for tokenization.
 * @param {string} rawExpressionString The original, uncleaned expression string.
 * @returns {string} The cleaned string, or an empty string if the input is invalid.
 */
function sanitizeInputString(rawExpressionString) {
    if (typeof rawExpressionString !== 'string') { // Type III validation.
        console.warn("Non-string input provided to sanitizeInputString. Returning empty string.");
        return '';
    }
    // The regular expression matches any whitespace character (\s) or 'S' (case-insensitive).
    const cleanupRegex = /[sS\s]/g;
    return rawExpressionString.replace(cleanupRegex, '');
}

/**
 * Determines if a given value can be successfully interpreted as a number.
 * This function is used during tokenization to distinguish numeric literals from operators.
 * @param {*} candidateToken The value to test.
 * @returns {boolean} True if the value is a valid number, false otherwise.
 */
function isValidNumericToken(candidateToken) {
    if (typeof candidateToken === 'number') { // Already a number, so it's valid (Type III optimization).
        return true;
    }
    if (typeof candidateToken !== 'string' || candidateToken.trim() === '') { // Invalid type or empty string (Type III validation).
        return false;
    }
    // Use `Number()` and `isNaN()` for robust numeric parsing check (Type III rewrite).
    return !isNaN(Number(candidateToken));
}

/**
 * Breaks down a cleaned expression string into an array of distinct tokens.
 * Numeric sequences are parsed into actual `number` types, while operators remain `string` types.
 * Example: "12<3>4" becomes `[12, '<', 3, '>', 4]`.
 * @param {string} cleanedExpression The sanitized expression string.
 * @returns {(number|string)[]} An array containing numbers and operator characters.
 */
function segmentExpressionTokens(cleanedExpression) {
    if (typeof cleanedExpression !== 'string' || cleanedExpression.length === 0) { // Type III validation.
        return [];
    }

    const characters = Array.from(cleanedExpression); // Convert string to array of characters (Type III rewrite).
    const totalChars = characters.length;
    const tokenParts = []; // The array to store the segmented tokens.
    let currentSegmentStart = 0;
    let currentlyInNumber = false; // Flag to track if we are currently parsing a number.

    for (let i = 0; i < totalChars; i++) {
        const char = characters[i];

        if (isValidNumericToken(char)) {
            if (!currentlyInNumber) {
                // Mark the beginning of a new number segment.
                currentSegmentStart = i;
                currentlyInNumber = true;
            }
        } else { // The current character is an operator.
            if (currentlyInNumber) {
                // If we were parsing a number, extract it and add to tokens.
                const numString = characters.slice(currentSegmentStart, i).join('');
                tokenParts.push(Number(numString)); // Convert to actual number.
                currentlyInNumber = false; // Reset flag.
            }
            // Add the operator character itself.
            tokenParts.push(char);
        }
    }

    // After the loop, check if there's a pending number segment at the end of the string.
    if (currentlyInNumber) {
        const finalNumString = characters.slice(currentSegmentStart, totalChars).join('');
        tokenParts.push(Number(finalNumString));
    }
    return tokenParts;
}

/**
 * Helper function to determine if a '>' character represents a single right-angle bracket ('q' token)
 * or is part of a double right-shift operator ('t' token, '>>').
 * This involves a look-ahead mechanism.
 * @param {number} currentIndex The index of the potential '>' character in the token sequence.
 * @param {(number|string)[]} fullTokenSequence The array of segmented tokens.
 * @returns {boolean} True if it's a single '>', false if it's '>>'.
 */
function isSingleRightAngleBracket(currentIndex, fullTokenSequence) {
    // Check if there's a character immediately after the current one.
    if (currentIndex + 1 < fullTokenSequence.length && fullTokenSequence[currentIndex + 1] === '>') {
        // If it's '>>', further check if it's followed by a number or a '<'.
        // This is the specific rule for '>>' vs. two separate '>' tokens.
        const charAfterDoubleBracket = fullTokenSequence[currentIndex + 2];
        if (currentIndex + 2 < fullTokenSequence.length &&
            (isValidNumericToken(charAfterDoubleBracket) || charAfterDoubleBracket === '<')) {
            return false; // It's a '>>' (double right shift) operator.
        }
    }
    return true; // It's a single '>' operator.
}

// Symbolic constants for our internal token representation (Type III enhancement).
const TOKEN_LEFT_BRACKET = 'p'; // Represents '<'
const TOKEN_RIGHT_BRACKET = 'q'; // Represents '>'
const TOKEN_RIGHT_SHIFT_OPERATOR = 't'; // Represents '>>'

/**
 * Converts a sequence of segmented characters/numbers into a canonical tokenized array.
 * This involves mapping '<' to 'p', '>' to 'q', and '>>' to 't'.
 * Numbers remain as numbers.
 * @param {(number|string)[]} segmentedInputTokens The array of tokens from segmentExpressionTokens.
 * @returns {(number|string)[]} An array of canonical tokens ready for evaluation.
 */
function lexicalAnalyzeExpression(segmentedInputTokens) {
    if (!Array.isArray(segmentedInputTokens) || segmentedInputTokens.length === 0) { // Type III validation.
        return [];
    }

    const canonicalTokenSequence = [];
    const inputLength = segmentedInputTokens.length;

    for (let i = 0; i < inputLength; i++) {
        const currentSegment = segmentedInputTokens[i];

        if (isValidNumericToken(currentSegment)) {
            canonicalTokenSequence.push(currentSegment);
        } else {
            // Use a switch statement for cleaner operator handling (Type III rewrite).
            switch (currentSegment) {
                case '<':
                    canonicalTokenSequence.push(TOKEN_LEFT_BRACKET);
                    break;
                case '>':
                    // Determine if it's a single '>' or part of a '>>'.
                    if (isSingleRightAngleBracket(i, segmentedInputTokens)) {
                        canonicalTokenSequence.push(TOKEN_RIGHT_BRACKET);
                    } else {
                        canonicalTokenSequence.push(TOKEN_RIGHT_SHIFT_OPERATOR);
                        i++; // Advance the index to consume the second '>' character of '>>'.
                    }
                    break;
                default:
                    // Log a warning for any unrecognized tokens (Type III error handling).
                    console.warn(`Lexer encountered an unexpected character: "${currentSegment}". Skipping.`);
                    break;
            }
        }
    }
    return canonicalTokenSequence;
}

/**
 * Evaluates the tokenized expression array by applying operations in a stack-like manner.
 * The array is modified in-place, reducing expressions like 'p', x, 'q' to S(x) and x, 't', y to T(x,y).
 * @param {(number|string)[]} expressionTokens The tokenized array from lexicalAnalyzeExpression.
 * @returns {(number|string)[]} A single-element array containing the final numeric result.
 */
function evaluateExpressionTree(expressionTokens) {
    if (!Array.isArray(expressionTokens) || expressionTokens.length === 0) { // Type III validation.
        console.error("Cannot evaluate an empty or invalid expression token array.");
        return [0]; // Return a default error value.
    }

    let processingIndex = 0; // Index to traverse the token array.

    // Continue processing until only one element (the final result) remains in the array
    // or until the index goes out of bounds (indicating a malformed expression).
    while (expressionTokens.length > 1 && processingIndex < expressionTokens.length) {
        const currentToken = expressionTokens[processingIndex];

        switch (currentToken) {
            case TOKEN_RIGHT_BRACKET: // Handles the 'S<x>' operation (represented as 'p', x, 'q').
                // Ensure the pattern 'p', value, 'q' exists.
                if (processingIndex >= 2 && expressionTokens[processingIndex - 2] === TOKEN_LEFT_BRACKET) {
                    const operandForSquaredModulus = expressionTokens[processingIndex - 1];
                    // Replace the sequence 'p', operand, 'q' with the result of S(operand).
                    expressionTokens[processingIndex - 2] = computeSquaredModulus(operandForSquaredModulus);
                    expressionTokens.splice(processingIndex - 1, 2); // Remove the operand and 'q' token.
                    processingIndex -= 2; // Adjust the index to point to the newly placed result.
                } else {
                    console.error(`Evaluation error: '${TOKEN_RIGHT_BRACKET}' token found without matching '${TOKEN_LEFT_BRACKET}' and operand at index ${processingIndex}.`);
                    return [0]; // Indicate a critical error.
                }
                break;

            case TOKEN_RIGHT_SHIFT_OPERATOR: // Handles the 'x>>y' operation (represented as x, 't', y).
                // Ensure the pattern value1, 't', value2 exists with valid numeric operands.
                if (processingIndex >= 1 && processingIndex + 1 < expressionTokens.length &&
                    isValidNumericToken(expressionTokens[processingIndex - 1]) &&
                    isValidNumericToken(expressionTokens[processingIndex + 1])) {
                    const firstOperandForShift = expressionTokens[processingIndex - 1];
                    const secondOperandForShift = expressionTokens[processingIndex + 1];
                    // Replace the sequence operand1, 't', operand2 with the result of T(operand1, operand2).
                    expressionTokens[processingIndex - 1] = computeRightShift(firstOperandForShift, secondOperandForShift);
                    expressionTokens.splice(processingIndex, 2); // Remove the 't' token and the second operand.
                    processingIndex -= 1; // Adjust the index to point to the newly placed result.
                } else {
                    console.error(`Evaluation error: '${TOKEN_RIGHT_SHIFT_OPERATOR}' token found without valid operands at index ${processingIndex}.`);
                    return [0]; // Indicate a critical error.
                }
                break;

            case TOKEN_LEFT_BRACKET: // Left bracket token, acts as a marker.
                // No operation, just advance the index.
                break;

            default:
                // If it's a number, no operation is performed, just advance.
                if (!isValidNumericToken(currentToken)) { // Type III error handling for unexpected tokens.
                    console.warn(`Evaluation warning: Unexpected non-numeric token "${currentToken}" encountered at index ${processingIndex}.`);
                }
                break;
        }
        processingIndex++; // Move to the next element in the (potentially modified) array.
    }

    // After the loop, the array should ideally contain only one element—the final result.
    if (expressionTokens.length !== 1) { // Type III validation.
        console.error("Expression evaluation failed: Resulting array does not contain a single element.");
        return [0]; // Return an error value.
    }

    return expressionTokens; // Return the array containing the single final result.
}

/**
 * Orchestrates the full processing pipeline for a single input expression string.
 * This includes sanitization, segmentation, tokenization, and final evaluation.
 * The final numeric result is then printed.
 * @param {string} rawInputString The raw expression string received as input.
 */
function processSingleExpression(rawInputString) {
    // Step 1: Sanitize the raw input string.
    const cleanedString = sanitizeInputString(rawInputString);
    if (cleanedString.length === 0) { // Type III guard clause.
        outputResult("Skipping expression: Input became empty after cleaning.");
        return;
    }
    // console.log(`DEBUG: Cleaned: "${cleanedString}"`); // Optional debug output (Type III).

    // Step 2: Segment the cleaned string into an array of numbers and operator characters.
    const segmentedParts = segmentExpressionTokens(cleanedString);
    if (segmentedParts.length === 0) { // Type III guard clause.
        outputResult("Skipping expression: No valid segments found after initial parsing.");
        return;
    }
    // console.log(`DEBUG: Segmented: [${segmentedParts.map(t => typeof t === 'string' ? `'${t}'` : t).join(', ')}]`); // Optional debug output.

    // Step 3: Perform lexical analysis to convert raw operator characters to canonical tokens.
    const lexedTokens = lexicalAnalyzeExpression(segmentedParts);
    if (lexedTokens.length === 0) { // Type III guard clause.
        outputResult("Skipping expression: No valid tokens generated after lexical analysis.");
        return;
    }
    // console.log(`DEBUG: Lexed: [${lexedTokens.map(t => typeof t === 'string' ? `'${t}'` : t).join(', ')}]`); // Optional debug output.

    // Step 4: Evaluate the tokenized expression to arrive at a single numeric result.
    const finalResultArray = evaluateExpressionTree(lexedTokens);

    // Step 5: Output the final computed value.
    outputResult(finalResultArray[0]);
}