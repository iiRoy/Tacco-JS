const fileSystem = require('fs');

function calculateRoundedAverage(sourceText) {
  const segments = sourceText.trim().split(' ');
  let primaryValue, secondaryValue;
  let elementCounter = 0;

  for (const currentSegment of segments) {
    const convertedNumber = currentSegment | 0;
    if (elementCounter === 0) {
      primaryValue = convertedNumber;
    } else if (elementCounter === 1) {
      secondaryValue = convertedNumber;
      break;
    }
    elementCounter++;
  }

  const operandOne = primaryValue === undefined ? 0 : primaryValue;
  const operandTwo = secondaryValue === undefined ? 0 : secondaryValue;

  const finalResult = (operandOne + operandTwo + 1) >> 1;

  return String(finalResult);
}

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

console.log(calculateRoundedAverage(rawData));
