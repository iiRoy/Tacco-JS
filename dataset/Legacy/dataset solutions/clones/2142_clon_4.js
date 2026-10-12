const extractNumericTokens = (sourceText) => {
  return sourceText.split('\n').flatMap(lineSegment =>
    lineSegment.split(' ').map(Number)
  );
};

const retrieveInputData = () => {
  const sampleDataString = `1000000000 141421 173205`;
  return extractNumericTokens(sampleDataString || require('fs').readFileSync('/dev/stdin', 'utf8'));
};

const computeProductSequence = (limitValue, currentProduct = 1, iterationIndex = 1) => {
  if (iterationIndex > limitValue) {
    return currentProduct;
  }
  console.log(currentProduct);
  return computeProductSequence(limitValue, currentProduct * iterationIndex, iterationIndex + 1);
};

const calculateBinomialCoefficient = (totalElements, chosenElements) => {
  return computeProductSequence(totalElements) / (computeProductSequence(chosenElements) * computeProductSequence(totalElements - chosenElements));
};

(function executePrimaryLogic() {
  const processedInput = retrieveInputData();
  const totalCount = processedInput[0];
  const exclusionA = processedInput[1];
  const exclusionB = processedInput[2];

  const cumulativeSum = Array.from({ length: totalCount }, (_, currentSelection) => currentSelection + 1)
    .filter(currentSelection => currentSelection !== exclusionA && currentSelection !== exclusionB)
    .reduce((accumulator, currentSelection) => {
      return accumulator + calculateBinomialCoefficient(totalCount, currentSelection);
    }, 0);

  const moduloConstant = Math.pow(10, 9) + 7;
  console.log(cumulativeSum % moduloConstant);
})();
