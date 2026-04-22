const produceOrderedSubsets = (totalElements, subsetLength) => {
  if (totalElements < 0 || subsetLength < 0 || subsetLength > totalElements) {
    return [];
  }

  let partialResults = [[]];
  let nextIterationCache;

  for (let currentSubsetElementIndex = 0; currentSubsetElementIndex < subsetLength; currentSubsetElementIndex++) {
    nextIterationCache = [];

    partialResults.forEach(existingCombination => {
      for (let potentialElement = 1; potentialElement <= totalElements; potentialElement++) {
        if (!existingCombination.includes(potentialElement)) {
          nextIterationCache.push([...existingCombination, potentialElement]);
        }
      }
    });
    partialResults = Array.from(nextIterationCache);
  }
  return partialResults;
};

const evaluateGameOutcome = (rawGameData) => {
  if (!rawGameData || typeof rawGameData !== 'string' || rawGameData.trim() === '') {
    console.error("Error: Invalid or empty game data provided.");
    return 0;
  }

  let processedDataLines = rawGameData.split("\n");

  while (processedDataLines.length > 0 && processedDataLines[processedDataLines.length - 1].trim() === '') {
    processedDataLines.pop();
  }

  if (processedDataLines.length < 3) {
    console.error("Error: Insufficient game configuration lines in input.");
    return 0;
  }

  const firstLineParts = processedDataLines[0].split(' ');
  const totalRounds = parseInt(firstLineParts[0], 10);
  const skipDistance = parseInt(firstLineParts[1], 10);

  const secondLineParts = processedDataLines[1].split(' ');
  const pointsForRockWin = parseInt(secondLineParts[0], 10);
  const pointsForScissorsWin = parseInt(secondLineParts[1], 10);
  const pointsForPaperWin = parseInt(secondLineParts[2], 10);

  const opponentActionSequence = processedDataLines[2];

  let currentTotalScore = 0;

  const roundSkippedFlags = new Array(totalRounds).fill(false);

  const winningMoveScores = {
    'r': pointsForPaperWin,
    's': pointsForRockWin,
    'p': pointsForScissorsWin
  };

  for (let roundIndex = 0; roundIndex < opponentActionSequence.length; roundIndex++) {
    const currentOpponentMove = opponentActionSequence[roundIndex];

    const previousRelevantRoundIndex = roundIndex - skipDistance;
    const isSkipConditionMet = (
      roundIndex >= skipDistance &&
      currentOpponentMove === opponentActionSequence[previousRelevantRoundIndex] &&
      !roundSkippedFlags[previousRelevantRoundIndex]
    );

    if (isSkipConditionMet) {
      roundSkippedFlags[roundIndex] = true;
      continue;
    }

    currentTotalScore += winningMoveScores[currentOpponentMove] || 0;
  }

  console.log(currentTotalScore);
};

evaluateGameOutcome(require("fs").readFileSync("/dev/stdin", "utf8"));