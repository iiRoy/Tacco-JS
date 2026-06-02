var inputBuffer = [];
var lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
lineReader.on('line', function (currentLine) {
  inputBuffer.push(currentLine);
});
process.stdin.on('end', function () {
  processInputData(inputBuffer);
});

function processInputData(receivedLines) {
  const VALUE_SEPARATOR = ' ';

  const parseNumericValues = (lineString, separator) => {
    const stringParts = lineString.split(separator);
    const valueOne = Number(stringParts[0]);
    const valueTwo = Number(stringParts[1]);
    return { valueOne, valueTwo };
  };

  const calculateAndFormatResults = (numA, numB, separator) => {
    const productValue = numA * numB;
    const sumValue = numA + numB;
    const doubledSum = sumValue * 2;
    return productValue + separator + doubledSum;
  };

  const firstInputLine = receivedLines[0];
  const { valueOne: firstNum, valueTwo: secondNum } = parseNumericValues(firstInputLine, VALUE_SEPARATOR);

  const finalOutputString = calculateAndFormatResults(firstNum, secondNum, VALUE_SEPARATOR);
  console.log(finalOutputString);
}
