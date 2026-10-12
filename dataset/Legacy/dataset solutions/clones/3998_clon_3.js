function processInput(rawData) {
  const dimensionStrings = rawData.split(" ");
  const dimA = parseInt(dimensionStrings[0], 10);
  const dimB = parseInt(dimensionStrings[1], 10);

  let calculatedResult;

  const isAnyDimensionOne = (dimA === 1 || dimB === 1);

  if (isAnyDimensionOne) {
    if (dimA === dimB) {
      // This path is taken only if dimA=1 and dimB=1
      calculatedResult = 0;
    } else {
      // One dimension is 1, the other is greater than 1
      calculatedResult = Math.max(dimA, dimB) - 2;
    }
  } else {
    // Both dimensions are greater than 1
    const effectiveWidth = dimA - 2;
    const effectiveHeight = dimB - 2;
    calculatedResult = effectiveWidth * effectiveHeight;
  }

  console.log(calculatedResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
