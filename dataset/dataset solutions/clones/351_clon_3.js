// This module is designed to process a series of mathematical equations where an unknown digit 'X'
// needs to be replaced by a number from 0 to 9 to satisfy the equality.
// It reads equations from standard input and outputs the first valid digit found, or 'NA' if none works.

// A buffer to collect all incoming data chunks from standard input.
var rawDataStreamAccumulator = '';

/**
 * Preprocesses the raw input text, splitting it into individual lines
 * and filtering out any lines that are empty or consist only of whitespace.
 * @param {string} fullRawText The complete string read from standard input.
 * @returns {string[]} An array of non-empty, trimmed lines.
 */
function parseRawInputIntoEquationLines(fullRawText) {
    // We split the entire raw text by newline characters to get individual potential equation strings.
    // Then, we filter this array, keeping only those lines that, after trimming whitespace,
    // still contain actual content. This ensures we don't process empty rows.
    return fullRawText.split('\n').filter(function(singleLineEntry) {
        return singleLineEntry.trim().length > 0;
    });
}

/**
 * Checks if substituting the given digit for 'X' would result in an invalid leading zero
 * in any of the operand strings.
 * @param {number} candidateDigit The digit (0-9) being tested for substitution.
 * @param {string} operandStr1 The string representation of the first operand.
 * @param {string} operandStr2 The string representation of the second operand.
 * @param {string} operandStrResult The string representation of the result operand.
 * @returns {boolean} True if a leading 'X' would become '0', otherwise false.
 */
function hasInvalidLeadingZero(candidateDigit, operandStr1, operandStr2, operandStrResult) {
    // According to the problem's interpretation, if 'X' is 0 and it's the first character
    // of any number, it's considered an invalid leading zero.
    if (candidateDigit === 0) {
        // Check if the 'X' appears at the very beginning of any of the three number strings.
        if (operandStr1.startsWith('X') || operandStr2.startsWith('X') || operandStrResult.startsWith('X')) {
            return true; // This substitution would create an invalid leading zero.
        }
    }
    return false; // No invalid leading zero detected for this digit.
}

/**
 * The main logic function that iterates through each equation, attempts to solve it,
 * and prints the corresponding result.
 */
function processAndSolveEquations() {
    // First, prepare the list of equation strings from the accumulated input buffer.
    const equationStatements = parseRawInputIntoEquationLines(rawDataStreamAccumulator);

    // Iterate over each equation statement provided in the input array.
    for (const currentEquationString of equationStatements) {
        // A robust check for empty or purely whitespace lines, although `parseRawInputIntoEquationLines`
        // should have already filtered most of these. This serves as an additional safety net.
        if (!currentEquationString || currentEquationString.trim().length === 0) {
            continue; // Skip processing for genuinely empty lines.
        }

        // Define the regular expression to extract the three numeric parts of the equation.
        // It looks for a sequence of digits or 'X' followed by '+', then another sequence,
        // then '=', and finally the result sequence. Whitespace around operators is tolerated.
        const equationRegex = /^([0-9X]+)\s*\+\s*([0-9X]+)\s*=\s*([0-9X]+)$/;
        const regexMatchResult = currentEquationString.match(equationRegex);

        // Guard clause: If the current line does not conform to the expected equation pattern,
        // log a warning and output 'NA' for this specific line.
        if (!regexMatchResult) {
            console.warn(`Skipping malformed equation statement: "${currentEquationString}".`);
            console.log('NA'); // Output 'NA' as per problem specification for unparseable lines.
            continue; // Move to the next statement.
        }

        // Use array destructuring to extract the captured groups (the three numeric strings).
        // The first element `_` captures the full matched string, which we don't need here.
        const [_, firstOperandRaw, secondOperandRaw, resultOperandRaw] = regexMatchResult;

        let solutionDigit = 10; // Initialize with 10, a sentinel value indicating no solution (maps to 'NA').

        // Begin iterating through all possible digits from 0 to 9.
        // This loop attempts to find the correct digit for 'X'.
        for (let testDigit = 0; testDigit <= 9; testDigit++) {
            // Apply the leading zero constraint check. If invalid, skip this digit and try the next.
            if (hasInvalidLeadingZero(testDigit, firstOperandRaw, secondOperandRaw, resultOperandRaw)) {
                continue; // This digit is not valid due to a leading zero.
            }

            // Convert the current `testDigit` to its string representation for replacement.
            const digitCharacterToSubstitute = String(testDigit);

            // Replace all occurrences of 'X' with the current `digitCharacterToSubstitute` in each operand string.
            const evaluatedFirstNumStr = firstOperandRaw.replace(/X/g, digitCharacterToSubstitute);
            const evaluatedSecondNumStr = secondOperandRaw.replace(/X/g, digitCharacterToSubstitute);
            const evaluatedResultNumStr = resultOperandRaw.replace(/X/g, digitCharacterToSubstitute);

            // Convert the modified strings into actual numeric values.
            // Using `Number()` constructor which is similar to `parseInt()` for these cases.
            const valueOfFirstOperand = Number(evaluatedFirstNumStr);
            const valueOfSecondOperand = Number(evaluatedSecondNumStr);
            const valueOfResultOperand = Number(evaluatedResultNumStr);

            // Check if the arithmetic equality holds true for the current digit.
            if (valueOfFirstOperand + valueOfSecondOperand === valueOfResultOperand) {
                solutionDigit = testDigit; // A valid digit has been found.
                break; // Exit the loop immediately as we need the first such digit.
            }
        }

        // Based on whether a solution was found, output the digit or 'NA'.
        // This uses an explicit if-else block instead of a ternary for clarity and structural change.
        if (solutionDigit === 10) {
            console.log('NA'); // No digit from 0-9 satisfied the equation.
        } else {
            console.log(solutionDigit); // Output the digit that made the equation true.
        }
    }
}

// --- Standard Input/Output Stream Management ---

// Ensures that the standard input stream is active and ready to receive data.
process.stdin.resume();

// Sets the character encoding for the input data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for when data chunks are received from standard input.
// Each incoming chunk is appended to our global buffer.
process.stdin.on('data', function(incomingDataChunk) {
    rawDataStreamAccumulator += incomingDataChunk;
});

// Event listener for when the standard input stream has ended (no more data to come).
// Once all data is received, the main processing function is called.
process.stdin.on('end', function() {
    // All input has been collected; now it's time to process and solve the puzzles.
    processAndSolveEquations();
});

// An additional error handler for the standard input stream.
// This ensures graceful error handling if issues occur during input reading.
process.stdin.on('error', function(streamError) {
    console.error('An error occurred while reading from standard input:', streamError.message);
    process.exit(1); // Exit the process with an error code.
});