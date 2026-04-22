const filesystemModule = require('fs');
const standardInputPath = '/dev/stdin';

function extractTokens(sourceData) {
  return sourceData.split('\n').reduce((accumulator, lineSegment) => {
    return accumulator.concat(lineSegment.split(' '));
  }, []);
}

function acquireData() {
  const rawContent = filesystemModule.readFileSync(standardInputPath, 'utf8');
  return extractTokens(rawContent);
}

(() => {
  const allElements = acquireData();
  
  const [initialQuantityString, baseValueString] = allElements;
  const initialQuantity = Number(initialQuantityString);
  const baseValue = Number(baseValueString);

  const referenceConstant = 10;
  const scalarFactor = 100;

  const differenceValue = referenceConstant - initialQuantity;
  const scaledDifference = differenceValue * scalarFactor;
  
  const finalResult = baseValue + scaledDifference;

  console.log(finalResult);
})();