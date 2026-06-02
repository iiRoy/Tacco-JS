'use strict';

const executeCalculation = (rawData) => {
  const targetNumber = parseInt(rawData[0]);

  const upperLimit = Math.floor(Math.sqrt(targetNumber));

  const potentialDivisors = Array.from({ length: upperLimit }, (_, index) => index + 1);

  const minimumExpressionValue = potentialDivisors
    .filter(currentDivisor => targetNumber % currentDivisor === 0)
    .map(currentDivisor => currentDivisor - 2 + targetNumber / currentDivisor)
    .reduce(
      (accumulator, currentValue) => Math.min(accumulator, currentValue),
      Infinity
    );

  console.log(minimumExpressionValue);
};

executeCalculation(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
