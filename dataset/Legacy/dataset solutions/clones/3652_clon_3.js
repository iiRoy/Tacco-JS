function processData(rawInputString) {
  const trimmedInput = rawInputString.trim();
  const parsedNumbers = trimmedInput.split(" ").map(Number);

  const maximumValue = Math.max(...parsedNumbers);
  const minimumValue = Math.min(...parsedNumbers);

  const finalDifference = maximumValue - minimumValue;

  console.log(finalDifference);
}

const inputSourcePath = '/dev/stdin';
const fileSystemModule = require('fs');
const fileContents = fileSystemModule.readFileSync(inputSourcePath, 'utf8');

processData(fileContents);
