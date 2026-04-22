"use strict";

// Core Node.js utilities for console output, etc.
const nodeUtilities = require("util");

// Function alias for logging a line to standard output.
const outputLine = console.log;

// Global state for parsing the current arithmetic expression string.
let currentExpressionString;
let currentIndex = 0; // Pointer to the current character being processed.

/**
 * Helper function to retrieve the character at the current cursor position.
 * @returns {string} The character at currentIndex, or an empty string if out of bounds.
 */
function getCurrentChar() {
    return currentExpressionString.charAt(currentIndex);
}

/**
 * Advances the global cursor by a specified number of steps.
 * @param {number} [steps=1] - The number of positions to advance the cursor.
 */
function advanceCursor(steps = 1) {
    currentIndex += steps;
}

/**
 * Checks if a given character is a digit (0-9).
 * @param {string} char - The character to check.
 * @returns {boolean} True if the character is a digit, false otherwise.
 */
function isDigit(char) {
    return /^\d$/.test(char);
}

/**
 * Parses an arithmetic expression involving addition and subtraction.
 * This is the highest precedence level in our grammar (after factors and terms).
 * Grammar: Expression -> Term { ('+' | '-') Term }
 * @returns {number} The evaluated result of the expression.
 * @throws {Error} If an unexpected character is encountered.
 */
function evaluateExpression() {
    let intermediateResult = evaluateTerm(); // Start by parsing a term

    // Continue processing as long as we encounter '+' or '-'
    while (true) {
        const operator = getCurrentChar();
        if (operator === "+") {
            advanceCursor(); // Consume '+'
            intermediateResult += evaluateTerm();
        } else if (operator === "-") {
            advanceCursor(); // Consume '-'
            intermediateResult -= evaluateTerm();
        } else {
            // No more addition/subtraction operators, so break the loop
            break;
        }
    }
    return intermediateResult;
}

/**
 * Parses an arithmetic term involving multiplication and division.
 * This has higher precedence than addition/subtraction.
 * Grammar: Term -> Factor { ('*' | '/') Factor }
 * @returns {number} The evaluated result of the term.
 * @throws {Error} If an unexpected character is encountered or division by zero occurs.
 */
function evaluateTerm() {
    let currentOperand = parseFactor(); // Start by parsing a factor

    // Continue processing as long as we encounter '*' or '/'
    while (true) {
        const operator = getCurrentChar();
        if (operator === "*") {
            advanceCursor(); // Consume '*'
            currentOperand *= parseFactor();
        } else if (operator === "/") {
            advanceCursor(); // Consume '/'
            const divisor = parseFactor();
            if (divisor === 0) {
                throw new Error(`Runtime Error: Division by zero at position ${currentIndex - 1}`);
            }
            // Integer division using Math.trunc to handle negative numbers consistently with `~~`
            currentOperand = Math.trunc(currentOperand / divisor);
        } else {
            // No more multiplication/division operators, so break the loop
            break;
        }
    }
    return currentOperand;
}

/**
 * Parses the most basic unit of an expression: a number or a parenthesized sub-expression.
 * Grammar: Factor -> Number | '(' Expression ')'
 * @returns {number} The evaluated result of the factor.
 * @throws {Error} If a syntax error (e.g., missing parenthesis) or an invalid character is found.
 */
function parseFactor() {
    // Check for an opening parenthesis, indicating a sub-expression
    if (getCurrentChar() === "(") {
        advanceCursor(); // Consume '('
        const subExpressionResult = evaluateExpression(); // Recursively evaluate the nested expression

        // After evaluating the sub-expression, the next character MUST be a closing parenthesis
        if (getCurrentChar() !== ")") {
            throw new Error(`Syntax Error: Expected ')' at position ${currentIndex}, but found '${getCurrentChar()}'`);
        }
        advanceCursor(); // Consume ')'
        return subExpressionResult;
    }

    // If it's not a parenthesized expression, it must be a direct number
    return extractNumber();
}

/**
 * Extracts a multi-digit number from the current expression string.
 * @returns {number} The parsed integer value.
 * @throws {Error} If a non-digit character is encountered when a number is expected.
 */
