/*
 *  Project: Shipura Expression Evaluator
 *  (Original problem from http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=2570)
 *
 *  Current Status: Implemented and tested for Type II cloning.
 *
 *  Notes: This code processes mathematical expressions with custom operators.
 */

// Global logger for output operations
const outputLog = console.log;

// Check if running in a Node.js-like environment to handle input
if (typeof process !== "undefined") {
    let rawData = ""; // Accumulates all incoming data
    process.stdin.resume(); // Keep the process alive for input
    process.stdin.setEncoding('utf8'); // Set input encoding

    // Event listener for data chunks
    process.stdin.on('data', function(chunk) {
        rawData += chunk; // Append new data to the buffer
    });

    // Event listener for end of input
    process.stdin.on('end', function() {
        const inputLines = rawData.split("\n"); // Split raw data into individual lines
        processInputData(inputLines); // Pass lines to the main processing function
    });
}


/**
 * Main entry point for processing an array of input lines.
 * Each line represents an expression to be evaluated.
 *
 * @param {string[]} inputLines - An array of strings, each being an expression.
 */
function processInputData(inputLines) {
    inputLines.forEach(function(currentLine) {
        // Skip processing if the line is just a '#' (sentinel value)
        if (currentLine !== "#") {
            handleSingleLine(currentLine);
        }
    });
}

/**
 * Implements the custom 'S' operator: squares a number modulo 1000000007.
 *
 * @param {number} val - The numeric value to operate on.
 * @returns {number} The result of (val * val) % 1000000007.
 */
function calculateSquaredMod(val) {
    const moduloDivisor = 1000000007; // The modulus for the operation

    // Adjust value to prevent overflow before squaring, if it's too large.
    // This ensures intermediate products don't exceed standard integer limits
    // before the modulo operation, maintaining correctness.
    if (val > 500000000) {
        val = val - moduloDivisor;
    }

    const squaredResult = val * val; // Calculate the square
    return squaredResult % moduloDivisor; // Return the result modulo the divisor
}

/**
 * Implements the custom 'T' operator: performs a right bit shift (integer division by 2^shiftAmount).
 *
 * @param {number} baseVal - The base numeric value.
 * @param {number} shiftAmount - The amount to shift by (exponent for 2).
 * @returns {number} The result of Math.floor(baseVal / (2^shiftAmount)).
 */
function performRightShift(baseVal, shiftAmount) {
    // Math.pow(2, shiftAmount) calculates 2 raised to the power of shiftAmount.
    // Math.floor ensures integer division behavior, consistent with a right bit shift.
    return Math.floor(baseVal / Math.pow(2, shiftAmount));
}

/**
 * Cleans an input string by removing all whitespace characters and 'S' characters.
 *
 * @param {string} rawStr - The raw input string.
 * @returns {string} The cleaned string.
 */
function cleanInputString(rawStr) {
    // The regular expression /\s|S/g matches all whitespace characters (\s)
    // and the literal character 'S' globally (g). These are replaced with an empty string.
    return rawStr.replace(/\s|S/g, '');
}

/**
 * Checks if a given character string represents a numeric digit.
 *
 * @param {string} charToCheck - The character string to verify.
 * @returns {boolean} True if the character can be parsed as a number, false otherwise.
 */
function isNumericChar(charToCheck) {
    const parsedNum = Number(charToCheck); // Attempt to convert the character to a number
    const numStr = parsedNum.toString(); // Convert the parsed number back to a string

    // If the original character was not a number, Number() returns NaN.
    // NaN.toString() is "NaN". So, if numStr is not "NaN", it was a valid number.
    return Boolean(numStr !== "NaN");
}

/**
 * Divides the input string into an initial sequence of numbers and operator characters.
 * It groups consecutive digits into a single number token.
 *
 * @param {string} inputSequence - The cleaned input string.
 * @returns {(number|string)[]} An array of numbers and single-character operator strings.
 */
function tokenizeInitial(inputSequence) {
    inputSequence = inputSequence.split(''); // Convert string to an array of characters
    const sequenceLength = inputSequence.length;
    let numStartIdx = 0; // Index where a number sequence begins
    let numEndIdx = 0; // Index where a number sequence ends
    const intermediateTokens = []; // Stores the resulting tokens
    let currentlyParsingNumber = false; // Flag to track if we are inside a number sequence

    for (let idx = 0; idx < sequenceLength; idx++) {
        const currentChar = inputSequence[idx];

        // If not currently parsing a number and the current char is numeric, start a new number.
        if (!currentlyParsingNumber && isNumericChar(currentChar)) {
            numStartIdx = idx;
            currentlyParsingNumber = true;
        }
        // If currently parsing a number and the current char is not numeric, the number sequence has ended.
        else if (currentlyParsingNumber && !isNumericChar(currentChar)) {
            numEndIdx = idx;
            currentlyParsingNumber = false;

            // Extract the number string, convert to number, and push to tokens.
            const numSlice = inputSequence.slice(numStartIdx, numEndIdx);
            const numStringSegment = numSlice.join('');
            const parsedNumberValue = Number(numStringSegment);
            intermediateTokens.push(parsedNumberValue);
        }

        // If the current character is not numeric, push it as a separate token.
        if (!isNumericChar(currentChar)) {
            intermediateTokens.push(currentChar);
        }
    }

    // After the loop, if we were still parsing a number, it means the number extended to the end of the string.
    if (currentlyParsingNumber) {
        numEndIdx = sequenceLength;
        const numSlice = inputSequence.slice(numStartIdx, numEndIdx);
        const numStringSegment = numSlice.join('');
        const parsedNumberValue = Number(numStringSegment);
        intermediateTokens.push(parsedNumberValue);
    }
    return intermediateTokens;
}

