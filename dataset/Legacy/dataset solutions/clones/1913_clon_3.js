'use strict';

const outputLog = (logText) => {
  console.log(logText);
};

const parseNumbersFromString = (inputString) => {
  return inputString.split(" ").map(val => parseInt(val, 10));
};

const checkRangeForDivisibility = (divisor, start, end) => {
  for (let currentNum = start; currentNum <= end; currentNum++) {
    const remainder = currentNum % divisor;
    if (remainder === 0) {
      return true;
    }
  }
  return false;
};

function executeLogic(dataLines) {
  const firstLineParts = dataLines[0].split(" ");
  const divisorVal = parseInt(firstLineParts[0], 10);

  const [startRange, endRange] = parseNumbersFromString(dataLines[1]);

  const isDivisibleFound = checkRangeForDivisibility(divisorVal, startRange, endRange);

  if (isDivisibleFound) {
    outputLog('OK');
  } else {
    outputLog('NO');
  }
}

executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
