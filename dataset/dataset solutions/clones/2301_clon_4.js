"use strict";
const fileSystemHandler = require("fs");

const optimalCounterplays = new Map([
  ['r', 'P'],
  ['s', 'R'],
  ['p', 'S']
]);

const rawInputContent = fileSystemHandler.readFileSync("/dev/stdin", { encoding: "utf8" });
const inputRecordings = rawInputContent.split('\n');

const [gameLengthIndicator, segmentDividerString] = inputRecordings[0].split(' ');
const gameLengthValue = Number(gameLengthIndicator);
const segmentDividerValue = Number(segmentDividerString);

const [rockScoreString, scissorsScoreString, paperScoreString] = inputRecordings[1].split(' ');
const rockPointsValue = Number(rockScoreString);
const scissorsPointsValue = Number(scissorsScoreString);
const paperPointsValue = Number(paperScoreString);

const opponentActionSequence = inputRecordings[2];

const moveValueLookup = new Map([
  ['R', rockPointsValue],
  ['S', scissorsPointsValue],
  ['P', paperPointsValue]
]);

const computeSegmentOutcome = (startingPosition, intervalStep) => {
  const selectedOpponentActions = Array.from({
    length: Math.ceil((opponentActionSequence.length - startingPosition) / intervalStep)
  }, (_, index) => opponentActionSequence[startingPosition + index * intervalStep]);

  const finalAccumulatedState = selectedOpponentActions.reduce((currentAccumulator, currentOpponentAction) => {
    const currentBestResponse = optimalCounterplays.get(currentOpponentAction);

    if (currentBestResponse !== currentAccumulator.previousEffectiveResponse) {
      if (currentAccumulator.previousEffectiveResponse !== null) {
        currentAccumulator.segmentOverallScore += moveValueLookup.get(currentAccumulator.previousEffectiveResponse) * Math.floor((currentAccumulator.consecutiveResponseCount + 1) / 2);
      }
      currentAccumulator.consecutiveResponseCount = 0;
    }

    currentAccumulator.previousEffectiveResponse = currentBestResponse;
    currentAccumulator.consecutiveResponseCount++;

    return currentAccumulator;
  }, {
    segmentOverallScore: 0,
    previousEffectiveResponse: null,
    consecutiveResponseCount: 0
  });

  if (finalAccumulatedState.previousEffectiveResponse !== null) {
    finalAccumulatedState.segmentOverallScore += moveValueLookup.get(finalAccumulatedState.previousEffectiveResponse) * Math.floor((finalAccumulatedState.consecutiveResponseCount + 1) / 2);
  }

  return finalAccumulatedState.segmentOverallScore;
};

const grandTotalScore = Array.from({ length: segmentDividerValue }).reduce((cumulativeScore, _, segmentIndex) => {
  return cumulativeScore + computeSegmentOutcome(segmentIndex, segmentDividerValue);
}, 0);

console.log(grandTotalScore);