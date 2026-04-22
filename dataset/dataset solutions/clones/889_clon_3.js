/*
 * This file contains a JavaScript program designed to parse and evaluate a custom
 * expression syntax. The expressions involve numerical literals, a custom "S" operator
 * (similar to squaring with modular arithmetic), and a custom "T" operator
 * (similar to right bit shift or division by powers of two).
 *
 * The processing pipeline involves several stages:
 * 1. Initial cleaning of the input string.
 * 2. Segmentation of the string into numerical literals and operator characters.
 * 3. Tokenization of these segments into a symbolic representation.
 * 4. Evaluation of the symbolic expression using an iterative reduction approach.
 *
 * The program is designed to run in a Node.js environment, reading input
 * line by line from standard input and printing results to standard output.
 */

// Global output handler, aliased for convenience.
let outputLogger = console.log;

// Check if running in a Node.js-like environment to handle standard input.
if (typeof process !== "undefined" && process.stdin) {
    let inputBuffer = ""; // Accumulates all incoming data.
    process.stdin.resume(); // Keep the process alive for input.
    process.stdin.setEncoding('utf8'); // Specify character encoding.

    // Event listener for data chunks.
    process.stdin.on('data', function(dataChunk) {
        inputBuffer += dataChunk; // Append current chunk to buffer.
    });

    // Event listener for end of input stream.
    process.stdin.on('end', function() {
        // Split the accumulated input into individual lines.
        const inputRecords = inputBuffer.split("\n");
        // Trigger the main processing function with the gathered input.
        processInputRecords(inputRecords);
    });
}


/**
 * Orchestrates the processing of all input records.
 * Each record (line) is processed sequentially.
 *
 * @param {string[]} inputRecords - An array of strings, where each string is an input line.
 */
function processInputRecords(inputRecords) {
    // Iterate over each record provided in the input array.
    inputRecords.forEach(function(currentRecord) {
        // Skip processing if the record is a special termination marker.
        if (currentRecord !== "#") {
            executeComputationFlow(currentRecord);
        }
    });
}

/**
 * Recursively calculates a modified sum with modular arithmetic.
 * This function effectively computes (baseValue * exponentFactor) % modDivisor,
 * but uses a specialized recursive approach for large exponent factors
 * to handle the custom "S" operator logic.
 *
 * @param {number} baseValue - The base number for the calculation.
 * @param {number} exponentFactor - The factor by which the base is "multiplied" or iterated.
 * @returns {number} The result of the modular sum.
 */
function calculateModularSumRecursive(baseValue, exponentFactor) {
    // Define the modulus for all calculations.
    const modDivisor = 1000000007;

    // Optimization for large base values and exponent factors greater than 1.
    // This condition is heuristic and aims to prevent stack overflow for very large numbers
    // while maintaining a specific behavior (likely related to the original problem's constraints).
    if (baseValue > 90000000 && exponentFactor > 1) {
        const remainderCheck = exponentFactor % 2; // Check if exponentFactor is odd.
        const halfExponent = Math.floor(exponentFactor / 2); // Integer division.

        // Recursive call with half the exponent.
        let intermediateResult = calculateModularSumRecursive(baseValue, halfExponent);
        let currentSum;

        // Apply specific logic based on whether the exponent was odd or even.
        if (remainderCheck !== 0) { // If exponentFactor was odd.
            currentSum = (2 * intermediateResult + baseValue) % modDivisor;
        } else { // If exponentFactor was even.
            currentSum = (2 * intermediateResult) % modDivisor;
        }
        // Ensure the final sum is within the modular range.
        return currentSum % modDivisor;
    }
    // Base case: for small exponent factors or base values, perform direct multiplication.
    // Ensure the result is always positive and within the modular range.
    return (baseValue * exponentFactor) % modDivisor;
}


/**
 * Computes the "S" operator equivalent: S(x) = x * x (mod D).
 * This uses the custom recursive modular sum function.
 *
 * @param {number} inputVal - The number to apply the S operator to.
 * @returns {number} The modular squared value.
 */
function evaluateSquaredSum(inputVal) {
    return calculateModularSumRecursive(inputVal, inputVal);
}

