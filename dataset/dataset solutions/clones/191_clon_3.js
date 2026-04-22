// This module simulates a simple cup-shuffling game based on textual instructions.

// Constant map to translate cup identifiers (A, B, C) to internal numerical positions (0, 1, 2)
// and vice-versa. This ensures consistent referencing throughout the simulation.
const positionLookup = {
  'A': 0,
  'B': 1,
  'C': 2,
  0: 'A',
  1: 'B',
  2: 'C',
};

// Represents the current state of the cups.
// Each boolean indicates whether the ball is currently under that cup's position.
// Initial state: ball is under the first cup.
let ballPositionIndicators = [true, false, false];

/**
 * Executes the primary game logic, processing a series of shuffle instructions.
 * Each instruction describes a pair of cups to swap.
 */
function processCupGame() {
  // Ensure we have raw input data to work with.
  if (!fullInputStream || fullInputStream.length === 0) {
    console.error("No game instructions provided. Exiting.");
    return;
  }

  // Split the entire collected input into individual instruction lines.
  const instructionLines = fullInputStream.split('\n');

  // Iterate through each received instruction line to perform the shuffles.
  for (const rawInstruction of instructionLines) {
    // Skip any empty or whitespace-only lines to prevent processing errors.
    const trimmedInstruction = rawInstruction.trim();
    if (trimmedInstruction.length === 0) {
      continue; // Move to the next instruction if this one is empty.
    }

    // Parse the instruction to identify the cups involved in the swap.
    const cupIdentifiers = trimmedInstruction.split(',');

    // Basic validation for the instruction format.
    if (cupIdentifiers.length !== 2) {
      console.warn(`Skipping malformed instruction: "${trimmedInstruction}". Expected two cup identifiers.`);
      continue;
    }

    // Retrieve the numerical indices corresponding to the cup identifiers.
    const firstCupLabel = cupIdentifiers[0];
    const secondCupLabel = cupIdentifiers[1];

    const firstCupIndex = positionLookup[firstCupLabel];
    const secondCupIndex = positionLookup[secondCupLabel];

    // Validate that the identifiers map to valid positions.
    if (firstCupIndex === undefined || secondCupIndex === undefined) {
      console.warn(`Skipping instruction with unknown cup identifiers: "${trimmedInstruction}".`);
      continue;
    }

    // Perform the actual swap operation on the cup states.
    performContentExchange(ballPositionIndicators, firstCupIndex, secondCupIndex);
  }

  // After all shuffles are complete, determine the final position of the ball.
  const finalBallIndex = ballPositionIndicators.findIndex(isBallPresent => isBallPresent === true);

  // If a ball is found, log its corresponding cup identifier.
  if (finalBallIndex !== -1) {
    const finalCupLabel = positionLookup[finalBallIndex];
    console.log(`The ball is finally located under cup: ${finalCupLabel}`);
  } else {
    // This case should ideally not happen if the initial state is correct and swaps are valid.
    console.error("Error: Ball position could not be determined after shuffles.");
  }
}

/**
 * Swaps the content (boolean states) of two specified positions within an array.
 * This function is used to simulate the physical exchange of cups.
 *
 * @param {boolean[]} targetStateArray The array representing the current states of the cups.
 * @param {number} positionA The index of the first cup to be involved in the swap.
 * @param {number} positionB The index of the second cup to be involved in the swap.
 */
function performContentExchange(targetStateArray, positionA, positionB) {
  // Basic validation to ensure indices are within the array bounds.
  const arrayLength = targetStateArray.length;
  if (positionA < 0 || positionA >= arrayLength || positionB < 0 || positionB >= arrayLength) {
    console.error(`Attempted swap with invalid positions: ${positionA}, ${positionB}. Array length: ${arrayLength}`);
    return; // Prevent out-of-bounds access.
  }

  // Perform the swap using array destructuring for conciseness and readability.
  [targetStateArray[positionA], targetStateArray[positionB]] = [targetStateArray[positionB], targetStateArray[positionA]];
}

// Variable to accumulate all incoming data from standard input.
let fullInputStream = '';

// Setup standard input stream handlers.
// Resume the stdin stream to start listening for data.
process.stdin.resume();

// Set the encoding for the incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for 'data' chunks received from stdin.
process.stdin.on('data', (dataSegment) => {
  fullInputStream += dataSegment; // Append each chunk to our accumulated input string.
});

// Event listener for the 'end' of the stdin stream.
process.stdin.on('end', () => {
  // Once all input has been received, initiate the game processing.
  processCupGame();
});