/*
 * This file contains logic for parsing and evaluating a custom expression language.
 * The core functionality involves modular arithmetic and bitwise operations.
 *
 * Original source inspiration: http://judge.u-aizu.ac.jp/onlinejudge/description.jsp?id=2570
 *
 * Status: Implemented and tested against basic cases.
 * Comments: Extensive documentation added for clarity and maintainability.
 */

// Global output stream alias for convenience.
const outputStream = console.log;

// Check if running in a Node.js environment to set up input handling.
if (typeof process !== "undefined" && process.stdin) {
    let rawInputBuffer = "";

    // Resume stdin to start receiving data.
    process.stdin.resume();
    // Set encoding to UTF-8 for text input.
    process.stdin.setEncoding('utf8');

    // Event listener for incoming data chunks.
    process.stdin.on('data', (dataChunk) => {
        rawInputBuffer += dataChunk;
    });

    // Event listener for end of input stream.
    process.stdin.on('end', () => {
        // Split the accumulated input into individual lines.
        const inputDataLines = rawInputBuffer.split("\n");
        // Process all input lines.
        processAllInput(inputDataLines);
    });
}

/**
 * Processes an array of input text lines.
 * Each line represents a distinct expression to be evaluated.
 * Lines starting with '#' are ignored as comments.
 *
 * @param {string[]} textLines - An array of strings, where each string is an input line.
 */
function processAllInput(textLines) {
    if (!textLines || textLines.length === 0) {
        outputStream("No input lines provided for processing.");
        return;
    }

    for (const currentLine of textLines) {
        // Skip comment lines or empty lines for processing.
        const trimmedLine = currentLine.trim();
        if (trimmedLine === "#" || trimmedLine.length === 0) {
            continue;
        }
        handleSingleExpressionLine(currentLine);
    }
}

/**
 * Calculates (baseValue * exponentValue) % MODULUS,
 * optimized for large exponentValue using modular exponentiation principles.
 * This function effectively computes (baseValue * exponentValue) modulo MODULUS.
 *
 * @param {number} baseValue - The base number.
 * @param {number} exponentValue - The exponent-like multiplier.
 * @returns {number} The result of the modular calculation.
 */
const MODULUS = 1000000007; // Define the modulus as a constant.
const LARGE_EXPONENT_THRESHOLD = 90000000; // Threshold for applying optimization.

function calculateModularProduct(baseValue, exponentValue) {
    // If the exponent is large and greater than 1, apply recursive optimization.
    if (baseValue > LARGE_EXPONENT_THRESHOLD && exponentValue > 1) {
        const isExponentOdd = (exponentValue % 2 !== 0);
        const halfExponent = Math.floor(exponentValue / 2);
        const recursiveResult = calculateModularProduct(baseValue, halfExponent);

        let currentSum;
        if (isExponentOdd) {
            // Equivalent to (2 * recursiveResult + baseValue) % MODULUS
            currentSum = (2 * recursiveResult + baseValue) % MODULUS;
        } else {
            // Equivalent to (2 * recursiveResult) % MODULUS
            currentSum = (2 * recursiveResult) % MODULUS;
        }
        return currentSum % MODULUS; // Ensure final result is within modulus.
    }
    // Base case: direct multiplication for smaller exponents or when exponent is 1.
    return (baseValue * exponentValue) % MODULUS;
}

/**
 * Applies a special self-operation: computes `operand` multiplied by itself
 * modulo `MODULUS` using the optimized `calculateModularProduct`.
 *
 * @param {number} operand - The number to operate on.
 * @returns {number} The result of `operand * operand` modulo `MODULUS`.
 */
function applySelfOperation(operand) {
    if (typeof operand !== 'number' || isNaN(operand)) {
        throw new Error("Invalid operand for applySelfOperation: must be a number.");
    }
    return calculateModularProduct(operand, operand);
}

