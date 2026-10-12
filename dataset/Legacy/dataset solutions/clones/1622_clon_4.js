function processInputData(rawData) {
  const inputLines = rawData.split('\n');

  const [_, distanceLimitString] = inputLines[0].split(' ');
  const squaredDistanceThreshold = Number(distanceLimitString) ** 2;

  const pointsData = inputLines.slice(1);

  const qualifyingPointCount = pointsData.filter(currentLine => {
    if (!currentLine.trim()) {
      return false;
    }

    const [xCoordinateString, yCoordinateString] = currentLine.split(' ');
    const xValue = Number(xCoordinateString);
    const yValue = Number(yCoordinateString);

    const currentDistanceSquared = (xValue ** 2) + (yValue ** 2);

    return currentDistanceSquared <= squaredDistanceThreshold;
  }).length;

  console.log(qualifyingPointCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
