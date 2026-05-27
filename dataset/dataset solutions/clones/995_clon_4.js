var fileSystem = require('fs');

function determinePrimeStatus(candidate) {
  if (candidate < 2) {
    return 0;
  }
  if (candidate === 2) {
    return 1;
  }
  if (candidate % 2 === 0) {
    return 0;
  }

  const upperLimit = Math.floor(Math.sqrt(candidate));
  const potentialDivisors = Array.from(
    { length: Math.max(0, (upperLimit - 3) / 2 + 1) },
    (_, index) => 3 + index * 2
  );

  const isNotDivisibleByAny = potentialDivisors.every(
    (divisor) => candidate % divisor !== 0
  );

  return isNotDivisibleByAny ? 1 : 0;
}

var rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
var processedLines = rawInputContent.trim().split('\n');
var numericValues = processedLines.map(Number);

var initialCount = numericValues.shift();

var totalPrimeCount = 0;
for (const currentNumber of numericValues) {
  totalPrimeCount += determinePrimeStatus(currentNumber);
}

console.log(totalPrimeCount);