/**
 * Performs an integer division by a power of two, effectively a right bit shift.
 *
 * @param {number} value - The number to be shifted.
 * @param {number} shiftAmount - The number of positions to shift right.
 * @returns {number} The result of `value / (2^shiftAmount)`, floored.
 */
function integerDivideByPowerOfTwo(value, shiftAmount) {
    if (typeof value !== 'number' || isNaN(value)) {
        throw new Error("Invalid value for integerDivideByPowerOfTwo: must be a number.");
    }
    if (typeof shiftAmount !== 'number' || isNaN(shiftAmount) || shiftAmount < 0) {
        throw new Error("Invalid shiftAmount for integerDivideByPowerOfTwo: must be a non-negative number.");
    }
    // Using bitwise shift for efficiency if shiftAmount is an integer.
    // If shiftAmount can be very large and cause issues with `1 << shiftAmount`,
    // Math.pow is safer, but problem context implies small integer shifts.
    return Math.floor(value / (1 << shiftAmount));
}

/**
 * Cleans an input string by removing all whitespace characters and
 * occurrences of the character 'S'.
 *
 * @param {string} rawString - The original input string.
 * @returns {string} The cleaned string.
 */
function stripUnwantedChars(rawString) {
    if (typeof rawString !== 'string') {
        return ''; // Return empty string for non-string inputs.
    }
    // Use a regular expression to remove all whitespace (\s) and 'S' characters globally.
    return rawString.replace(/[\sS]/g, '');
}

/**
 * Determines if a given character string represents a numeric digit.
 *
 * @param {string} charToCheck - The character string to validate.
 * @returns {boolean} True if the character is a digit, false otherwise.
 */
function charIsDigit(charToCheck) {
    // Check if the character is a single digit using a regex.
    return /^\d$/.test(charToCheck);
}

/**
 * Divides an input string into a sequence of numbers and operator characters.
 * Numbers are converted from string form to actual numeric values.
 *
 * For example, "123<456>>7" becomes [123, '<', 456, '>', '>', 7].
 *
 * @param {string} inputChars - The string to be segmented.
 * @returns {(string|number)[]} An array containing numbers and operator characters.
 */
function parseNumericAndOperatorSegments(inputChars) {
    if (typeof inputChars !== 'string') {
        return [];
    }

    const charArray = inputChars.split('');
    const charCount = charArray.length;
    const segmentedList = [];

    let segmentStartIdx = 0;
    let inNumberSegment = false;

    for (let i = 0; i < charCount; i++) {
        const currentChar = charArray[i];
        const isCurrentCharDigit = charIsDigit(currentChar);

        if (!inNumberSegment && isCurrentCharDigit) {
            // Start of a new number segment.
            segmentStartIdx = i;
            inNumberSegment = true;
        } else if (inNumberSegment && !isCurrentCharDigit) {
            // End of a number segment. Extract and push the number.
            const numberString = charArray.slice(segmentStartIdx, i).join('');
            segmentedList.push(Number(numberString));
            inNumberSegment = false;
        }

        // If current character is not a digit, push it directly.
        if (!isCurrentCharDigit) {
            segmentedList.push(currentChar);
        }
    }

    // After the loop, if we were still in a number segment, process the last number.
    if (inNumberSegment) {
        const numberString = charArray.slice(segmentStartIdx, charCount).join('');
        segmentedList.push(Number(numberString));
    }

    return segmentedList;
}

/**
 * Helper function to determine if a '>' character represents a single
 * 'greater than' operator ('q') or part of a '>>' right shift operator ('t').
 *
 * @param {number} currentIndex - The index of the current '>' character in the token sequence.
 * @param {(string|number)[]} tokenSequence - The array of parsed segments.
 * @returns {boolean} True if it's a single '>', false if it's part of '>>'.
 */
