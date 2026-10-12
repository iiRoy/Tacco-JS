const arrangeAsc = (items) => items.sort((valA, valB) => valA - valB);

function processData(rawData) {
  const dataLines = rawData.split('\n');

  const upperParts = arrangeAsc(dataLines[1].split(' ').map(Number));
  const middleParts = arrangeAsc(dataLines[2].split(' ').map(Number));
  const lowerParts = arrangeAsc(dataLines[3].split(' ').map(Number));

  let totalCombinations = 0;
  let upperPointer = 0;
  let lowerPointer = 0;

  for (let midIdx = 0; midIdx < middleParts.length; midIdx++) {
    const currentMiddleVal = middleParts[midIdx];

    while (upperPointer < upperParts.length && upperParts[upperPointer] < currentMiddleVal) {
      upperPointer++;
    }
    const countSmallerUpper = upperPointer;

    while (lowerPointer < lowerParts.length && lowerParts[lowerPointer] <= currentMiddleVal) {
      lowerPointer++;
    }
    const countLargerLower = lowerParts.length - lowerPointer;

    totalCombinations += countSmallerUpper * countLargerLower;
  }

  console.log(totalCombinations);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
