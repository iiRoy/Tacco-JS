'use strict';

function computeGCD(valA, valB) {
  valA = Math.abs(valA);
  valB = Math.abs(valB);
  while (valB) {
    let temporary = valB;
    valB = valA % valB;
    valA = temporary;
  }
  return valA;
}

function processInput(inputContent) {
  const parsedNumbers = inputContent.split('\n')[0].split(' ').map(str => Number(str));
  const firstOperand = parsedNumbers[0];
  const modulusValue = parsedNumbers[1];
  const checkValue = parsedNumbers[2];

  const divisorResult = computeGCD(firstOperand, modulusValue);

  let finalDecision = false;

  if (divisorResult === 0) {
    finalDecision = false;
  } else {
    if (checkValue % divisorResult === 0) {
      const absoluteModulus = Math.abs(modulusValue);

      if (firstOperand >= 0) {
        finalDecision = (checkValue >= 0 && checkValue < absoluteModulus);
      } else {
        finalDecision = (checkValue <= 0 && checkValue > -absoluteModulus);
      }
    }
  }

  console.log(finalDecision ? 'YES' : 'NO');
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