function extractNumber() {
    let parsedNumber = 0;
    let digitCount = 0;

    // Loop while the current character is a digit
    while (isDigit(getCurrentChar())) {
        // Convert character to number and append to the parsed number
        parsedNumber = parsedNumber * 10 + Number(getCurrentChar());
        advanceCursor(); // Move to the next character
        digitCount++;
    }

    if (digitCount === 0) {
        // If no digits were found, it means an invalid character was encountered
        throw new Error(`Syntax Error: Expected a number at position ${currentIndex}, but found '${getCurrentChar()}'`);
    }

    return parsedNumber;
}

/**
 * Creates and returns an input handler object for reading data from stdin.
 * It tokenizes input lines based on newlines and optionally spaces.
 * @param {boolean} [shouldSplitByWhitespace=true] - If true, further splits lines by spaces.
 * @returns {object} An object with methods to navigate and consume input tokens.
 */
function createInputHandler(shouldSplitByWhitespace = true) {
    let tokenReadPointer = 0; // Internal pointer for the token array.
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8"); // Read all input from stdin.
    const inputLines = rawInputContent.replace(/\r/g, '').split("\n"); // Normalize newlines and split into lines.

    const processedTokens = []; // Array to store all processed tokens.

    // Process each line to create a flat array of tokens.
    for (const currentLineSegment of inputLines) {
        if (shouldSplitByWhitespace && currentLineSegment.trim() !== "") {
            // If splitting by space and line is not empty, split it.
            for (const segmentPart of currentLineSegment.split(" ")) {
                if (segmentPart !== "") {
                    processedTokens.push(segmentPart);
                }
            }
        } else {
            // Otherwise, push the entire line as a single token.
            processedTokens.push(currentLineSegment);
        }
    }

    return {
        /**
         * Checks if there are more tokens available to read.
         * @returns {boolean} True if more tokens exist, false otherwise.
         */
        hasMoreTokens: function() {
            return typeof processedTokens[tokenReadPointer] !== "undefined";
        },
        /**
         * Returns the next token and advances the read pointer.
         * @returns {string} The next token.
         * @throws {RangeError} If attempting to read beyond available tokens.
         */
        consumeNext: function() {
            if (!this.hasMoreTokens()) {
                throw new RangeError(`Input Error: Attempted to read beyond available tokens at index ${tokenReadPointer}`);
            }
            return processedTokens[tokenReadPointer++];
        },
        /**
         * Returns the next token as a number, advancing the read pointer.
         * @returns {number} The next token converted to a number.
         * @throws {TypeError} If the token cannot be converted to a number.
         */
        consumeNextNumber: function () {
            const token = this.peekCurrent();
            const numValue = Number(token);
            if (!Number.isFinite(numValue)) {
                throw new TypeError(`Input Error: Token '${token}' cannot be converted to a finite number`);
            }
            this.consumeNext(); // Advance after successful conversion check
            return numValue;
        },
        /**
         * Returns the next token as an integer, advancing the read pointer.
         * @returns {number} The next token converted to an integer.
         */
        consumeNextInt: function() {
            return Math.floor(this.consumeNextNumber());
        },
        /**
         * Peeks at the current token without advancing the read pointer.
         * @returns {string|undefined} The current token, or undefined if no more tokens.
         */
        peekCurrent: function() {
            return processedTokens[tokenReadPointer];
        },
        /**
         * Resets the read pointer to the beginning of the token list.
         */
        resetPointer: function() {
            tokenReadPointer = 0;
        }
    };
}

// Initialize the input handler.
const inputProcessor = createInputHandler();

// Read the number of test cases.
let testCaseCount = inputProcessor.consumeNextInt();

// Process each test case.
for (let i = 0; i < testCaseCount; i++) {
    // Reset parser state for each new expression.
    currentIndex = 0;

    // Read the expression line.
    currentExpressionString = inputProcessor.consumeNext();

    // Specific adjustment: remove the last character of the line.
    // This is common in competitive programming to trim trailing newlines or specific markers.
    currentExpressionString = currentExpressionString.slice(0, currentExpressionString.length - 1);

    try {
        // Evaluate the expression.
        const finalResult = evaluateExpression();

        // Output the result for the current test case.
        outputLine(finalResult);
    } catch (evaluationError) {
        // Handle any parsing or runtime errors during expression evaluation.
        outputLine(`Error evaluating expression "${currentExpressionString}": ${evaluationError.message}`);
    }
}