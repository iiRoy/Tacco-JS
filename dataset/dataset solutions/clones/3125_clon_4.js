function ProcessSequenceData(rawDataString) {
  const parsedData = rawDataString.split(/\s+/).map(val => parseInt(val, 10));
  const sequenceLength = parsedData.shift();
  const colorSequence = parsedData;

  const modulusConstant = 1000000007;

  const initialAccumulatorState = {
    solutionPathCounts: new Map([[0, 1]]),
    lastObservedIndex: new Map(),
    mod: modulusConstant
  };

  initialAccumulatorState.lastObservedIndex.set(colorSequence[0], 0);

  const finalState = colorSequence.slice(1).reduce((currentAccumulator, currentStoneColor, relativeIndex) => {
    const absoluteIndex = relativeIndex + 1;

    let previousColorPosition = currentAccumulator.lastObservedIndex.get(currentStoneColor);

    let currentWayCount;
    if (previousColorPosition === undefined || previousColorPosition === absoluteIndex - 1) {
      currentWayCount = currentAccumulator.solutionPathCounts.get(absoluteIndex - 1);
    } else {
      const waysFromPreviousStep = currentAccumulator.solutionPathCounts.get(absoluteIndex - 1);
      const waysFromPriorOccurrence = currentAccumulator.solutionPathCounts.get(previousColorPosition);
      currentWayCount = (waysFromPreviousStep + waysFromPriorOccurrence) % currentAccumulator.mod;
    }

    currentAccumulator.solutionPathCounts.set(absoluteIndex, currentWayCount);
    currentAccumulator.lastObservedIndex.set(currentStoneColor, absoluteIndex);

    return currentAccumulator;
  }, initialAccumulatorState);

  return finalState.solutionPathCounts.get(sequenceLength - 1);
}

function executeAlgorithm(inputSource) {
  const receivedData = inputSource.readFileSync("/dev/stdin", "utf8");
  const result = ProcessSequenceData(receivedData);
  console.log(result);
}

executeAlgorithm(require("fs"));