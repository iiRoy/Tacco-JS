function processInputData(rawData) {
  const trimmedInputString = rawData.trim();
  const inputStringParts = trimmedInputString.split(" ");

  const getNumericValue = (str) => parseInt(str, 10);

  const initialValueA = getNumericValue(inputStringParts[0]);
  const finalValueB = getNumericValue(inputStringParts[1]);
  const iterationLimitK = getNumericValue(inputStringParts[2]);

  const collectedUniqueNumbers = new Set();

  // First pass: collect numbers starting from initialValueA
  for (let currentIdx = 0; currentIdx < iterationLimitK; currentIdx++) {
    const calculatedValue = initialValueA + currentIdx;
    if (calculatedValue <= finalValueB) {
      collectedUniqueNumbers.add(calculatedValue);
    }
  }

  // Second pass: collect numbers starting from finalValueB, ensuring they are within range
  for (let currentIdx = 0; currentIdx < iterationLimitK; currentIdx++) {
    const calculatedValue = finalValueB - currentIdx;
    if (calculatedValue >= initialValueA) {
      collectedUniqueNumbers.add(calculatedValue);
    }
  }

  // Convert the set to an array and sort it numerically
  const sortedOutputNumbers = Array.from(collectedUniqueNumbers).sort((val1, val2) => val1 - val2);

  // Print each number on a new line
  sortedOutputNumbers.forEach(num => {
    console.log(num);
  });
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';

processInputData(fileSystemModule.readFileSync(standardInputPath, encodingFormat));
