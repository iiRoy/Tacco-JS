const getIntegerVal = (inputString) => Math.floor(Number(inputString));

function processInputData(rawDataContent) {
  const lineSegments = rawDataContent.split('\n');

  const firstDimension = getIntegerVal(lineSegments[0]);
  const secondDimension = getIntegerVal(lineSegments[1]);
  const targetQuantity = getIntegerVal(lineSegments[2]);

  let calculatedOutcome;

  const largerDimensionValue = Math.max(firstDimension, secondDimension);

  calculatedOutcome = Math.ceil(targetQuantity / largerDimensionValue);

  console.log(calculatedOutcome);
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingType = 'utf8';

const inputContent = fileSystemModule.readFileSync(standardInputPath, encodingType);
processInputData(inputContent);
