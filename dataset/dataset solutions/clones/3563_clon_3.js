function processInput(dataArray) {
  const rawInputString = dataArray[0];
  const numericValue = Number(rawInputString);

  const valueDividedByTwo = numericValue / 2;
  const ceilingOfHalf = Math.ceil(valueDividedByTwo);
  const floorOfHalf = Math.floor(valueDividedByTwo);

  const calculatedProduct = ceilingOfHalf * floorOfHalf;

  console.log(calculatedProduct);
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const fileContentBuffer = fileSystemModule.readFileSync(standardInputPath, 'utf8');
const trimmedContent = fileContentBuffer.trim();
const linesArray = trimmedContent.split("\n");

processInput(linesArray);