/**
 * Computes the "T" operator equivalent: T(x, y) = floor(x / (2^y)).
 * This is effectively an integer right shift by 'y' positions.
 *
 * @param {number} dividendNum - The numerator.
 * @param {number} shiftAmount - The power of 2 to divide by (or number of right shifts).
 * @returns {number} The result of the division, floored.
 */
function binaryRightShift(dividendNum, shiftAmount) {
    // Using bitwise right shift operator for efficiency and clarity.
    // If shiftAmount is negative or very large, this might behave differently than Math.pow(2,y).
    // For positive shiftAmount, it's equivalent to Math.floor(dividendNum / (1 << shiftAmount)).
    return dividendNum >> shiftAmount;
}

/**
 * Cleans the raw input string by removing all whitespace characters and
 * the specific character 'S'.
 *
 * @param {string} rawString - The original input string.
 * @returns {string} The cleaned string.
 */
function stripSpecialChars(rawString) {
    // Use a regular expression to match whitespace (\s) or the literal 'S'.
    // The 'g' flag ensures all occurrences are replaced.
    let processedString = rawString.replace(/[\sS]/g, '');
    // Optionally, trim any leading/trailing whitespace that might remain (though regex should cover it).
    return processedString.trim();
}

/**
 * Checks if a given token candidate can be successfully parsed into a number.
 *
 * @param {*} tokenCandidate - The value to check. Can be string or number.
 * @returns {boolean} True if the token represents a valid number, false otherwise.
 */
function checkIfNumber(tokenCandidate) {
    // Attempt to convert the candidate to a number.
    const parsedValue = Number(tokenCandidate);
    // Check if the parsed value is NOT NaN (Not-a-Number).
    // This is a robust way to determine if a value is a valid number.
    return !isNaN(parsedValue);
}

/**
 * Divides the input character sequence into initial segments:
 * sequences of digits (parsed as numbers) and individual operator characters.
 *
 * Example: "123<4>>5" -> [123, '<', 4, '>', '>', 5]
 *
 * @param {string} charArrayInput - The input string to segment.
 * @returns {Array<string|number>} An array of segmented tokens.
 */
function segmentInputTokens(charArrayInput) {
    if (!charArrayInput || charArrayInput.length === 0) {
        return []; // Return empty array for empty input.
    }

    const inputChars = charArrayInput.split(''); // Convert string to char array.
    const inputLength = inputChars.length;
    let segmentStartIdx = 0;
    let processedTokens = [];
    let inNumberSequence = false; // Flag to track if we are currently parsing a number.

    for (let currentIdx = 0; currentIdx < inputLength; currentIdx++) {
        const currentChar = inputChars[currentIdx];

        // Case 1: Transition from non-number to number.
        if (!inNumberSequence && checkIfNumber(currentChar)) {
            segmentStartIdx = currentIdx; // Mark the start of a new number.
            inNumberSequence = true;
        }
        // Case 2: Transition from number to non-number.
        else if (inNumberSequence && !checkIfNumber(currentChar)) {
            // End of a number sequence. Extract and parse it.
            let numberSegment = inputChars.slice(segmentStartIdx, currentIdx).join('');
            processedTokens.push(Number(numberSegment));
            inNumberSequence = false; // Reset flag.
        }

        // Case 3: If current character is not part of a number sequence, push it directly.
        // This handles operators and characters outside of number literals.
        if (!checkIfNumber(currentChar)) {
            processedTokens.push(currentChar);
        }
    }

    // After the loop, if we were still in a number sequence, process the last number.
    if (inNumberSequence) {
        let lastNumberSegment = inputChars.slice(segmentStartIdx, inputLength).join('');
        processedTokens.push(Number(lastNumberSegment));
    }

    return processedTokens;
}

/**
 * Determines if a '>' character acts as a simple closing bracket 'q'
 * or as part of a binary right shift operator 't' (>>).
 *
 * @param {number} currentIndex - The index of the '>' character in the token sequence.
 * @param {Array<string|number>} tokenSequence - The array of segmented tokens.
 * @returns {boolean} True if it's a simple closing bracket 'q', false if it's part of '>>'.
 */
