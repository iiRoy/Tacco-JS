"use strict";

const determineGameResult = (valA, valB, valC) => {
  const winningThreshold = 21;
  const currentScore = valA + valB + valC;

  if (currentScore > winningThreshold) {
    return "bust";
  } else {
    return "win";
  }
};

const processInputData = (inputLine) => {
  const stringComponents = inputLine.split(" ");
  const numericalValues = [];

  for (let i = 0; i < stringComponents.length; i++) {
    const component = stringComponents[i];
    const parsedNumber = parseInt(component, 10);
    numericalValues.push(parsedNumber);
  }

  const firstValue = numericalValues[0];
  const secondValue = numericalValues[1];
  const thirdValue = numericalValues[2];

  const outcomeMessage = determineGameResult(firstValue, secondValue, thirdValue);
  console.log(outcomeMessage);
  return;
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
