((inputData) => {
  // Helper function to convert a string line into an array of integers.
  // This ensures explicit parsing and handles potential non-numeric values gracefully.
  const convertLineToNumbers = (lineContent) => {
    // Split the line by spaces and parse each part into an integer with base 10.
    // If parsing fails, it will result in NaN, which might need further handling
    // depending on strictness, but for competitive programming, input is usually clean.
    return lineContent.split(' ').map(strVal => parseInt(strVal, 10));
  };

  // Process the entire raw input string to extract structured data.
  const processRawInput = (rawStringPayload) => {
    // Remove leading/trailing whitespace and split into individual lines.
    const allInputLines = rawStringPayload.trim().split('\n');

    // Basic validation: ensure there's at least one line for N.
    if (allInputLines.length === 0) {
      console.error("Error: Empty input provided.");
      return { entitiesCount: 0, coordinateData: [] };
    }

    // The first line contains the number of point pairs (N).
    const entitiesCount = parseInt(allInputLines[0], 10);

    // Validate the parsed N.
    if (isNaN(entitiesCount) || entitiesCount <= 0) {
      console.error("Error: Invalid or non-positive number of entities (N) provided.");
      return { entitiesCount: 0, coordinateData: [] };
    }

    // Ensure enough lines are present for N red points and N blue points.
    // N lines for red, N lines for blue, plus 1 line for N itself.
    if (allInputLines.length < (2 * entitiesCount + 1)) {
      console.error(`Error: Expected ${2 * entitiesCount + 1} lines but received ${allInputLines.length}.`);
      return { entitiesCount: 0, coordinateData: [] };
    }

    // Map the remaining lines (after N) into arrays of numeric coordinates.
    // The slice starts from index 1 to skip the N value line.
    const coordinateData = allInputLines.slice(1).map(convertLineToNumbers);

    return { entitiesCount, coordinateData };
  };

  // Execute the input processing.
  const { entitiesCount: numPoints, coordinateData: allCoordinates } = processRawInput(inputData);

  // If initial processing failed or resulted in zero points, return 0.
  if (numPoints === 0) {
    return '0';
  }

  // Separate the red and blue points based on their order in the input.
  // The first N lines are red points, the next N lines are blue points.
  const potentialRedPoints = allCoordinates.slice(0, numPoints);
  const initialBluePoints = allCoordinates.slice(numPoints, 2 * numPoints);

  // Perform an additional check for the correct number of points after slicing.
  if (potentialRedPoints.length !== numPoints || initialBluePoints.length !== numPoints) {
    console.error("Error: Mismatch in expected and actual number of red/blue points.");
    return '0';
  }

  // Sort the blue points array by their X-coordinate in ascending order.
  // This optimization helps in finding suitable red points more efficiently.
  const sortedBluePoints = initialBluePoints.sort((pointOne, pointTwo) => pointOne[0] - pointTwo[0]);

  // Keep a mutable copy of red points as we will remove matched ones.
  let availableRedPoints = [...potentialRedPoints];

  // Initialize a counter for successfully formed pairs.
  let successfulPairCount = 0;

  // Iterate through each blue point to find a matching red point.
  // We use a for...of loop for cleaner iteration over the sorted blue points.
  for (const currentBluePoint of sortedBluePoints) {
    // Destructure the X and Y coordinates of the current blue point.
    const [currentBlueX, currentBlueY] = currentBluePoint;

    // A structure to keep track of the best suitable red point found for the current blue point.
    // It stores the index in `availableRedPoints` and its Y-coordinate.
    let bestRedCandidate = {
      indexInRedList: -1, // Initialize with an invalid index
      maxRedYCoordinate: -1 // Initialize with a value that any valid Y-coordinate will exceed
    };

    // Guard clause: If there are no red points left, no more matches can be made.
    if (availableRedPoints.length === 0) {
      break;
    }

    // Iterate through the currently available red points.
    // We use a traditional for loop to easily access and manipulate indices for splicing.
    for (let redPointIterator = 0; redPointIterator < availableRedPoints.length; redPointIterator++) {
      const [candidateRedX, candidateRedY] = availableRedPoints[redPointIterator];

      // Condition 1: The red point's X-coordinate must be less than the blue point's X-coordinate.
      // If not, this red point (and any red points with larger X, due to sorting not applied to red points)
      // cannot be a match for the current blue point on the X-axis.
      if (candidateRedX >= currentBlueX) {
        continue; // Skip this red point, it's too far right or aligned with the blue point.
      }

      // Condition 2: The red point's Y-coordinate must be less than the blue point's Y-coordinate.
      // Additionally, among all valid red points, we want the one with the largest Y-coordinate.
      if (candidateRedY < currentBlueY && candidateRedY > bestRedCandidate.maxRedYCoordinate) {
        // This red point is a better candidate than any previously found for this blue point.
        bestRedCandidate = {
          indexInRedList: redPointIterator,
          maxRedYCoordinate: candidateRedY
        };
      }
    }

    // Check if a suitable red point was found for the current blue point.
    if (bestRedCandidate.indexInRedList !== -1) {
      // Remove the matched red point from the available list to prevent reuse.
      availableRedPoints.splice(bestRedCandidate.indexInRedList, 1);
      // Increment the count of successful pairs.
      successfulPairCount++;
    }
  }

  // Return the final count of formed pairs as a string.
  return `${successfulPairCount}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8'));