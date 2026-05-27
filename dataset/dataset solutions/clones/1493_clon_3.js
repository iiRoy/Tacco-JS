function CoordinateProcessor(inputString) {
  const lines = inputString.split("\n");

  const pointCount = parseInt(lines[0], 10);

  const xCoordinates = [];
  const yCoordinates = [];

  const extractCoordinates = (lineContent) => {
    const parts = lineContent.split(" ").map(coordinateValueStr => parseInt(coordinateValueStr, 10));
    return { x: parts[0], y: parts[1] };
  };

  for (let pointIndex = 0; pointIndex < pointCount; pointIndex++) {
    const currentPointData = extractCoordinates(lines[pointIndex + 1]);
    xCoordinates.push(currentPointData.x);
    yCoordinates.push(currentPointData.y);
  }

  const directComparisonCounts = [];

  for (let primaryIndex = 0; primaryIndex < pointCount; primaryIndex++) {
    let comparisonTally = 0;
    for (let secondaryIndex = 0; secondaryIndex < pointCount; secondaryIndex++) {
      const isDominantOrDominated =
        (xCoordinates[primaryIndex] > xCoordinates[secondaryIndex] && yCoordinates[primaryIndex] > yCoordinates[secondaryIndex]) ||
        (xCoordinates[primaryIndex] < xCoordinates[secondaryIndex] && yCoordinates[primaryIndex] < yCoordinates[secondaryIndex]);

      if (isDominantOrDominated) {
        comparisonTally++;
      }
    }
    directComparisonCounts.push(comparisonTally);
  }

  for (let primaryIndex = 0; primaryIndex < pointCount; primaryIndex++) {
    let finalTally = 1;
    for (let secondaryIndex = 0; secondaryIndex < pointCount; secondaryIndex++) {
      const isRelatedByDominance =
        (xCoordinates[primaryIndex] > xCoordinates[secondaryIndex] && yCoordinates[primaryIndex] > yCoordinates[secondaryIndex]) ||
        (xCoordinates[primaryIndex] < xCoordinates[secondaryIndex] && yCoordinates[primaryIndex] < yCoordinates[secondaryIndex]);

      if (isRelatedByDominance) {
        finalTally += directComparisonCounts[secondaryIndex];
      }
    }
    console.log(finalTally);
  }
}

CoordinateProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));
