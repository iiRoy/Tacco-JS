function processInputData(rawData) {
  let lines = rawData.split("\n");
  let quantity = parseInt(lines[0]);
  let heights = lines[1].split(" ").map(val => parseInt(val));
  let weights = lines[2].split(" ").map(val => parseInt(val));

  let maximumIndexValue = quantity;
  let bitStructure = new Array(maximumIndexValue + 1).fill(0);

  function adjustValue(zeroIndexedPosition, valueToSet) {
    zeroIndexedPosition++;
    while (zeroIndexedPosition <= maximumIndexValue) {
      bitStructure[zeroIndexedPosition] = Math.max(bitStructure[zeroIndexedPosition], valueToSet);
      zeroIndexedPosition += zeroIndexedPosition & (-zeroIndexedPosition);
    }
  }

  function obtainPrefixMaximum(zeroIndexedBound) {
    if (zeroIndexedBound < 0) return 0;
    zeroIndexedBound++;
    let currentBestValue = 0;
    while (zeroIndexedBound > 0) {
      currentBestValue = Math.max(currentBestValue, bitStructure[zeroIndexedBound]);
      zeroIndexedBound -= zeroIndexedBound & (-zeroIndexedBound);
    }
    return currentBestValue;
  }

  let overallMaximumPathSum = 0;

  for (let k = 0; k < quantity; k++) {
    let currentHeightValue = heights[k];
    let currentWeightValue = weights[k];

    let maxPreviousConnectionValue = obtainPrefixMaximum(currentHeightValue - 2);

    let currentPathTotal = maxPreviousConnectionValue + currentWeightValue;

    adjustValue(currentHeightValue - 1, currentPathTotal);

    overallMaximumPathSum = Math.max(overallMaximumPathSum, currentPathTotal);
  }

  console.log('%s', overallMaximumPathSum);
  return overallMaximumPathSum;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));