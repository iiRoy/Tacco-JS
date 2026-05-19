function processInputData(rawInputString) {
  const processedInput = rawInputString.trim();
  const inputSegments = processedInput.split(" ");

  const DECIMAL_BASE = 10;
  const firstValue = parseInt(inputSegments[0], DECIMAL_BASE);
  const secondValue = parseInt(inputSegments[1], DECIMAL_BASE);
  const thirdValue = parseInt(inputSegments[2], DECIMAL_BASE);

  const twiceThirdValue = 2 * thirdValue;
  const effectiveFirstValue = firstValue - twiceThirdValue;

  const sumOfSecondAndThird = secondValue + thirdValue;

  const baseCalculatedCount = Math.floor(effectiveFirstValue / sumOfSecondAndThird);

  let finalCalculatedResult;
  if (effectiveFirstValue % sumOfSecondAndThird >= secondValue) {
    finalCalculatedResult = baseCalculatedCount + 1;
  } else {
    finalCalculatedResult = baseCalculatedCount;
  }

  console.log(finalCalculatedResult);
}

function retrieveStandardInput() {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
}

processInputData(retrieveStandardInput());