function isSingleGreaterThanOperator(currentIndex, tokenSequence) {
    // If there's a next character and it's also '>', it's potentially '>>'.
    if (currentIndex + 1 < tokenSequence.length && tokenSequence[currentIndex + 1] === '>') {
        // If the character after '>>' is a number or '<', then it's definitely '>>'.
        // The original logic `is_number(line[i + 2]) || line[i + 2] == '<'` seems to imply
        // that if `>>` is followed by a number or `<`, it forms a 't' token.
        // This means `>` followed by `>` is `t` unless `>` followed by `>X` where X is not number or `<`.
        // The original logic is `if (line[i + 1] == '>') { if (is_number(line[i + 2]) || line[i + 2] == '<') { ret = false; } }`
        // This means `>` is 'q' by default, unless `line[i+1]` is `>` AND (`line[i+2]` is number OR `<`).
        // So `>>` is 't' if followed by a number or `<`. Otherwise, it's two separate `q`s or `q` followed by something else.
        // This is a subtle point. Let's re-interpret: `>>` forms a single `t` token. If it's just `>X`, it's `qX`.
        // The original `is_q` returns `true` for `q`, `false` for `t`.
        // So, `is_q` is true if it's a `q`. It's false if it's a `t`.
        // It's `t` if `tokenSequence[currentIndex + 1]` is `>` AND `tokenSequence[currentIndex + 2]` is a number OR `<`.
        // This means `A>>B` is `A t B`. `A>B` is `A q B`.
        // What about `A>>` at the end of string? Or `A>>>`?
        // The original code implies that `t` consumes `>` and `>`.
        // So if `tokenSequence[currentIndex + 1]` is `>` then it's a `t`, and `i` is incremented by 1 in tokenizer.
        // The condition `is_number(line[i + 2]) || line[i + 2] == '<'` is actually determining if `>>` is validly formed.
        // If `>>` is *not* followed by a number or `<`, then it's not a `t`. It's two `q`s.
        // This is extremely specific. Let's stick to the exact original logic for `is_q`.
        const nextNextChar = tokenSequence[currentIndex + 2];
        if (currentIndex + 2 < tokenSequence.length && (charIsDigit(nextNextChar) || nextNextChar === '<')) {
            return false; // It's part of a '>>' (type 't')
        }
    }
    return true; // It's a single '>' (type 'q')
}


/**
 * Converts a list of parsed segments (numbers and raw operators) into a
 * tokenized list using symbolic representations ('p' for '<', 'q' for '>', 't' for '>>').
 *
 * @param {(string|number)[]} parsedSegments - The list of segments from `parseNumericAndOperatorSegments`.
 * @returns {(string|number)[]} The tokenized list.
 */
function convertSegmentsToTokens(parsedSegments) {
    if (!Array.isArray(parsedSegments)) {
        return [];
    }

    const tokenList = [];
    const segmentCount = parsedSegments.length;

    for (let i = 0; i < segmentCount; i++) {
        const currentSegment = parsedSegments[i];

        if (typeof currentSegment === 'number') {
            tokenList.push(currentSegment);
        } else if (currentSegment === '<') {
            tokenList.push('p'); // Represents '<' (S<x> start)
        } else if (currentSegment === '>') {
            // Check if it's a single '>' ('q') or part of a '>>' ('t').
            if (isSingleGreaterThanOperator(i, parsedSegments)) {
                tokenList.push('q'); // Represents '>' (S<x> end)
            } else {
                tokenList.push('t'); // Represents '>>' (right shift)
                i += 1; // Consume the next '>' character as it's part of '>>'.
            }
        } else {
            // Handle unexpected tokens, though current grammar implies only numbers, '<', '>'.
            outputStream(`Warning: Unexpected segment '${currentSegment}' encountered.`);
        }
    }

    return tokenList;
}

/**
 * Evaluates the tokenized expression list by iteratively reducing
 * `S<x>` (p x q) and `x>>y` (x t y) patterns.
 * This function modifies the `expressionTokens` array in place.
 *
 * The evaluation proceeds from left to right, reducing patterns as they are found.
 *
 * @param {(string|number)[]} expressionTokens - The tokenized expression array.
 * @returns {number[]} The array containing the final evaluated result (should be a single number).
 */
