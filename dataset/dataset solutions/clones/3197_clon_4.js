'use strict'

const evaluateCondition = (rawData) => {
  const [firstValue, secondValue] = rawData.trim().split(/\s+/).map(Number);

  const decisionBoolean = Math.max(firstValue + 1, 2 * secondValue) === (firstValue + 1);

  const outcomeLookup = ['NO', 'YES'];
  console.log(outcomeLookup[+decisionBoolean]);
};

evaluateCondition(require('node:fs').readFileSync('/dev/stdin', 'utf8'));