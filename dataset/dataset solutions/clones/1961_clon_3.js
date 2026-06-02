const parseNumericLine = (lineContent, separator = ' ') => {
  return lineContent.split(separator).map(Number);
};

const sumNumericArray = (numbersCollection) => {
  return numbersCollection.reduce((currentTotal, singleValue) => currentTotal + singleValue, 0);
};

const processInputLines = (dataLines) => {
  const LINE_DELIMITER = ' ';

  const firstLineParsedValues = parseNumericLine(dataLines[0], LINE_DELIMITER);
  const totalCapacity = firstLineParsedValues[0];
  const elementCount = firstLineParsedValues[1]; // 'M' is parsed but not utilized in the subsequent logic

  const secondLineParsedValues = parseNumericLine(dataLines[1], LINE_DELIMITER);
  const totalItemsSum = sumNumericArray(secondLineParsedValues);

  let finalOutputValue;
  if (totalItemsSum > totalCapacity) {
    finalOutputValue = -1;
  } else {
    finalOutputValue = totalCapacity - totalItemsSum;
  }

  console.log(finalOutputValue);
};

let inputBuffer = '';
process.stdin.on('data', (inputChunk) => {
  inputBuffer += inputChunk;
});

process.stdin.on('end', () => {
  const {
    EOL
  } = require('os');
  const parsedLines = inputBuffer.split(EOL);
  processInputLines(parsedLines);
});