function detectSimpleClosing(currentIndex, tokenSequence) {
    // Check if the next token exists and is also a '>'.
    // Also, check the token after '>>' to disambiguate.
    // If it's '>>' followed by a number or '<', it's the shift operator.
    // Otherwise, '>>' might not be a single operator, or it's a simple 'q'.
    if (currentIndex + 1 < tokenSequence.length && tokenSequence[currentIndex + 1] === '>') {
        // If it's '>>', then check the token after the second '>'.
        // If it's a number or '<', it implies the '>>' is the T operator.
        if (currentIndex + 2 < tokenSequence.length) {
            const nextNextToken = tokenSequence[currentIndex + 2];
            if (checkIfNumber(nextNextToken) || nextNextToken === '<') {
                return false; // It's part of the '>>' (T) operator.
            }
        }
        // If '>>' is not followed by a number or '<', it could still be two separate 'q's
        // or the context implies it's not the T operator.
        // For robustness, if the above condition isn't met, we assume it's a 'q'.
        // This might need re-evaluation based on specific grammar rules if different.
    }
    return true; // Default to simple closing bracket 'q'.
}


/**
 * Converts a sequence of raw segments (numbers and characters) into a
 * symbolic token stream, where '<' becomes 'p', '>' becomes 'q' (or 't' for '>>').
 *
 * @param {Array<string|number>} segmentedInput - The output from `segmentInputTokens`.
 * @returns {Array<string|number>} An array of symbolic tokens.
 */
function symbolicTransformer(segmentedInput) {
    if (!segmentedInput || segmentedInput.length === 0) {
        return [];
    }

    let symbolicTokens = [];
    const segmentCount = segmentedInput.length;

    for (let currentIdx = 0; currentIdx < segmentCount; currentIdx++) {
        const currentToken = segmentedInput[currentIdx];

        if (checkIfNumber(currentToken)) {
            symbolicTokens.push(currentToken);
        } else {
            // Use a switch statement for clearer operator handling.
            switch (currentToken) {
                case '<':
                    symbolicTokens.push('p'); // 'p' for opening bracket.
                    break;
                case '>':
                    // Check if this '>' is part of a '>>' (T operator).
                    if (!detectSimpleClosing(currentIdx, segmentedInput)) {
                        symbolicTokens.push('t'); // 't' for binary right shift operator.
                        currentIdx++; // Skip the next '>' as it's part of '>>'.
                    } else {
                        symbolicTokens.push('q'); // 'q' for simple closing bracket.
                    }
                    break;
                // Potentially add a default case for unknown characters, or throw an error.
                default:
                    // For now, silently ignore or push as is, depending on desired robustness.
                    // For this problem, we expect only numbers, '<', and '>'.
                    break;
            }
        }
    }
    return symbolicTokens;
}

/**
 * Evaluates the symbolic token stream by iteratively resolving the custom operators
 * ('p', 'q', 't') and reducing the stream to a single numerical result.
 * The evaluation follows a specific order: first 'S' operators (p...q), then 'T' operators (t).
 *
 * @param {Array<string|number>} tokenStream - The output from `symbolicTransformer`.
 * @returns {Array<number>} An array containing the final single numerical result.
 */
