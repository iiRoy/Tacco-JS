function shiftDice(directionChar, currentFaces) {
   // Extract individual face values from the input array for clarity
   let faceOne = currentFaces[0];   // Represents the top face
   let faceTwo = currentFaces[1];   // Represents the front face
   let faceThree = currentFaces[2]; // Represents the right face
   let faceFour = currentFaces[3];  // Represents the back face
   let faceFive = currentFaces[4];  // Represents the left face
   let faceSix = currentFaces[5];   // Represents the bottom face

   let newFaces = []; // This array will hold the dice's new orientation

   // Apply the rotation logic based on the specified direction
   if (directionChar === "N") { // Moving the dice North
      newFaces = [faceTwo, faceSix, faceThree, faceFour, faceOne, faceFive];
   }
   if (directionChar === "S") { // Moving the dice South
      newFaces = [faceFive, faceOne, faceThree, faceFour, faceSix, faceTwo];
   }
   if (directionChar === "E") { // Moving the dice East
      newFaces = [faceFour, faceTwo, faceOne, faceSix, faceFive, faceThree];
   }
   if (directionChar === "W") { // Moving the dice West
      newFaces = [faceThree, faceTwo, faceSix, faceOne, faceFive, faceFour];
   }
   return newFaces; // Return the array representing the dice's new state
}

function rotateDice(currentLayout) {
   // Deconstruct the current dice layout into named faces
   let topFace = currentLayout[0];    // The face currently on top
   let frontFace = currentLayout[1];  // The face currently at the front
   let rightFace = currentLayout[2];  // The face currently on the right
   let backFace = currentLayout[3];   // The face currently at the back
   let leftFace = currentLayout[4];   // The face currently on the left
   let bottomFace = currentLayout[5]; // The face currently at the bottom

   let rotatedLayout = []; // Array to store the configuration after rotation
   // This specific rotation keeps the top and bottom faces in their relative positions
   // but shuffles the front, right, back, and left faces.
   // The sequence becomes: Top, Right, Left, Front, Back, Bottom
   rotatedLayout = [topFace, rightFace, leftFace, frontFace, backFace, bottomFace];
   return rotatedLayout; // Return the new arrangement of faces
}

function processOrientations(initialConfig) {
   let uniqueConfigs = {}; // A temporary object to track unique configurations for the current dice state
   // Perform 4 rotations around the current top-bottom axis
   for (let idx = 0; idx < 4; idx++) {
      let configString = initialConfig.join(","); // Convert the array to a string for use as an object key
      // If this specific configuration string has not been recorded yet for this dice state
      if (!uniqueConfigs.hasOwnProperty(configString)) {
         uniqueConfigs[configString] = true; // Mark it as encountered
      }
      initialConfig = rotateDice(initialConfig); // Rotate the dice to get the next orientation
   }

   // After generating all 4 rotations, check them against the global map of all seen configurations
   for (let keyStr in uniqueConfigs) {
      // If any of these unique configurations (from the current dice state)
      // has already been seen in the global collection
      if (GLOBAL_CONFIG_MAP.hasOwnProperty(keyStr)) {
         finalOutcome = "No"; // Set the global result to "No" as a duplicate is found
      } else {
         GLOBAL_CONFIG_MAP[keyStr] = true; // Otherwise, add this new unique configuration to the global map
      }
   }
}

// Read all input from standard input
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Clean up the input: remove leading/trailing whitespace and split into an array of lines
let inputLines = (rawData.trim()).split("\n");

// The first line contains the number of test cases
let numCases = parseInt(inputLines.shift(), 10); // Convert the first line to an integer

let GLOBAL_CONFIG_MAP = {}; // This global object stores all unique dice configurations encountered across all test cases
let finalOutcome = "YES";   // The overall result, initialized to "YES"

// Iterate through each test case provided in the input
for (let caseIndex = 0; caseIndex < numCases; caseIndex++) {
   // Parse the current line into an array of numbers representing the dice faces
   let currentDiceState = inputLines[caseIndex].split(" ").map(Number);

   // Simulate rotations by moving the dice North 4 times.
   // This covers all 4 orientations where the initial top face is still on top.
   for (let rotationIndex = 0; rotationIndex < 4; rotationIndex++) {
      processOrientations(currentDiceState); // Process the current orientation and its 4 rolls
      currentDiceState = shiftDice("N", currentDiceState); // Move the dice North
   }

   // After 4 North moves, the dice has returned to its original top face, but potentially rotated.
   // Now, move East once to bring a new face to the top.
   currentDiceState = shiftDice("E", currentDiceState);
   processOrientations(currentDiceState); // Process this new set of orientations

   // Move South twice to bring yet another new face to the top.
   currentDiceState = shiftDice("S", currentDiceState);
   currentDiceState = shiftDice("S", currentDiceState);
   processOrientations(currentDiceState); // Process this final set of orientations

   // If at any point a duplicate configuration was found, the finalOutcome would be "No".
   // We can stop processing further cases if this happens.
   if (finalOutcome === "No") {
      break; // Exit the loop early
   }
}

// Print the final result to standard output
console.log(finalOutcome);
