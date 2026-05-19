const processInputAndCalculate = rawInputString => {
  const trimmedInput = rawInputString.trim();
  const parsedNumber = Number(trimmedInput);

  const numberSquared = parsedNumber * parsedNumber;
  const numberCubed = parsedNumber * numberSquared;

  const totalSum = parsedNumber + numberSquared + numberCubed;

  return totalSum;
};

const fileSystemHandler = require('fs');
const standardInputFile = '/dev/stdin';
const fileEncoding = 'utf8';

const fileContents = fileSystemHandler.readFileSync(standardInputFile, fileEncoding);
console.log(processInputAndCalculate(fileContents));
