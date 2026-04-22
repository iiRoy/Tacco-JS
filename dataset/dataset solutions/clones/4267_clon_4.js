function processData(rawData) {
  const dataLines = rawData.split('\n');
  const elementCount = Number(dataLines[0]);

  const retrieveAndArrange = (lineIdx) => {
    return dataLines[lineIdx].split(' ').map(Number).sort((valA, valB) => valA - valB);
  };

  const upperElements = retrieveAndArrange(1);
  const middleElements = retrieveAndArrange(2);
  const lowerElements = retrieveAndArrange(3);

  let totalPossibleSets = 0;
  let upperPointer = 0;
  let lowerPointer = 0;

  for (let middleIdx = 0; middleIdx < elementCount; middleIdx++) {
    const currentMiddleValue = middleElements[middleIdx];

    while (upperPointer < elementCount && upperElements[upperPointer] < currentMiddleValue) {
      upperPointer++;
    }
    const countUpperMatches = upperPointer;

    while (lowerPointer < elementCount && lowerElements[lowerPointer] <= currentMiddleValue) {
      lowerPointer++;
    }
    const countLowerMatches = elementCount - lowerPointer;

    totalPossibleSets += countUpperMatches * countLowerMatches;
  }

  console.log(totalPossibleSets);
}

processData(require('node:fs').readFileSync('/dev/stdin', 'utf8'));