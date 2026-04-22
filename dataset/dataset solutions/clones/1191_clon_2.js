// This function calculates the new state of a 3D block after a directional shift.
// It takes the current block's face configuration and a direction code.
function shiftBlock(directionCode, currentBlockState) {
  // Extract individual face values from the current state array.
  let faceOne   = currentBlockState[0];
  let faceTwo   = currentBlockState[1];
  let faceThree = currentBlockState[2];
  let faceFour  = currentBlockState[3];
  let faceFive  = currentBlockState[4];
  let faceSix   = currentBlockState[5];

  // Initialize an array to hold the new face configuration.
  let newState  = [];

  // Based on the given direction, determine the new arrangement of faces.
  if (directionCode === "N") {
    newState = [faceTwo, faceSix, faceThree, faceFour, faceOne, faceFive]; // North shift
  }
  if (directionCode === "S") {
    newState = [faceFive, faceOne, faceThree, faceFour, faceSix, faceTwo]; // South shift
  }
  if (directionCode === "E") {
    newState = [faceFour, faceTwo, faceOne, faceSix, faceFive, faceThree]; // East shift
  }
  if (directionCode === "W") {
    newState = [faceThree, faceTwo, faceSix, faceOne, faceFive, faceFour]; // West shift
  }

  // Return the updated block state.
  return newState;
}

// Read all input data from standard input, assuming UTF-8 encoding.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace, then split into an array of lines.
let lineData = rawData.trim().split("\n");

// The first line contains the initial configuration of the block's faces.
// Split by space and convert each part to a number.
let blockFaces = lineData[0].split(" ").map(Number);

// Remove the first two lines from the processed input, as they are now consumed.
// These lines likely contained setup information or were placeholders.
lineData.shift();
lineData.shift();

// Define the possible movement directions as an array of characters.
const moveDirections = "NSEW".split("");

// Iterate over the remaining lines of input, each representing a target state.
lineData.forEach(function(lineContent) {
  // Parse the target row and column from the current line.
  // Using parseInt for explicit type conversion.
  let targetRow = parseInt(lineContent.split(" ")[0], 10);
  let targetCol = parseInt(lineContent.split(" ")[1], 10);

  // Keep shifting the block randomly until its top face (index 0) and front face (index 1)
  // match the target row and column values.
  while (!(blockFaces[0] === targetRow && blockFaces[1] === targetCol)) {
    // Generate a random index to pick a direction (N, S, E, W).
    let randomDirIndex = Math.floor(Math.random() * 4);
    // Apply the random shift to the block and update its state.
    blockFaces = shiftBlock(moveDirections[randomDirIndex], blockFaces);
  }

  // Once the target state is reached, print the value of the block's third face (index 2).
  console.log(blockFaces[2]);
});