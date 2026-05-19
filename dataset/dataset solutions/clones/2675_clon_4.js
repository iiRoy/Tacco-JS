"use strict";

const processInput = (inputString) => {
  const numericComponents = inputString.split(/\s+/).reduce((accumulator, currentElement) => {
    const parsedValue = parseFloat(currentElement);
    if (!isNaN(parsedValue)) { // Ensure only valid numbers are pushed
      accumulator.push(parsedValue);
    }
    return accumulator;
  }, []);

  const [firstVal, secondVal, thirdVal] = numericComponents;

  const intermediateResult = thirdVal + secondVal - firstVal;

  const finalOutcome = Math.max(0, intermediateResult);

  console.log(finalOutcome);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
