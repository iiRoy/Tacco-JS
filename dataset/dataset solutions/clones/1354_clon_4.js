process.stdin.resume();
process.stdin.setEncoding('utf8');

const computeGeometricProperties = (dimensionsArray) => {
  const [firstDimension, secondDimension] = dimensionsArray;
  const productResult = firstDimension * secondDimension;
  const sumDoubledResult = 2 * (firstDimension + secondDimension);
  return [productResult, sumDoubledResult];
};

const processInputAndFormatOutput = (rawInputString) => {
  const numericDimensions = rawInputString.split(' ').map(Number);
  const [calculatedProduct, calculatedSumDoubled] = computeGeometricProperties(numericDimensions);
  return `${calculatedProduct} ${calculatedSumDoubled}`;
};

process.stdin.on('data', (inputBuffer) => {
  console.log(processInputAndFormatOutput(inputBuffer));
});
