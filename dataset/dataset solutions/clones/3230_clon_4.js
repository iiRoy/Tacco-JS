"use strict";

function computeBitwiseDifference(valA, valB) {
  return valA ^ valB;
}

function processChallenge(rawInputText) {
  const parsedLines = rawInputText.split("\n").filter(line => line.length > 0);

  const firstLineParts = parsedLines[0].split(" ").map(Number);
  const limitVal = firstLineParts[1];
  const dataSeries = parsedLines[1].split(" ").map(Number);

  let largestDatum = 0;
  for (const item of dataSeries) {
    if (item > largestDatum) {
      largestDatum = item;
    }
  }

  let conceptualBitLength = 0;
  if (largestDatum > 0) {
    conceptualBitLength = Math.floor(Math.log2(largestDatum)) + 1;
  } else if (dataSeries.length > 0) {
    conceptualBitLength = 1;
  }

  let optimalCandidateXorValue = 0;
  for (let currentBitIndex = conceptualBitLength - 1; currentBitIndex >= 0; currentBitIndex--) {
    let zeroCount = 0;
    let oneCount = 0;

    for (const numberValue of dataSeries) {
      if (((numberValue >> currentBitIndex) & 1) === 1) {
        oneCount++;
      } else {
        zeroCount++;
      }
    }

    if (zeroCount > oneCount) {
      optimalCandidateXorValue |= (1 << currentBitIndex);
    }
  }

  let ultimateXorValue;

  if (limitVal === 0) {
    ultimateXorValue = 0;
  } else {
    const limitValueBitLength = Math.floor(Math.log2(limitVal)) + 1;

    if (conceptualBitLength < limitValueBitLength) {
      const higherBitsFiller = ((1 << limitValueBitLength) - (1 << conceptualBitLength));
      ultimateXorValue = (optimalCandidateXorValue | higherBitsFiller);
    } else {
      const lowerBitsMask = (1 << limitValueBitLength) - 1;
      ultimateXorValue = optimalCandidateXorValue & lowerBitsMask;
    }
  }

  let overallSum = 0;
  for (const element of dataSeries) {
    overallSum += computeBitwiseDifference(element, ultimateXorValue);
  }
  
  console.log(overallSum);
}

processChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));