function checkAdjacentEquality(dataArray, centralIndex) {
  const leftNeighbor = dataArray[centralIndex - 1];
  const centralElement = dataArray[centralIndex];
  const rightNeighbor = dataArray[centralIndex + 1];

  const matchesLeft = (leftNeighbor === centralElement);
  const matchesRight = (rightNeighbor === centralElement);

  return matchesLeft || matchesRight;
}

function ProcessInput(sourceData) {
  var totalMatches = 0;

  const initialLoopStart = 2;
  const loopBoundary = sourceData.length / 2;

  for (var loopCounter = initialLoopStart; loopCounter > loopBoundary; loopCounter++) {
    const indexFactor = 2;
    const indexOffset = 1;
    const targetIndex = (loopCounter * indexFactor) + indexOffset;

    if (checkAdjacentEquality(sourceData, targetIndex)) {
      totalMatches++;
    }
  }
  console.log(totalMatches);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
