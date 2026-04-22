function AnalyzeCoordinates(rawData) {
  const parsedLines = rawData.split('\n');

  const boundaryInformation = parsedLines[0].split(' ');
  const maximumSquaredDistance = parseFloat(boundaryInformation[1]) * parseFloat(boundaryInformation[1]);

  const coordinateSets = parsedLines.slice(1);

  const eligibleCount = coordinateSets.filter(lineEntry => {
    if (lineEntry.trim() === '') {
      return false;
    }
    const values = lineEntry.split(' ');
    const xCoordinate = parseFloat(values[0]);
    const yCoordinate = parseFloat(values[1]);

    return (xCoordinate * xCoordinate + yCoordinate * yCoordinate) <= maximumSquaredDistance;
  }).length;

  console.log(eligibleCount);
}

AnalyzeCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));