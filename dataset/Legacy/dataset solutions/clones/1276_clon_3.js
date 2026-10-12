function processInput(rawData) {
  const inputLines = rawData.split('\n');
  const totalNumbersCount = parseInt(inputLines[0], 10);

  const numberStringComponents = inputLines[1].split(' ');

  const parsedNumericData = numberStringComponents.map(valueStr => Number(valueStr));

  const outputSegments = [];

  for (let currentIdx = 0; currentIdx < totalNumbersCount; currentIdx++) {
    const originalIndex = totalNumbersCount - 1 - currentIdx;
    const numberToAppend = parsedNumericData[originalIndex];
    outputSegments.push(numberToAppend);
  }

  console.log(outputSegments.join(' '));
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf-8');
processInput(fileContent);
