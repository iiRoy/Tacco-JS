const parseData = (dataInputSource) => {
  const dataLines = dataInputSource.split("\n");
  const itemCount = parseInt(dataLines[0], 10);
  const rawHeights = dataLines[1].split(" ").map(Number);
  const rawScores = dataLines[2].split(" ").map(Number);
  return { itemCount, rawHeights, rawScores };
};

const obtainScoreForAltitude = (targetAltitude, scoreRegistry) => {
  let currentTopScore = 0;
  for (const [registeredAltitude, registeredScore] of scoreRegistry.entries()) {
    if (registeredAltitude <= targetAltitude) {
      currentTopScore = Math.max(currentTopScore, registeredScore);
    }
  }
  return currentTopScore;
};

const cascadeScoreUpdate = (
  startAltitude,
  valueToPropagate,
  scoreRegistry,
  maximumPossibleAltitude
) => {
  if (startAltitude > maximumPossibleAltitude) {
    return;
  }

  const existingScoreAtCurrent = obtainScoreForAltitude(startAltitude, scoreRegistry);

  if (valueToPropagate > existingScoreAtCurrent) {
    scoreRegistry.set(startAltitude, valueToPropagate);
    cascadeScoreUpdate(
      startAltitude + 1,
      valueToPropagate,
      scoreRegistry,
      maximumPossibleAltitude
    );
  }
};

const processBlockRecursively = (
  currentBlockIndex,
  allBlockDetails,
  currentMaxScoresMap,
  ultimatePeakScore
) => {
  if (currentBlockIndex >= allBlockDetails.length) {
    return ultimatePeakScore;
  }

  const currentBlock = allBlockDetails[currentBlockIndex];
  const blockAltitude = currentBlock[0];
  const blockWorth = currentBlock[1];

  const maxScoreBeforeCurrent = obtainScoreForAltitude(blockAltitude, currentMaxScoresMap);
  const potentialNewScore = blockWorth + maxScoreBeforeCurrent;

  cascadeScoreUpdate(
    blockAltitude,
    potentialNewScore,
    currentMaxScoresMap,
    allBlockDetails.length 
  );

  const scoreAfterFullUpdate = obtainScoreForAltitude(blockAltitude, currentMaxScoresMap);
  const newUltimatePeakScore = Math.max(ultimatePeakScore, scoreAfterFullUpdate);

  return processBlockRecursively(
    currentBlockIndex + 1,
    allBlockDetails,
    currentMaxScoresMap,
    newUltimatePeakScore
  );
};

const executeProcessing = (dataInput) => {
  const { itemCount, rawHeights, rawScores } = parseData(dataInput);
  const blockItems = rawHeights.map((hVal, idx) => [hVal, rawScores[idx]]);

  const maxAttainableScoreMap = new Map(); 
  const finalOutcome = processBlockRecursively(
    0,
    blockItems,
    maxAttainableScoreMap,
    0
  );

  console.log(finalOutcome.toString());
  return finalOutcome;
};