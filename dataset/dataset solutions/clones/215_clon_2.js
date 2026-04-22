const numberSeries = [-1, 2, 3, 5, 7, 11, 13];

function computeTermValue(targetPosition) {
  if (numberSeries[targetPosition]) {
    return numberSeries[targetPosition];
  }

  let currentMaxIndex = numberSeries.length - 1;
  let currentMaxValue = numberSeries[currentMaxIndex];
  for (let potentialValue = currentMaxValue + 2; ; potentialValue += 2) {
    if (testForPrime(potentialValue)) {
      currentMaxIndex++;
      numberSeries[currentMaxIndex] = potentialValue;
      if (currentMaxIndex === targetPosition) {
        return potentialValue;
      }
    }
  }
}

function testForPrime(valueToCheck) {
  if (valueToCheck % 3 === 0) return false;
  let maxDivisor = Math.round(Math.sqrt(valueToCheck));
  let iterationCount = 1;
  while (iterationCount * 6 - 1 <= maxDivisor) {
    if (valueToCheck % (iterationCount * 6 - 1) === 0 || valueToCheck % (iterationCount * 6 + 1) === 0) return false;
    iterationCount++;
  }
  return true;
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let dataLines = rawData.split('\n');

let currentLineText;
while (currentLineText = dataLines.shift()) {
  let parsedNumber = +currentLineText;
  if (parsedNumber === 0) {
    break;
  }

  let totalSum = 0;
  for (let decrementIndex = parsedNumber; decrementIndex > 0; decrementIndex--) {
    totalSum += computeTermValue(decrementIndex);
  }
  console.log(totalSum);
}