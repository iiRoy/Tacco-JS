function extractNumericTokens(sourceText) {
  const numericTokens = sourceText.split('\n').flatMap(currentLine => {
    const lineSegments = currentLine.split(' ');
    return lineSegments;
  });

  return numericTokens;
}

function computeFinalValue(paramR, paramN) {
  const MULTIPLIER_CONSTANT = 100;
  const SUBTRAHEND_CONSTANT = 10;

  const differenceTerm = SUBTRAHEND_CONSTANT - paramN;
  const productTerm = MULTIPLIER_CONSTANT * differenceTerm;
  const finalSum = paramR + productTerm;

  return finalSum;
}

function fetchAndProcessInput() {
  const FILE_PATH_SOURCE = '/dev/stdin';
  const fileSystemModule = require('fs');

  const rawFileContent = fileSystemModule.readFileSync(FILE_PATH_SOURCE, 'utf8');
  return extractNumericTokens(rawFileContent);
}

(function executeProgram() {
  const parsedInputData = fetchAndProcessInput();
  const firstNumericParam = +parsedInputData[0];
  const secondNumericParam = +parsedInputData[1];

  const calculatedOutcome = computeFinalValue(secondNumericParam, firstNumericParam);

  console.log(calculatedOutcome);
})();
