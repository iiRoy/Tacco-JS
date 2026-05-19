const fs = require("fs");

function extractBoundaryDigits(numericValue) {
  const stringRepresentation = String(numericValue);
  const firstCharacter = stringRepresentation[0];
  const lastCharacter = stringRepresentation[stringRepresentation.length - 1];
  return { first: firstCharacter, last: lastCharacter };
}

function generateConcatenatedKey(charA, charB) {
  return charA + charB;
}

const calculateMatchingPairs = (inputData) => {
  const inputContentLines = inputData.split('\n');

  const upperBound = parseInt(inputContentLines[0].split(' ')[0], 10);

  const digitCombinationCounts = {};

  for (let currentNumber = 1; currentNumber <= upperBound; ++currentNumber) {
    const { first: leadingDigit, last: trailingDigit } = extractBoundaryDigits(currentNumber);
    const forwardCombinationKey = generateConcatenatedKey(leadingDigit, trailingDigit);
    
    digitCombinationCounts[forwardCombinationKey] = (digitCombinationCounts[forwardCombinationKey] || 0) + 1;
  }

  let totalValidPairs = 0;

  for (let numIterator = 1; numIterator <= upperBound; ++numIterator) {
    const { first: currentLeadingDigit, last: currentTrailingDigit } = extractBoundaryDigits(numIterator);
    
    const reverseCombinationKey = generateConcatenatedKey(currentTrailingDigit, currentLeadingDigit);

    totalValidPairs += digitCombinationCounts[reverseCombinationKey] || 0;
  }

  console.log(totalValidPairs);
};

calculateMatchingPairs(fs.readFileSync('/dev/stdin', 'utf8'));
