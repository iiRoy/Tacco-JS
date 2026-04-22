"use strict";

const fileSystem = require("fs");

// Define a constant for the bingo grid dimensions to improve readability and maintainability.
const BINGO_DIMENSION = 3;

/**
 * Analyzes a raw string of game data to determine if a bingo card has a winning pattern.
 * This function processes the card setup and compares it against a list of announced numbers.
 *
 * @param {string} rawGameData - The complete input string, typically from stdin,
 *                               containing the bingo card values and the sequence of called numbers.
 */
function processBingoGame(rawGameData) {
  // First, parse the raw input data into individual lines.
  // Using trim() helps in handling potential leading/trailing whitespace or empty lines.
  const gameLines = rawGameData.trim().split("\n");

  // Basic validation: Ensure there are enough lines for the bingo card and at least one called number.
  // A 3x3 card needs 3 lines, plus 1 line for the count of called numbers, plus at least 1 actual called number.
  if (gameLines.length < BINGO_DIMENSION + 1) {
    console.error("Error: Input data is incomplete or malformed. Expected at least 4 lines.");
    // In a production scenario, one might throw an error or handle it more robustly.
    return;
  }

  // Extract the bingo card values from the first few lines.
  // Each line is split by space to get individual cell values.
  const bingoCardValues = gameLines
    .slice(0, BINGO_DIMENSION)
    .map((lineContent) => lineContent.split(" "));

  // The original code reads 'n' (the count of announced numbers) but doesn't utilize it.
  // This line is considered non-essential for the core logic and can be safely removed.
  // Original: const n = tmp[3]; // This line is intentionally omitted as part of Type III changes.

  // Extract the list of numbers that have been called out during the game.
  // These are all lines after the bingo card and the 'n' line.
  const announcedNumbers = gameLines.slice(BINGO_DIMENSION + 1);

  // Initialize a 2D array (matrix) to keep track of which cells on the bingo card have been marked.
  // All cells start as 'false' (unmarked).
  const cellMarkedStatus = Array.from({ length: BINGO_DIMENSION }, () =>
    new Array(BINGO_DIMENSION).fill(false)
  );

  // Iterate through each announced number and mark the corresponding cell(s) on the bingo card.
  // This involves nested loops to check every cell against the current announced number.
  for (const currentCall of announcedNumbers) {
    for (let rowIndex = 0; rowIndex < BINGO_DIMENSION; rowIndex++) {
      for (let colIndex = 0; colIndex < BINGO_DIMENSION; colIndex++) {
        // If a card cell's value matches the current announced number, mark it as true.
        if (bingoCardValues[rowIndex][colIndex] === currentCall) {
          cellMarkedStatus[rowIndex][colIndex] = true;
          // Note: In some bingo variants, a number might appear multiple times on a card.
          // This logic correctly marks all occurrences.
        }
      }
    }
  }

  // --- Core Logic: Check for a winning bingo pattern ---
  // A bingo win occurs if any complete row, column, or diagonal has all its cells marked.
  let hasWinningLine = false; // Flag to track if any winning condition is met.

  // Helper utility function to check if all boolean values in an array are true.
  const areAllTrue = (boolArray) => boolArray.every(Boolean);

  // 1. Check for winning rows:
  // Iterate through each row of the marked status grid.
  for (let r = 0; r < BINGO_DIMENSION; r++) {
    if (areAllTrue(cellMarkedStatus[r])) {
      hasWinningLine = true;
      break; // A winning row was found, no need to check further rows.
    }
  }

  // If a row win is detected, we can immediately output "yes" and exit the function.
  if (hasWinningLine) {
    console.log("yes");
    return;
  }

  // 2. Check for winning columns:
  // Iterate through each column. For each column, collect all its cell statuses.
  for (let c = 0; c < BINGO_DIMENSION; c++) {
    const currentColumnMarkings = []; // Intermediate array to hold status of cells in the current column.
    for (let r = 0; r < BINGO_DIMENSION; r++) {
      currentColumnMarkings.push(cellMarkedStatus[r][c]);
    }
    if (areAllTrue(currentColumnMarkings)) {
      hasWinningLine = true;
      break; // A winning column was found.
    }
  }

  // If a column win is detected, output "yes" and exit.
  if (hasWinningLine) {
    console.log("yes");
    return;
  }

  // 3. Check for the main diagonal (top-left to bottom-right):
  const mainDiagonalMarkings = []; // Intermediate array for main diagonal cells.
  for (let d = 0; d < BINGO_DIMENSION; d++) {
    mainDiagonalMarkings.push(cellMarkedStatus[d][d]);
  }
  if (areAllTrue(mainDiagonalMarkings)) {
    hasWinningLine = true;
  }

  // 4. Check for the anti-diagonal (top-right to bottom-left):
  // Only proceed if a win hasn't been found yet to avoid redundant checks.
  if (!hasWinningLine) {
    const antiDiagonalMarkings = []; // Intermediate array for anti-diagonal cells.
    for (let d = 0; d < BINGO_DIMENSION; d++) {
      antiDiagonalMarkings.push(cellMarkedStatus[d][BINGO_DIMENSION - 1 - d]);
    }
    if (areAllTrue(antiDiagonalMarkings)) {
      hasWinningLine = true;
    }
  }

  // Final Output: Based on whether any winning line was identified.
  if (hasWinningLine) {
    console.log("yes");
  } else {
    console.log("no");
  }
}

// Entry point for the application: Reads input from standard input and processes it.
// A try-catch block is added for robust error handling during file (stdin) operations.
try {
  const stdinContent = fileSystem.readFileSync("/dev/stdin", "utf8");
  processBingoGame(stdinContent);
} catch (error) {
  console.error(`An error occurred while reading from stdin or processing the game: ${error.message}`);
  // Exit with a non-zero code to indicate an error to the operating system.
  process.exit(1);
}