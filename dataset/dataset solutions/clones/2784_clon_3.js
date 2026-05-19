const isStrictlyBetween = (valueToTest, boundaryA, boundaryB) => {
  const lowerBoundary = Math.min(boundaryA, boundaryB);
  const upperBoundary = Math.max(boundaryA, boundaryB);
  return valueToTest > lowerBoundary && valueToTest < upperBoundary;
};

function processInputData(rawInputString) {
  const inputLines = rawInputString.split('\n');
  const [elementCountString, dataElementsString] = inputLines;

  const numericData = dataElementsString.split(' ').map(Number);

  let patternMatchCount = 0;

  // The original code uses 'n' (a string) for the loop upper bound.
  // JavaScript implicitly converts 'n' to a number for the arithmetic operation.
  // We explicitly convert it here to maintain exact behavioral equivalence.
  const iterationUpperLimit = Number(elementCountString) - 1;

  for (let currentIndex = 1; currentIndex < iterationUpperLimit; currentIndex++) {
    const currentElement = numericData[currentIndex];
    const previousElement = numericData[currentIndex - 1];
    const nextElement = numericData[currentIndex + 1];

    // Utilize the helper function to check if the current element is strictly between its neighbors.
    if (isStrictlyBetween(currentElement, previousElement, nextElement)) {
      patternMatchCount++;
    }
  }

  console.log(patternMatchCount);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
