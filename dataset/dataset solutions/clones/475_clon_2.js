// Utilize Node.js file system module for standard input operations
var fileSystemModule = require('fs');

// Determine the size of the standard input stream
var fileSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data
var dataBuffer = new Buffer(fileSize);

// Read data from standard input into the buffer
var readBytesCount = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);

// Convert the buffer content to a UTF-8 string and split it into an array of lines
var inputLines = dataBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Invoke the primary function to process the game data
processGameData();

/**
 * Main function to handle the game logic, processing multiple scenarios from input.
 */
function processGameData() {
  let currentLineIndex = 0; // Index to track the current line being read from `inputLines`

  // Loop continuously to process multiple game fields until a specific termination condition is met
  while (true) {
    // Extract field dimensions from the current input line
    let levelDimensions = inputLines[currentLineIndex].split(' ');
    let gridWidth = Number(levelDimensions[0]);  // Convert string to numeric width
    let gridHeight = Number(levelDimensions[1]); // Convert string to numeric height

    // Check for the termination signal: both width and height are zero
    if (!gridWidth && !gridHeight) {
      break; // Exit the processing loop
    }

    // Declare variables for storing game state and intermediate calculations
    let startPoint; // Encoded coordinates of the starting position 'S'
    let endPoint;   // Encoded coordinates of the goal position 'G'

    // An array of arrays to store the encoded locations of creatures by their type (0-4)
    // creatureLocations[type_id][instance_index] = encoded_position
    let creatureLocations = [[], [], [], [], []];

    let charValue; // Character read from the grid cell
    let lineContent; // The string content of the current grid row
    let currentCreatureTypeLocations; // Temporary reference to an inner array of `creatureLocations`
    let rowIdx; // Loop variable for iterating through grid rows
    let colIdx; // Loop variable for iterating through grid columns

    // Iterate through the grid rows in reverse order (from `gridHeight - 1` down to 0)
    for (rowIdx = gridHeight; rowIdx--;) {
      currentLineIndex++; // Advance to the next line in the input, which is a grid row
      lineContent = inputLines[currentLineIndex]; // Get the content of the current grid row

      // Iterate through the grid columns in reverse order (from `gridWidth - 1` down to 0)
      for (colIdx = gridWidth; colIdx--;) {
        charValue = lineContent[colIdx]; // Get the character at the current (colIdx, rowIdx) position

        // Process the character to identify its type and store its location
        if (charValue === '.') {
          // Empty space, no specific action required
        } else if (charValue >= '1' && charValue <= '5') {
          // A creature of type '1' through '5' is found
          currentCreatureTypeLocations = creatureLocations[Number(charValue) - 1]; // Get the array for this creature type
          currentCreatureTypeLocations[currentCreatureTypeLocations.length] = encodeCoordinates(colIdx, rowIdx); // Add its encoded position
        } else if (charValue === 'S') {
          // The starting point 'S' is found
          startPoint = encodeCoordinates(colIdx, rowIdx);
        } else { // Assuming 'G' for any other character
          // The goal point 'G' is found
          endPoint = encodeCoordinates(colIdx, rowIdx);
        }
      }
    }

    // Variables for the dynamic programming pathfinding algorithm
    const infinityValue = 1 << 30; // A large integer representing an unreachable distance
    let optimalCreatureType = -1; // Stores the index of the best starting creature type (0-4)
    let pathDistance; // Temporary variable to hold the distance of a calculated path
    let minimumTotalDistance = infinityValue; // Stores the shortest path distance found across all trials

    // Dynamic programming table: distanceMatrix[creature_type][creature_instance_index]
    // Stores the minimum distance to reach a specific creature instance
    let distanceMatrix;

    let outerLoopIndex; // Generic loop counter
    let innerLoopIndex; // Another generic loop counter
    let evolutionStep; // Counter for the "evolution" steps (S -> Type1 -> Type2 -> Type3 -> Type4 -> G)
    let arrayLength; // Helper variable for array lengths in loops

    let currentTypeDistances; // Cache for `distanceMatrix[currentCreatureType]`
    let currentCreatureDistance; // Cache for `distanceMatrix[currentCreatureType][outerLoopIndex]`
    let nextTypeDistances; // Cache for `distanceMatrix[nextCreatureType]`

    let currentTypeCreatures; // Cache for `creatureLocations[currentCreatureType]`
    let currentCreaturePosition; // Cache for `creatureLocations[currentCreatureType][outerLoopIndex]`
    let nextTypeCreatures; // Cache for `creatureLocations[nextCreatureType]`

    let currentCreatureType; // Index of the creature type currently being processed
    let currentTypeCount; // Number of creatures of the `currentCreatureType`
    let nextCreatureType; // Index of the next creature type in the sequence
    let nextTypeCount; // Number of creatures of the `nextCreatureType`

    // Iterate through each possible creature type (0 to 4) to be the first in the sequence (after 'S')
    for (let initialCreatureSelection = 0; initialCreatureSelection < 5; initialCreatureSelection++) {
      // Initialize the distance matrix for the current `initialCreatureSelection` trial
      distanceMatrix = [[], [], [], [], []];

      // Fill the `distanceMatrix` with `infinityValue` for all creature instances
      for (outerLoopIndex = 5; outerLoopIndex--;) { // Loop through creature types (0-4)
        arrayLength = creatureLocations[outerLoopIndex].length;
        distanceMatrix[outerLoopIndex].length = arrayLength; // Set array length
        let tempDistanceCache = distanceMatrix[outerLoopIndex]; // Cache the inner array
        while (arrayLength--) { // Loop through instances of the current type
          tempDistanceCache[arrayLength] = infinityValue;
        }
      }

      // Determine the actual first creature type in the sequence (e.g., if initial selection is 0, first type is 1)
      currentCreatureType = (initialCreatureSelection + 1) % 5;
      currentTypeCount = creatureLocations[currentCreatureType].length;
      currentTypeDistances = distanceMatrix[currentCreatureType];
      currentTypeCreatures = creatureLocations[currentCreatureType];

      // Calculate initial distances from the start point 'S' to all creatures of the first type
      for (outerLoopIndex = 0; outerLoopIndex < currentTypeCount; outerLoopIndex++) {
        currentTypeDistances[outerLoopIndex] = calculateManhattanDistance(startPoint, currentTypeCreatures[outerLoopIndex]);
      }

      // Perform the "evolution" steps: S -> Type1 -> Type2 -> Type3 -> Type4 -> G
      // There are 3 intermediate transitions (Type1->Type2, Type2->Type3, Type3->Type4)
      for (evolutionStep = 0; evolutionStep < 3; evolutionStep++) {
        // Determine the next creature type in the sequence
        nextCreatureType = (currentCreatureType + 1) % 5;
        nextTypeDistances = distanceMatrix[nextCreatureType];
        nextTypeCreatures = creatureLocations[nextCreatureType];
        nextTypeCount = nextTypeCreatures.length;

        // Iterate through all creatures of the `currentCreatureType`
        for (outerLoopIndex = 0; outerLoopIndex < currentTypeCount; outerLoopIndex++) {
          currentCreatureDistance = currentTypeDistances[outerLoopIndex];
          currentCreaturePosition = currentTypeCreatures[outerLoopIndex];

          // Pruning: If the current path to this creature is already longer than the best path found so far,
          // there's no need to extend it further.
          if (currentCreatureDistance >= minimumTotalDistance) {
            continue;
          }

          // Iterate through all creatures of the `nextCreatureType`
          for (innerLoopIndex = 0; innerLoopIndex < nextTypeCount; innerLoopIndex++) {
            let nextCreaturePosition = nextTypeCreatures[innerLoopIndex];
            let nextCreatureDistance = nextTypeDistances[innerLoopIndex];

            // Calculate the distance from the current creature to the next creature,
            // and update the `distanceMatrix` if a shorter path is found.
            nextCreatureDistance = findMinimum(nextCreatureDistance, currentCreatureDistance + calculateManhattanDistance(currentCreaturePosition, nextCreaturePosition));
            nextTypeDistances[innerLoopIndex] = nextCreatureDistance; // Store the updated minimum distance

            // If this is the final evolution step (Type4 -> G)
            if (evolutionStep === 2) {
              // Calculate the total path distance from 'S' to 'G' via this sequence
              pathDistance = nextCreatureDistance + calculateManhattanDistance(nextCreaturePosition, endPoint);

              // If this total path is shorter than the `minimumTotalDistance` found so far, update it
              if (pathDistance < minimumTotalDistance) {
                minimumTotalDistance = pathDistance;
                optimalCreatureType = initialCreatureSelection;
              }
            }
          }
        }

        // Prepare for the next evolution step: `nextCreatureType` becomes the `currentCreatureType`
        currentCreatureType = nextCreatureType;
        currentTypeDistances = nextTypeDistances;
        currentTypeCreatures = nextTypeCreatures;
        currentTypeCount = nextTypeCount;
      }
    }

    // Output the result for the current game scenario
    if (minimumTotalDistance === infinityValue) {
      console.log("NA"); // No valid path was found
    } else {
      // Output the 1-based index of the optimal creature type and the minimum total distance
      console.log((optimalCreatureType + 1) + " " + minimumTotalDistance);
    }

    currentLineIndex++; // Move to the next line in input, preparing for the next game field
  }
}

