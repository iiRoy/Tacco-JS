var fileSystemModule = require('fs');
var dataLength = fileSystemModule.fstatSync(process.stdin.fd).size;
var inputBuffer = new Buffer(dataLength);
var readBytesCount = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0);
var rawInputLines = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Initiate the primary processing function
processGridData();

/**
 * Orchestrates the reading of grid data, pathfinding, and result output.
 * Continues processing grids until a '0 0' input is encountered.
 */
function processGridData() {
  var currentLineIndex = 0; // Keeps track of the current line being read from the input array
  
  // Main loop to process multiple grid configurations
  while (true) {
    // Extract grid dimensions from the current input line
    var gridDimensions = rawInputLines[currentLineIndex].split(' ');
    var gridWidth = gridDimensions[0] - 0; // Convert string to integer for width
    var gridHeight = gridDimensions[1] - 0; // Convert string to integer for height
    
    // Check for the termination condition: '0 0' signifies end of input
    if (!gridWidth && !gridHeight) {
      break; // Exit the processing loop
    }
    
    // Declare variables for storing grid elements and positions
    var startPosition; // Encoded coordinates of the starting point 'S'
    var targetPosition; // Encoded coordinates of the goal point 'G'
    // An array of arrays to store encoded positions of elements, grouped by their attribute (0-4)
    // elementLocations[attribute_id][element_index] holds an encoded position
    var elementLocations = [[], [], [], [], []]; 
    var charValue; // Character read from the grid cell
    var currentGridRow; // The string representing the current row of the grid
    var attributeElementsCache; // Temporary reference to an attribute's element array
    var rowIterator; // Loop counter for iterating through grid rows
    var colIterator; // Loop counter for iterating through grid columns
    
    // Iterate through the grid rows, from bottom to top (reverse order)
    for (rowIterator = gridHeight; rowIterator--;) {
      currentLineIndex++; // Advance to the next line in the input
      currentGridRow = rawInputLines[currentLineIndex]; // Get the string for the current row
      
      // Iterate through the columns of the current row, from right to left (reverse order)
      for (colIterator = gridWidth; colIterator--;) {
        charValue = currentGridRow[colIterator]; // Get the character at the current (col, row)
        
        // Process the character based on its value
        if (charValue === '.') {
          // Empty cell, no action required
        } else if (charValue === '1' || charValue === '2' || charValue === '3' || charValue === '4' || charValue === '5') {
          // It's an element with an attribute (1-5)
          attributeElementsCache = elementLocations[charValue - 1]; // Get the array for this specific attribute
          // Store the encoded position at the end of the attribute's element list
          attributeElementsCache[attributeElementsCache.length] = encodeCoordinates(colIterator, rowIterator);
        } else if (charValue === 'S') {
          startPosition = encodeCoordinates(colIterator, rowIterator); // Record the start position
        } else { // Must be 'G'
          targetPosition = encodeCoordinates(colIterator, rowIterator); // Record the goal position
        }
      }
    }
    
    // Variables for the pathfinding algorithm (Dijkstra-like approach)
    var infinityValue = 1 << 30; // A large integer representing an unreachable distance
    var optimalAttributeIndex = -1; // Stores the 0-indexed attribute that yields the shortest path
    var currentPathDistance; // Distance calculated for the current path segment
    var minimumOverallDistance = infinityValue; // The shortest path distance found across all attribute sequences
    // A 2D array to store minimum distances: distanceMatrix[attribute_id][element_index]
    var distanceMatrix; 
    var loopIndexA; // Generic loop counter
    var loopIndexB; // Another generic loop counter
    var pathSegmentIndex; // Counter for the number of attribute transitions (e.g., S->A, A->B, B->C, C->D, D->G)
    var attributeCount; // Number of elements for a specific attribute
    var currentAttributeDistances; // Cache for distanceMatrix[currentAttributeId]
    var currentElementDistance; // Cache for distanceMatrix[currentAttributeId][loopIndexA]
    var nextAttributeDistances; // Cache for distanceMatrix[nextAttributeId]
    var currentAttributeElements; // Cache for elementLocations[currentAttributeId]
    var currentElementLocation; // Cache for elementLocations[currentAttributeId][loopIndexA]
    var nextAttributeElements; // Cache for elementLocations[nextAttributeId]
    var currentAttributeId; // The ID of the attribute currently being processed (0-4)
    var currentAttributeElementCount; // Number of elements for the current attribute
    var nextAttributeId; // The ID of the next attribute in the sequence
    var nextAttributeElementCount; // Number of elements for the next attribute
    
    // Iterate through each possible starting attribute (0 to 4) for the path S -> (initialAttributeChoice+1)%5 -> ... -> G
    for (var initialAttributeChoice = 0; initialAttributeChoice < 5; initialAttributeChoice++) {
      // Initialize the distance matrix for the current starting attribute sequence
      distanceMatrix = [[], [], [], [], []]; 
      
      // Fill the distance matrix with infinity values
      for (loopIndexA = 5; loopIndexA--;) { // Loop through attributes (0-4) in reverse
        attributeCount = elementLocations[loopIndexA].length;
        currentAttributeDistances = distanceMatrix[loopIndexA];
        currentAttributeDistances.length = attributeCount; // Pre-allocate array size for efficiency
        while (attributeCount--) { // Loop through elements within the current attribute in reverse
          currentAttributeDistances[attributeCount] = infinityValue;
        }
      }
      
      // Determine the first attribute in the sequence based on the initial choice
      currentAttributeId = (initialAttributeChoice + 1) % 5;
      currentAttributeElementCount = elementLocations[currentAttributeId].length;
      currentAttributeDistances = distanceMatrix[currentAttributeId];
      currentAttributeElements = elementLocations[currentAttributeId];
      
      // Calculate initial distances from the start position 'S' to all elements of the first attribute
      for (loopIndexA = 0; loopIndexA < currentAttributeElementCount; loopIndexA++) {
        currentAttributeDistances[loopIndexA] = calculateManhattanDistance(startPosition, currentAttributeElements[loopIndexA]);
      }
      
      // Process the intermediate path segments (e.g., A->B, B->C, C->D)
      // There are 3 such transitions in a path like S -> A -> B -> C -> D -> G
      for (pathSegmentIndex = 0; pathSegmentIndex < 3; pathSegmentIndex++) {
        // Determine the next attribute in the sequence
        nextAttributeId = (currentAttributeId + 1) % 5;
        nextAttributeDistances = distanceMatrix[nextAttributeId];
        nextAttributeElements = elementLocations[nextAttributeId];
        nextAttributeElementCount = nextAttributeElements.length;
        
        // Iterate through elements of the current attribute
        for (loopIndexA = 0; loopIndexA < currentAttributeElementCount; loopIndexA++) {
          currentElementDistance = currentAttributeDistances[loopIndexA];
          currentElementLocation = currentAttributeElements[loopIndexA];
          
          // Optimization: If the current path segment's distance already exceeds the overall minimum,
          // there's no need to extend this path further.
          if (currentElementDistance >= minimumOverallDistance) {
            continue;
          }
          
          // Calculate distances from the current element to all elements of the next attribute
          for (loopIndexB = 0; loopIndexB < nextAttributeElementCount; loopIndexB++) {
            nextAttributeDistances[loopIndexB] = findMinimum(
              nextAttributeDistances[loopIndexB], 
              currentElementDistance + calculateManhattanDistance(currentElementLocation, nextAttributeElements[loopIndexB])
            );
          }
        }
        
        // Advance to the next attribute for the subsequent iteration
        currentAttributeId = nextAttributeId;
        currentAttributeDistances = nextAttributeDistances;
        currentAttributeElements = nextAttributeElements;
        currentAttributeElementCount = nextAttributeElementCount;
      }
      
      // After processing all intermediate segments, calculate the final distance to the goal 'G'
      for (loopIndexA = 0; loopIndexA < nextAttributeElementCount; loopIndexA++) {
        currentPathDistance = nextAttributeDistances[loopIndexA] + calculateManhattanDistance(currentAttributeElements[loopIndexA], targetPosition);
        
        // Update the overall minimum distance if a shorter path is found
        if (currentPathDistance < minimumOverallDistance) {
          minimumOverallDistance = currentPathDistance;
          optimalAttributeIndex = initialAttributeChoice;
        }
      }
    }
    
    // Output the final result for the current grid
    if (minimumOverallDistance === infinityValue) {
      console.log("NA"); // No path found to the goal
    } else {
      // Output the 1-based index of the optimal starting attribute and the minimum distance
      console.log((optimalAttributeIndex + 1) + " " + minimumOverallDistance);
    }
    
    currentLineIndex++; // Move to the next line to prepare for the next grid or termination check
  }
}

