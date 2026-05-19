'use strict';

function processInputAndDetermineOutcome(rawInputContent) {
  const numericValues = rawInputContent.split('\n')[0].split(' ').map(Number);

  const firstValue = numericValues[0];
  const secondValue = numericValues[1];
  const thirdValue = numericValues[2];

  const outcomeMessage = (secondValue >= thirdValue)
    ? 'delicious'
    : ((firstValue >= (thirdValue - secondValue))
      ? 'safe'
      : 'dangerous');

  console.log(outcomeMessage);
}

processInputAndDetermineOutcome(require("node:fs").readFileSync("/dev/stdin", "utf8"));
