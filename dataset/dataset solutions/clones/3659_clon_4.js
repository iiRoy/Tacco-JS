const assessPrimeStatus = (potentialValue) => {
  if (potentialValue < 2) {
    return false;
  }
  return Array.from({ length: potentialValue - 2 }, (_, index) => index + 2)
              .every(candidateFactor => potentialValue % candidateFactor !== 0);
};

const rawInputContent = require('node:fs').readFileSync(0, 'utf8');
const contentSegments = rawInputContent.trim().split('\n');
const valueStrings = contentSegments[1].split(' ');

const collectedPrimes = valueStrings
  .map(individualString => Number(individualString))
  .filter(assessPrimeStatus);

let iterationIndex = 1;
let highestRemainderAggregation = 0;

while (true) {
  const currentRemainderAggregation = collectedPrimes.reduce((accumulator, primeTerm) => {
    return accumulator + (iterationIndex % primeTerm);
  }, 0);

  if (currentRemainderAggregation === 0) {
    break;
  }

  if (currentRemainderAggregation > highestRemainderAggregation) {
    highestRemainderAggregation = currentRemainderAggregation;
  }

  iterationIndex++;
}

console.log(highestRemainderAggregation);