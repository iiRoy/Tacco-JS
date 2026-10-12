'use strict'

const ACE_VALUE_INCREMENT = 13;

function getAdjustedCardValue(originalCard) {
  if (originalCard === 1) {
    return originalCard + ACE_VALUE_INCREMENT;
  }
  return originalCard;
}

function processInput(inputString) {
  const firstLineContent = inputString.split('\n')[0];

  const numberStrings = firstLineContent.split(' ');

  const parsedNumericValues = numberStrings.map(str => parseInt(str, 10));

  let aliceRawCard = parsedNumericValues[0];
  let bobRawCard = parsedNumericValues[1];

  let aliceEffectiveCard = getAdjustedCardValue(aliceRawCard);
  let bobEffectiveCard = getAdjustedCardValue(bobRawCard);

  let gameOutcomeMessage = '';

  if (aliceEffectiveCard > bobEffectiveCard) {
    gameOutcomeMessage = 'Alice';
  } else if (aliceEffectiveCard < bobEffectiveCard) {
    gameOutcomeMessage = 'Bob';
  } else {
    gameOutcomeMessage = 'Draw';
  }

  console.log(gameOutcomeMessage);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