/**
 * Calculates the Manhattan distance between two encoded coordinate points.
 * @param {number} originPoint - The encoded starting point (x, y).
 * @param {number} destinationPoint - The encoded ending point (x, y).
 * @returns {number} The Manhattan distance.
 */
function calculateManhattanDistance(originPoint, destinationPoint) {
  // Extract x-coordinate by right-shifting 11 bits (x is in higher bits)
  let x1 = originPoint >> 0xB; // 11
  // Extract y-coordinate by bitwise AND with 0x7FF (2047, lower 11 bits)
  let y1 = originPoint & 0x7FF;

  let x2 = destinationPoint >> 0xB;
  let y2 = destinationPoint & 0x7FF;

  // Manhattan distance = |x1 - x2| + |y1 - y2|
  return getAbsoluteValue(x1 - x2) + getAbsoluteValue(y1 - y2);
}

/**
 * Finds the minimum of two numbers using bitwise operations.
 * This method is often used for performance optimization in competitive programming.
 * @param {number} valA - The first number.
 * @param {number} valB - The second number.
 * @returns {number} The smaller of the two numbers.
 */
function findMinimum(valA, valB) {
  // This bitwise trick works by leveraging the sign bit of (valA - valB)
  // If (valA - valB) is negative, (valA - valB) >> 0x1F will be -1 (all 1s).
  // If (valA - valB) is positive or zero, (valA - valB) >> 0x1F will be 0.
  // (valA - valB) & ((valA - valB) >> 0x1F) will be (valA - valB) if negative, or 0 if positive/zero.
  // So, valB + (negative_diff) = valA, or valB + 0 = valB.
  return valB + ((valA - valB) & ((valA - valB) >> 0x1F)); // 31
}

