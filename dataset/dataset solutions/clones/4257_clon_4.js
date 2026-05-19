'use strict';

function locateUpperBoundary(collection, value) {
  let lowerBound = 0;
  let upperBound = collection.length;

  while (lowerBound < upperBound) {
    const pivot = Math.floor((lowerBound + upperBound) / 2);
    if (collection[pivot] <= value) {
      lowerBound = pivot + 1;
    } else {
      upperBound = pivot;
    }
  }
  return lowerBound;
}

console.log(function(inputData) {
  const parsedLines = inputData.trim().split('\n').map(line => line.split(' ').map(Number));

  const size = parsedLines[0][0];
  const firstArray = parsedLines[1].slice().sort((x, y) => x - y);
  const secondArray = parsedLines[2].slice().sort((x, y) => x - y);
  const thirdArray = parsedLines[3].slice().sort((x, y) => x - y);

  let totalTriplets = 0;

  for (const currentB of secondArray) {
    const countSmallerA = locateUpperBoundary(firstArray, currentB - 1);
    const countLargerC = size - locateUpperBoundary(thirdArray, currentB);
    
    totalTriplets += countSmallerA * countLargerC;
  }

  return totalTriplets.toString();
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
