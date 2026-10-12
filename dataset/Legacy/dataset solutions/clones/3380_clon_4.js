"use strict";

function extractIntegers(textSegment) {
  return textSegment.split(/\s+/).map(Number);
}

function processInputData(sourceText) {
  const allNumericTokens = extractIntegers(sourceText);

  const itemCount = allNumericTokens[0];

  const valueSequence = allNumericTokens.slice(1, itemCount + 1);

  const oddValueCount = valueSequence.reduce((accumulator, currentNumber) => {
    return accumulator + (currentNumber % 2 !== 0 ? 1 : 0);
  }, 0);

  const firstPlayerOutcome = oddValueCount % 2 !== 0;

  console.log(firstPlayerOutcome ? 'first' : 'second');
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
