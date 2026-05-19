function computeValue(inputData) {
  const firstLineContent = inputData[0];
  const spaceDelimiter = " ";
  const parsedSegments = firstLineContent.split(spaceDelimiter);

  const initialPoint = Number(parsedSegments[0]);
  const upperBound = Number(parsedSegments[1]);

  let computedResult = 1;
  const iterationStep = initialPoint - 1;

  let currentIterationPoint = initialPoint;
  while (currentIterationPoint < upperBound) {
    computedResult++;
    currentIterationPoint += iterationStep;
  }

  console.log(computedResult);
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';

const rawFileContent = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
const linesOfInput = rawFileContent.split("\n");

computeValue(linesOfInput);
