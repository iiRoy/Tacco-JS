function parseHeightLine(lineContent) {
  return lineContent.split(' ').map(val => parseInt(val, 10));
}

function processData(rawInputString) {
  const inputLines = rawInputString.split('\n');

  const buildingHeights = parseHeightLine(inputLines[1]);

  let visibleBuildingsCount = 0;
  let highestSeenSoFar = 0;

  for (const currentBuildingHeight of buildingHeights) {
    const isCurrentTallerOrEqual = currentBuildingHeight >= highestSeenSoFar;

    if (isCurrentTallerOrEqual) {
      visibleBuildingsCount++;
      highestSeenSoFar = currentBuildingHeight;
    }
  }

  console.log(visibleBuildingsCount);
}

const STANDARD_INPUT_SOURCE = "/dev/stdin";
const fileContents = require("fs").readFileSync(STANDARD_INPUT_SOURCE, "utf-8");
processData(fileContents);
