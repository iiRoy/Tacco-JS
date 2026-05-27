let outputFunc = console.log;

// Check if running in a Node.js-like environment to handle standard input
if (typeof process !== "undefined") {
    let receivedData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(chunk) {
        receivedData += chunk;
    });
    process.stdin.on('end', function() {
        const inputRows = receivedData.split("\n");
        processAllInput(inputRows);
    });
}

/**
 * Processes all input lines received from standard input.
 * @param {string[]} inputRows - An array of input strings.
 */
function processAllInput(inputRows) {
    inputRows.forEach(function(currentLine) {
        // Skip processing if the line is a specific termination character
        if (currentLine !== "#") {
            handleSingleLine(currentLine);
        }
    }, this);
    // Output an empty line at the end, as per original behavior
    outputFunc('');
}

/**
 * Performs a recursive multiplication with a modulo operation.
 * Optimized for large 'y' values.
 * @param {number} valX - The base value.
 * @param {number} valY - The multiplier.
 * @returns {number} The result of (valX * valY) % MODULO_VAL.
 */
function recursiveMultiply(valX, valY) {
    const MODULO_VAL = 1000000007; // A large prime number for modulo arithmetic

    // If valX is large and valY is greater than 1, use a recursive approach
    if (valX > 90000000 && valY > 1) {
        let remainder = valY % 2;
        let halfY = Math.floor(valY / 2);
        let resultN = recursiveMultiply(valX, halfY);

        let intermediateSum;
        if (remainder) {
            // If valY is odd: (2 * resultN + valX) % MODULO_VAL
            intermediateSum = (2 * resultN + valX) % MODULO_VAL;
        } else {
            // If valY is even: (2 * resultN) % MODULO_VAL
            intermediateSum = (2 * resultN) % MODULO_VAL;
        }
        return intermediateSum % MODULO_VAL;
    }
    // For smaller values or base cases, perform direct multiplication
    return (valX * valY) % MODULO_VAL;
}

/**
 * Calculates S(x) which is equivalent to recM(x, x).
 * @param {number} inputVal - The input value.
 * @returns {number} The result of recursiveMultiply(inputVal, inputVal).
 */
function calculateS(inputVal) {
    return recursiveMultiply(inputVal, inputVal);
}

/**
 * Calculates T(x, y) which is equivalent to Math.floor(x / (2^y)).
 * @param {number} baseVal - The base number.
 * @param {number} exponentVal - The exponent for 2.
 * @returns {number} The floored result of the division.
 */
function calculateT(baseVal, exponentVal) {
    return Math.floor(baseVal / Math.pow(2, exponentVal));
}

/**
 * Removes all whitespace characters and 'S' characters from a string.
 * @param {string} inputStr - The string to clean.
 * @returns {string} The cleaned string.
 */
function cleanInputString(inputStr) {
    return inputStr.replace(/\s|S/g, '');
}

/**
 * Checks if a given item can be converted to a valid number.
 * @param {*} item - The item to check.
 * @returns {boolean} True if the item is numeric, false otherwise.
 */
function isNumericValue(item) {
    const numRepresentation = Number(item);
    const stringRepresentation = numRepresentation.toString();
    // Returns true if the string representation is not "NaN"
    return Boolean(stringRepresentation !== "NaN");
}

/**
 * Divides an input string into a sequence of numbers and operators ('<', '>').
 * Numbers are parsed as actual numeric types.
 * @param {string} inputString - The raw input string.
 * @returns {Array<number|string>} An array containing numbers and operator characters.
 */
function segmentInput(inputString) {
    inputString = inputString.split('');
    const currentLength = inputString.length;
    let segmentStart = 0;
    let segmentEnd = 0;
    let segmentedParts = [];
    let currentlyParsingNumber = false;

    for (let idx = 0; idx < currentLength; idx++) {
        const element = inputString[idx];
        if (!currentlyParsingNumber && isNumericValue(element)) {
            // Start of a number sequence
            segmentStart = idx;
            currentlyParsingNumber = true;
        } else if (currentlyParsingNumber && !isNumericValue(element)) {
            // End of a number sequence
            segmentEnd = idx;
            currentlyParsingNumber = false;
            // Extract and push the number
            const slicedPart = inputString.slice(segmentStart, segmentEnd);
            const joinedString = slicedPart.join('');
            const parsedNumber = Number(joinedString);
            segmentedParts.push(parsedNumber);
        }
        if (!isNumericValue(element)) {
            // Push non-numeric elements directly
            segmentedParts.push(element);
        }
    }
    // Handle case where the string ends with a number
    if (currentlyParsingNumber) {
        segmentEnd = currentLength;
        const slicedPart = inputString.slice(segmentStart, segmentEnd);
        const joinedString = slicedPart.join('');
        const parsedNumber = Number(joinedString);
        segmentedParts.push(parsedNumber);
    }
    return segmentedParts;
}

