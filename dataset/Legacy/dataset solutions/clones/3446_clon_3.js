process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputLines = [];
const lineDelimiter = ' ';

const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  const firstInputLine = inputLines[0];
  const parsedValues = firstInputLine.split(lineDelimiter);

  const firstValueString = parsedValues[0];
  const thirdValueString = parsedValues[2];

  const numericFirstValue = Number(firstValueString);
  const numericThirdValue = Number(thirdValueString);

  const halfOfThirdValue = numericThirdValue / 2;

  const finalCalculatedResult = numericFirstValue + halfOfThirdValue;

  console.log(finalCalculatedResult);
});
