"use strict";

function checkPowerOfTwo(val) {
  return val > 0 && (val & (val - 1)) === 0;
}

function processInput(rawData) {
  const parsedLines = rawData.split("\n").filter(Boolean);

  const initialNumbers = parsedLines[1].split(" ").map(Number);

  const numberFrequencies = new Map();
  let maxObservedValue = 0;
  for (const num of initialNumbers) {
    numberFrequencies.set(num, (numberFrequencies.get(num) || 0) + 1);
    if (num > maxObservedValue) {
      maxObservedValue = num;
    }
  }

  const uniqueDescendingNumbers = Array.from(numberFrequencies.keys()).sort((a, b) => b - a);

  const relevantPowersOfTwo = [];
  for (let p = 2; p <= 2 * maxObservedValue; p *= 2) {
    relevantPowersOfTwo.push(p);
  }

  let successfulPairs = 0;

  for (const currentNumber of uniqueDescendingNumbers) {
    while (numberFrequencies.get(currentNumber) > 0) {
      numberFrequencies.set(currentNumber, numberFrequencies.get(currentNumber) - 1);

      let pairFoundForCurrent = false;

      for (const powerVal of relevantPowersOfTwo) {
        const requiredComplement = powerVal - currentNumber;

        if (requiredComplement > 0 && numberFrequencies.get(requiredComplement) > 0) {
          numberFrequencies.set(requiredComplement, numberFrequencies.get(requiredComplement) - 1);
          successfulPairs++;
          pairFoundForCurrent = true;
          break;
        }
      }
    }
  }

  console.log(successfulPairs);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
