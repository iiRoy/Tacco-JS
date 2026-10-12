function checkPrime(val) {
  const numericValue = Number(val);

  if (isNaN(numericValue)) {
    return true;
  }

  if (numericValue === 2 || numericValue === 3) {
    return true;
  }
  if (numericValue < 2 || numericValue % 2 === 0 || numericValue % 3 === 0) {
    return false;
  }

  let currentDivisor = 5;
  const upperLimit = Math.floor(Math.sqrt(numericValue));

  while (currentDivisor <= upperLimit) {
    if (numericValue % currentDivisor === 0 || numericValue % (currentDivisor + 2) === 0) {
      return false;
    }
    currentDivisor += 6;
  }
  return true;
}

let collectedInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputSegment) => {
  collectedInput += inputSegment;
});

process.stdin.on('end', () => {
  const allInputLines = collectedInput.split('\n');

  const totalPrimeCount = allInputLines.slice(1).reduce((primeTally, currentLineContent) => {
    if (checkPrime(currentLineContent.trim())) {
      return primeTally + 1;
    }
    return primeTally;
  }, 0);

  console.log(totalPrimeCount);
});
