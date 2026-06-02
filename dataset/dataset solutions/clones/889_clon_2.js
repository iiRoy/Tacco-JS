let outputFn = console.log; // Function for logging output to the console

// Check if running in a Node.js-like environment to handle standard input
if (typeof process !== "undefined") {
    let rawInputData = ""; // Accumulator for incoming data chunks
    process.stdin.resume(); // Ensure stdin is open
    process.stdin.setEncoding('utf8'); // Set encoding for input
    process.stdin.on('data', function(dataSegment) {
        rawInputData += dataSegment; // Append new data to the buffer
    });
    process.stdin.on('end', function() {
        const inputLines = rawInputData.split("\n"); // Split accumulated data into individual lines
        processAllInput(inputLines); // Process all received lines
    });
}

/**
 * Main entry point for processing all input lines.
 * @param {string[]} inputLines - An array of strings, each representing a line of input.
 */
function processAllInput(inputLines) {
    // Iterate over each line provided in the input
    inputLines.forEach(function(currentLine) {
        // Only process lines that are not the termination character '#'
        if (currentLine !== "#") {
            handleSingleLine(currentLine);
        }
    }, this); // 'this' context is not strictly necessary here but preserved for Type II
}

/**
 * Recursively calculates (baseVal * exponentVal) % MODULUS_VALUE,
 * optimized for large baseVal and exponentVal using modular exponentiation principles.
 * @param {number} baseVal - The base number.
 * @param {number} exponentVal - The exponent.
 * @returns {number} The result of the modular multiplication.
 */
function recursiveModuloPower(baseVal, exponentVal) {
    const MODULUS_VALUE = 1_000_000_007; // Define the modulus constant

    // Apply optimization for large base and exponent
    if (baseVal > 90_000_000 && exponentVal > 1) {
        const remainder = exponentVal % 2; // Check if exponent is odd or even
        const halfExp = Math.floor(exponentVal / 2); // Halve the exponent
        const resultHalf = recursiveModuloPower(baseVal, halfExp); // Recursive call for half exponent

        let currentSum;
        if (remainder) {
            // If exponent was odd: (2 * resultHalf + baseVal) % MODULUS_VALUE
            currentSum = (2 * resultHalf + baseVal) % MODULUS_VALUE;
        } else {
            // If exponent was even: (2 * resultHalf) % MODULUS_VALUE
            currentSum = (2 * resultHalf) % MODULUS_VALUE;
        }
        return currentSum % MODULUS_VALUE; // Ensure final result is within modulus
    }
    // Base case: direct multiplication for smaller values or exponent 1
    return (baseVal * exponentVal) % MODULUS_VALUE;
}

/**
 * Calculates the S(x) operation, which is equivalent to recM(x, x).
 * @param {number} inputVal - The input value for the S operation.
 * @returns {number} The result of S(x).
 */
function calculateS(inputVal) {
    return recursiveModuloPower(inputVal, inputVal);
}

/**
 * Calculates the T(x, y) operation, which is floor(x / (2^y)).
 * @param {number} dividendVal - The dividend.
 * @param {number} divisorPower - The exponent for the power of 2.
 * @returns {number} The result of T(x, y).
 */
function calculateT(dividendVal, divisorPower) {
    return Math.floor(dividendVal / Math.pow(2, divisorPower));
}

/**
 * Removes all whitespace characters and 'S' characters from a given string.
 * @param {string} rawString - The input string to clean.
 * @returns {string} The cleaned string.
 */
function cleanInputString(rawString) {
    return rawString.replace(/\s|S/g, ''); // Use regex to remove spaces and 'S'
}

/**
 * Checks if a given token can be converted to a valid number.
 * @param {*} tokenValue - The value to check.
 * @returns {boolean} True if the value is a number, false otherwise.
 */
function isNumericToken(tokenValue) {
    const numericConversion = Number(tokenValue); // Attempt conversion to number
    const stringRepresentation = numericConversion.toString(); // Convert back to string
    // A value is considered a number if its string representation is not "NaN"
    return Boolean(stringRepresentation !== "NaN");
}

/**
 * Segments the input string into a list of numbers and operators.
 * It identifies contiguous sequences of digits as numbers and treats other characters as individual tokens.
 * @param {string} processedString - The string after initial cleaning.
 * @returns {Array<number|string>} An array containing numbers and operator characters.
 */
function segmentInputTokens(processedString) {
    processedString = processedString.split(''); // Convert string to an array of characters
    const stringLength = processedString.length;
    let segmentStartIdx = 0;
    let segmentEndIdx = 0;
    const tokenList = []; // List to store the segmented tokens
    let currentlyParsingNumber = false; // Flag to track if we are currently inside a number sequence

    for (let charIndex = 0; charIndex < stringLength; charIndex++) {
        const currentCharacter = processedString[charIndex];

        // If not currently parsing a number and the current char is a digit, start a new number segment
        if (!currentlyParsingNumber && isNumericToken(currentCharacter)) {
            segmentStartIdx = charIndex;
            currentlyParsingNumber = true;
        }
        // If currently parsing a number and the current char is not a digit, end the number segment
        else if (currentlyParsingNumber && !isNumericToken(currentCharacter)) {
            segmentEndIdx = charIndex;
            currentlyParsingNumber = false;
            // Extract and parse the number, then add it to the token list
            const numberChars = processedString.slice(segmentStartIdx, segmentEndIdx);
            const numberString = numberChars.join('');
            const parsedNumber = Number(numberString);
            tokenList.push(parsedNumber);
        }

        // If the current character is not a digit, add it directly to the token list
        if (!isNumericToken(currentCharacter)) {
            tokenList.push(currentCharacter);
        }
    }

    // After the loop, if we were still parsing a number, add the final number segment
    if (currentlyParsingNumber) {
        segmentEndIdx = stringLength;
        const remainingNumberChars = processedString.slice(segmentStartIdx, segmentEndIdx);
        const finalNumberString = remainingNumberChars.join('');
        const finalParsedNumber = Number(finalNumberString);
        tokenList.push(finalParsedNumber);
    }
    return tokenList;
}

