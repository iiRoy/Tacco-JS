function shiftDice(directionChar, currentDiceFaces) {
  // Extract individual face values for clarity
  let faceOne = currentDiceFaces[0]; // Top face
  let faceTwo = currentDiceFaces[1]; // Front face
  let faceThree = currentDiceFaces[2]; // Right face
  let faceFour = currentDiceFaces[3]; // Left face
  let faceFive = currentDiceFaces[4]; // Back face
  let faceSix = currentDiceFaces[5]; // Bottom face

  // Array to store the new orientation after the move
  let nextOrientation = [];

  // Determine the new arrangement based on the movement direction
  if (directionChar === "N") {
    // North: Top becomes Front, Front becomes Bottom, Bottom becomes Back, Back becomes Top
    nextOrientation = [faceTwo, faceSix, faceThree, faceFour, faceOne, faceFive];
  } else if (directionChar === "S") {
    // South: Top becomes Back, Back becomes Bottom, Bottom becomes Front, Front becomes Top
    nextOrientation = [faceFive, faceOne, faceThree, faceFour, faceSix, faceTwo];
  } else if (directionChar === "E") {
    // East: Top becomes Left, Left becomes Bottom, Bottom becomes Right, Right becomes Top
    nextOrientation = [faceFour, faceTwo, faceOne, faceSix, faceFive, faceThree];
  } else if (directionChar === "W") {
    // West: Top becomes Right, Right becomes Bottom, Bottom becomes Left, Left becomes Top
    nextOrientation = [faceThree, faceTwo, faceSix, faceOne, faceFive, faceFour];
  }

  // Return the new dice orientation
  return nextOrientation;
}

function rotateDice(initialFaces) {
  // Extract current face values
  let topFace = initialFaces[0];
  let frontFace = initialFaces[1];
  let rightFace = initialFaces[2];
  let leftFace = initialFaces[3];
  let backFace = initialFaces[4];
  let bottomFace = initialFaces[5];

  // Array to hold the faces after rotation
  let rotatedFaces = [];

  // Rotate the dice clockwise around the vertical axis (top/bottom stay, others shift)
  // Top (d1) and Bottom (d6) remain in place
  // Front (d2) moves to Right (d3) position
  // Right (d3) moves to Back (d5) position
  // Back (d5) moves to Left (d4) position
  // Left (d4) moves to Front (d2) position
  rotatedFaces = [topFace, rightFace, backFace, frontFace, leftFace, bottomFace];

  return rotatedFaces;
}

// Global map to store unique dice configurations encountered
let GLOBAL_STATE_MAP = {};
// Global variable to track the final outcome
let finalOutcome = "Yes";

function processRotations(diceState) {
  // Local object to store unique states for the current dice configuration
  let uniqueStates = {};

  // Perform 4 rotations around the vertical axis
  for (let idx = 0; idx < 4; idx++) {
    // Convert the current dice state array to a comma-separated string
    let stateString = diceState.join(",");
    // If this specific state hasn't been seen for the current dice, add it
    if (!uniqueStates.hasOwnProperty(stateString)) {
      uniqueStates[stateString] = true;
    }
    // Rotate the dice for the next iteration
    diceState = rotateDice(diceState);
  }

  // After checking all 4 vertical rotations, compare with the global map
  for (let keyStr in uniqueStates) {
    // Check if this unique configuration (including its rotations) has been seen globally
    if (GLOBAL_STATE_MAP.hasOwnProperty(keyStr)) {
      // If it has, then this dice is a duplicate
      finalOutcome = "No";
    } else {
      // If it's a new configuration, add it to the global map
      GLOBAL_STATE_MAP[keyStr] = true;
    }
  }
}

// Read input from standard input
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Process input: trim whitespace and split into lines
let inputLines = (rawData.trim()).split("\n");

// Get the number of dice configurations to process
let numCases = inputLines.shift() - 0; // Convert to number

// Loop through each dice configuration
for (let caseIndex = 0; caseIndex < numCases; caseIndex++) {
  // Parse the current line into an array of numbers representing dice faces
  let currentDice = inputLines[caseIndex].split(" ").map(Number);

  // Perform a series of moves and rotations to check all 24 orientations
  // First, check 4 rotations for the initial 'N' orientation
  for (let rotationIndex = 0; rotationIndex < 4; rotationIndex++) {
    processRotations(currentDice);
    currentDice = shiftDice("N", currentDice); // Move North
  }

  // Move East once
  currentDice = shiftDice("E", currentDice);
  // Check 4 rotations for the 'E' orientation
  processRotations(currentDice);

  // Move South twice (equivalent to moving North twice from the 'E' orientation)
  currentDice = shiftDice("S", currentDice);
  currentDice = shiftDice("S", currentDice);
  // Check 4 rotations for this 'S' orientation
  processRotations(currentDice);

  // If a duplicate dice configuration was found, no need to check further
  if (finalOutcome === "No") {
    break;
  }
}

// Output the final result
console.log(finalOutcome);
