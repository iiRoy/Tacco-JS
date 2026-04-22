// This module provides an advanced calculator functionality,
// capable of evaluating arithmetic expressions from standard input.
// It utilizes a recursive descent parser to handle operator precedence
// and parenthetical grouping.
(function(rawInputData) {
    // Regular expression to aggressively remove all whitespace characters
    // from the input expression string, simplifying parsing.
    const WHITESPACE_STRIPPER_REGEX = /\s+/g;

    // Regular expression to match a single digit character (0-9).
    const NUMERIC_DIGIT_PATTERN = /[0-9]/;

    // A global (within this IIFE's scope) variable to hold the
    // mathematical expression string currently being processed.
    let currentExpressionString;

    // A pointer indicating the current character position in
    // `currentExpressionString` that the parser is examining.
    let parseHeadPosition;

    /**
     * Evaluates an arithmetic expression, specifically handling addition and subtraction.
     * This function represents the lowest precedence level in the parser hierarchy,
     * meaning it processes operations after multiplication/division.
     *
     * @returns {number} The computed numerical result of the expression segment.
     */
    function evaluateSumDifference() {
        // Begin by evaluating a 'product-quotient' term, which handles higher precedence operations.
        let accumulatedResult = processProductQuotient();

        // Continuously process addition and subtraction operations
        // as long as the parser hasn't reached the end of the string
        // and encounters an additive/subtractive operator.
        while (parseHeadPosition < currentExpressionString.length) {
            const currentOperatorChar = currentExpressionString[parseHeadPosition];

            if (currentOperatorChar === '+') {
                parseHeadPosition++; // Advance past the '+' operator.
                // Add the result of the next product-quotient term.
                accumulatedResult += processProductQuotient();
            } else if (currentOperatorChar === '-') {
                parseHeadPosition++; // Advance past the '-' operator.
                // Subtract the result of the next product-quotient term.
                accumulatedResult -= processProductQuotient();
            } else {
                // If the character is not '+' or '-', this expression level is complete.
                break;
            }
        }
        return accumulatedResult;
    }

    /**
     * Processes a term, handling multiplication and division operations.
     * This function represents an intermediate precedence level, operating
     * on 'primary' operands (numbers or parenthesized expressions).
     *
     * @returns {number} The computed numerical result of the term segment.
     */
    function processProductQuotient() {
        // Start by parsing a 'primary operand', which could be a number or a parenthesized expression.
        let currentOperandValue = parsePrimaryOperand();

        // Loop to apply multiplication or division operators.
        while (parseHeadPosition < currentExpressionString.length) {
            const currentSymbol = currentExpressionString[parseHeadPosition];

            if (currentSymbol === '*') {
                parseHeadPosition++; // Advance past the '*' operator.
                // Multiply the current operand by the next primary operand.
                // Math.floor ensures integer arithmetic, consistent with division.
                currentOperandValue = Math.floor(currentOperandValue * parsePrimaryOperand());
            } else if (currentSymbol === '/') {
                parseHeadPosition++; // Advance past the '/' operator.
                const divisor = parsePrimaryOperand(); // Get the divisor.

                // Implement a basic check for division by zero to prevent runtime errors
                // and provide a more informative output.
                if (divisor === 0) {
                    console.error(`Runtime Error: Division by zero detected in expression at position ${parseHeadPosition}.`);
                    // Returning NaN or throwing an error are valid Type III changes.
                    // Returning NaN allows the program to continue, but indicates an invalid result.
                    return NaN;
                }
                // Perform integer division.
                currentOperandValue = Math.floor(currentOperandValue / divisor);
            } else {
                // If no multiplication or division operator, this term is fully processed.
                break;
            }
        }
        return currentOperandValue;
    }

    /**
     * Parses a primary operand, which can be either a numeric literal or
     * an expression enclosed in parentheses. This is the highest precedence level.
     *
     * @returns {number} The numerical value of the primary operand.
     */
    function parsePrimaryOperand() {
        let evaluatedValue;

        // Check if the current character indicates the start of a parenthesized expression.
        if (currentExpressionString[parseHeadPosition] === '(') {
            parseHeadPosition++; // Consume the opening parenthesis.
            // Recursively call evaluateSumDifference to handle the inner expression.
            evaluatedValue = evaluateSumDifference();

            // After evaluating the inner expression, expect a closing parenthesis.
            if (currentExpressionString[parseHeadPosition] !== ')') {
                console.error(`Syntax Error: Expected ')' at position ${parseHeadPosition}, but found ` +
                              `'${currentExpressionString[parseHeadPosition] || 'end of string'}' in '${currentExpressionString}'.`);
                // For robustness, returning NaN or throwing an error is a valid response.
                return NaN;
            }
            parseHeadPosition++; // Consume the closing parenthesis.
        } else {
            // If not a parenthesis, assume it's a numeric literal.
            evaluatedValue = extractNumericLiteral();
        }

        // A final check to ensure a valid number was obtained.
        if (typeof evaluatedValue === 'undefined' || Number.isNaN(evaluatedValue)) {
            console.error(`Parsing Error: Could not determine a valid numerical value at position ${parseHeadPosition}.`);
            // Provide a default value or propagate error.
            return 0;
        }

        return evaluatedValue;
    }

    /**
     * Extracts and converts a sequence of digits into an integer.
     * This function moves the `parseHeadPosition` past the consumed digits.
     *
     * @returns {number} The parsed integer value. Returns 0 if no digits are found
     *                   or if an error occurs, along with a console warning.
     */
    function extractNumericLiteral() {
        let constructedNumber = 0;
        let digitsReadCount = 0; // Tracks how many digits were successfully parsed.

        // Continue as long as we are within string bounds and the current character is a digit.
        while (parseHeadPosition < currentExpressionString.length &&
               currentExpressionString[parseHeadPosition].match(NUMERIC_DIGIT_PATTERN)) {
            // Convert the character digit to its integer value and append it.
            // This is an efficient way to build the number without string concatenation.
            constructedNumber = (constructedNumber * 10) + Number.parseInt(currentExpressionString[parseHeadPosition], 10);
            parseHeadPosition++; // Move to the next character.
            digitsReadCount++;
        }

        // If no digits were consumed, it indicates an unexpected character
        // where a number was expected.
        if (digitsReadCount === 0) {
            console.warn(`Syntax Warning: Expected a numeric literal at position ${parseHeadPosition}, ` +
                         `but found '${currentExpressionString[parseHeadPosition] || 'end of string'}'. Returning 0.`);
            return 0; // Return a default value to allow parsing to continue, or throw an error.
        }

        return constructedNumber;
    }

    // --- Main Program Execution Flow ---

    // Initial data preparation:
    // 1. Remove all carriage returns (`\r`) to normalize line endings.
    // 2. Split the input string into an array of individual lines.
    const inputLines = rawInputData.replace(/\r/g, '').split('\n');

    // The first line of the input is expected to be the number of test cases.
    let numberOfTestCases = Number.parseInt(inputLines.shift(), 10);

    // Validate the parsed number of test cases.
    if (Number.isNaN(numberOfTestCases) || numberOfTestCases <= 0) {
        console.error("Initialization Error: The first line of input must be a positive integer " +
                      "representing the number of test cases. Received: " + rawInputData.split('\n')[0]);
        return; // Halt execution if the initial input is invalid.
    }

    // Iterate through each test case provided in the input.
    while (numberOfTestCases > 0) {
        let currentExpressionLine = inputLines.shift();

        // Guard clause: Ensure there's an expression line available for each test case.
        if (!currentExpressionLine) {
            console.error(`Input Error: Expected ${numberOfTestCases} more expression lines, but ran out of input.`);
            break; // Stop processing if input lines are exhausted prematurely.
        }

        // Prepare the expression for parsing:
        // 1. Remove all whitespace characters from the line.
        currentExpressionString = currentExpressionLine.replace(WHITESPACE_STRIPPER_REGEX, '');
        // 2. Reset the parser's head position for the new expression.
        parseHeadPosition = 0;

        // Execute the main parsing and evaluation function.
        const finalCalculatedResult = evaluateSumDifference();

        // Post-evaluation check: Verify if the entire expression was consumed.
        // This helps detect malformed expressions with trailing unparsed characters.
        if (parseHeadPosition < currentExpressionString.length) {
            console.warn(`Warning: Unparsed characters detected in expression '${currentExpressionString}' ` +
                         `starting from position ${parseHeadPosition}. Remaining: '${currentExpressionString.substring(parseHeadPosition)}'.`);
        }

        // Output the final result of the expression evaluation.
        console.log(finalCalculatedResult);

        // Decrement the counter for remaining test cases.
        numberOfTestCases--;
    }

})(require("fs").readFileSync("/dev/stdin", "utf8")); // Reads input from standard input as a UTF-8 string.