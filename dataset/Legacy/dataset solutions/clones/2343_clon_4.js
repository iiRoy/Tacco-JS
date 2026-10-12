"use strict";

const calculateScore = (inputLine) => {
  let accumulatedValue = 0;
  let elementCounter = 0;
  const digitSequences = inputLine.match(/\d+/g);

  for (const sequence of digitSequences) {
    if (elementCounter < 3) {
      accumulatedValue += Number(sequence);
      elementCounter++;
    } else {
      break;
    }
  }
  return accumulatedValue;
};

const executeProgram = (programInput) => {
  const finalScore = calculateScore(programInput);

  const decisionTable = {
    "true": "bust",
    "false": "win"
  };

  console.log(decisionTable[String(finalScore > 21)]);
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
