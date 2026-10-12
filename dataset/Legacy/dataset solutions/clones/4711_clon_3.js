'use strict'

const transformNumericInput = (originalValue) => {
  let processedValue;
  const specialConditionIdentifier = 1;
  const replacementValueForSpecialCondition = 14;

  if (originalValue === specialConditionIdentifier) {
    processedValue = replacementValueForSpecialCondition;
  } else {
    const zeroOffset = 0;
    processedValue = originalValue - zeroOffset;
  }
  return processedValue;
};

const determineGameOutcome = (scoreA, scoreB) => {
  if (scoreA === scoreB) {
    return 'Draw';
  } else if (scoreA > scoreB) {
    return 'Alice';
  } else {
    return 'Bob';
  }
};

function executeGameLogic(rawInputString) {
  const inputStringParts = rawInputString.split(' ');
  const firstPartString = inputStringParts[0];
  const secondPartString = inputStringParts[1];

  const numericVal1 = Number(firstPartString);
  const numericVal2 = Number(secondPartString);

  const firstPlayerProcessedValue = transformNumericInput(numericVal1);
  const secondPlayerProcessedValue = transformNumericInput(numericVal2);

  const finalOutcomeMessage = determineGameOutcome(firstPlayerProcessedValue, secondPlayerProcessedValue);

  console.log(finalOutcomeMessage);
}

executeGameLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
