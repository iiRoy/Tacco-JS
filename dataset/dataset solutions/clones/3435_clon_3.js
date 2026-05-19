"use strict";

function processInput(rawData) {
  const rawLines = rawData.split("\n");
  const parsedLines = rawLines.filter(line => line !== "");

  const targetNumber = Number(parsedLines[0]);

  function calculatePrimeFactorCounts(limit) {
    const factorOccurrences = Array(limit + 1).fill(0);
    for (let currentNum = 2; currentNum <= limit; currentNum++) {
      let tempNum = currentNum;
      for (let divisor = 2; divisor <= currentNum; divisor++) {
        while (tempNum % divisor === 0) {
          factorOccurrences[divisor] += 1;
          tempNum /= divisor;
        }
      }
    }
    return factorOccurrences;
  }

  function countElementsMeetingThreshold(threshold, dataArray) {
    let count = 0;
    for (const item of dataArray) {
      if (item >= threshold) {
        count++;
      }
    }
    return count;
  }

  function calculateCombinations(totalItems, itemsToChoose) {
    let combinationResult = 1;
    for (let k = totalItems; k > totalItems - itemsToChoose; k--) {
      combinationResult *= k;
    }

    for (let k = itemsToChoose; k > 0; k--) {
      combinationResult /= k;
    }
    return combinationResult;
  }

  const primeFactorOccurrences = calculatePrimeFactorCounts(targetNumber);

  const countAtLeast74 = countElementsMeetingThreshold(74, primeFactorOccurrences);
  const countAtLeast24 = countElementsMeetingThreshold(24, primeFactorOccurrences);
  const countAtLeast14 = countElementsMeetingThreshold(14, primeFactorOccurrences);
  const countAtLeast4 = countElementsMeetingThreshold(4, primeFactorOccurrences);
  const countAtLeast2 = countElementsMeetingThreshold(2, primeFactorOccurrences);

  const case75 = countAtLeast74;
  const case25x3 = countAtLeast24 * (countAtLeast2 - 1);
  const case15x5 = countAtLeast14 * (countAtLeast4 - 1);
  const case5x5x3 = (countAtLeast4 * (countAtLeast4 - 1) * (countAtLeast2 - 2)) / 2;

  const finalResultSum = case75 + case25x3 + case15x5 + case5x5x3;

  console.log(finalResultSum);
}

const STANDARD_INPUT_PATH = "/dev/stdin";
processInput(require("fs").readFileSync(STANDARD_INPUT_PATH, "utf8"));
