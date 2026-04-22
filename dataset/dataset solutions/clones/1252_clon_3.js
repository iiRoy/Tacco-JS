(function() {
    // This script processes arithmetic expressions provided via standard input.
    // It reads lines until a specific termination keyword is encountered,
    // then performs calculations on the valid lines and outputs the results.

    // --- Input Acquisition and Initial Processing ---
    let rawInputContentBuffer;
    let processedInputRecords;
    let finalDelimiterPosition = -1; // Index of the line containing the termination keyword.
    const standardInputEncoding = 'utf8'; // Preferred encoding for text data.
    const inputTerminationSignal = "END_OF_OPERATIONS"; // Custom termination keyword, changed from '?'.

    try {
        // Attempt to read from standard input.
        // This leverages Node.js's 'fs' module for synchronous file reading.
        // In a real-world scenario, asynchronous reading or stream processing would be more efficient.
        if (typeof require === 'function' && typeof process !== 'undefined' && process.stdin && process.stdin.isTTY === false) {
            // Check if stdin is a pipe/file, not an interactive TTY, to avoid blocking.
            rawInputContentBuffer = require('fs').readFileSync('/dev/stdin');
        } else {
            // Fallback for environments where /dev/stdin might not be accessible
            // or for testing purposes. This is an added guard.
            console.error("ALERT: Standard input not directly accessible or not a pipe. Using simulated input data.");
            rawInputContentBuffer = Buffer.from(
                "10 + 5\n" +
                "  20 - 7\n" +
                "3 * 4   \n" +
                "  15 / 3\n" +
                "INVALID EXPRESSION\n" +
                "END_OF_OPERATIONS\n" + // Our custom termination signal.
                "30 + 2\n" + // This line and subsequent ones should be ignored.
                "40 - 10"
            );
        }

        // Convert the raw buffer content into a string, then split into individual lines.
        processedInputRecords = rawInputContentBuffer.toString(standardInputEncoding).split('\n');

        // --- Identification of Termination Point ---
        // Iterate through the lines to locate the custom termination signal.
        // Original: Backward loop looking for '?'.
        // New: Forward loop looking for 'END_OF_OPERATIONS' with trimming.
        let currentRecordIdx = 0;
        for (const recordSegment of processedInputRecords) {
            // Ensure the segment is a string and not just empty before trimming.
            if (typeof recordSegment === 'string' && recordSegment.trim() === inputTerminationSignal) {
                finalDelimiterPosition = currentRecordIdx;
                break; // Once found, no need to continue searching.
            }
            currentRecordIdx++;
        }

        // --- Filtering and Preparation of Effective Input ---
        let effectiveOperationSet;
        if (finalDelimiterPosition !== -1) {
            // If the termination signal was found, only consider lines before it.
            effectiveOperationSet = processedInputRecords.slice(0, finalDelimiterPosition);
        } else {
            // If no termination signal, process all available input lines.
            effectiveOperationSet = processedInputRecords;
        }

        // Further filter out any completely empty lines that might result from splitting
        // or leading/trailing newlines in the input file.
        effectiveOperationSet = effectiveOperationSet.filter(segment => typeof segment === 'string' && segment.trim().length > 0);

        // --- Execution of Arithmetic Operations ---
        // Collect the outcomes of each calculation.
        // Original: `line.map(solve).join("\n")`.
        // New: Explicit loop with error handling and intermediate result storage.
        const calculatedOutcomes = [];
        for (const expressionString of effectiveOperationSet) {
            try {
                // Attempt to compute the result for the current expression.
                const resultValue = evaluateArithmeticExpression(expressionString);
                calculatedOutcomes.push(resultValue);
            } catch (errorDetails) {
                // If an error occurs during evaluation of a single line,
                // log the error for that line and continue processing other lines.
                calculatedOutcomes.push(`EVALUATION_ERROR: ${errorDetails.message} for input "${expressionString}"`);
            }
        }

        // --- Output Generation ---
        // Display all computed results, separated by newlines.
        console.log(calculatedOutcomes.join('\n'));

    } catch (primaryError) {
        // Catch any fatal errors during the initial input reading or setup phase.
        console.error("CRITICAL_FAILURE: An unrecoverable error prevented processing:", primaryError.message);
    }

    /**
     * Analyzes an arithmetic expression string and computes its result.
     * Original function: `solve(line)`.
     *
     * @param {string} rawExpressionText - The input string containing an arithmetic operation (e.g., "10 + 5").
     * @returns {number} The numerical result of the expression.
     * @throws {Error} If the expression is malformed, contains invalid numbers, or an unsupported operator.
     */
    function evaluateArithmeticExpression(rawExpressionText) {
        // Input validation: Ensure the expression is a non-empty string.
        if (typeof rawExpressionText !== 'string' || rawExpressionText.trim().length === 0) {
            throw new Error("Empty or invalid expression string provided.");
        }

        // Original: `ary = line.split(" ", 3);`
        // New: Using `const` and more descriptive variable names.
        const componentsOfExpression = rawExpressionText.trim().split(' ', 3);

        // Structural validation: Check if the expression has the expected number of parts.
        if (componentsOfExpression.length !== 3) {
            throw new Error(`Expression format error: Expected 'operand operator operand', but found ${componentsOfExpression.length} parts in "${rawExpressionText}".`);
        }

        // Parse operands into numerical types. `Number()` is more flexible than `parseInt()`.
        const operandA = Number(componentsOfExpression[0]);
        const operatorChar = componentsOfExpression[1];
        const operandB = Number(componentsOfExpression[2]);

        // Semantic validation: Check if operands are valid numbers.
        if (isNaN(operandA) || isNaN(operandB)) {
            throw new Error(`Invalid numeric operands detected in expression: "${rawExpressionText}".`);
        }

        let computedOutcome;

        // Original: `if/else if` chain.
        // New: `switch` statement for better readability and extensibility.
        switch (operatorChar) {
            case '+':
                computedOutcome = operandA + operandB;
                break;
            case '-':
                computedOutcome = operandA - operandB;
                break;
            case '*':
                computedOutcome = operandA * operandB;
                break;
            case '/':
                // Guard against division by zero.
                if (operandB === 0) {
                    throw new Error("Attempted division by zero.");
                }
                // Original: `Math.floor(parseInt(ary[0]) / parseInt(ary[2]))`.
                // New: Using `Math.trunc()` for integer division, which correctly handles negative numbers
                // by simply removing the fractional part (e.g., trunc(-5.5) is -5, floor(-5.5) is -6).
                computedOutcome = Math.trunc(operandA / operandB);
                break;
            default:
                // For any unrecognized operator, throw an error.
                // The original code would default to division for unknown operators,
                // this change makes the behavior more explicit and safer.
                throw new Error(`Unsupported arithmetic operator "${operatorChar}" encountered in expression: "${rawExpressionText}".`);
        }

        return computedOutcome;
    }

})(); // End of the Immediately Invoked Function Expression (IIFE) for scope management.