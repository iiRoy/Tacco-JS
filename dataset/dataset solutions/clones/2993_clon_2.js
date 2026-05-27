// This module contains functions for processing game logic and testing solutions.

/**
 * Processes game input to determine if a player's path is valid given board constraints
 * and trap movements.
 * @param {string} rawData - The raw input string containing game parameters.
 * @returns {string} "YES" if the path is valid, "NO" otherwise.
 */
function ProcessGame(rawData) {
  // Split the entire input string into individual lines.
  const gameLines = rawData.split('\n');

  // Parse the first line for board dimensions and the total number of moves.
  const firstLineParts = gameLines[0].split(' ');
  const boardHeight = parseInt(firstLineParts[0], 10); // The vertical size of the game area.
  const boardWidth = parseInt(firstLineParts[1], 10);  // The horizontal size of the game area.
  const totalMoves = parseInt(firstLineParts[2], 10);   // The count of player and trap actions.

  // Parse the second line for the player's starting row and column.
  const startPositionParts = gameLines[1].split(' ');
  const initialRow = parseInt(startPositionParts[0], 10); // Player's initial vertical coordinate.
  const initialCol = parseInt(startPositionParts[1], 10); // Player's initial horizontal coordinate.

  // Extract the sequences of player and trap movements.
  const playerActionSequence = gameLines[2].split(''); // An array of characters representing player's moves.
  const trapActionSequence = gameLines[3].split('');   // An array of characters representing trap's moves.

  // Initialize variables to track the player's cumulative shifts from the starting position.
  let currentLeftShift = 0x0;  // Total steps moved left by the player.
  let currentRightShift = 0x0; // Total steps moved right by the player.
  let currentUpShift = 0x0;    // Total steps moved up by the player.
  let currentDownShift = 0x0;  // Total steps moved down by the player.

  // Initialize variables to track the trap's cumulative shifts, which affect boundaries.
  let trapBoundaryLeft = 0x0;  // Cumulative left shift of the trap boundary.
  let trapBoundaryRight = 0x0; // Cumulative right shift of the trap boundary.
  let trapBoundaryUp = 0x0;    // Cumulative up shift of the trap boundary.
  let trapBoundaryDown = 0x0;  // Cumulative down shift of the trap boundary.

  // The default outcome is "YES", indicating a valid path, until a violation occurs.
  let pathValidityResult = "YES";

  // Loop through each move in the sequence, from the first to the last.
  for (let moveIndex = 0; moveIndex < totalMoves; moveIndex++) {
    // Update player's potential shifts based on their current intended move.
    if (playerActionSequence[moveIndex] === "L") {
      currentLeftShift++;
    }
    if (playerActionSequence[moveIndex] === "R") {
      currentRightShift++;
    }
    if (playerActionSequence[moveIndex] === "U") {
      currentUpShift++;
    }
    if (playerActionSequence[moveIndex] === "D") {
      currentDownShift++;
    }

    // Check if the player's current position (considering all shifts) exceeds board boundaries.
    // If the player moves too far to the right.
    if (currentRightShift + initialCol > boardWidth) {
      pathValidityResult = "NO";
      break; // Path is invalid, no need to check further moves.
    }
    // If the player moves too far to the left.
    if (initialCol - currentLeftShift <= 0x0) {
      pathValidityResult = "NO";
      break; // Path is invalid.
    }
    // If the player moves too far down.
    if (currentDownShift + initialRow > boardHeight) {
      pathValidityResult = "NO";
      break; // Path is invalid.
    }
    // If the player moves too far up (note: original code uses initialCol for up-shift check).
    if (initialCol - currentUpShift <= 0x0) {
      pathValidityResult = "NO";
      break; // Path is invalid.
    }

    // Adjust the player's effective movement range based on the trap's current move.
    // If the trap moves Right and there's space for it to expand the right boundary.
    if (trapActionSequence[moveIndex] === "R" && initialCol + trapBoundaryRight + 0b1 <= boardWidth) {
      currentLeftShift--;  // Player can effectively move one less step left.
      trapBoundaryRight++; // Trap's right boundary expands.
    }
    // If the trap moves Left and there's space for it to expand the left boundary.
    if (trapActionSequence[moveIndex] === "L" && initialCol - trapBoundaryLeft - 0b1 > 0x0) {
      currentRightShift--; // Player can effectively move one less step right.
      trapBoundaryLeft++;  // Trap's left boundary expands.
    }
    // If the trap moves Up and there's space for it to expand the up boundary.
    if (trapActionSequence[moveIndex] === "U" && initialRow - trapBoundaryUp - 0b1 > 0x0) {
      currentDownShift--; // Player can effectively move one less step down.
      trapBoundaryUp++;   // Trap's up boundary expands.
    }
    // If the trap moves Down and there's space for it to expand the down boundary.
    if (trapActionSequence[moveIndex] === "D" && initialRow + trapBoundaryDown + 0b1 >= boardHeight) {
      currentUpShift--;   // Player can effectively move one less step up.
      trapBoundaryDown++; // Trap's down boundary expands.
    }
  }

  // Output the final result to the console.
  console.log('%s', pathValidityResult);
  return pathValidityResult;
}

/**
 * A utility function for testing the ProcessGame logic against predefined inputs and outputs
 * typically found in a web-based testing environment.
 * @param {number} testNumber - The identifier for the specific test case (e.g., "input1", "output1").
 */
function testSolution(testNumber) {
  // Retrieve the input string from a DOM element.
  const currentTestInput = document.getElementById("input" + testNumber).value;
  // Retrieve the expected output string from a DOM element, taking only the first line.
  const expectedTestOutput = document.getElementById("output" + testNumber).value.split('\n')[0];

  // Execute the main game logic with the retrieved input.
  const actualTestResult = ProcessGame(currentTestInput);

  // Compare the actual result with the expected result.
  let evaluationStatus = "WA"; // Default to "Wrong Answer".
  if (actualTestResult === expectedTestOutput) {
    evaluationStatus = "AC"; // Set to "Accepted" if results match.
  }

  // Display the evaluation status in the designated result DOM element.
  document.getElementById("result" + testNumber).innerHTML = evaluationStatus;
}

// This line executes the main game processing function, reading input from standard input.
ProcessGame(require("fs").readFileSync("/dev/stdin", "utf8"));
