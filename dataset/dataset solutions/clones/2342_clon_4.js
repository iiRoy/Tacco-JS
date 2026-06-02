'use strict';

function evaluateGameResult(rawInput) {
  const tokenizedInput = rawInput.trim().split(' ');

  let accumulatedValue = 0;
  for (let position = 0; position < 3; position++) {
    accumulatedValue += Number(tokenizedInput[position]);
  }

  const outcomeMap = {
    true: 'bust',
    false: 'win'
  };

  console.log(outcomeMap[accumulatedValue > 21]);
}

evaluateGameResult(require('fs').readFileSync('/dev/stdin', 'utf8'));
