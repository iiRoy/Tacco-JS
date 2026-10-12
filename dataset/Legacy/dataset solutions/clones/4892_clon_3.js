const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const calculateOverlapLength = (rawInputData) => {
  const processedInput = rawInputData.trim();
  const inputSegments = processedInput.split('\n');

  const lengthString = inputSegments[0];
  const primaryString = inputSegments[1];
  const secondaryString = inputSegments[2];

  const commonSize = parseInt(lengthString, 10);

  let finalCalculatedLength = commonSize + commonSize; // Default to N+N

  for (let startOffset = 0; startOffset < commonSize; startOffset++) {
    let isCurrentOverlapValid = true;
    const comparisonSpan = commonSize - startOffset;

    for (let charIndex = 0; charIndex < comparisonSpan; charIndex++) {
      const charFromPrimary = primaryString[startOffset + charIndex];
      const charFromSecondary = secondaryString[charIndex];

      if (charFromPrimary !== charFromSecondary) {
        isCurrentOverlapValid = false;
        break;
      }
    }

    if (isCurrentOverlapValid) {
      finalCalculatedLength = startOffset + commonSize;
      return finalCalculatedLength;
    }
  }

  return finalCalculatedLength;
};

console.log(calculateOverlapLength(fileContent));
