function processInputData(rawData) {
  const lineSegments = rawData.split('\n');

  const divisorString = lineSegments[0];
  const divisorValue = Number(divisorString);

  const rangeSpecification = lineSegments[1];
  const rangeParts = rangeSpecification.split(' ');
  const lowerBound = Number(rangeParts[0]);
  const upperBound = Number(rangeParts[1]);

  const checkDivisibility = (numberToCheck, divisor) => {
    return numberToCheck % divisor === 0;
  };

  let foundSatisfyingNumber = false;

  for (let currentIterationNumber = lowerBound; currentIterationNumber <= upperBound; currentIterationNumber++) {
    const isCurrentNumberDivisible = checkDivisibility(currentIterationNumber, divisorValue);
    if (isCurrentNumberDivisible) {
      foundSatisfyingNumber = true;
      break;
    }
  }

  if (foundSatisfyingNumber) {
    console.log('OK');
  } else {
    console.log('NG');
  }
}

const fileSystemModule = require('fs');
const rawFileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedContent = rawFileContent.trim();
processInputData(processedContent);