/**
 * Determines if a '>' character represents a simple closing bracket 'q' or a '>>' operator 't'.
 * @param {number} currentIndex - The current index of the '>' character in the token array.
 * @param {Array<number|string>} tokenArray - The array of segmented tokens.
 * @returns {boolean} True if it's a simple closing bracket 'q', false if it's a '>>' operator 't'.
 */
function isClosingBracket(currentIndex, tokenArray) {
    let isSimpleClosing = true;
    // Check if the next character is also '>'
    if (tokenArray[currentIndex + 1] === '>') {
        // If it's '>>', check the character after that to distinguish '>>L' from '>>S<x>'
        if (isNumericToken(tokenArray[currentIndex + 2]) || tokenArray[currentIndex + 2] === '<') {
            isSimpleClosing = false; // It's a '>>' operator
        }
    }
    return isSimpleClosing;
}

/**
 * Converts the segmented token list into a standardized token sequence for evaluation.
 * 'S<x>' becomes 'p', 'x>>y' becomes 't', and 'S<x>' closing '>' becomes 'q'.
 * @param {Array<number|string>} segmentedList - The list of segmented numbers and characters.
 * @returns {Array<number|string>} The tokenized sequence.
 */
function convertToTokens(segmentedList) {
    const processedTokens = []; // Array to store the standardized tokens
    const listLength = segmentedList.length;

    for (let tokenIndex = 0; tokenIndex < listLength; tokenIndex++) {
        const currentElement = segmentedList[tokenIndex];

        if (isNumericToken(currentElement)) {
            processedTokens.push(currentElement); // Numbers are pushed as is
        } else if (currentElement === '<') {
            processedTokens.push('p'); // '<' represents the start of S(x)
        } else if (currentElement === '>') {
            // Determine if '>' is a simple closing 'q' or part of '>>' operator 't'
            if (isClosingBracket(tokenIndex, segmentedList)) {
                processedTokens.push('q'); // Simple closing bracket
            } else {
                processedTokens.push('t'); // '>>' operator
                tokenIndex += 1; // Skip the next '>' as it's part of '>>'
            }
        }
    }
    return processedTokens;
}

/**
 * Evaluates the token sequence by applying S and T operations in the correct order.
 * This function modifies the tokenSequence in place, reducing it to a single result.
 * @param {Array<number|string>} tokenSequence - The tokenized sequence to evaluate.
 * @returns {Array<number>} An array containing the final single result.
 */
function evaluateExpressionTree(tokenSequence) {
    let currentPosition = 0; // Current index for iterating through the sequence

    // Continue processing until only one element (the final result) remains
    while (tokenSequence.length > 1) {
        const currentSymbol = tokenSequence[currentPosition];

        if (isNumericToken(currentSymbol)) {
            // If current symbol is a number and preceded by 't' (T operator)
            if (currentPosition > 0 && tokenSequence[currentPosition - 1] === 't') {
                // Apply T operation: tokenSequence[i-2] = T(tokenSequence[i-2], tokenSequence[i])
                tokenSequence[currentPosition - 2] = calculateT(tokenSequence[currentPosition - 2], tokenSequence[currentPosition]);
                // Remove the 't' operator and the second operand
                tokenSequence.splice(currentPosition - 1, 2);
                // Adjust position to re-evaluate the modified part
                currentPosition = currentPosition - 3;
            }
        } else if (currentSymbol === 'p') {
            // 'p' (opening S bracket) does not trigger an immediate operation
        } else if (currentSymbol === 'q') {
            // If current symbol is 'q' (closing S bracket)
            // Apply S operation: tokenSequence[i-2] = S(tokenSequence[i-1])
            tokenSequence[currentPosition - 2] = calculateS(tokenSequence[currentPosition - 1]);
            // Remove the 'p' operator and its operand, and the 'q' itself
            tokenSequence.splice(currentPosition - 1, 2);
            // Adjust position to re-evaluate the modified part
            currentPosition = currentPosition - 3;
        } else if (currentSymbol === 't') {
            // 't' (T operator) waits for its second operand (a number)
        }
        currentPosition++; // Move to the next symbol
    }
    return tokenSequence; // The array now contains a single element, the final result
}

/**
 * Processes a single line of input through all stages: cleaning, segmentation, tokenization, and evaluation.
 * @param {string} inputString - The raw input string for this line.
 */
function handleSingleLine(inputString) {
    // Step 1: Eliminate 'S' and whitespace
    let processedString = cleanInputString(inputString);
    if (!processedString) { outputFn(''); return; } // Output empty line if string becomes empty

    // Step 2: Divide into initial tokens (numbers and single characters)
    processedString = segmentInputTokens(processedString);
    if (!processedString) { outputFn(''); return; }

    // Step 3: Tokenize into 'p', 'q', 't', and numbers
    processedString = convertToTokens(processedString);
    if (!processedString) { outputFn(''); return; }

    // Step 4: Evaluate the expression tree
    processedString = evaluateExpressionTree(processedString);
    if (!processedString) { outputFn(''); return; }

    // Output the final result (which is the single element in the processedString array)
    outputFn(processedString);
}
