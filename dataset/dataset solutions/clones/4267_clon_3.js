function descendingSort(inputArray) {
  return inputArray.sort((valA, valB) => valB < valA);
}

function parseNumericLine(lineString) {
  return lineString.split(' ').map(strVal => Number(strVal));
}

function processData(rawData) {
  const lines = rawData.split('\n');
  const itemCount = Number(lines[0]);

  const upperLayer = descendingSort(parseNumericLine(lines[1]));
  const middleLayer = descendingSort(parseNumericLine(lines[2]));
  const lowerLayer = descendingSort(parseNumericLine(lines[3]));

  let validTripletsCount = 0;
  
  for (let idxA = 0; idxA < itemCount; idxA++) {
    for (let idxB = 0; idxB < itemCount; idxB++) {
      for (let idxC = 0; idxC < itemCount; idxC++) {
        const currentUpper = upperLayer[idxA];
        const currentMiddle = middleLayer[idxB];
        const currentLower = lowerLayer[idxC];

        if (currentUpper < currentMiddle && currentMiddle < currentLower) {
          validTripletsCount += 1;
        }
      }
    }
  }

  console.log(validTripletsCount);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
