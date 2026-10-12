"use strict";

function processInput(rawData) {
  const lines = rawData.split("\n").filter(lineItem => lineItem !== "");
  let targetNum = Number(lines[0]);

  function factorizeCounts(upperBound) {
    let primeFactorCounts = Array(upperBound + 1).fill(0);
    for (let currentNum = 2; currentNum <= upperBound; currentNum++) {
      let tempNum = currentNum;
      for (let divisor = 2; divisor <= currentNum; divisor++) {
        while (tempNum % divisor === 0) {
          primeFactorCounts[divisor] += 1;
          tempNum = tempNum / divisor;
        }
      }
    }
    return primeFactorCounts;
  }

  function countElementsMeetingThreshold(thresholdValue, dataCollection) {
    return dataCollection.filter(item => item >= thresholdValue).length;
  }

  function calculateCombinations(totalItems, itemsToChoose) {
    let comboResult = 1;
    for (let loopCounter = totalItems; loopCounter > totalItems - itemsToChoose; loopCounter = loopCounter - 1) {
      comboResult = comboResult * loopCounter;
    }

    for (let loopCounter = itemsToChoose; loopCounter > 0; loopCounter = loopCounter - 1) {
      comboResult = comboResult / loopCounter;
    }
    return comboResult;
  }

  let factorizationResults = factorizeCounts(targetNum);

  let countGE74 = countElementsMeetingThreshold(74, factorizationResults);
  let countGE24 = countElementsMeetingThreshold(24, factorizationResults);
  let countGE14 = countElementsMeetingThreshold(14, factorizationResults);
  let countGE4 = countElementsMeetingThreshold(4, factorizationResults);
  let countGE2 = countElementsMeetingThreshold(2, factorizationResults);

  let termFiveFiveThree = (countGE4 * (countGE4 - 1) * (countGE2 - 2)) / 2;
  let termFifteenFive = countGE14 * (countGE4 - 1);
  let termTwentyFiveThree = countGE24 * (countGE2 - 1);
  let termSeventyFive = countGE74;

  console.log(
    countGE74 + countGE24 * (countGE2 - 1) + countGE14 * (countGE4 - 1) + (countGE4 * (countGE4 - 1) * (countGE2 - 2)) / 2
  );
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
