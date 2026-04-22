const CalculatePathways = (entryData) => {
  entryData = entryData.split(" ").map(itemValue => Math.floor(Number(itemValue)));

  const heightDimension = entryData[0];
  const widthMeasure = entryData[1];
  const finalColumnIndex = entryData[2];
  const modulusValue = 1000000007;

  if (widthMeasure === 1) {
    return 1;
  }

  const validConfigurationStrings = Array(Math.pow(2, (widthMeasure - 1)))
    .fill(0)
    .map((_, currentIdx) => currentIdx)
    .map(numericPattern => numericPattern.toString(2))
    .filter(binaryString => !/11/.test(binaryString))
    .map(binaryString => "000000" + binaryString)
    .map(binaryString => binaryString.slice(1 - widthMeasure))
    .map(binaryString => "0" + binaryString + "0");

  const pathAccumulator = new Array(heightDimension + 1);
  for (let rowIdx = 0; rowIdx <= heightDimension; rowIdx++) {
    pathAccumulator[rowIdx] = new Array(widthMeasure).fill(0);
  }
  pathAccumulator[0][0] = 1;

  for (let currentRow = 1; currentRow <= heightDimension; currentRow++) {
    validConfigurationStrings.forEach((currentConfig) => {
      for (let currentColumn = 0; currentColumn < widthMeasure; currentColumn++) {
        const adjacentRungs = currentConfig[currentColumn] + currentConfig[currentColumn + 1];

        switch (adjacentRungs) {
          case "10":
            pathAccumulator[currentRow][currentColumn] += pathAccumulator[currentRow - 1][currentColumn - 1];
            break;
          case "01":
            pathAccumulator[currentRow][currentColumn] += pathAccumulator[currentRow - 1][currentColumn + 1];
            break;
          case "00":
            pathAccumulator[currentRow][currentColumn] += pathAccumulator[currentRow - 1][currentColumn];
            break;
        }
        pathAccumulator[currentRow][currentColumn] %= modulusValue;
      }
    });
  }

  return pathAccumulator[heightDimension][finalColumnIndex - 1];
};

if (typeof require !== 'undefined')
  console.log(CalculatePathways(require("fs").readFileSync("/dev/stdin", "utf8")));