function evaluateTokenTree(expressionTokens) {
    if (!Array.isArray(expressionTokens) || expressionTokens.length === 0) {
        return [];
    }

    let tokenIndex = 0;
    while (expressionTokens.length > 1 && tokenIndex < expressionTokens.length) {
        const currentToken = expressionTokens[tokenIndex];

        // Pattern: ... t Y ... (Y is a number) -> X t Y -> integerDivideByPowerOfTwo(X, Y)
        // This means we need to look back two positions for 'X'.
        if (currentToken === 't' && tokenIndex + 1 < expressionTokens.length && typeof expressionTokens[tokenIndex + 1] === 'number') {
            if (tokenIndex >= 2 && typeof expressionTokens[tokenIndex - 1] === 'number') {
                const value = expressionTokens[tokenIndex - 1];
                const shift = expressionTokens[tokenIndex + 1];
                const result = integerDivideByPowerOfTwo(value, shift);

                // Replace 'X t Y' with 'result'.
                // Original: [..., X, t, Y, ...]
                // New:      [..., result, ...]
                expressionTokens.splice(tokenIndex - 1, 3, result);
                tokenIndex -= 1; // Adjust index to re-evaluate the new element or previous elements.
                continue; // Restart iteration from adjusted index.
            }
        }
        // Pattern: ... p X q ... (X is a number) -> p X q -> applySelfOperation(X)
        // This means we need to look back two positions for 'p' and one for 'X'.
        else if (currentToken === 'q') {
            if (tokenIndex >= 2 && expressionTokens[tokenIndex - 2] === 'p' && typeof expressionTokens[tokenIndex - 1] === 'number') {
                const operand = expressionTokens[tokenIndex - 1];
                const result = applySelfOperation(operand);

                // Replace 'p X q' with 'result'.
                // Original: [..., p, X, q, ...]
                // New:      [..., result, ...]
                expressionTokens.splice(tokenIndex - 2, 3, result);
                tokenIndex -= 2; // Adjust index to re-evaluate the new element or previous elements.
                continue; // Restart iteration from adjusted index.
            }
        }
        tokenIndex++;
    }

    return expressionTokens;
}

/**
 * Handles the complete processing pipeline for a single input expression line.
 * This includes cleaning, segmenting, tokenizing, and evaluating the expression.
 *
 * @param {string} inputExpressionString - The raw input string representing an expression.
 */
function handleSingleExpressionLine(inputExpressionString) {
    try {
        let currentProcessedData = inputExpressionString;

        // Step 1: Remove spaces and 'S' characters.
        const cleanedString = stripUnwantedChars(currentProcessedData);
        if (cleanedString.length === 0) {
            outputStream(''); // Output empty line for empty results.
            return;
        }

        // Step 2: Divide into numeric and operator segments.
        const segmentedData = parseNumericAndOperatorSegments(cleanedString);
        if (!segmentedData || segmentedData.length === 0) {
            outputStream('');
            return;
        }

        // Step 3: Tokenize the segments into symbolic representation.
        const tokenizedExpression = convertSegmentsToTokens(segmentedData);
        if (!tokenizedExpression || tokenizedExpression.length === 0) {
            outputStream('');
            return;
        }

        // Step 4: Evaluate the tokenized expression tree.
        const evaluatedResultArray = evaluateTokenTree(tokenizedExpression);

        // Expecting a single number as the final result.
        if (!evaluatedResultArray || evaluatedResultArray.length !== 1 || typeof evaluatedResultArray[0] !== 'number') {
            outputStream(`Error: Evaluation did not yield a single numeric result for '${inputExpressionString}'.`);
            return;
        }

        const finalResult = evaluatedResultArray[0];
        outputStream(finalResult);

    } catch (error) {
        outputStream(`Error processing line '${inputExpressionString}': ${error.message}`);
    }
}