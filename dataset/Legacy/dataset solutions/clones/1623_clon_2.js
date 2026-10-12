function processInput(rawData) {
  // Parse the input string to extract N, D, and the list of points.
  // The first line contains N (number of points, though not explicitly used after destructuring) and D (maximum distance).
  // Subsequent lines contain the coordinates of each point.
  const [[numPoints, maxDistance], ...pointCoordinates] = rawData
    .split('\n') // Split the input into individual lines
    .map(lineText => lineText.split(' ').map(Number)); // For each line, split by space and convert to numbers

  // Initialize a counter for points that satisfy the distance condition.
  let validPointsCount = 0;

  // Iterate over each point in the list of coordinates.
  pointCoordinates.forEach(currentPoint => {
    // Destructure the current point's coordinates into x and y.
    const [coordX, coordY] = currentPoint;

    // Calculate the Euclidean distance from the origin (0,0) to the current point.
    // If this distance is less than or equal to the maximum allowed distance (maxDistance),
    // increment the counter for valid points.
    if (Math.sqrt(coordX * coordX + coordY * coordY) <= maxDistance) {
      validPointsCount++;
    }
  });

  // Output the final count of points that are within the specified distance.
  console.log(validPointsCount);
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
