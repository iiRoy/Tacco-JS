function computeValueDifference(sourceContent) {
  const allLines = sourceContent.split('\n');
  const numericStringCollection = allLines[1].split(' ');

  const sortedNumericArray = numericStringCollection.map(entry => Number(entry)).sort((valA, valB) => valA - valB);

  const totalElements = sortedNumericArray.length;
  const upperHalfIndex = totalElements / 2;
  const lowerHalfIndex = upperHalfIndex - 1;

  const largerCentral = sortedNumericArray[upperHalfIndex];
  const smallerCentral = sortedNumericArray[lowerHalfIndex];

  console.log(largerCentral - smallerCentral);
}

computeValueDifference(require('fs').readFileSync('/dev/stdin', 'utf8'));