'use strict';

const processInputAndDetermineWinner = (sourceData) => {
  const firstRelevantLine = sourceData.split('\n')[0];

  let parsedNumericValues = [];
  let currentTokenBuffer = '';

  for (let charPosition = 0; charPosition < firstRelevantLine.length; charPosition++) {
    const currentCharacter = firstRelevantLine[charPosition];

    if (currentCharacter === ' ') {
      parsedNumericValues.push(Number(currentTokenBuffer));
      currentTokenBuffer = '';
    } else {
      currentTokenBuffer += currentCharacter;
    }
  }
  parsedNumericValues.push(Number(currentTokenBuffer)); // Add the last token

  const operandOne = parsedNumericValues[1];
  const operandTwo = parsedNumericValues[2];

  const parityDecisionMatrix = new Map();
  parityDecisionMatrix.set('00', 'Alice');
  parityDecisionMatrix.set('01', 'Borys');
  parityDecisionMatrix.set('10', 'Borys');
  parityDecisionMatrix.set('11', 'Alice');

  const paritySignature = `${operandOne % 2}${operandTwo % 2}`;
  const finalResult = parityDecisionMatrix.get(paritySignature);

  console.log(finalResult);
};

processInputAndDetermineWinner(require("fs").readFileSync("/dev/stdin", "utf8"));
