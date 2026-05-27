"use strict"; // Enforce strict mode for cleaner code execution

/**
 * Main function to process input data for a bingo-like game.
 * It parses the bingo card, the list of called numbers,
 * and determines if any winning pattern is achieved.
 * @param {string} inputData - The raw input string from stdin.
 */
const processInput = (inputData) => {
    // Trim whitespace and split the input into individual lines
    const lines = inputData.trim().split('\n');

    // Parse the three rows of the bingo card.
    // Note: parseInt on an array like ['1', '2', '3'] will convert it to "1,2,3" and then parse "1", resulting in 1.
    // This behavior is preserved from the original code.
    const firstRowNumbers = parseInt(lines[0].split(' '));
    const secondRowNumbers = parseInt(lines[1].split(' '));
    const thirdRowNumbers = parseInt(lines[2].split(' '));

    // Parse the total count of numbers that will be called
    const numCount = parseInt(lines[3]);

    // Array to store the numbers that are called out
    const calledNumbers = [];
    // A temporary variable, unused in this scope but present in original
    const tempVal = 0;

    // Define the bingo patterns (columns and diagonals)
    // These are initialized as empty arrays and then populated.
    const col1 = [];
    const col2 = [];
    const col3 = [];
    const diag1 = [];
    const diag2 = [];

    // Populate the first column pattern
    col1.push(firstRowNumbers[0]);
    col1.push(secondRowNumbers[0]);
    col1.push(thirdRowNumbers[0]);

    // Populate the second column pattern
    col2.push(firstRowNumbers[1]);
    col2.push(secondRowNumbers[1]);
    col2.push(thirdRowNumbers[1]);

    // Populate the third column pattern
    col3.push(firstRowNumbers[2]);
    col3.push(secondRowNumbers[2]);
    col3.push(thirdRowNumbers[2]);

    // Populate the first diagonal pattern (top-right to bottom-left)
    diag1.push(firstRowNumbers[2]);
    diag1.push(secondRowNumbers[1]);
    diag1.push(thirdRowNumbers[0]);

    // Populate the second diagonal pattern (top-left to bottom-right)
    diag2.push(firstRowNumbers[0]);
    diag2.push(secondRowNumbers[1]);
    diag2.push(thirdRowNumbers[2]);

    // Combine all bingo patterns (rows, columns, diagonals) into a single array
    const allPatterns = [
        firstRowNumbers, secondRowNumbers, thirdRowNumbers,
        col1, col2, col3, diag1, diag2
    ];

    // Populate the `calledNumbers` array from the input lines, starting from the 5th line
    for (let idx = 4; idx < lines.length; idx++) {
        calledNumbers.push(parseInt(lines[idx]));
    }

    // Iterate through each bingo pattern and process it against the called numbers
    for (let patternIdx = 0; patternIdx < allPatterns.length; patternIdx++) {
        // Log the current pattern before processing (for debugging/observability)
        console.log(allPatterns[patternIdx]);
        // Attempt to remove matched numbers from the current pattern
        processPattern(allPatterns[patternIdx], numCount, calledNumbers);
    }

    // After processing all patterns, check if any pattern has been completed (i.e., is empty)
    console.log(checkCompletion(allPatterns));
};

/**
 * Processes a single bingo pattern by attempting to remove numbers that have been called.
 * Note: The original code's splice behavior (splice(index, testnum)) is preserved,
 * which means it removes 'testnum' elements from 'index', not just one.
 * @param {Array<number>} currentPattern - The bingo pattern (row, column, or diagonal) to process.
 * @param {number} totalCalls - The total number of calls made.
 * @param {Array<number>} drawnNumbers - An array of numbers that have been called.
 */
const processPattern = (currentPattern, totalCalls, drawnNumbers) => {
    currentPattern.forEach((patternItem, itemIndex) => {
        // Iterate through each drawn number
        for (let callIdx = 0; callIdx < totalCalls; callIdx++) {
            const currentDrawnNum = drawnNumbers[callIdx];
            // If a number in the pattern matches a drawn number
            if (patternItem === currentDrawnNum) {
                // Remove elements from the pattern.
                // The second argument to splice is the deleteCount.
                // This means it removes 'currentDrawnNum' elements starting from 'itemIndex'.
                // This behavior is preserved from the original code.
                currentPattern.splice(itemIndex, currentDrawnNum);
            }
        }
    });
};

/**
 * Checks if any of the provided bingo patterns are empty, indicating a win.
 * @param {Array<Array<number>>} allPatterns - An array containing all bingo patterns.
 * @returns {string} "Yes" if any pattern is empty, "No" otherwise.
 */
const checkCompletion = (allPatterns) => {
    for (let patternIterator = 0; patternIterator < allPatterns.length; patternIterator++) {
        // If a pattern's length is 0, it means all its numbers were "removed"
        if (allPatterns[patternIterator].length === 0) {
            return "Yes"; // A winning pattern found
        }
    }
    return "No"; // No winning pattern found
};

// Read input from standard input and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
