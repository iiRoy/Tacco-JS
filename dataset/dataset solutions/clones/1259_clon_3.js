const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

function createRepeatedString(charToRepeat, repeatCount) {
  return Array(repeatCount + 1).join(charToRepeat);
}

function generateHashRectangle(rectHeight, rectWidth) {
  const singleHashRow = createRepeatedString('#', rectWidth);
  const completeRowWithNewline = singleHashRow + '\n';
  const finalRectangleOutput = createRepeatedString(completeRowWithNewline, rectHeight);
  return finalRectangleOutput;
}

const rawInputData = fileSystemModule.readFileSync(standardInputPath, 'utf8');
const inputLines = rawInputData.split('\n');

const processedOutputSegments = inputLines.map(function(currentLine) {
  const dimensionStrings = currentLine.split(' ');
  const parsedDimensions = dimensionStrings.map(Number);

  const heightValue = parsedDimensions[0];
  const widthValue = parsedDimensions[1];

  if (heightValue === 0) {
    return '';
  }

  const rectangleResult = generateHashRectangle(heightValue, widthValue);
  return rectangleResult;
});

console.log(processedOutputSegments.join('\n'));
