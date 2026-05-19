function processInputData(rawData) {
  const dataLines = rawData.split("\n");
  const parsedData = dataLines.map(lineSegment => lineSegment.split(" "));

  const dataCount = Number(parsedData[0][0]);

  const checkMutualDominance = (coord1X, coord1Y, coord2X, coord2Y) => {
    const numCoord1X = Number(coord1X);
    const numCoord1Y = Number(coord1Y);
    const numCoord2X = Number(coord2X);
    const numCoord2Y = Number(coord2Y);

    return (numCoord1X < numCoord2X && numCoord1Y < numCoord2Y) ||
           (numCoord2X < numCoord1X && numCoord2Y < numCoord1Y);
  };

  const calculateDominanceCount = (targetIndex, targetX, targetY) => {
    let dominanceTally = 1;

    for (let comparisonIndex = 1; comparisonIndex <= dataCount; comparisonIndex++) {
      if (targetIndex === comparisonIndex) {
        continue;
      }

      const comparisonPoint = parsedData[comparisonIndex];
      const comparisonX = comparisonPoint[0];
      const comparisonY = comparisonPoint[1];

      if (checkMutualDominance(targetX, targetY, comparisonX, comparisonY)) {
        dominanceTally++;
      }
    }
    return dominanceTally;
  };

  for (let iterationIndex = 1; iterationIndex <= dataCount; iterationIndex++) {
    const currentPointData = parsedData[iterationIndex];
    const currentPointX = currentPointData[0];
    const currentPointY = currentPointData[1];

    console.log(calculateDominanceCount(iterationIndex, currentPointX, currentPointY));
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