/**
 * Encodes 2D coordinates (x, y) into a single integer for efficient storage and manipulation.
 * Assumes x and y coordinates fit within 1024 (2^10) for y and 2^21 for x.
 * @param {number} colIdx - The x-coordinate (column index).
 * @param {number} rowIdx - The y-coordinate (row index).
 * @returns {number} The encoded integer representing the coordinates.
 */
function encodeCoordinates(colIdx, rowIdx) {
  // Shifts the x-coordinate left by 11 bits to occupy higher bits,
  // then adds the y-coordinate to fill the lower 11 bits.
  return (colIdx << 0xB) + rowIdx; // 11
}

/**
 * Calculates the absolute value of an integer using bitwise operations.
 * This is a common optimization technique.
 * @param {number} valA - The integer for which to find the absolute value.
 * @returns {number} The absolute value of `valA`.
 */
function getAbsoluteValue(valA) {
  // If valA is negative, signBit will be -1 (all 1s).
  // If valA is positive or zero, signBit will be 0.
  let signBit = valA >> 0x1F; // 31

  // If valA is negative: (valA ^ -1) - (-1) = (~valA) + 1 = -valA (two's complement negation)
  // If valA is positive: (valA ^ 0) - 0 = valA
  return (valA ^ signBit) - signBit;
}
