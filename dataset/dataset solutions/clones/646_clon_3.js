function calculateCeilingProduct(numeratorStr, denominatorStr, multiplierStr) {
  const numVal = Number(numeratorStr);
  const denVal = Number(denominatorStr);
  const multVal = Number(multiplierStr);

  const intermediateDivision = numVal / denVal;
  const roundedUpValue = Math.ceil(intermediateDivision);
  const finalProduct = roundedUpValue * multVal;

  return finalProduct;
}

function processInputData(rawDataString) {
  const components = rawDataString.split(" ");

  const componentA = components[0];
  const componentB = components[1];
  const componentC = components[2];
  const componentD = components[3];
  const componentE = components[4];

  const derivedValueOne = calculateCeilingProduct(componentA, componentB, componentC);

  const derivedValueTwo = calculateCeilingProduct(componentA, componentD, componentE);

  const minimumDerivedValue = Math.min(derivedValueOne, derivedValueTwo);

  console.log(minimumDerivedValue);
}

const fileSystemModule = require('fs');
const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
processInputData(standardInputContent);
