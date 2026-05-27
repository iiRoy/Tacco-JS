'use strict';

function determineNextBalance(currentBalanceValue, operationCharacter, incrementIdentifier) {
  if (operationCharacter === incrementIdentifier) {
    return currentBalanceValue + 1;
  } else {
    return currentBalanceValue - 1;
  }
}

function processSequence(rawInputString) {
  const characterArray = rawInputString.split('');
  const sequenceLengthString = characterArray[0];
  const actualSequenceLength = parseInt(sequenceLengthString, 10);

  let currentAccumulatedBalance = 0;
  const historicalBalances = [0];

  const INCREMENT_SYMBOL = 'I';

  for (let iterationIndex = 0; iterationIndex < actualSequenceLength; iterationIndex++) {
    const currentOperationCharacter = characterArray[iterationIndex + 2];

    currentAccumulatedBalance = determineNextBalance(
      currentAccumulatedBalance,
      currentOperationCharacter,
      INCREMENT_SYMBOL
    );

    historicalBalances.push(currentAccumulatedBalance);
  }

  console.log(Math.max(...historicalBalances));
}

processSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