/**
 * Computes the Manhattan (L1) distance between two encoded grid positions.
 * @param {number} fromPos - The encoded starting position.
 * @param {number} toPos - The encoded target position.
 * @returns {number} The Manhattan distance between the two points.
 */
function calculateManhattanDistance(fromPos, toPos) {
  // Extract x-coordinates (higher bits, shifted right by 11)
  var fromX = fromPos >> 11;
  var toX = toPos >> 11;
  
  // Extract y-coordinates (lower 11 bits, masked with 2047 which is 2^11 - 1)
  var fromY = fromPos & 2047;
  var toY = toPos & 2047;
  
  return absoluteValue(fromX - toX) + absoluteValue(fromY - toY);
}

/**
 * Returns the smaller of two numbers using a bitwise trick for potential performance.
 * @param {number} valA - The first number.
 * @param {number} valB - The second number.
 * @returns {number} The minimum of valA and valB.
 */
function findMinimum(valA, valB) {
  // This is a bitwise equivalent of Math.min(valA, valB)
  return valB + ((valA - valB) & ((valA - valB) >> 31));
}

/**
 * Encodes 2D grid coordinates (x, y) into a single integer.
 * The y-coordinate occupies the lower 11 bits, and the x-coordinate occupies higher bits.
 * This assumes y-coordinates are within [0, 2047].
 * @param {number} xCoord - The x-coordinate.
 * @param {number} yCoord - The y-coordinate.
 * @returns {number} The encoded position.
 */
function encodeCoordinates(xCoord, yCoord) {
  // Shift x-coordinate left by 11 bits and add y-coordinate
  return (xCoord << 11) + yCoord;
}

/**
 * Calculates the absolute value of a number using bitwise operations.
 * @param {number} numVal - The input number.
 * @returns {number} The absolute value of numVal.
 */
function absoluteValue(numVal) {
  // This is a bitwise equivalent of Math.abs(numVal)
  var mask = numVal >> 31; // Creates a mask of all 0s for positive, all 1s for negative
  return (numVal ^ mask) - mask;
}
