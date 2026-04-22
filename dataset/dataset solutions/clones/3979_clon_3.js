const parseCoordinatePair = (lineString) => {
  // Input validation: ensure the line is not empty or just whitespace
  if (!lineString || lineString.trim() === '') {
    // In a competitive programming context, invalid input might lead to errors
    // or specific default behavior. For this problem, returning [0, 0] or
    // throwing an error are options. Defaulting to [0,0] for robustness.
    return [0, 0];
  }
  // Split the string by space and convert each part to an integer with base 10.
  // Using parseInt for explicit type conversion.
  return lineString.split(' ').map(coordStr => parseInt(coordStr, 10));
};

const comparePointsByXCoordinateDescending = (firstPoint, secondPoint) => {
  // Access the X-coordinate (first element) of each point pair
  const xCoordOne = firstPoint[0];
  const xCoordTwo = secondPoint[0];
  // Sort in descending order based on X-coordinate
  return xCoordTwo - xCoordOne;
};

// The main problem-solving logic is encapsulated within this function.
// This design improves modularity and testability.
const determineMaxPairings = (rawInputContent) => {
  // Preliminary check for empty or invalid input data
  if (!rawInputContent || rawInputContent.trim() === '') {
    return '0'; // If no input, no pairings possible
  }

  // Split the entire input string into individual lines
  const allInputLines = rawInputContent.trim().split('\n');

  // Extract the total number of point pairs (N) from the very first line
  const totalNumberOfPoints = parseInt(allInputLines[0].trim(), 10);

  // Validate the extracted count. It must be a positive integer.
  if (isNaN(totalNumberOfPoints) || totalNumberOfPoints <= 0) {
    return '0'; // Invalid N means no valid pairings
  }

  // Initialize arrays to store the red and blue points
  const availableRedPoints = [];
  const availableBluePoints = [];

  // Populate the collection of red points
  // Red points occupy lines from index 1 to totalNumberOfPoints
  for (let lineIndexForRed = 1; lineIndexForRed <= totalNumberOfPoints; lineIndexForRed++) {
    const redCoordinatePair = parseCoordinatePair(allInputLines[lineIndexForRed]);
    // Add point only if parsing was successful and it's a valid pair
    if (redCoordinatePair.length === 2 && !isNaN(redCoordinatePair[0]) && !isNaN(redCoordinatePair[1])) {
      availableRedPoints.push(redCoordinatePair);
    }
  }

  // Populate the collection of blue points
  // Blue points occupy lines from totalNumberOfPoints + 1 to 2 * totalNumberOfPoints
  for (let lineIndexForBlue = totalNumberOfPoints + 1; lineIndexForBlue <= 2 * totalNumberOfPoints; lineIndexForBlue++) {
    const blueCoordinatePair = parseCoordinatePair(allInputLines[lineIndexForBlue]);
    // Add point only if parsing was successful and it's a valid pair
    if (blueCoordinatePair.length === 2 && !isNaN(blueCoordinatePair[0]) && !isNaN(blueCoordinatePair[1])) {
      availableBluePoints.push(blueCoordinatePair);
    }
  }

  // Sort both collections of points. The sorting criterion is descending X-coordinate.
  // This strategy helps in quickly finding suitable red points later.
  availableRedPoints.sort(comparePointsByXCoordinateDescending);
  availableBluePoints.sort(comparePointsByXCoordinateDescending);

  let successfulMatchesCount = 0; // Counter for the number of successful pairings

  // Iterate through each blue point to find an optimal red point match.
  // A traditional `for` loop is used here because `availableRedPoints` will be modified
  // by splicing, which affects its length and indices.
  for (let currentBluePointIdx = 0; currentBluePointIdx < availableBluePoints.length; currentBluePointIdx++) {
    const [currentBlueXCoord, currentBlueYCoord] = availableBluePoints[currentBluePointIdx];

    // Object to track the best possible red point match for the current blue point.
    // Using an object enhances readability compared to a generic array.
    let optimalRedMatch = {
      indexInRedCollection: -1, // Stores the array index of the best red point
      yCoordinateValue: -1      // Stores the Y-coordinate of the best red point found
    };

    // Iterate through the currently available red points.
    for (let redPointSearchIdx = 0; redPointSearchIdx < availableRedPoints.length; redPointSearchIdx++) {
      const [currentRedXCoord, currentRedYCoord] = availableRedPoints[redPointSearchIdx];

      // Condition 1: The red point's X-coordinate must be strictly less than the blue point's X-coordinate.
      // Since both arrays are sorted by X-descending, if currentBlueXCoord <= currentRedXCoord,
      // it means all subsequent red points (which have smaller or equal X-coords) will also
      // fail this condition (or be equal), so we can terminate this inner loop early.
      if (currentBlueXCoord <= currentRedXCoord) {
        continue; // The original code uses continue here. Let's maintain that behavior for closer structural resemblance.
                  // An alternative (and potentially more efficient for large N) would be to `break;`
                  // if `currentRedXCoord` is already too small (i.e., `currentRedXCoord < currentBlueXCoord` is false).
                  // However, the original code's logic is `if (bx < rx) continue;`, meaning `rx` is too large.
                  // Since `rp` is sorted descending by `x`, if the current `rx` is too large,
                  // all subsequent `rx` values will be even larger (or equal), so they will also be too large.
                  // This means we can `break;` here. Let's change it to `break;` for a Type III structural update.
        // Re-evaluating: The original `if (bx < rx) continue;` means we skip red points whose X is too high.
        // Because `rp` is sorted DESC by X, once we hit an `rx` that is too high (i.e., `rx >= bx`),
        // all *subsequent* `rx` values in the array will also be too high (or equal).
        // Therefore, we can indeed `break` the inner loop for efficiency.
        if (currentRedXCoord >= currentBlueXCoord) { // Condition: red x must be smaller than blue x
            break; // All remaining red points will also have X >= currentBlueXCoord, so no valid matches further
        }
      }

      // Condition 2: The red point's Y-coordinate must be strictly less than the blue point's Y-coordinate.
      // Condition 3: Among all valid red points, we select the one with the maximum Y-coordinate.
      if (currentBlueYCoord > currentRedYCoord && currentRedYCoord > optimalRedMatch.yCoordinateValue) {
        optimalRedMatch.indexInRedCollection = redPointSearchIdx;
        optimalRedMatch.yCoordinateValue = currentRedYCoord;
      }
    }

    // If a suitable red point was identified for the current blue point
    if (optimalRedMatch.indexInRedCollection !== -1) {
      // Remove the matched red point from the available collection to ensure it's not reused.
      // This is a destructive operation on the array, which is why the outer loop uses a traditional `for`.
      availableRedPoints.splice(optimalRedMatch.indexInRedCollection, 1);
      successfulMatchesCount++; // Increment the total count of successful pairings
    }
  }

  // Convert the final count to a string before returning, as per typical output requirements.
  return String(successfulMatchesCount);
};

// Standard input reading and output writing for Node.js environment.
// Reads the entire content of '/dev/stdin' as UTF-8.
const fileSystem = require('fs');
const inputBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Call the main solver function with the read input and print its result to standard output.
process.stdout.write(determineMaxPairings(inputBuffer));