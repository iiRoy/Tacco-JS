const processInputData = (rawData) => {
  const linesOfData = rawData.split("\n");

  const totalPointsCount = Number(linesOfData[0]);

  let coordinateList = [];

  // Populate the array with parsed coordinate pairs
  for (let idx = 1; idx <= totalPointsCount; idx++) {
    coordinateList[idx] = linesOfData[idx].split(" ").map(valStr => Number(valStr));
  }

  /*
   * Calculate all possible pairwise combinations of points
   * The number of combinations is N * (N - 1) / 2
   */
  let maxDistanceFound = 0;

  for (let firstPointIndex = 1; firstPointIndex <= totalPointsCount; firstPointIndex++) {
    for (let secondPointIndex = firstPointIndex + 1; secondPointIndex <= totalPointsCount; secondPointIndex++) {

      // Compute Manhattan distance (L1 norm) between two points
      const currentDistance = Math.abs(coordinateList[firstPointIndex][0] - coordinateList[secondPointIndex][0])
                            + Math.abs(coordinateList[firstPointIndex][1] - coordinateList[secondPointIndex][1]);

      // Keep track of the largest distance encountered so far
      if (currentDistance > maxDistanceFound) {
        maxDistanceFound = currentDistance;
      }
    }
  }

  console.log(maxDistanceFound);
};

processInputData(require('node:fs').readFileSync('/dev/fd/0', 'utf8'));