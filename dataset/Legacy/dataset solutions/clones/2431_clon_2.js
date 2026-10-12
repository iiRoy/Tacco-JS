// This function is designed to process a given string of raw input data.
function ProcessInput(rawData) {
  // The initial raw input string is split into an array of individual lines.
  // Each element in 'linesArray' will correspond to one line from the input.
  let linesArray = rawData.split('\n');

  // The first line of the input typically specifies the total number of data points
  // or entries that follow. This value is parsed as an integer.
  const dataCount = parseInt(linesArray[0], 10);

  // Declare several variables that will be used throughout the calculation.
  // These include loop counters, temporary storage for point coordinates,
  // and the calculated distance between two points.
  let idxA, idxB;
  let pointCoordsA, coordXA, coordYA;
  let pointCoordsB, coordXB, coordYB;
  let distanceVal;

  // Initialize a variable to accumulate the sum of all pairwise distances.
  // Using a floating-point zero to ensure subsequent additions maintain precision.
  let totalDistanceSum = 0.0;

  // Outer loop: Iterates through each data point, starting from the first actual data entry
  // (which is at index 1 in the 'linesArray', as index 0 holds the 'dataCount').
  // This loop selects the first point for a pair (Point A).
  for (idxA = 1; idxA <= dataCount; idxA++) {
    // Extract the coordinates for Point A from the current line.
    // The coordinates are expected to be space-separated.
    pointCoordsA = linesArray[idxA].split(' ');
    // Convert the string coordinate values to floating-point numbers for calculations.
    coordXA = parseFloat(pointCoordsA[0]);
    coordYA = parseFloat(pointCoordsA[1]);

    // Inner loop: Iterates through the remaining data points, starting from the one
    // immediately after Point A. This loop selects the second point for a pair (Point B).
    // This approach ensures each pair is considered only once (e.g., A-B, not B-A)
    // and avoids comparing a point with itself.
    for (idxB = idxA + 1; idxB <= dataCount; idxB++) {
      // Extract the coordinates for Point B from its respective line.
      pointCoordsB = linesArray[idxB].split(' ');
      // Convert the string coordinate values to floating-point numbers.
      coordXB = parseFloat(pointCoordsB[0]);
      coordYB = parseFloat(pointCoordsB[1]);

      // Calculate the Euclidean distance between Point A and Point B.
      // The formula is: sqrt((x_A - x_B)^2 + (y_A - y_B)^2).
      distanceVal = Math.sqrt(
        (coordXA - coordXB) * (coordXA - coordXB) +
        (coordYA - coordYB) * (coordYA - coordYB)
      );

      // Add the newly calculated distance to the running total sum.
      totalDistanceSum += distanceVal;
    }
  }

  // After all pairwise distances have been summed, perform the final calculation
  // as specified by the problem: multiply the total sum by 2 and then divide by the data count.
  console.log(totalDistanceSum * 2 / dataCount);
}

// This standard boilerplate code reads the entire content of standard input
// and passes it to the 'ProcessInput' function. It should remain unchanged.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
