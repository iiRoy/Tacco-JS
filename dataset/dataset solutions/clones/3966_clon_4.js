"use strict";

function acquireSystemInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8");
}

function decipherTextualData(sourceText) {
  const allSegments = sourceText.trim().split(/\s+/);
  
  const initialQuantity = Number(allSegments[0]);

  const primaryElements = allSegments.slice(1, initialQuantity + 1);
  const secondaryElements = allSegments.slice(initialQuantity + 2);

  return { primarySet: primaryElements, secondarySet: secondaryElements };
}

function computeAggregatedScores(structuredData) {
  const scoreRegistry = new Map();

  structuredData.primarySet.forEach(element => {
    scoreRegistry.set(element, (scoreRegistry.get(element) || 0) + 1);
  });

  structuredData.secondarySet.forEach(element => {
    scoreRegistry.set(element, (scoreRegistry.get(element) || 0) - 1);
  });

  return scoreRegistry;
}

function findPeakScore(scoreRegistry) {
  if (scoreRegistry.size === 0) {
    return 0;
  }

  const allScores = Array.from(scoreRegistry.values());
  const calculatedMax = allScores.reduce((currentMax, value) => {
    return value > currentMax ? value : currentMax;
  }, -Infinity);

  return Math.max(0, calculatedMax);
}

function initiateProcessing(externalInput) {
  const parsedData = decipherTextualData(externalInput);
  const finalScores = computeAggregatedScores(parsedData);
  const ultimateResult = findPeakScore(finalScores);
  
  console.log(ultimateResult);
}

initiateProcessing(acquireSystemInput());