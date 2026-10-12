function processInput(rawData) {
  "use strict"; // Enforce strict parsing and error handling in the code.

  // Split the entire input string into an array of individual lines.
  const inputLines = rawData.split("\n");

  // Process the very first line to extract key parameters.
  // It's expected to contain two space-separated numeric values.
  const initialParams = inputLines[0].split(" ").map((itemVal) => +itemVal);

  // The first parameter represents the circumference of the circle.
  const circumference = initialParams[0];

  // The second parameter, numPoints, is not directly used in the algorithm's core logic,
  // but it indicates the count of points that follow.
  const numPoints = initialParams[1];

  // Extract and parse the remaining lines, filtering out any empty strings,
  // and converting them into an array of numbers representing point locations.
  let pointLocations = inputLines
    .slice(1)
    .filter((itemVal) => itemVal)
    .map((itemVal) => +itemVal);

  // This array will store the total travel costs for all possible paths.
  let totalCosts = [];

  /**
   * Recursively explores all possible paths to visit all points,
   * calculating the accumulated cost for each path.
   *
   * @param {number} currentPos - The current position on the circle.
   * @param {number[]} remainingPoints - An array of points yet to be visited.
   * @param {number} accumulatedCost - The total cost accumulated so far for the current path.
   */
  const explorePaths = (currentPos, remainingPoints, accumulatedCost) => {
    // Base case: If there are no points left to visit,
    // the current path is complete. Record its total cost.
    if (remainingPoints.length === 0) {
      totalCosts.push(accumulatedCost);
      return;
    }

    // Calculate the distance to the leftmost remaining point.
    // Accounts for wrapping around the circle (circumference).
    const distToLeft =
      remainingPoints[0] >= currentPos
        ? remainingPoints[0] - currentPos
        : circumference - currentPos + remainingPoints[0];

    // Calculate the distance to the rightmost remaining point.
    // Accounts for wrapping around the circle (circumference).
    const distToRight =
      remainingPoints[remainingPoints.length - 1] <= currentPos
        ? currentPos - remainingPoints[remainingPoints.length - 1]
        : currentPos + (circumference - remainingPoints[remainingPoints.length - 1]);

    // Create a copy of the remaining points for the 'left' path.
    const leftPathPoints = remainingPoints.concat();
    // Get and remove the leftmost point for this path.
    const leftmostPoint = leftPathPoints.shift();

    // Create another copy of the remaining points for the 'right' path.
    const rightPathPoints = remainingPoints.concat();
    // Get and remove the rightmost point for this path.
    const rightmostPoint = rightPathPoints.pop();

    // Recursively explore the path by moving to the leftmost point.
    explorePaths(leftmostPoint, leftPathPoints, accumulatedCost + distToLeft);

    // Recursively explore the path by moving to the rightmost point.
    explorePaths(rightmostPoint, rightPathPoints, accumulatedCost + distToRight);
  };

  // Initiate the path exploration from position 0 with all points and an initial cost of 0.
  explorePaths(0, pointLocations, 0);

  // Output the maximum accumulated cost found among all possible paths.
  console.log(Math.max.apply(null, totalCosts));
}

// Read input from standard input and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
