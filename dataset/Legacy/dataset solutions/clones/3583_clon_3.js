const processInput = (rawData) => {
  const trimmedInput = rawData.trim();
  const inputLines = trimmedInput.split('\n');

  const firstLineContent = inputLines[0];
  // This preserves the original behavior of mapping each character to a Number.
  // For inputs like "5 2", this will result in [5, NaN, 2],
  // making the second destructured variable 'i' (or 'valB') NaN.
  const mappedNumericElements = firstLineContent.map(Number);

  const valA = mappedNumericElements[0];
  const valB = mappedNumericElements[1];

  // Define a small helper function for the arithmetic operation
  const performCalculation = (operandOne, operandTwo) => {
    return operandOne - operandTwo + 1;
  };

  const computedResult = performCalculation(valA, valB);
  console.log(computedResult);
};

// Separate the file system operations and input reading
const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const fileEncoding = 'utf8';

const fileContent = fileSystemModule.readFileSync(standardInputFilePath, fileEncoding);
processInput(fileContent);
