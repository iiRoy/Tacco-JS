function solveProblem(rawInputString) {
  const NEWLINE_DELIMITER = "\n";
  const SPACE_DELIMITER = " ";

  const inputLines = rawInputString.split(NEWLINE_DELIMITER);

  const firstLineData = inputLines[0].split(SPACE_DELIMITER);
  const distanceThreshold = Number(firstLineData[1]);
  const thresholdSquared = distanceThreshold * distanceThreshold;

  let validPointsCount = 0;

  for (let lineIndex = 1; lineIndex < inputLines.length; lineIndex++) {
    const currentLine = inputLines[lineIndex];
    const coordinateStrings = currentLine.split(SPACE_DELIMITER);

    const xCoordinate = Number(coordinateStrings[0]);
    const yCoordinate = Number(coordinateStrings[1]);

    const currentPointDistanceSquared = (xCoordinate * xCoordinate) + (yCoordinate * yCoordinate);

    if (currentPointDistanceSquared <= thresholdSquared) {
      validPointsCount++;
    }
  }

  console.log(validPointsCount);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
