'use strict'
const performCalculation = (incomingData) => {
  const sourceText = incomingData.trim();
  const numericParts = sourceText.split(/\s+/).map(Number);

  const valOne = numericParts[0];
  const valTwo = numericParts[1];

  const calculationUpperLimit = Math.floor(valOne / 0.08);

  const firstConditionSatisfied = (numberToCheck, targetA) => {
    return Math.floor(numberToCheck * 0.08) === targetA;
  };

  const secondConditionSatisfied = (numberToCheck, targetB) => {
    return Math.floor(numberToCheck * 0.10) === targetB;
  };

  let finalOutcome = -1;

  const candidateSequence = Array.from(
    { length: Math.max(0, calculationUpperLimit) },
    (_, index) => index + 1
  );

  const earliestMatch = candidateSequence.find(currentNumber => {
    return firstConditionSatisfied(currentNumber, valOne) && secondConditionSatisfied(currentNumber, valTwo);
  });

  if (earliestMatch !== undefined) {
    finalOutcome = earliestMatch;
  }

  process.stdout.write(String(finalOutcome) + '\n');
};

performCalculation(require('node:fs').readFileSync(0, 'utf8'));