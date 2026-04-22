const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const greatestCommonDivisor = (firstNum, secondNum) => {
  if (secondNum === 0) return firstNum;
  return greatestCommonDivisor(secondNum, firstNum % secondNum);
};

const processDirectionalString = (initialInput) => {
  const reducedString = initialInput.replace(/orth|est/g, '');
  return [...reducedString].reverse();
};

const computeAngularValue = (directionSymbols) => {
  if (directionSymbols.length === 0) {
    return 0;
  }

  const initialSymbol = directionSymbols[0];
  let currentAccumulatedAngle = (initialSymbol === 'w') ? 90 : 0;

  const subsequentAdjustments = directionSymbols.slice(1).map((symbol, index) => {
    const powerOfTwoFactor = 1 << (index + 1);
    if (symbol === 'w') {
      return 90 / powerOfTwoFactor;
    } else if (symbol === 'n') {
      return -90 / powerOfTwoFactor;
    }
    return 0; // Ignore other characters
  });

  return currentAccumulatedAngle + subsequentAdjustments.reduce((sum, adjustment) => sum + adjustment, 0);
};

const representAsFraction = (decimalValue) => {
  if (decimalValue % 1 === 0) {
    return String(decimalValue);
  }

  let numeratorCandidate = decimalValue;
  let denominatorCandidate = 1;

  while (numeratorCandidate % 1 !== 0) {
    numeratorCandidate *= 2;
    denominatorCandidate *= 2;
  }

  const commonDivisor = greatestCommonDivisor(numeratorCandidate, denominatorCandidate);
  const finalNumerator = numeratorCandidate / commonDivisor;
  const finalDenominator = denominatorCandidate / commonDivisor;

  return `${finalNumerator}/${finalDenominator}`;
};

const instructionLines = sourceData.trim().split("\n");

for (const currentLine of instructionLines) {
  if (currentLine === "#") {
    break;
  }

  const reversedSymbols = processDirectionalString(currentLine);
  const calculatedAngle = computeAngularValue(reversedSymbols);
  const formattedOutput = representAsFraction(calculatedAngle);

  console.log(formattedOutput);
}