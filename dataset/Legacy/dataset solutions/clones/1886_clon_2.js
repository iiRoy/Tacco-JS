"use strict"; // Enforce strict mode for cleaner code execution.

// Read the entire input file from standard input.
let fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input content into an array of tokens using spaces or newlines as delimiters.
let tokenArray = fileContent.split(/ |\n/);
let tokenIndex = 0; // Initialize an index to keep track of the current token being read.

/**
 * Retrieves the next token from the input array.
 * @param {boolean} asString - If true, returns the token as a string; otherwise, converts it to a number.
 * @returns {string|number} The next token.
 */
function getNextToken(asString) {
    // Increment tokenIndex after accessing the token.
    return asString ? tokenArray[tokenIndex++] : +tokenArray[tokenIndex++];
}

/**
 * Retrieves a specified number of tokens from the input array.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<string|number>} An array containing the retrieved tokens.
 */
function getMultipleTokens(count, asStrings) {
    let startIndex = tokenIndex;
    tokenIndex += count; // Advance the token index by the count.
    // Slice the array to get the desired tokens.
    // If 'asStrings' is false, map them to numbers.
    return asStrings ? tokenArray.slice(startIndex, tokenIndex) : tokenArray.slice(startIndex, tokenIndex).map(value => +value);
}

/**
 * Retrieves tokens to form a matrix of specified dimensions.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in the matrix.
 * @param {boolean} asStrings - If true, returns tokens as strings; otherwise, converts them to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
 */
function getMatrixTokens(height, width, asStrings) {
    let resultMatrix = []; // Initialize an empty array to store the matrix rows.
    let currentRow = 0;
    if (asStrings) {
        // If tokens should be kept as strings.
        for (; currentRow < height; currentRow++) {
            resultMatrix.push(tokenArray.slice(tokenIndex, tokenIndex += width));
        }
    } else {
        // If tokens should be converted to numbers.
        for (; currentRow < height; currentRow++) {
            resultMatrix.push(tokenArray.slice(tokenIndex, tokenIndex += width).map(value => +value));
        }
    }
    return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * The dimensions are provided as subsequent arguments.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., createMultiDimArray(0, 2, 3) for a 2x3 array).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    let functionArguments = arguments; // Access all arguments passed to the function.
    let argumentCount = functionArguments.length;
    // Construct the innermost array creation expression.
    let arrayCreationString = `Array(functionArguments[${--argumentCount}]).fill().map(element => { return ${initialValue}; })`;
    // Wrap the expression for each remaining dimension.
    while (--argumentCount) {
        arrayCreationString = `Array(functionArguments[${argumentCount}]).fill().map(element => ${arrayCreationString})`;
    }
    // Evaluate the dynamically constructed string to create the array.
    return eval(arrayCreationString);
}

// Execute the main program logic and store its result.
let programResult = executeLogic();

// If the program logic returns a value (i.e., not undefined), print it to the console.
if (programResult !== undefined) {
    console.log(programResult);
}

/**
 * The core logic of the program to determine if a sequence of parenthesis strings can be balanced.
 * @returns {string} "Yes" if the strings can be balanced, "No" otherwise.
 */
function executeLogic() {
    const noStr = "No"; // Constant string for a negative outcome.
    const yesStr = "Yes"; // Constant string for a positive outcome.

    let numInputs = getNextToken(); // Read the total number of parenthesis strings.

    // Lists to categorize strings based on their balance characteristics.
    let negativeBalanceList = []; // Stores strings that end with a non-positive balance and had a negative minimum.
    let positiveBalanceList = []; // Stores strings that end with a positive balance but had a negative minimum.
    let totalBalance = 0; // Accumulates the final balance of all strings combined.
    let currentBalance = 0; // Represents the current balance as strings are processed.

    // Iterate through each input string.
    for (let idx = 0; idx < numInputs; idx++) {
        let minBalance = 0; // Tracks the minimum balance encountered while traversing the current string.
        let finalBalance = 0; // The balance of the current string after full traversal.

        let inputString = getNextToken(true); // Read the current parenthesis string.

        // Traverse each character in the current string.
        for (let charIdx = 0; charIdx < inputString.length; charIdx++) {
            if (inputString[charIdx] === "(") {
                finalBalance++; // Increment balance for an opening parenthesis.
            } else {
                finalBalance--; // Decrement balance for a closing parenthesis.
                if (finalBalance < minBalance) {
                    minBalance = finalBalance; // Update the minimum balance if the current balance is lower.
                }
            }
        }

        totalBalance += finalBalance; // Add the current string's final balance to the overall total.

        if (minBalance >= 0) {
            // If the balance never dropped below zero, this string can be appended directly.
            currentBalance += finalBalance;
        } else if (finalBalance <= 0) {
            // If the final balance is non-positive and min balance was negative, add to negativeBalanceList.
            // The first element is the required opening balance to make this string valid.
            negativeBalanceList.push([-minBalance + finalBalance, finalBalance]);
        } else {
            // If the final balance is positive but min balance was negative, add to positiveBalanceList.
            // The first element is the required opening balance to avoid going negative.
            positiveBalanceList.push([-minBalance, finalBalance]);
        }
    }

    // If the total balance of all strings is not zero, it's impossible to balance them.
    if (totalBalance !== 0) {
        return noStr;
    }

    // Sort the positiveBalanceList by the required opening balance in ascending order.
    // This prioritizes strings that require fewer initial openings.
    positiveBalanceList.sort((itemA, itemB) => itemA[0] - itemB[0]);

    // Process strings in the positiveBalanceList.
    for (let idx = 0; idx < positiveBalanceList.length; idx++) {
        // If the required opening balance for the current string exceeds the current accumulated balance,
        // it's impossible to balance.
        if (positiveBalanceList[idx][0] > currentBalance) {
            return noStr;
        }
        currentBalance += positiveBalanceList[idx][1]; // Add the string's final balance to the current balance.
    }

    // Sort the negativeBalanceList by the required opening balance in descending order.
    // This prioritizes strings that require more initial openings, which are harder to satisfy.
    negativeBalanceList.sort((itemA, itemB) => itemB[0] - itemA[0]);

    // Process strings in the negativeBalanceList.
    for (let idx = 0; idx < negativeBalanceList.length; idx++) {
        // Destructure the array elements for clarity.
        const [requiredOpenings, finalValue] = negativeBalanceList[idx];
        // If the required opening balance for the current string exceeds the current accumulated balance,
        // it's impossible to balance.
        if (requiredOpenings > currentBalance) {
            return noStr;
        }
        currentBalance += finalValue; // Add the string's final balance to the current balance.
    }

    // If all strings have been successfully processed and balanced, return "Yes".
    return yesStr;
}
