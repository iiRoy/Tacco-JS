const fs = require('fs');

const createLineReader = (inputContent) => {
  const lines = inputContent.split('\n');
  let currentLinePointer = 0;

  return () => {
    if (currentLinePointer >= lines.length) {
      return null;
    }
    return lines[currentLinePointer++];
  };
};

const rawInputData = fs.readFileSync(0, 'utf8');
const retrieveNextLine = createLineReader(rawInputData);

initiateProcessing();

function initiateProcessing() {
  const MAXIMUM_POSSIBLE_DISTANCE = Infinity;

  let startCoordinates = null;
  let endCoordinates = null;
  const elementGroupings = Array.from({ length: 5 }, () => []); // elementGroupings[type-1] = [{x,y}, ...]

  let pathMemoization = new Map(); // Stores results of subproblems for recursive DP

  const generatePositionIdentifier = (positionObject) => `${positionObject.x},${positionObject.y}`;

  // Recursive function to determine the shortest path segment
  // from a given element to the final destination, traversing 'hopsRemaining' additional element types.
  const computeSegmentPath = (currentPositionObject, currentTypeIdentifier, hopsRemaining) => {
    // Check if result is already memoized
    let hopsCacheMap = pathMemoization.get(hopsRemaining);
    if (hopsCacheMap) {
      let typeCacheMap = hopsCacheMap.get(currentTypeIdentifier);
      if (typeCacheMap) {
        const positionKey = generatePositionIdentifier(currentPositionObject);
        if (typeCacheMap.has(positionKey)) {
          return typeCacheMap.get(positionKey);
        }
      }
    }

    // Base case: No more intermediate element types to visit, proceed directly to the end point
    if (hopsRemaining === 0) {
      return calculateManhattanDistance(currentPositionObject, endCoordinates);
    }

    // Recursive step: Identify the subsequent element type in the sequence (modulo 5)
    const nextTypeIdentifier = (currentTypeIdentifier + 1) % 5;
    let minimumPathFromCurrent = MAXIMUM_POSSIBLE_DISTANCE;

    // Iterate through all elements belonging to the next type
    for (const nextElementPositionObject of elementGroupings[nextTypeIdentifier]) {
      const distanceToNextElement = calculateManhattanDistance(currentPositionObject, nextElementPositionObject);
      const remainingPathLength = computeSegmentPath(nextElementPositionObject, nextTypeIdentifier, hopsRemaining - 1);

      // Only consider valid paths (i.e., not infinite)
      if (remainingPathLength !== MAXIMUM_POSSIBLE_DISTANCE) {
        minimumPathFromCurrent = Math.min(minimumPathFromCurrent, distanceToNextElement + remainingPathLength);
      }
    }

    // Store the computed result in the memoization cache
    if (!hopsCacheMap) {
      hopsCacheMap = new Map();
      pathMemoization.set(hopsRemaining, hopsCacheMap);
    }
    let typeCacheMap = hopsCacheMap.get(currentTypeIdentifier);
    if (!typeCacheMap) {
      typeCacheMap = new Map();
      hopsCacheMap.set(currentTypeIdentifier, typeCacheMap);
    }
    typeCacheMap.set(generatePositionIdentifier(currentPositionObject), minimumPathFromCurrent);

    return minimumPathFromCurrent;
  };

  // Loop to process multiple grid configurations from input
  while (true) {
    const dimensionLine = retrieveNextLine();
    const [gridXSizeStr, gridYSizeStr] = dimensionLine.split(' ');
    const gridXSize = parseInt(gridXSizeStr, 10);
    const gridYSize = parseInt(gridYSizeStr, 10);

    // Exit condition for the main processing loop
    if (gridXSize === 0 && gridYSize === 0) {
      break;
    }

    // Reset state for the new grid
    startCoordinates = null;
    endCoordinates = null;
    for (let i = 0; i < 5; i++) {
      elementGroupings[i].length = 0; // Clear elements from previous grid
    }

    // Parse the current grid layout
    for (let currentY = 0; currentY < gridYSize; currentY++) {
      const currentRowData = retrieveNextLine();
      for (let currentX = 0; currentX < gridXSize; currentX++) {
        const characterAtPosition = currentRowData[currentX];
        const currentPoint = { x: currentX, y: currentY };

        if (characterAtPosition === 'S') {
          startCoordinates = currentPoint;
        } else if (characterAtPosition === 'G') {
          endCoordinates = currentPoint;
        } else if (characterAtPosition >= '1' && characterAtPosition <= '5') {
          const typeIndex = parseInt(characterAtPosition, 10) - 1; // Convert '1'-'5' to 0-4 index
          elementGroupings[typeIndex].push(currentPoint);
        }
        // '.' characters are implicitly ignored
      }
    }

    let overallMinimumPath = MAXIMUM_POSSIBLE_DISTANCE;
    let bestStartingElementType = -1;

    // Iterate through each potential starting element type (0-4)
    for (let initialTypeIndex = 0; initialTypeIndex < 5; initialTypeIndex++) {
      // Reset memoization cache for each new starting type sequence
      pathMemoization = new Map();

      let currentMinimumForThisSequence = MAXIMUM_POSSIBLE_DISTANCE;

      // Evaluate paths starting with each element of the current initial type
      for (const firstElementPosition of elementGroupings[initialTypeIndex]) {
        const distanceToFirst = calculateManhattanDistance(startCoordinates, firstElementPosition);
        // Calculate the remaining path from this first element, requiring 2 more intermediate element types
        const remainingPathSegment = computeSegmentPath(firstElementPosition, initialTypeIndex, 2);

        if (remainingPathSegment !== MAXIMUM_POSSIBLE_DISTANCE) {
          currentMinimumForThisSequence = Math.min(currentMinimumForThisSequence, distanceToFirst + remainingPathSegment);
        }
      }

      // Update the global minimum if a shorter path is discovered
      if (currentMinimumForThisSequence < overallMinimumPath) {
        overallMinimumPath = currentMinimumForThisSequence;
        bestStartingElementType = initialTypeIndex;
      }
    }

    // Output the final result for the current grid
    if (overallMinimumPath === MAXIMUM_POSSIBLE_DISTANCE) {
      console.log("NA");
    } else {
      console.log((bestStartingElementType + 1) + " " + overallMinimumPath);
    }
  }
}

// Calculates Manhattan distance between two point objects {x, y}
function calculateManhattanDistance(pointOne, pointTwo) {
  return Math.abs(pointOne.x - pointTwo.x) + Math.abs(pointOne.y - pointTwo.y);
}
