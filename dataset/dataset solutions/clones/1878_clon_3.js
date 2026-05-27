function getNextTown(currentTownIndex, townMap) {
  return townMap[currentTownIndex] - 1;
}

function completeCycleTraversal(initialPosition, remainingStepsCount, cycleSize, connectionMap) {
  let currentLoc = initialPosition;
  let stepsToTake = remainingStepsCount;

  if (stepsToTake >= cycleSize) {
    stepsToTake %= cycleSize;
  }

  while (stepsToTake > 0) {
    currentLoc = getNextTown(currentLoc, connectionMap);
    stepsToTake--;
  }
  return currentLoc;
}


function processInput(rawDataString) {
  const inputLines = rawDataString.trim().split("\n");

  const firstLineParts = inputLines[0].split(' ');
  const numTowns = parseInt(firstLineParts[0], 10);
  let stepsRemaining = BigInt(firstLineParts[1]);

  const townConnections = inputLines[1].split(' ').map(Number);

  const pathHistory = [];
  let currentPosition = 0;

  pathHistory.push(currentPosition);

  while (stepsRemaining > 0) {
    currentPosition = getNextTown(currentPosition, townConnections);
    stepsRemaining--;

    const cycleStartIndex = pathHistory.indexOf(currentPosition);

    if (cycleStartIndex !== -1) {
      const cycleLength = BigInt(pathHistory.length - cycleStartIndex);

      currentPosition = completeCycleTraversal(currentPosition, stepsRemaining, cycleLength, townConnections);
      stepsRemaining = 0n;
      break;
    } else {
      pathHistory.push(currentPosition);
    }
  }

  console.log(currentPosition + 1);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInput(fileContent);