/**
 * Determines if a '>' character is a simple closing bracket 'q' or part of a '>>' operator 't'.
 * @param {number} currentIndex - The current index of the '>' character.
 * @param {Array<number|string>} currentArray - The array of segmented parts.
 * @returns {boolean} True if it's a simple 'q', false if it's part of 't'.
 */
function isClosingBracket(currentIndex, currentArray) {
    let isSimpleClosing = true;
    if (currentArray[currentIndex + 1] === '>') {
        // If the next character is also '>', check the character after that
        if (isNumericValue(currentArray[currentIndex + 2]) || currentArray[currentIndex + 2] === '<') {
            // If it's '>>' followed by a number or '<', it's a 't' operator
            isSimpleClosing = false;
        }
    }
    return isSimpleClosing;
}

/**
 * Converts the segmented parts into a tokenized sequence, replacing '<', '>', '>>' with 'p', 'q', 't'.
 * @param {Array<number|string>} expressionParts - The array of segmented parts.
 * @returns {Array<number|string>} The tokenized sequence.
 */
function tokenizeExpression(expressionParts) {
    // These variables are declared but not used, mirroring original structure
    let qStartIdx = 0;
    let qEndIdx = 0;

    let tokenizedSequence = [];
    const sequenceLength = expressionParts.length;

    for (let index = 0; index < sequenceLength; index++) {
        const element = expressionParts[index];
        if (isNumericValue(element)) {
            tokenizedSequence.push(element);
        } else if (element === '<') {
            tokenizedSequence.push('p'); // Represents S<x> opening
        } else if (element === '>') {
            // Check if it's a simple closing bracket 'q' or a '>>' operator 't'
            if (isClosingBracket(index, expressionParts)) {
                tokenizedSequence.push('q'); // Represents S<x> closing
            } else {
                tokenizedSequence.push('t'); // Represents '>>' operator
                index += 1; // Skip the next '>' as it's part of '>>'
            }
        }
    }
    return tokenizedSequence;
}

/**
 * Processes the tokenized sequence to evaluate expressions based on 'p', 'q', 't' operators.
 * This function modifies the array in place, reducing it to a single result.
 * @param {Array<number|string>} tokenList - The tokenized sequence.
 * @returns {Array<number>} An array containing the final computed value.
 */
function processTokens(tokenList) {
    // This variable is declared but not used, mirroring original structure
    const currentListLength = tokenList.length;
    let currentIdx = 0;

    // Continue processing until only one element (the result) remains
    while (tokenList.length > 1) {
        const currentItem = tokenList[currentIdx];

        if (isNumericValue(currentItem)) {
            // If current item is a number and preceded by 't' (>> operator)
            if (currentIdx > 0 && tokenList[currentIdx - 1] === 't') {
                // Apply T operator: tokenList[currentIdx - 2] >> tokenList[currentIdx]
                tokenList[currentIdx - 2] = calculateT(tokenList[currentIdx - 2], tokenList[currentIdx]);
                // Remove the 't' operator and the current number
                tokenList.splice(currentIdx - 1, 2);
                // Adjust index to re-evaluate from the new position
                currentIdx = currentIdx - 3;
            }
        } else if (currentItem === 'p') {
            // 'p' (S<x> opening) doesn't perform an immediate operation, just a marker
        } else if (currentItem === 'q') {
            // If current item is 'q' (S<x> closing)
            // Apply S operator: S(tokenList[currentIdx - 1])
            tokenList[currentIdx - 2] = calculateS(tokenList[currentIdx - 1]);
            // Remove the 'p' and the number it enclosed
            tokenList.splice(currentIdx - 1, 2);
            // Adjust index to re-evaluate from the new position
            currentIdx = currentIdx - 3;
        } else if (currentItem === 't') {
            // 't' (>> operator) is handled when the subsequent number is encountered
        }
        currentIdx++;
        // Reset index if it goes out of bounds due to splicing
        if (currentIdx < 0) currentIdx = 0;
        if (currentIdx >= tokenList.length && tokenList.length > 1) currentIdx = 0; // Loop back if end reached but not done
    }
    return tokenList;
}

/**
 * Processes a single line of input through the entire pipeline:
 * cleaning, segmenting, tokenizing, and evaluating.
 * @param {string} inputString - The single line of input to process.
 */
function handleSingleLine(inputString) {
    inputString = cleanInputString(inputString);
    if (!inputString) { outputFunc(''); return; }

    inputString = segmentInput(inputString);
    if (!inputString) { outputFunc(''); return; }

    inputString = tokenizeExpression(inputString);
    if (!inputString) { outputFunc(''); return; }

    inputString = processTokens(inputString);
    if (!inputString) { outputFunc(''); return; }

    // The final result should be the only element left in the array
    inputString = inputString[0];
    outputFunc(inputString);
}
