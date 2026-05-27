const fs = require('fs');

const rawContent = fs.readFileSync('/dev/stdin', 'utf8');
const processedContent = rawContent.trim();
const lineSegments = processedContent.split('\n');

const numericValues = [];
for (let segmentIndex = 0; segmentIndex < lineSegments.length; segmentIndex++) {
  numericValues.push(Number(lineSegments[segmentIndex]));
}

const findMinimumOfThree = (valA, valB, valC) => {
  let currentMinimum = valA;
  if (valB < currentMinimum) {
    currentMinimum = valB;
  }
  if (valC < currentMinimum) {
    currentMinimum = valC;
  }
  return currentMinimum;
};

const findMinimumOfTwo = (valA, valB) => (valA < valB ? valA : valB);

const firstSetMinimum = findMinimumOfThree(numericValues[0], numericValues[1], numericValues[2]);
const secondSetMinimum = findMinimumOfTwo(numericValues[3], numericValues[4]);

console.log(firstSetMinimum + secondSetMinimum - 50);
