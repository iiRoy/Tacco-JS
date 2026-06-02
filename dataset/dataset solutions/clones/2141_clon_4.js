const acquireDataElements = () => {
  const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  return sourceContent.split('\n').flatMap(lineSegment => lineSegment.split(' '));
};

const computeProductSequence = (upperBound) => {
  if (upperBound <= 1) return 1;
  return upperBound * computeProductSequence(upperBound - 1);
};

const calculateCombinations = (totalItems, chosenItems) => {
  return computeProductSequence(totalItems) / (computeProductSequence(chosenItems) * computeProductSequence(totalItems - chosenItems));
};

(() => {
  const rawDataElements = acquireDataElements();
  const totalCount = +rawDataElements[0];
  const exclusionA = +rawDataElements[1];
  const exclusionB = +rawDataElements[2];

  const modulusValue = Math.pow(10, 9) + 7;

  const finalSum = Array.from({ length: totalCount }, (_, index) => index + 1)
    .filter(currentVal => currentVal !== exclusionA && currentVal !== exclusionB)
    .reduce((accumulator, currentVal) => accumulator + calculateCombinations(totalCount, currentVal), 0);

  console.log(finalSum % modulusValue);
})();
