const summingReducer = function(currentAccumulation, itemValue) {
  const intermediateSum = currentAccumulation + itemValue;
  return intermediateSum;
};

const STDIN_PATH = '/dev/stdin';
const LINE_SEPARATOR = "\n";

const fileSystemModule = require('fs');
const fileBuffer = fileSystemModule.readFileSync(STDIN_PATH, 'utf8');

const trimmedBuffer = fileBuffer.trim();
const dataLines = trimmedBuffer.split(LINE_SEPARATOR);

const parsedNumbers = dataLines.map(lineString => {
  const convertedNumber = Number(lineString);
  return convertedNumber;
});

console.log(parsedNumbers.reduce(summingReducer));
