const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';

const rawFileContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
const processedContent = rawFileContent.trim();
let contentLines = processedContent.split('\n');

const initialCountStringValue = contentLines.shift();
const parsedInitialCount = parseInt(initialCountStringValue, 10);

const numbersLineContent = contentLines.shift();
let currentNumericSequence = numbersLineContent.split(' ').map(Number);

const sequenceLength = currentNumericSequence.length;

for (let outerIterationIndex = 0; outerIterationIndex < sequenceLength; outerIterationIndex++) {
  const valueToPlace = currentNumericSequence[outerIterationIndex];
  let comparisonPosition = outerIterationIndex - 1;

  while (comparisonPosition >= 0 && currentNumericSequence[comparisonPosition] > valueToPlace) {
    currentNumericSequence[comparisonPosition + 1] = currentNumericSequence[comparisonPosition];
    comparisonPosition--;
  }

  currentNumericSequence[comparisonPosition + 1] = valueToPlace;

  const formattedOutputLine = currentNumericSequence.join(' ');
  console.log(formattedOutputLine);
}
