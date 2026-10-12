function processInputData(rawData) {
  const whitespaceDelimiter = /\s/g;
  const rawTokens = rawData.split(whitespaceDelimiter);

  const nonEmptyTokens = rawTokens.filter(item => item);

  const parsedNumbers = nonEmptyTokens.map(item => parseInt(item, 10));

  const arraySize = parsedNumbers[0];
  const upperBound = parsedNumbers[1];

  let finalCalculatedValue;
  const CONSTANT_ONE = 1;

  if (upperBound === arraySize) {
    finalCalculatedValue = CONSTANT_ONE;
  } else {
    const denominator = upperBound - CONSTANT_ONE;
    finalCalculatedValue = arraySize / denominator;
  }

  console.log(finalCalculatedValue);
}

const fileSystemHandler = require("fs");
const inputSourcePath = "/dev/stdin";
const textEncoding = "utf8";
const fileContent = fileSystemHandler.readFileSync(inputSourcePath, textEncoding);

processInputData(fileContent);
