function processPointData(rawInputString) {
  const dataLines = rawInputString.split("\n");
  dataLines.pop(); // Remove the last empty line if present

  const totalPointsCount = parseInt(dataLines.shift(), 10);
  const pointCoordinates = [];

  // Helper function to parse a single point
  const parsePoint = (lineString) => {
    const coordinatePairStrings = lineString.split(' ');
    const xCoord = parseInt(coordinatePairStrings[0], 10);
    const yCoord = parseInt(coordinatePairStrings[1], 10);
    return { x: xCoord, y: yCoord };
  };

  for (let idx = 0; idx < totalPointsCount; idx++) {
    pointCoordinates.push(parsePoint(dataLines[idx]));
  }

  // Sort points: primary by x, secondary by y
  pointCoordinates.sort((pA, pB) => {
    const xValA = pA.x;
    const xValB = pB.x;
    if (xValA === xValB) {
      const yValA = pA.y;
      const yValB = pB.y;
      return yValA - yValB;
    }
    return xValA - xValB;
  });

  const vectorCounts = {}; // Stores counts of (dx, dy) vectors

  // Helper function to generate a unique key for a vector
  const generateVectorKey = (xComponent, yComponent) => `${xComponent},${yComponent}`;

  // Calculate all pairwise differences and count their occurrences
  for (let idx = 0; idx < totalPointsCount; idx++) {
    for (let jdx = 0; jdx < totalPointsCount; jdx++) {
      if (idx === jdx) {
        continue; // Skip self-comparison
      }
      const diffX = pointCoordinates[idx].x - pointCoordinates[jdx].x;
      const diffY = pointCoordinates[idx].y - pointCoordinates[jdx].y;
      const currentVectorKey = generateVectorKey(diffX, diffY);

      vectorCounts[currentVectorKey] = (vectorCounts[currentVectorKey] || 0) + 1;
    }
  }

  const allVectorKeys = Object.keys(vectorCounts);
  let maximumCount = 0;
  let dominantVectorKey = '0,0'; // Default, will be overwritten

  // Find the most frequent (dx, dy) vector
  for (let idx = 0; idx < allVectorKeys.length; idx++) {
    const currentKey = allVectorKeys[idx];
    const countForKey = vectorCounts[currentKey];
    if (countForKey > maximumCount) {
      maximumCount = countForKey;
      dominantVectorKey = currentKey;
    }
  }

  const keyParts = dominantVectorKey.split(',');
  const dominantDeltaX = parseInt(keyParts[0], 10);
  const dominantDeltaY = parseInt(keyParts[1], 10);

  let minimumLinesRequired = 0;

  // Helper function to check if two points are collinear with a given vector
  const arePointsCollinear = (point1, point2, dX, dY) => {
    const pointDiffX = point2.x - point1.x;
    const pointDiffY = point2.y - point1.y;

    const isXAligned = (dX === 0 && pointDiffX === 0) || (dX !== 0 && pointDiffX % dX === 0);
    const isYAligned = (dY === 0 && pointDiffY === 0) || (dY !== 0 && pointDiffY % dY === 0);

    return isXAligned && isYAligned;
  };

  // Iteratively cover points with lines defined by the dominant vector
  while (pointCoordinates.length > 0) {
    const referencePoint = pointCoordinates.shift(); // Take the first available point
    minimumLinesRequired++; // This point starts a new line

    // Iterate through remaining points to find others on the same line
    for (let idx = 0; idx < pointCoordinates.length; idx++) {
      const comparisonPoint = pointCoordinates[idx];
      if (arePointsCollinear(referencePoint, comparisonPoint, dominantDeltaX, dominantDeltaY)) {
        pointCoordinates.splice(idx, 1); // Remove the covered point
        idx--; // Adjust index due to splice
      }
    }
  }

  console.log(minimumLinesRequired);
}

processPointData(require("fs").readFileSync("/dev/stdin", "utf8"));
