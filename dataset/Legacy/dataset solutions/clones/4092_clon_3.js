'use strict'

const parseInputLine = (inputStringContent) => {
  const firstRelevantLine = inputStringContent.split('\n')[0];
  const spaceSeparatedTokens = firstRelevantLine.split(' ');
  const numericParsedValues = spaceSeparatedTokens.map(token => Number(token));
  return numericParsedValues;
};

const processGameOutcome = (rawInputData) => {
  const parsedNumbers = parseInputLine(rawInputData);

  const playerAValue = parsedNumbers[1];
  const playerBValue = parsedNumbers[2];

  const differenceBetweenValues = playerAValue - playerBValue;

  let gameWinnerIdentifier;
  const moduloDivisor = 2;

  if (differenceBetweenValues % moduloDivisor === 0) {
    gameWinnerIdentifier = 'Alice';
  } else {
    gameWinnerIdentifier = 'Borys';
  }

  console.log(gameWinnerIdentifier);
};

processGameOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));
