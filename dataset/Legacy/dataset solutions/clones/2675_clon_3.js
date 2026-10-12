"use strict";

const processInput = (inputLine) => {
  const stringComponents = inputLine.split(" ");

  const parseNumericComponent = (componentString) => {
    return Number(componentString);
  };

  const numericComponents = stringComponents.map(parseNumericComponent);

  const valueA = numericComponents[0];
  const valueB = numericComponents[1];
  const valueC = numericComponents[2];

  const sumOfBAndC = valueC + valueB;
  const preliminaryResult = sumOfBAndC - valueA;

  const finalCalculatedValue = Math.max(0, preliminaryResult);

  console.log(finalCalculatedValue);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
