const parseNumericLine = (lineString, parserFunction) => {
  const SPACE_DELIMITER = ' ';
  return lineString.split(SPACE_DELIMITER).map(parserFunction);
};

function processInputAndCalculate(rawDataContent) {
  const NEWLINE_DELIMITER = '\n';
  const integerParser = (str) => parseInt(str, 10);

  const inputLines = rawDataContent.split(NEWLINE_DELIMITER);

  const firstLineParsedValues = parseNumericLine(inputLines[0], integerParser);
  const initialCountValue = firstLineParsedValues[0];
  const requiredSumThreshold = firstLineParsedValues[1];

  const maxIterationLimit = initialCountValue + 1;

  const sequenceOfElements = parseNumericLine(inputLines[1], integerParser);

  let cumulativeSum = 0;

  for (let currentElementCount = 1; currentElementCount <= maxIterationLimit; currentElementCount++) {
    if (currentElementCount <= sequenceOfElements.length) {
      cumulativeSum += sequenceOfElements[currentElementCount - 1];
    }

    if (cumulativeSum >= requiredSumThreshold) {
      console.log(currentElementCount);
      return;
    }
  }

  console.log(initialCountValue);
}

(function() {
  const fileSystemModule = require('fs');
  const inputFilePath = '/dev/stdin';
  const fileEncoding = 'utf8';

  try {
    const fileContent = fileSystemModule.readFileSync(inputFilePath, fileEncoding);
    processInputAndCalculate(fileContent);
  } catch (error) {
    throw error;
  }
})();
