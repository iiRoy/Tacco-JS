const dataSegments = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split(/\s+/);

const countElements = parseInt(dataSegments[0], 10);
const firstCollection = new Array(countElements);
const secondCollection = new Array(countElements);

// Populate the two arrays from the input data
for (let idx = 0, dataPointer = 1; idx < countElements; idx++) {
  firstCollection[idx] = parseInt(dataSegments[dataPointer++], 10);
  secondCollection[idx] = parseInt(dataSegments[dataPointer++], 10);
}

// Define a comparison function for sorting numbers
const compareValues = (valA, valB) => valA - valB;

// Sort both collections numerically
firstCollection.sort(compareValues);
secondCollection.sort(compareValues);

// Determine the range of possible median sums based on the number of elements
if (countElements % 2 === 0) { // If the total count is an even number
  const midIdxOne = countElements / 2 - 1;
  const midIdxTwo = countElements / 2;
  const upperMedianSum = secondCollection[midIdxOne] + secondCollection[midIdxTwo];
  const lowerMedianSum = firstCollection[midIdxOne] + firstCollection[midIdxTwo];
  console.log(upperMedianSum - lowerMedianSum + 1);
} else { // If the total count is an odd number
  const centralIndex = (countElements - 1) / 2;
  const upperMedianSum = secondCollection[centralIndex];
  const lowerMedianSum = firstCollection[centralIndex];
  console.log(upperMedianSum - lowerMedianSum + 1);
}
