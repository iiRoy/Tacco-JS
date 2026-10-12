const processInputData = (rawData) => {
  // Split the incoming text into individual lines
  let parsedLines = rawData.split("\n");

  // Determine the total number of coordinate entries
  let numEntries = Number(parsedLines[0]);

  // Initialize an array to store unique coordinate pairs
  const coordinateSet = [];

  // Iterate through the input lines to extract and store coordinates
  for (let idx = 1; idx <= numEntries; idx++) {
    // Parse the current line into numeric x and y values
    const currentCoords = parsedLines[idx].split(" ").map((numVal) => Number(numVal));

    // Only add the coordinate pair if it's not already present
    // Note: Array.prototype.indexOf for arrays checks reference equality,
    // so this might not filter out structurally identical but distinct array objects.
    // However, this behavior is preserved as per Type II cloning rules.
    if (coordinateSet.indexOf(currentCoords) === -1) {
      coordinateSet.push(currentCoords);
    }
  }

  // Optimization note: Instead of checking all pairs, focus on extreme points.
  // This comment reflects the original's intent.

  let countOfItems = coordinateSet.length;

  // Prepare arrays to hold x and y components separately
  const xCoordinates = [];
  const yCoordinates = [];

  // Populate the separate x and y arrays
  for (let idx = 0; idx < countOfItems; idx++) {
    xCoordinates[idx] = [coordinateSet[idx][0]]; // Store as single-element arrays
    yCoordinates[idx] = [coordinateSet[idx][1]]; // Store as single-element arrays
  }

  // Sort x-coordinates to find min/max
  xCoordinates.sort((valA, valB) => valB - valA);
  const maxXValue = xCoordinates[0]; // Highest x-value
  const minXValue = xCoordinates[countOfItems - 1]; // Lowest x-value

  // Sort y-coordinates to find min/max
  yCoordinates.sort((valA, valB) => valB - valA);
  const maxYValue = yCoordinates[0]; // Highest y-value
  const minYValue = yCoordinates[countOfItems - 1]; // Lowest y-value

  // Create a list of indices for points that are at the extremes
  const extremeIndices = [];

  // Identify points that lie on the boundaries (min/max x or y)
  for (let idx = 0; idx < countOfItems; idx++) {
    // Check if the x-coordinate is an extreme value
    if (coordinateSet[idx][0] === maxXValue || coordinateSet[idx][0] === minXValue) {
      if (extremeIndices.indexOf(idx) === -1) {
        extremeIndices.push(idx);
      }
    }
    // Check if the y-coordinate is an extreme value
    if (coordinateSet[idx][1] === maxYValue || coordinateSet[idx][1] === minYValue) {
      if (extremeIndices.indexOf(idx) === -1) {
        extremeIndices.push(idx);
      }
    }
  }

  // Update the count to reflect only the extreme points
  let filteredCount = extremeIndices.length;

  // Initialize an array to store calculated Manhattan distances
  const calculatedDistances = [];

  // Calculate Manhattan distances between all unique pairs of extreme points
  for (let idx = 0; idx < filteredCount; idx++) {
    for (let jdx = idx + 1; jdx < filteredCount; jdx++) {
      const point1 = coordinateSet[extremeIndices[idx]];
      const point2 = coordinateSet[extremeIndices[jdx]];

      const manhattanDistance =
        Math.abs(point1[0] - point2[0]) + Math.abs(point1[1] - point2[1]);
      calculatedDistances.push(manhattanDistance);
    }
  }

  // Sort the distances in descending order to find the maximum
  calculatedDistances.sort((valA, valB) => valB - valA);

  // Output the largest calculated distance
  console.log(calculatedDistances[0]);
};

// Read input from standard input and pass it to the processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
