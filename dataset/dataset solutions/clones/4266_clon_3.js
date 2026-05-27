const parseIntegerLine = (lineContent) => {
  return lineContent.split(' ').map(itemStr => parseInt(itemStr, 10));
};

function processInputData(rawData) {
  const inputLines = rawData.split('\n');

  const arrayA = parseIntegerLine(inputLines[1]);
  const arrayB = parseIntegerLine(inputLines[2]);
  const arrayC = parseIntegerLine(inputLines[3]);

  const calculateCountsForB = (sourceArray, targetArray) => {
    return targetArray.map(currentBElement => {
      let countOfSmaller = 0;
      for (const sourceAElement of sourceArray) {
        if (sourceAElement < currentBElement) {
          countOfSmaller++;
        }
      }
      return countOfSmaller;
    });
  };

  const countsForB = calculateCountsForB(arrayA, arrayB);
  console.log(countsForB);

  const calculateSumForSingleC = (currentCElement, bElements, bCounts) => {
    let sumForCurrentC = 0;
    for (let bIdx = 0; bIdx < bElements.length; bIdx++) {
      const innerBElement = bElements[bIdx];
      if (innerBElement < currentCElement) {
        sumForCurrentC += bCounts[bIdx];
      }
    }
    return sumForCurrentC;
  };

  let finalAccumulatedSum = 0;
  for (const currentCElement of arrayC) {
    finalAccumulatedSum += calculateSumForSingleC(currentCElement, arrayB, countsForB);
  }

  console.log(finalAccumulatedSum);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
