"use strict";

const calculateModularPower = (base, exponent, modulus) => {
  let result = 1;
  base %= modulus;
  while (exponent > 0) {
    if (exponent % 2 === 1) {
      result = (result * base) % modulus;
    }
    base = (base * base) % modulus;
    exponent = Math.floor(exponent / 2);
  }
  return result;
};

function* inputTokenStream(rawInputContent) {
  const inputLines = rawInputContent.split("\n");
  let currentLineIndex = 0;
  let currentLineTokens = [];
  let currentTokenPosition = 0;

  while (currentLineIndex < inputLines.length) {
    if (currentTokenPosition === currentLineTokens.length) {
      let lineContent = '';
      while (currentLineIndex < inputLines.length && !(lineContent = inputLines[currentLineIndex++].trim())) {
      }
      if (!lineContent) break;

      currentLineTokens = lineContent.split(" ").map(Number);
      currentTokenPosition = 0;
    }
    if (currentTokenPosition < currentLineTokens.length) {
      yield currentLineTokens[currentTokenPosition++];
    }
  }
}

const MODULUS_VALUE = 998244353;

function processMainLogic(inputData) {
  const tokenReader = inputTokenStream(inputData);

  const fetchNextNumber = () => tokenReader.next().value;

  const numberOfElements = fetchNextNumber();
  const elementValues = Array.from({ length: numberOfElements }, fetchNextNumber);

  const totalSumOfElements = elementValues.reduce((accumulator, current) => accumulator + current, 0);

  const totalPossibleAssignments = calculateModularPower(3, numberOfElements, MODULUS_VALUE);

  let dpStateA = new Map([[0, 1]]);

  for (const itemVal of elementValues) {
    const nextDpStateA = new Map();
    for (const [currentSum, count] of dpStateA.entries()) {
      const countIfItemNotInR = (nextDpStateA.get(currentSum) || 0) + (count * 2);
      nextDpStateA.set(currentSum, countIfItemNotInR % MODULUS_VALUE);

      const newSumWithItemInR = currentSum + itemVal;
      const countIfItemInR = (nextDpStateA.get(newSumWithItemInR) || 0) + count;
      nextDpStateA.set(newSumWithItemInR, countIfItemInR % MODULUS_VALUE);
    }
    dpStateA = nextDpStateA;
  }

  let conditionA_Count = 0;
  const sumThresholdA = Math.ceil(totalSumOfElements / 2);
  for (const [currentSum, count] of dpStateA.entries()) {
    if (currentSum >= sumThresholdA) {
      conditionA_Count = (conditionA_Count + count) % MODULUS_VALUE;
    }
  }

  let conditionB_Count = 0;
  if (totalSumOfElements % 2 === 0) {
    let dpStateB = new Map([[0, 1]]);

    for (const itemVal of elementValues) {
      const nextDpStateB = new Map();
      for (const [currentSum, count] of dpStateB.entries()) {
        const countIfItemNotInSubset = (nextDpStateB.get(currentSum) || 0) + count;
        nextDpStateB.set(currentSum, countIfItemNotInSubset % MODULUS_VALUE);

        const newSumWithItemInSubset = currentSum + itemVal;
        const countIfItemInSubset = (nextDpStateB.get(newSumWithItemInSubset) || 0) + count;
        nextDpStateB.set(newSumWithItemInSubset, countIfItemInSubset % MODULUS_VALUE);
      }
      dpStateB = nextDpStateB;
    }
    conditionB_Count = dpStateB.get(totalSumOfElements / 2) || 0;
  }

  let finalCalculatedAnswer = (totalPossibleAssignments - conditionA_Count * 3 + conditionB_Count * 3);
  
  finalCalculatedAnswer = (finalCalculatedAnswer % MODULUS_VALUE + MODULUS_VALUE) % MODULUS_VALUE;

  console.log(finalCalculatedAnswer);
}

processMainLogic(require("fs").readFileSync("/dev/stdin", "utf8"));
