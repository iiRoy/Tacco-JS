function ProcessCoordinates(rawData) {
  // Variable to store the final computed area
  let finalArea;

  // Parse the total number of data points from the raw input array
  const pointCount = Number.parseInt(rawData.shift());

  // The remaining array elements contain coordinate and direction data
  const coordinateData = rawData;

  // Initialize boundary variables for different movement directions
  // Using MAX_SAFE_INTEGER for minimums and MIN_SAFE_INTEGER for maximums
  // ensures any actual coordinate will be smaller/larger respectively.

  // Boundaries for points moving 'L' (Left)
  let leftBoundaryMinX = Number.MAX_SAFE_INTEGER; // Smallest X-coordinate among 'L' points
  let leftBoundaryMaxX = Number.MIN_SAFE_INTEGER; // Largest X-coordinate among 'L' points

  // Shared Y-boundaries for points moving 'L' or 'R' (Left or Right)
  let horizontalMinY = Number.MAX_SAFE_INTEGER; // Smallest Y-coordinate among 'L'/'R' points
  let horizontalMaxY = Number.MIN_SAFE_INTEGER; // Largest Y-coordinate among 'L'/'R' points

  // Boundaries for points moving 'R' (Right)
  let rightBoundaryMinX = Number.MAX_SAFE_INTEGER; // Smallest X-coordinate among 'R' points
  let rightBoundaryMaxX = Number.MIN_SAFE_INTEGER; // Largest X-coordinate among 'R' points

  // Shared X-boundaries for points moving 'U' or 'D' (Up or Down)
  let verticalMinX = Number.MAX_SAFE_INTEGER; // Smallest X-coordinate among 'U'/'D' points
  let verticalMaxX = Number.MIN_SAFE_INTEGER; // Largest X-coordinate among 'U'/'D' points

  // Boundaries for points moving 'U' (Up)
  let upBoundaryMinY = Number.MAX_SAFE_INTEGER; // Smallest Y-coordinate among 'U' points
  let upBoundaryMaxY = Number.MIN_SAFE_INTEGER; // Largest Y-coordinate among 'U' points

  // Boundaries for points moving 'D' (Down)
  let downBoundaryMinY = Number.MAX_SAFE_INTEGER; // Smallest Y-coordinate among 'D' points
  let downBoundaryMaxY = Number.MIN_SAFE_INTEGER; // Largest Y-coordinate among 'D' points;

  // Flags to indicate if points for a particular direction were found
  let foundLeftDirection = false;
  let foundRightDirection = false;
  let foundUpDirection = false;
  let foundDownDirection = false;

  // Iterate through all the provided coordinate data
  for (let currentIdx = 0; currentIdx < pointCount; currentIdx++) {
    // Extract X, Y coordinates and the movement direction for the current point
    let pointX = Number.parseInt(rawData[currentIdx * 3]);
    let pointY = Number.parseInt(rawData[currentIdx * 3 + 1]);
    let movementDirection = rawData[currentIdx * 3 + 2];

    // Process each point based on its movement direction
    switch (movementDirection) {
      case "L": // Point moves Left
        leftBoundaryMinX = Math.min(leftBoundaryMinX, pointX);
        leftBoundaryMaxX = Math.max(leftBoundaryMaxX, pointX);
        horizontalMinY = Math.min(horizontalMinY, pointY);
        horizontalMaxY = Math.max(horizontalMaxY, pointY);
        foundLeftDirection = true;
        break;
      case "R": // Point moves Right
        rightBoundaryMinX = Math.min(rightBoundaryMinX, pointX);
        rightBoundaryMaxX = Math.max(rightBoundaryMaxX, pointX);
        horizontalMinY = Math.min(horizontalMinY, pointY);
        horizontalMaxY = Math.max(horizontalMaxY, pointY);
        foundRightDirection = true;
        break;
      case "U": // Point moves Up
        verticalMinX = Math.min(verticalMinX, pointX);
        verticalMaxX = Math.max(verticalMaxX, pointX);
        upBoundaryMinY = Math.min(upBoundaryMinY, pointY);
        upBoundaryMaxY = Math.max(upBoundaryMaxY, pointY);
        foundUpDirection = true;
        break;
      case "D": // Point moves Down
        verticalMinX = Math.min(verticalMinX, pointX);
        verticalMaxX = Math.max(verticalMaxX, pointX);
        downBoundaryMinY = Math.min(downBoundaryMinY, pointY);
        downBoundaryMaxY = Math.max(downBoundaryMaxY, pointY);
        foundDownDirection = true;
        break;
      default:
        // No specific action for other directions
        break;
    }
  }

  // Initialize the minimum calculated area to a very large number
  let minCalculatedArea = Number.MAX_SAFE_INTEGER;

  // Flag to control the simulation loop
  let continueSimulation = true;

  // Simulate movement and calculate bounding box area until stability
  while (continueSimulation) {
    // Determine the overall minimum and maximum X and Y coordinates
    // considering all active directional boundaries
    let currentGlobalMinX = Math.min(rightBoundaryMinX, leftBoundaryMinX, verticalMinX);
    let currentGlobalMaxX = Math.max(rightBoundaryMaxX, leftBoundaryMaxX, verticalMaxX);
    let currentGlobalMinY = Math.min(horizontalMinY, upBoundaryMinY, downBoundaryMinY);
    let currentGlobalMaxY = Math.max(horizontalMaxY, upBoundaryMaxY, downBoundaryMaxY);

    // Update the minimum calculated area if the current bounding box is smaller
    minCalculatedArea = Math.min(
      minCalculatedArea,
      (currentGlobalMaxX - currentGlobalMinX) * (currentGlobalMaxY - currentGlobalMinY)
    );

    // Check conditions to determine if the simulation should stop
    // The simulation stops when the overall bounding box has stabilized,
    // meaning its boundaries are determined by points that will move "outward"
    // relative to the current overall min/max, or if no points for that direction exist.
    continueSimulation = !(
      (currentGlobalMinX === leftBoundaryMinX || !foundLeftDirection) &&
      (currentGlobalMaxX === rightBoundaryMaxX || !foundRightDirection) &&
      (currentGlobalMinY === downBoundaryMinY || !foundDownDirection) &&
      (currentGlobalMaxY === upBoundaryMaxY || !foundUpDirection)
    );

    // Adjust boundaries for the next simulation step
    // 'L' points move left (X decreases)
    leftBoundaryMinX--;
    leftBoundaryMaxX--;

    // 'R' points move right (X increases)
    rightBoundaryMinX++;
    rightBoundaryMaxX++;

    // 'U' points move up (Y increases)
    upBoundaryMinY++;
    upBoundaryMaxY++;

    // 'D' points move down (Y decreases)
    downBoundaryMinY--;
    downBoundaryMaxY--;
  }

  // Output the smallest area found
  console.log(minCalculatedArea);
}

// Execute the main processing function with input read from stdin.
// The input is trimmed and split by newlines or spaces.
ProcessCoordinates(
  require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/[\n\s]+/)
);