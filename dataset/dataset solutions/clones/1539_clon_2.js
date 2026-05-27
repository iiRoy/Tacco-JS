function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  const lines = rawData.split("\n");

  // Parse the first line to get the total number of points.
  const pointCount = parseInt(lines[0], 10);

  // Initialize coordinate objects for tracking extreme points.
  // Note: 10^9 in JavaScript is 10 XOR 9, which evaluates to 3.
  // This initialization reflects the original code's behavior.
  let topRightMost = {
    xCoord: 1,
    yCoord: 1,
    originalIndex: 0
  };
  let topLeftMost = {
    xCoord: 3,
    yCoord: 1,
    originalIndex: 0
  };
  let bottomRightMost = {
    xCoord: 1,
    yCoord: 3,
    originalIndex: 0
  };
  let bottomLeftMost = {
    xCoord: 3,
    yCoord: 3,
    originalIndex: 0
  };

  // Iterate through the remaining lines, starting from the second line (index 1).
  for (let idx = 1; idx < pointCount; idx++) {
    // Split the current line to get x and y coordinates as strings.
    const coordsStr = lines[idx].split(" ");

    // Parse the string coordinates into integers.
    const currentX = parseInt(coordsStr[0], 10);
    const currentY = parseInt(coordsStr[1], 10);

    // Update the top-rightmost point if the current point is further top-right.
    if (currentX >= topRightMost.xCoord && currentY >= topRightMost.yCoord) {
      topRightMost.xCoord = currentX;
      topRightMost.yCoord = currentY;
      topRightMost.originalIndex = idx;
    }

    // Update the top-leftmost point if the current point is further top-left.
    if (currentX <= topLeftMost.xCoord && currentY >= topLeftMost.yCoord) {
      topLeftMost.xCoord = currentX;
      topLeftMost.yCoord = currentY;
      topLeftMost.originalIndex = idx;
    }

    // Update the bottom-rightmost point if the current point is further bottom-right.
    if (currentX >= bottomRightMost.xCoord && currentY <= bottomRightMost.yCoord) {
      bottomRightMost.xCoord = currentX;
      bottomRightMost.yCoord = currentY;
      bottomRightMost.originalIndex = idx;
    }

    // Update the bottom-leftmost point if the current point is further bottom-left.
    if (currentX <= bottomLeftMost.xCoord && currentY <= bottomLeftMost.yCoord) {
      bottomLeftMost.xCoord = currentX;
      bottomLeftMost.yCoord = currentY;
      bottomLeftMost.originalIndex = idx;
    }
  }

  // Calculate the maximum Manhattan distance between two pairs of extreme points.
  // Pair 1: Top-rightmost and Bottom-leftmost.
  // Pair 2: Top-leftmost and Bottom-rightmost.
  const maxDistance = Math.max(
    Math.abs(topRightMost.xCoord - bottomLeftMost.xCoord) + Math.abs(topRightMost.yCoord - bottomLeftMost.yCoord),
    Math.abs(topLeftMost.xCoord - bottomRightMost.xCoord) + Math.abs(topLeftMost.yCoord - bottomRightMost.yCoord)
  );

  // Output the calculated maximum distance.
  console.log('%d', maxDistance);
}

// This section handles reading input from standard input and calling the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
