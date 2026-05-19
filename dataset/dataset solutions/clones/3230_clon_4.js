"use strict";

function computeXOR(firstOperand, secondOperand) {
  return firstOperand ^ secondOperand;
}

function processInput(rawInputContent) {
  const contentLines = rawInputContent.split("\n").filter(Boolean);

  const [configLine, dataLine] = contentLines;

  const [arraySize, upperLimitK] = configLine.split(" ").map(Number);
  const numericData = dataLine.split(" ").map(Number);

  let maximumValueInArray = 0;
  for (const item of numericData) {
    if (item > maximumValueInArray) {
      maximumValueInArray = item;
    }
  }

  const significantBitsCount = maximumValueInArray === 0 ? 1 : Math.floor(Math.log2(maximumValueInArray)) + 1;

  let derivedOptimalX = 0;
  for (let currentBitPosition = 0; currentBitPosition < significantBitsCount; currentBitPosition++) {
    let zeroBitOccurrences = 0;
    let oneBitOccurrences = 0;

    for (const currentNumber of numericData) {
      if (((currentNumber >> currentBitPosition) & 1) === 0) {
        zeroBitOccurrences++;
      } else {
        oneBitOccurrences++;
      }
    }

    if (zeroBitOccurrences > oneBitOccurrences) {
      derivedOptimalX |= (1 << currentBitPosition);
    }
  }

  let finalXValue = 0;
  if (upperLimitK === 0) {
    finalXValue = 0;
  } else {
    const kBinaryLength = Math.floor(Math.log2(upperLimitK)) + 1;

    if (significantBitsCount < kBinaryLength) {
      const higherBitsMask = ((1 << kBinaryLength) - 1) ^ ((1 << significantBitsCount) - 1);
      finalXValue = derivedOptimalX | higherBitsMask;
    } else {
      const lowerBitsMask = (1 << kBinaryLength) - 1;
      finalXValue = derivedOptimalX & lowerBitsMask;
    }
  }

  let cumulativeXORSum = 0;
  for (const element of numericData) {
    cumulativeXORSum += computeXOR(element, finalXValue);
  }

  console.log(cumulativeXORSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
