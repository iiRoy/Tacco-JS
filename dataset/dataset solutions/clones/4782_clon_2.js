'use strict' // Activate strict JavaScript parsing rules for cleaner code.

/**
 * Orchestrates the processing of coordinate data to generate a complex movement path.
 * This function takes a string containing four numeric coordinates, parses them,
 * calculates displacements, and constructs a series of directional movements.
 *
 * @param {string} inputCoordinateString A space-separated string representing:
 *                                       initial_x initial_y final_x final_y.
 */
function processCoordinateSequence( inputCoordinateString ) {

  // Transform the raw input string into an array of numerical values.
  // 1. Remove any leading or trailing whitespace.
  // 2. Split the string into substrings based on space delimiters.
  // 3. Convert each substring into an integer using radix 10 (decimal).
  const extractedNumericValues = inputCoordinateString
                                 .trim()
                                 .split(' ')
                                 .map( numStr => Number.parseInt(numStr, 10) ) // Using arrow function for map and explicit radix

  // Assign the extracted numeric values to descriptive variables.
  const startPointX = extractedNumericValues[0] // The starting horizontal coordinate.
  const startPointY = extractedNumericValues[1] // The starting vertical coordinate.
  const endPointX   = extractedNumericValues[2] // The target horizontal coordinate.
  const endPointY   = extractedNumericValues[3] // The target vertical coordinate.

  // Calculate the total change required in both X and Y dimensions.
  const xDisplacement = endPointX - startPointX // Horizontal distance to cover.
  const yDisplacement = endPointY - startPointY // Vertical distance to cover.

  // Initialize a mutable string to build the complete movement sequence.
  let generatedMovementSequence = ''

  // --- Initial Path Segment: Ascend and Traverse Right ---

  // First, move upwards to cover the vertical displacement.
  // Each iteration adds an 'U' (Up) command.
  for (let verticalIterator = 0; verticalIterator <= yDisplacement; verticalIterator++) {
    generatedMovementSequence += 'U' // Append 'Up'
  }

  // Next, move rightwards to cover the horizontal displacement.
  // Each iteration adds an 'R' (Right) command.
  for (let horizontalIterator = 0; horizontalIterator <= xDisplacement; horizontalIterator++) {
    generatedMovementSequence += 'R' // Append 'Right'
  }

  // --- Return Path Segment: Descend and Traverse Left ---

  // Then, move downwards, mirroring the initial ascent.
  // Each iteration adds a 'D' (Down) command.
  for (let descendIterator = 0; descendIterator <= yDisplacement; descendIterator++) {
    generatedMovementSequence += 'D' // Append 'Down'
  }

  // Finally, move leftwards, mirroring the initial rightward movement.
  // Each iteration adds an 'L' (Left) command.
  for (let leftwardIterator = 0; leftwardIterator <= xDisplacement; leftwardIterator++) {
    generatedMovementSequence += 'L' // Append 'Left'
  }

  // --- Extended Complex Path Segment ---

  // Add an additional 'Left' step to initiate the complex path.
  generatedMovementSequence += 'L'

  // Execute an extended upward movement, one unit beyond the initial vertical displacement.
  for (let extendedUpIterator = 0; extendedUpIterator <= yDisplacement + 1; extendedUpIterator++) {
    generatedMovementSequence += 'U' // Append 'Up' for the extended segment
  }

  // Execute an extended rightward movement, one unit beyond the initial horizontal displacement.
  for (let extendedRightIterator = 0; extendedRightIterator <= xDisplacement + 1; extendedRightIterator++) {
    generatedMovementSequence += 'R' // Append 'Right' for the extended segment
  }

  // Insert a 'Down' then 'Right' sequence.
  generatedMovementSequence += 'DR'

  // Execute an extended downward movement, mirroring the extended upward path.
  for (let extendedDownIterator = 0; extendedDownIterator <= yDisplacement + 1; extendedDownIterator++) {
    generatedMovementSequence += 'D' // Append 'Down' for the extended segment
  }

  // Execute an extended leftward movement, mirroring the extended rightward path.
  for (let extendedLeftIterator = 0; extendedLeftIterator <= xDisplacement + 1; extendedLeftIterator++) {
    generatedMovementSequence += 'L' // Append 'Left' for the extended segment
  }

  // Conclude the complex path with a final 'Up' step.
  generatedMovementSequence += 'U'

  // Prepare to output the final sequence.
  const standardOutputInterface = console; // Reference to the global console object.
  const printMessageFunction = standardOutputInterface.log; // Reference to the console's log method.
  printMessageFunction(generatedMovementSequence); // Display the complete movement path.
}

// Establish aliases for global/built-in functions and objects to conform to identifier renaming.
const obtainModule = require;                                         // Alias for the CommonJS module loader.
const fileSystemModuleReference = obtainModule('fs');                 // Obtain a reference to the Node.js 'fs' module.
const readEntireFileContent = fileSystemModuleReference.readFileSync; // Alias for the file reading function within 'fs'.

// Execute the primary coordinate processing function.
// It reads input from standard input (e.g., `/dev/stdin` on Unix-like systems)
// as a UTF-8 encoded string and passes it to the processing logic.
processCoordinateSequence(readEntireFileContent('/dev/stdin', 'utf8'))