"use strict";

// Helper function to safely parse an integer from a string.
// This new fragment enhances robustness by handling non-numeric inputs gracefully.
const convertToNumber = (stringValue, fallbackValue = NaN) => {
    const numericValue = parseInt(stringValue.trim(), 10);
    return isNaN(numericValue) ? fallbackValue : numericValue;
};

// The primary function orchestrating the bingo game process.
// Renamed from 'main' to provide a more descriptive identifier.
const executeGameProcess = (rawInputContent) => {
    // --- Input Validation and Pre-processing (Type III: Added guard clauses and validations) ---
    if (!rawInputContent || typeof rawInputContent !== 'string' || rawInputContent.trim() === '') {
        console.error("Error: Received invalid or empty input for game processing.");
        return;
    }

    // Split the raw input into individual lines.
    // Renamed 'input' to 'dataSegments' for clarity.
    const dataSegments = rawInputContent.trim().split("\n");

    // A bingo board consists of 3 rows, plus a line for the call count, and then the called numbers.
    // Ensure minimum required lines are present.
    if (dataSegments.length < 5) { // 3 board rows + 1 call count + at least 1 drawn number
        console.error("Error: Insufficient input lines provided to set up the bingo game.");
        return;
    }

    // --- Parsing Bingo Board Rows (Type III: Bug fix and robust parsing) ---
    // The original code had a bug: parseInt("1 2 3") would only parse "1".
    // This has been corrected to parse all three numbers per line.
    // Variable names are changed for Type II.
    const boardRowOne = dataSegments[0].split(" ").map(convertToNumber);
    const boardRowTwo = dataSegments[1].split(" ").map(convertToNumber);
    const boardRowThree = dataSegments[2].split(" ").map(convertToNumber);

    // Validate that each board row contains exactly 3 valid numbers.
    if (boardRowOne.length !== 3 || boardRowTwo.length !== 3 || boardRowThree.length !== 3 ||
        boardRowOne.some(isNaN) || boardRowTwo.some(isNaN) || boardRowThree.some(isNaN)) {
        console.error("Error: Each bingo board row must contain exactly three valid numerical entries.");
        return;
    }

    // --- Parsing Call Count and Drawn Numbers ---
    // Parse the total number of drawn numbers to consider for this game.
    // Renamed 'count' to 'callCountLimit' (Type II).
    const callCountLimit = convertToNumber(dataSegments[3]);

    // Validate the parsed call count.
    if (isNaN(callCountLimit) || callCountLimit <= 0) {
        console.error("Error: The specified call count limit is invalid or non-positive.");
        return;
    }

    // Collect all potential numbers that could be called during the game.
    // Renamed 'nums' to 'allPossibleDrawnNumbers' (Type II).
    const allPossibleDrawnNumbers = [];
    // Loop changed to start from index 4, iterating through all remaining lines.
    for (let i = 4; i < dataSegments.length; i++) {
        const currentDrawnVal = convertToNumber(dataSegments[i]);
        if (!isNaN(currentDrawnVal)) {
            allPossibleDrawnNumbers.push(currentDrawnVal);
        }
        // Could add a warning here for invalid drawn number entries if desired.
    }

    // Ensure enough numbers were provided based on the specified call count limit.
    if (allPossibleDrawnNumbers.length < callCountLimit) {
        console.error(`Error: Expected at least ${callCountLimit} drawn numbers, but only ${allPossibleDrawnNumbers.length} were provided.`);
        return;
    }

    // Create a subset of drawn numbers based on the `callCountLimit`.
    // This is an intermediate step (Type III) for clarity.
    const numbersCalledInThisGame = allPossibleDrawnNumbers.slice(0, callCountLimit);

    // --- Defining Winning Patterns (Type III: Concise initialization) ---
    // Original code used multiple 'push' calls; this uses direct array literals for conciseness.
    // Variables renamed for Type II.
    const colOneNumbers = [boardRowOne[0], boardRowTwo[0], boardRowThree[0]];
    const colTwoNumbers = [boardRowOne[1], boardRowTwo[1], boardRowThree[1]];
    const colThreeNumbers = [boardRowOne[2], boardRowTwo[2], boardRowThree[2]];

    const diagonalTopLeftToBottomRight = [boardRowOne[0], boardRowTwo[1], boardRowThree[2]];
    const diagonalTopRightToBottomLeft = [boardRowOne[2], boardRowTwo[1], boardRowThree[0]];

    // Combine all potential winning lines into a single collection.
    // Renamed 'arrays' to 'allGameLines' (Type II).
    const allGameLines = [
        boardRowOne, boardRowTwo, boardRowThree,
        colOneNumbers, colTwoNumbers, colThreeNumbers,
        diagonalTopLeftToBottomRight, diagonalTopRightToBottomLeft
    ];

    // --- Processing Game Lines (Type III: Rewritten logic for robustness) ---
    // The original `removeNum` function contained a critical bug with `splice(index, testnum)`.
    // This new approach uses `filter` to create new arrays, which is safer and more functional.
    // Original `console.log(arrays[i])` has been removed (Type III: Deletion of non-essential statement).
    for (let lineIndex = 0; lineIndex < allGameLines.length; lineIndex++) {
        allGameLines[lineIndex] = removeMatchedNumbersFromLine(allGameLines[lineIndex], numbersCalledInThisGame);
    }

    // --- Determining Game Outcome ---
    // Check if any of the processed lines have become empty, indicating a bingo.
    // Renamed 'checlength' to 'checkBingoVictory' (Type II) and fixed original typo.
    const gameOutcome = checkBingoVictory(allGameLines);
    console.log(gameOutcome);
};

/**
 * Filters out numbers from a given bingo line that are present in the list of called numbers.
 * This function is a robust replacement for the buggy `removeNum` in the original code.
 * (Type III: Significant rewrite of existing function logic).
 * @param {number[]} currentLine - An array representing a single line (row, column, or diagonal) on the bingo board.
 * @param {number[]} calledNumbersList - An array of numbers that have been called in the game.
 * @returns {number[]} A new array containing only the numbers from the `currentLine` that have NOT been called.
 */
const removeMatchedNumbersFromLine = (currentLine, calledNumbersList) => {
    // Using `filter` is a clear and effective way to remove elements based on a condition,
    // avoiding issues with modifying an array during iteration.
    return currentLine.filter(value => !calledNumbersList.includes(value));
};

/**
 * Determines if a bingo victory has occurred by checking if any line is completely empty.
 * This function replaces the original `checlength` and fixes the typo 'arrayas'.
 * (Type III: Rewrite of existing function, minor stylistic change with `for...of`).
 * @param {Array<number[]>} listOfGameLines - A collection of arrays, each representing a potential winning line.
 * @returns {string} "Yes" if at least one line is empty (bingo), otherwise "No".
 */
const checkBingoVictory = (listOfGameLines) => {
    // Iterate through each line to see if it has become empty.
    for (const lineInstance of listOfGameLines) { // Using 'for...of' loop for cleaner iteration.
        if (lineInstance.length === 0) {
            return "Yes"; // Found an empty line, indicating a bingo!
        }
    }
    return "No"; // No empty lines were found.
};

// Execute the main game process by reading input from standard input.
executeGameProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));