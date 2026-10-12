function getIntegerVal(inputString) {
  return parseInt(inputString, 10);
}

function getFloatVal(inputString) {
  return parseFloat(inputString);
}

function isEvenNumber(value) {
  return (value % 2) === 0;
}

function isOddNumber(value) {
  return (value % 2) !== 0;
}

function sortNumbersAscending(numericArray) {
  return [...numericArray].sort((firstVal, secondVal) => (firstVal - secondVal));
}

function sortNumbersDescending(numericArray) {
  return [...numericArray].sort((firstVal, secondVal) => (secondVal - firstVal));
}

function sortStringsAscending(stringArray) {
  return [...stringArray].sort();
}

function sortStringsDescending(stringArray) {
  return [...stringArray].sort().reverse();
}

function filterOutValue(sourceArray, valueToExclude) {
  return sourceArray.filter(element => element !== valueToExclude);
}

function processGeometricDivision(inputLines) {
  const initialDimensions = inputLines[0].split(' ').map(getIntegerVal);
  const initialH = initialDimensions[0];
  const initialW = initialDimensions[1];

  const primaryDimensionConfigurations = [
    [initialW, initialH],
    [initialH, initialW]
  ];

  const allCalculatedDifferences = primaryDimensionConfigurations.flatMap(currentPrimaryDims => {
    const currentPrimaryDim0 = currentPrimaryDims[0];
    const currentPrimaryDim1 = currentPrimaryDims[1];

    const firstCutDimension = Math.round(currentPrimaryDim0 / 3);
    const remainingDimension = currentPrimaryDim0 - firstCutDimension;
    const areaPieceA = firstCutDimension * currentPrimaryDim1;

    const secondaryDimensionConfigurations = [
      [remainingDimension, currentPrimaryDim1],
      [currentPrimaryDim1, remainingDimension]
    ];

    return secondaryDimensionConfigurations.map(currentSecondaryDims => {
      const currentSecondaryDim0 = currentSecondaryDims[0];
      const currentSecondaryDim1 = currentSecondaryDims[1];

      const secondCutDimension = Math.round(currentSecondaryDim0 / 2);
      const finalRemainingDimension = currentSecondaryDim0 - secondCutDimension;
      const areaPieceB = secondCutDimension * currentSecondaryDim1;
      const areaPieceC = finalRemainingDimension * currentSecondaryDim1;

      return Math.max(areaPieceA, areaPieceB, areaPieceC) - Math.min(areaPieceA, areaPieceB, areaPieceC);
    });
  });

  return Math.min(...allCalculatedDifferences);
}

console.log(processGeometricDivision(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(lineContent => lineContent.trim())));
