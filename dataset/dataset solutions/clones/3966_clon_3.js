"use strict";

function adjustTermScore(scoreMap, termIdentifier, scoreChange) {
  let currentScoreValue = scoreMap[termIdentifier];
  if (currentScoreValue === undefined) {
    scoreMap[termIdentifier] = scoreChange;
  } else {
    scoreMap[termIdentifier] = currentScoreValue + scoreChange;
  }
}

function processInputAndCalculateMax(sourceData) {
  const dataSegments = sourceData.split(/\n|\s/);

  const firstSetSize = parseInt(dataSegments[0], 10);
  const secondSetSize = parseInt(dataSegments[firstSetSize + 1], 10);

  const positiveTermList = dataSegments.slice(1, firstSetSize + 1);
  const negativeTermList = dataSegments.slice(firstSetSize + 2);

  let termScoreMap = {};

  for (const currentTerm of positiveTermList) {
    adjustTermScore(termScoreMap, currentTerm, 1);
  }

  for (const currentTerm of negativeTermList) {
    adjustTermScore(termScoreMap, currentTerm, -1);
  }

  let overallMaxScore = 0;

  const allCalculatedScores = Object.values(termScoreMap);
  if (allCalculatedScores.length > 0) {
    overallMaxScore = Math.max(...allCalculatedScores);
  }
  
  overallMaxScore = Math.max(0, overallMaxScore);

  console.log(overallMaxScore);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInputAndCalculateMax(fileContent);
