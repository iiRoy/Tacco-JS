"use strict";

const fs = require("fs"); // File system module for reading input

/**
 * Processes the raw input text to determine if a bingo condition is met.
 * @param {string} rawInputText - The complete input string from stdin.
 */
function processBingoInput(rawInputText) {
  // Split the entire input into individual lines.
  const inputLines = rawInputText.split("\n");

  // The first three lines represent the 3x3 bingo board.
  // Each line is split by space to get individual numbers.
  const bingoBoard = inputLines.slice(0, 3).map(lineSegment => lineSegment.split(" "));

  // The fourth line (index 3) contains the count of numbers called, but it's not used in the logic.
  const numberOfCalls = inputLines[3]; // This variable is declared but not utilized further.

  // The remaining lines (from index 4 onwards) are the numbers called out.
  const bingoCalls = inputLines.slice(4);

  // Initialize a 3x3 grid to keep track of marked cells on the bingo board.
  // All cells are initially unmarked (false).
  const markedCells = [];
  for (let rowInitIndex = 0; rowInitIndex < 3; rowInitIndex++) {
    markedCells[rowInitIndex] = new Array(3).fill(false);
  }

  // Iterate through each called number.
  for (let currentBingoCall of bingoCalls) {
    // For each called number, check if it exists on the bingo board.
    for (let boardRowIndex = 0; boardRowIndex < 3; boardRowIndex++) {
      for (let boardColIndex = 0; boardColIndex < 3; boardColIndex++) {
        // If a number on the board matches the current called number, mark it.
        if (bingoBoard[boardRowIndex][boardColIndex] === currentBingoCall) {
          markedCells[boardRowIndex][boardColIndex] = true;
        }
      }
    }
  }

  // Check for a bingo condition (three marked cells in a row, column, or diagonal).
  // This complex conditional statement checks all possible winning lines.
  if (
    // Horizontal lines
    (markedCells[0][0] && markedCells[0][1] && markedCells[0][2]) ||
    (markedCells[1][0] && markedCells[1][1] && markedCells[1][2]) ||
    (markedCells[2][0] && markedCells[2][1] && markedCells[2][2]) ||
    // Vertical lines
    (markedCells[0][0] && markedCells[1][0] && markedCells[2][0]) ||
    (markedCells[0][1] && markedCells[1][1] && markedCells[2][1]) ||
    (markedCells[0][2] && markedCells[1][2] && markedCells[2][2]) ||
    // Diagonal lines
    (markedCells[0][0] && markedCells[1][1] && markedCells[2][2]) ||
    (markedCells[0][2] && markedCells[1][1] && markedCells[2][0])
  ) {
    // If any bingo condition is met, print "yes".
    console.log("yes");
  } else {
    // Otherwise, print "no".
    console.log("no");
  }
}

// Read the entire input from standard input and pass it to the processing function.
processBingoInput(fs.readFileSync("/dev/stdin", "utf8"));
