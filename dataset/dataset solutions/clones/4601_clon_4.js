'use strict';

function calculateGreatestCommonDivisor(firstOperand, secondOperand) {
  if (secondOperand === 0) {
    return firstOperand;
  }
  return calculateGreatestCommonDivisor(secondOperand, firstOperand % secondOperand);
}

function executeLogic(incomingTextContent) {
  const numericValues = incomingTextContent
    .split('\n')[0]
    .split(' ')
    .reduce((accumulator, currentPart) => {
      accumulator.push(Number(currentPart));
      return accumulator;
    }, []);

  const initialVal = numericValues[0];
  const moduloBasis = numericValues[1];
  const targetRemainder = numericValues[2];

  const commonFactor = calculateGreatestCommonDivisor(initialVal, moduloBasis);
  
  const outputDecision = (targetRemainder % commonFactor === 0) ? 'YES' : 'NO';
  
  console.log(outputDecision);
}

executeLogic(require("fs").readFileSync("/dev/stdin", "utf8"));