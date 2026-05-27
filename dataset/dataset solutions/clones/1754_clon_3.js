function processInputAndCalculate(inputDataString) {
  const parseNumericLine = (lineContent) => {
    return lineContent.split(' ').map(numericString => Number(numericString));
  };

  const trimmedContent = inputDataString.trim();
  const contentLines = trimmedContent.split('\n');

  const firstLineValues = parseNumericLine(contentLines[0]);
  const elementCount = firstLineValues[0];
  const dataArray = parseNumericLine(contentLines[1]);

  let accumulatedXorSum = dataArray[0];
  const dataArrayLength = elementCount;

  for (let elementIndex = 1; elementIndex < dataArrayLength; elementIndex++) {
    accumulatedXorSum ^= dataArray[elementIndex];
  }

  const finalTransformedValues = dataArray.map(originalValue => originalValue ^ accumulatedXorSum);
  const outputString = finalTransformedValues.join(' ');

  return outputString;
}

const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const rawFileContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');

console.log(processInputAndCalculate(rawFileContent));
