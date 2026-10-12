'use strict';

const logOutput = (outputMessage) => console.log(outputMessage);

function processInputData(inputLines) {
  const divisorNum = parseInt(inputLines[0].split(" ")[0], 10);

  const [lowerBoundVal, upperBoundVal] = inputLines[1].split(" ").map(Number);

  const rangeElements = Array.from(
    { length: upperBoundVal - lowerBoundVal + 1 },
    (_, index) => lowerBoundVal + index
  );

  const isAnyDivisible = rangeElements.some(element => element % divisorNum === 0);

  logOutput(isAnyDivisible ? 'OK' : 'NO');
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