/**
 * Determines if a '>' character is a simple closing bracket 'q' or part of a '>>' (shift) operator.
 *
 * @param {number} currentIdx - The current index of the '>' character in the token array.
 * @param {(number|string)[]} tokenArray - The array of tokens.
 * @returns {boolean} True if it's a simple 'q', false if it's part of a '>>' operator.
 */
function isClosingBracket(currentIdx, tokenArray) {
    let isSimpleClosing = true; // Assume it's a simple closing bracket by default

    // Check if the next character is also '>'
    if (tokenArray[currentIdx + 1] === '>') {
        // If it's '>>', check the character after that.
        // If the character after '>>' is a number or '<', then it's a '>>' operator.
        // Otherwise, it's a simple 'q' followed by something else.
        if (isNumericChar(tokenArray[currentIdx + 2]) || tokenArray[currentIdx + 2] === '<') {
            isSimpleClosing = false; // It's a '>>' operator
        }
    }
    return isSimpleClosing;
}

/**
 * Converts the intermediate tokens into a final, standardized token sequence.
 * Specifically, it replaces '<' with 'p', '>' with 'q' (for S<x> operations),
 * and '>>' with 't' (for right shift operations).
 *
 * @param {(number|string)[]} preTokens - The array of intermediate tokens.
 * @returns {(number|string)[]} The final array of standardized tokens.
 */
function convertTokens(preTokens) {
    // q_start and q_end were potentially for tracking bracket pairs, but not used in final logic.
    // var closeBracketStart = 0;
    // var closeBracketEnd = 0;

    const finalTokens = []; // Stores the standardized tokens
    const tokenCount = preTokens.length;

    for (let tokenIdx = 0; tokenIdx < tokenCount; tokenIdx++) {
        const currentToken = preTokens[tokenIdx];

        if (isNumericChar(currentToken)) {
            finalTokens.push(currentToken); // Numbers are pushed as is
        } else if (currentToken === '<') {
            finalTokens.push('p'); // '<' becomes 'p' (start of S<x> operation)
        } else if (currentToken === '>') {
            // Determine if it's a simple closing bracket 'q' or a '>>' shift operator 't'
            if (isClosingBracket(tokenIdx, preTokens)) {
                finalTokens.push('q'); // '>' becomes 'q' (end of S<x> operation)
            } else {
                finalTokens.push('t'); // '>>' becomes 't' (right shift operation)
                tokenIdx += 1; // Skip the next '>' as it's part of '>>'
            }
        }
    }
    return finalTokens;
}

/**
 * Evaluates the expression represented by the token array using a stack-like reduction.
 * It processes 'q' (S<x>) and 't' (x>>y) operators.
 *
 * @param {(number|string)[]} expressionTokens - The array of standardized tokens.
 * @returns {(number|string)[]} An array containing the single final result.
 */
function evaluateExpressionTree(expressionTokens) {
    let evalIndex = 0; // Current index for iteration

    // Continue processing until only one token (the final result) remains
    while (expressionTokens.length > 1) {
        const currentElement = expressionTokens[evalIndex];

        // If the current element is a number or 'p', just move to the next.
        // 'p' marks the start of an S<x> expression, which is handled by 'q'.
        if (isNumericChar(currentElement)) {
            // No action needed for numbers at this stage
        } else if (currentElement === 'p') {
            // No action needed for 'p' at this stage
        }
        // If 'q' (closing S<x> bracket) is encountered:
        // It means we have a structure like [..., 'p', number, 'q', ...]
        // The 'p' and 'q' define the scope of the S operator on the number.
        else if (currentElement === 'q') {
            // Apply the S operator to the number immediately preceding 'q'.
            // The result replaces the 'p' token.
            expressionTokens[evalIndex - 2] = calculateSquaredMod(expressionTokens[evalIndex - 1]);
            // Remove the number and 'q' tokens.
            expressionTokens.splice(evalIndex - 1, 2);
            // Adjust the index to account for removed elements and re-evaluate from the new position.
            evalIndex = evalIndex - 2;
        }
        // If 't' (right shift operator) is encountered:
        // It means we have a structure like [..., number_X, 't', number_Y, ...]
        // This represents number_X >> number_Y.
        else if (currentElement === 't') {
            // Apply the T operator to the number preceding 't' and the number following 't'.
            // The result replaces the first number.
            expressionTokens[evalIndex - 1] = performRightShift(expressionTokens[evalIndex - 1], expressionTokens[evalIndex + 1]);
            // Remove the 't' and the second number tokens.
            expressionTokens.splice(evalIndex, 2);
            // Adjust the index to account for removed elements and re-evaluate from the new position.
            evalIndex = evalIndex - 1;
        }
        evalIndex++; // Move to the next element
    }
    return expressionTokens; // Returns an array with a single element: the final result
}

/**
 * Processes a single line of input, evaluating the expression and logging the result.
 *
 * @param {string} inputExpression - The raw expression string from a single line.
 */
function handleSingleLine(inputExpression) {
    // Step 1: Remove 'S' and whitespace characters.
    inputExpression = cleanInputString(inputExpression);
    // Step 2: Divide the string into initial tokens (numbers and single-char operators).
    inputExpression = tokenizeInitial(inputExpression);
    // Step 3: Convert initial tokens into standardized operator tokens ('p', 'q', 't').
    inputExpression = convertTokens(inputExpression);
    // Step 4: Evaluate the expression tree by reducing tokens.
    inputExpression = evaluateExpressionTree(inputExpression);
    // The result is the first (and only) element in the final array.
    inputExpression = inputExpression[0];
    // Step 5: Log the final computed value.
    outputLog(inputExpression);
}
