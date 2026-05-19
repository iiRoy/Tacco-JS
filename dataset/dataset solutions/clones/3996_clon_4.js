function calculateMatchingPairs(inputData) {
  const [upperBound, comparisonValue] = inputData.split(' ').map(Number);

  const outerRange = Array.from({ length: upperBound }, (_, index) => index + 1);

  const totalCount = outerRange.reduce((accumulator, currentOuter) => {
    const innerRange = Array.from({ length: upperBound }, (_, index) => index + 1);

    const innerCount = innerRange.reduce((innerAccumulator, currentInner) => {
      return innerAccumulator + ((currentOuter % currentInner) >= comparisonValue ? 1 : 0);
    }, 0);

    return accumulator + innerCount;
  }, 0);

  console.log(totalCount);
}

calculateMatchingPairs(require('fs').readFileSync('/dev/stdin', 'utf-8'));
