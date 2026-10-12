function ProcessInput(rawData) {
  // Trim leading/trailing whitespace and split the input into lines.
  const processedLines = rawData.trim().split("\n");

  // Parse the total length K and number of points N from the first line.
  const totalLength = parseInt(processedLines[0].split(" ")[0], 10);
  const numPoints = parseInt(processedLines[0].split(" ")[1], 10);

  // Convert the second line into an array of numeric point coordinates.
  const pointCoordinates = processedLines[1].split(" ").map(val => val * 1);

  // Initialize a variable to store the largest gap found.
  let largestGap = 0;

  // This array is declared but not used in the original logic.
  const unusedArray = [];

  // Iterate through the points to find the maximum distance between consecutive points.
  for (let idx = 0; idx < numPoints; idx++) {
    // If it's the last point, calculate the distance from the last point to the first point,
    // considering the circular nature (K - A[i] + A[0]).
    if (idx + 1 === numPoints) {
      largestGap = Math.max(largestGap, (totalLength - pointCoordinates[idx]) + pointCoordinates[0]);
    } else {
      // For other points, calculate the distance to the next point.
      largestGap = Math.max(largestGap, pointCoordinates[idx + 1] - pointCoordinates[idx]);
    }
  }

  // The result is the total length minus the largest gap.
  console.log(totalLength - largestGap);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
