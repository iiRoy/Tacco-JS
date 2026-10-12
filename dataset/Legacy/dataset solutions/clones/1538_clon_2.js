const processInputData = (rawData) => {
  // Split the entire input string into individual lines
  let lineSegments = rawData.split("\n");

  // Parse the first line to get the total count of coordinate pairs
  var numPoints = Number(lineSegments[0]);

  // Initialize an array to store the parsed coordinate data
  let coordinateList = [];

  // Loop through the input lines to populate the coordinate list
  for (var idxA = 1; idxA <= numPoints; idxA++) {
    // For each line, split by space and convert string parts to numbers
    coordinateList[idxA] = lineSegments[idxA].split(" ").map(strVal => Number(strVal));
  }

  // This section calculates the maximum Manhattan distance between any two points.
  // The total number of unique pairs is N * (N - 1) / 2.
  let maxDistanceFound = 0;

  // Iterate through all possible unique pairs of points
  for (var idxA = 1; idxA <= numPoints; idxA++) {
    for (var idxB = idxA + 1; idxB <= numPoints; idxB++) {
      // Calculate the Manhattan distance (L1 distance) between point A and point B
      let currentDistance = Math.abs(coordinateList[idxA][0] - coordinateList[idxB][0]) + Math.abs(coordinateList[idxA][1] - coordinateList[idxB][1]);

      // Update the maximum distance if the current pair's distance is greater
      if (currentDistance > maxDistanceFound) {
        maxDistanceFound = currentDistance;
      }
    }
  }
  // Output the largest distance found to the console
  console.log(maxDistanceFound);
};

// Read input from standard input and pass it to the main processing function
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