function resolveOperations(tokenStream) {
    if (!tokenStream || tokenStream.length === 0) {
        return []; // Return empty for empty input.
    }

    let processIndex = 0;
    // Continue processing until the stream is reduced to a single element.
    while (tokenStream.length > 1 && processIndex < tokenStream.length) {
        const currentSymbol = tokenStream[processIndex];

        // Handle 'q' (closing bracket for 'S' operator)
        if (currentSymbol === 'q') {
            // Requires a structure like [p, NUMBER, q] or [NUMBER, q] (if 'p' is implicit)
            // The original logic assumes [p, NUMBER, q] is resolved to S(NUMBER).
            // It searches for 'NUMBER' at processIndex - 1 and 'p' at processIndex - 2.
            // If 'p' is not found, it implies the 'S' operator is applied directly to the number.
            // Let's stick to the original's assumption: NUMBER at i-1, and 'p' at i-2, then S(NUMBER).
            if (processIndex >= 2 && tokenStream[processIndex - 2] === 'p' && checkIfNumber(tokenStream[processIndex - 1])) {
                const operand = tokenStream[processIndex - 1];
                const result = evaluateSquaredSum(operand);
                // Replace [p, operand, q] with the result.
                tokenStream.splice(processIndex - 2, 3, result);
                processIndex -= 2; // Adjust index to re-evaluate the new element.
            } else if (processIndex >= 1 && checkIfNumber(tokenStream[processIndex - 1])) {
                // This case handles a direct 'NUMBER, q' without an explicit 'p'.
                // This might be an edge case or implicit behavior.
                // The original code `line[i-2] = S(line[i-1]); line.splice(i-1,2);`
                // suggests it expects something at i-2 (which would be 'p').
                // If it's just `NUMBER, q`, then it's `S(NUMBER)`.
                // Let's align with the original's `line[i-2]` access. If `i-2` is `p`, then `S(line[i-1])`.
                // The original `line[i-2] = S(line[i-1]); line.splice(i-1, 2);` effectively removes `NUMBER` and `q`,
                // and places `S(NUMBER)` at `p`'s position. This means `p` is replaced.
                // If there's no `p`, this logic is problematic.
                // Let's refine based on the expected structure `p X q`.
                // If `q` is found, it must close a `p`.
                // If `tokenStream[processIndex - 2]` is `p`, then `tokenStream[processIndex - 1]` is the operand.
                if (processIndex >= 2 && tokenStream[processIndex - 2] === 'p') {
                    const operand = tokenStream[processIndex - 1];
                    const result = evaluateSquaredSum(operand);
                    // Replace 'p', operand, 'q' with the computed result.
                    tokenStream.splice(processIndex - 2, 3, result);
                    processIndex -= 2; // Move back to re-evaluate the new result.
                } else {
                    // If 'q' doesn't have a 'p' preceding it, it's an error or unexpected state.
                    // For robust parsing, we might throw an error. For cloning, follow original intent.
                    // Original code `line[i-2] = S(line[i-1]); line.splice(i-1,2);`
                    // implies `i-2` existed and was replaced.
                    // This suggests 'p' is always expected. If not, the current `q` is skipped.
                    processIndex++; // Move to next token if no matching 'p' found.
                }
            } else {
                processIndex++; // Move to next token if not enough elements for 'q' reduction.
            }
        }
        // Handle numbers that might be operands for 't' operator
        else if (checkIfNumber(currentSymbol)) {
            // Check for a pattern like [NUMBER_A, 't', NUMBER_B]
            if (processIndex >= 2 && tokenStream[processIndex - 1] === 't' && checkIfNumber(tokenStream[processIndex - 2])) {
                const operandA = tokenStream[processIndex - 2];
                const operandB = currentSymbol; // currentSymbol is NUMBER_B
                const result = binaryRightShift(operandA, operandB);
                // Replace [operandA, 't', operandB] with the result.
                tokenStream.splice(processIndex - 2, 3, result);
                processIndex -= 2; // Adjust index to re-evaluate.
            } else {
                processIndex++; // Move to next token.
            }
        }
        // For 'p' and 't' (when not followed by a number for reduction), just advance.
        else if (currentSymbol === 'p' || currentSymbol === 't') {
            processIndex++;
        }
        // If an unexpected token, advance to avoid infinite loop.
        else {
            processIndex++;
        }
        // Ensure index doesn't go negative.
        if (processIndex < 0) {
            processIndex = 0;
        }
    }
    return tokenStream; // Should contain a single number if successful.
}


/**
 * Executes the full computation flow for a single input record.
 * This function orchestrates the cleaning, segmentation, tokenization,
 * and evaluation stages.
 *
 * @param {string} inputRecordString - The raw string from a single input line.
 */
function executeComputationFlow(inputRecordString) {
    // Stage 1: Clean the input string.
    let cleanedString = stripSpecialChars(inputRecordString);
    if (!cleanedString) {
        outputLogger(''); // Output empty line for empty cleaned string.
        return;
    }

    // Stage 2: Segment into numbers and raw operator characters.
    let segmentedData = segmentInputTokens(cleanedString);
    if (!segmentedData || segmentedData.length === 0) {
        outputLogger('');
        return;
    }

    // Stage 3: Convert raw segments into symbolic tokens.
    let symbolicTokens = symbolicTransformer(segmentedData);
    if (!symbolicTokens || symbolicTokens.length === 0) {
        outputLogger('');
        return;
    }

    // Stage 4: Evaluate the symbolic expression.
    let finalResultArray = resolveOperations(symbolicTokens);

    // Final check and output.
    if (!finalResultArray || finalResultArray.length === 0) {
        outputLogger('');
        return;
    }

    // The result should be a single number in an array.
    outputLogger(finalResultArray[0]);
}